import type { MarketRow } from '@/lib/prices/types'
import { readSheet, type SheetRow } from '@/lib/xlsx'

import { worldBankColumns } from './registry'

/**
 * Parsers for the Phase 7f sources (pure, no I/O). Each throws when the file's layout is not
 * the one it knows, so a job fails loudly instead of storing a wrong number.
 */

const utcDay = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null
}

/** Splits one CSV line, honouring double quotes. */
function csvCells(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (ch === '"') quoted = false
      else cur += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') {
      out.push(cur)
      cur = ''
    } else cur += ch
  }
  out.push(cur)
  return out
}

/**
 * FRED's `fredgraph.csv` for `DCOILBRENTEU`: `observation_date,DCOILBRENTEU`, one row per
 * business day, `.` or empty on holidays (skipped). Brent spot in US dollars per barrel.
 */
export function parseFredBrent(csv: string, fetchedAt = new Date()): MarketRow[] {
  const lines = csv.trim().split(/\r?\n/)
  const head = csvCells(lines[0] ?? '')
  if (head[1]?.trim() !== 'DCOILBRENTEU') throw new Error('FRED: not the DCOILBRENTEU series')
  const rows: MarketRow[] = []
  for (const line of lines.slice(1)) {
    const [day, raw] = csvCells(line)
    const period = utcDay(day ?? '')
    const price = Number(raw)
    if (!period || !raw || raw === '.' || !Number.isFinite(price) || price <= 0) continue
    rows.push({
      source: 'eia-brent',
      series: 'brent',
      market: 'world',
      price,
      currency: 'USD',
      unit: 'bbl',
      period,
      fetchedAt,
    })
  }
  if (!rows.length) throw new Error('FRED: no Brent prices')
  return rows
}

/**
 * The ECB data API's `csvdata` for `EXR/D.RON+USD.EUR.SP00.A`: one row per currency and day,
 * with `CURRENCY`, `TIME_PERIOD` and `OBS_VALUE` columns. Values are units of the currency per
 * euro, stored as series `eur-ron` and `eur-usd`.
 */
export function parseEcbRates(csv: string, fetchedAt = new Date()): MarketRow[] {
  const lines = csv.trim().split(/\r?\n/)
  const head = csvCells(lines[0] ?? '')
  const col = (name: string) => head.indexOf(name)
  const [cur, day, value, base] = [
    col('CURRENCY'),
    col('TIME_PERIOD'),
    col('OBS_VALUE'),
    col('CURRENCY_DENOM'),
  ]
  if (cur < 0 || day < 0 || value < 0) throw new Error('ECB: unexpected CSV header')
  const rows: MarketRow[] = []
  for (const line of lines.slice(1)) {
    const c = csvCells(line)
    if (base >= 0 && c[base] !== 'EUR') continue
    const currency = c[cur]
    if (currency !== 'RON' && currency !== 'USD') continue
    const period = utcDay(c[day] ?? '')
    const price = Number(c[value])
    if (!period || !Number.isFinite(price) || price <= 0) continue
    rows.push({
      source: 'ecb',
      series: currency === 'RON' ? 'eur-ron' : 'eur-usd',
      market: 'ECB',
      price,
      currency,
      unit: 'EUR',
      period,
      fetchedAt,
    })
  }
  if (!rows.length) throw new Error('ECB: no rates')
  return rows
}

/** The monthly workbook's link on the World Bank's commodity page. */
export function worldBankWorkbookUrl(html: string): string {
  const m = /https:\/\/[^"'\s]*CMO-Historical-Data-Monthly\.xlsx/.exec(html)
  if (!m) throw new Error('World Bank: no CMO-Historical-Data-Monthly.xlsx link')
  return m[0]
}

/** "($/mt)" → `t`, "($/mmbtu)" → `MMBtu`. */
function wbUnit(label: string | undefined): string | null {
  const u = (label ?? '').toLowerCase().replace(/[()\s]/g, '')
  if (u === '$/mt') return 't'
  if (u === '$/mmbtu') return 'MMBtu'
  return null
}

/**
 * The Pink Sheet's "Monthly Prices" sheet: a header row of commodity names, a row of units,
 * then one row per month (`2026M10`), nominal US dollars, `…` where there is no price.
 * Returns the columns listed in `worldBankColumns` from `since` (a UTC date) on.
 */
export function worldBankRows(rows: SheetRow[], since: Date, fetchedAt = new Date()): MarketRow[] {
  const headIndex = rows.findIndex((r) => Object.values(r).includes('Crude oil, Brent'))
  if (headIndex < 0) throw new Error('World Bank: no header row')
  const head = rows[headIndex]!
  const units = rows[headIndex + 1] ?? {}
  const columns = Object.entries(worldBankColumns).map(([label, series]) => {
    const col = Object.entries(head).find(([, v]) => v.replace(/\*+/g, '').trim() === label)?.[0]
    if (!col) throw new Error(`World Bank: no "${label}" column`)
    const unit = wbUnit(units[col])
    if (!unit) throw new Error(`World Bank: unexpected unit for "${label}": ${units[col]}`)
    return { col, series, unit }
  })
  const out: MarketRow[] = []
  for (const r of rows.slice(headIndex + 2)) {
    const m = /^(\d{4})M(\d{2})$/.exec(r.A?.trim() ?? '')
    if (!m) continue
    const period = new Date(Date.UTC(+m[1], +m[2] - 1, 1))
    if (period < since) continue
    for (const { col, series, unit } of columns) {
      const price = Number(r[col])
      if (!Number.isFinite(price) || price <= 0) continue
      out.push({
        source: 'world-bank',
        series,
        market: 'world',
        price: Math.round(price * 100) / 100,
        currency: 'USD',
        unit,
        period,
        fetchedAt,
      })
    }
  }
  if (!out.length) throw new Error('World Bank: no monthly prices')
  return out
}

export const parseWorldBank = (file: Buffer, since: Date, fetchedAt = new Date()) =>
  worldBankRows(readSheet(file, 'Monthly Prices'), since, fetchedAt)
