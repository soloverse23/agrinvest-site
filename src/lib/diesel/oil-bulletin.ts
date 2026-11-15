import type { MarketRow } from '@/lib/prices/types'
import { excelDate, readFirstSheet, type SheetRow } from '@/lib/xlsx'

/** The bulletin's EU-27 weighted-average row starts with this label. */
const EU_ROW = /^CE\/EC\/EG EUR27/

/**
 * The Weekly Oil Bulletin's "prices with taxes" sheet: one row per country, consumer
 * prices in euro per 1,000 litres, the bulletin date (a Monday) in A2. Column B is Euro-super
 * 95 (petrol), column C automotive gas oil (diesel). Returns Romania's diesel price first,
 * then Romania's petrol and the EU-27 averages (Phase 7f). Throws when the layout has changed,
 * so the job fails loudly instead of storing a wrong number.
 */
export function parseOilBulletin(file: Buffer, fetchedAt = new Date()): MarketRow[] {
  const rows = readFirstSheet(file)
  const header = rows[0]?.C ?? ''
  if (!/gas oil|diesel/i.test(header)) throw new Error('Oil Bulletin: column C is not diesel')
  if (!/euro-super 95/i.test(rows[0]?.B ?? ''))
    throw new Error('Oil Bulletin: column B is not Euro-super 95')
  const unit = rows[1]?.C?.trim()
  if (unit !== '1000 l' || rows[1]?.B?.trim() !== '1000 l')
    throw new Error(`Oil Bulletin: unexpected unit "${unit}"`)
  const serial = Number(rows[1]?.A)
  if (!Number.isFinite(serial) || serial < 40_000) throw new Error('Oil Bulletin: no date')

  const romania = rows.find((r) => r.A?.trim() === 'Romania')
  const diesel = Number(romania?.C)
  if (!romania || !Number.isFinite(diesel) || diesel <= 0)
    throw new Error('Oil Bulletin: no diesel price for Romania')
  const eu = rows.find((r) => EU_ROW.test(r.A?.trim() ?? ''))

  const period = excelDate(serial)
  const row = (series: 'diesel' | 'euro95', market: 'RO' | 'EU', value: unknown) => {
    const price = Number(value)
    if (!Number.isFinite(price) || price <= 0) return []
    // Romania reports in lei; the bulletin converts to euro with long fractions.
    return [
      {
        source: 'eu-oil-bulletin' as const,
        series,
        market,
        price: Math.round(price * 100) / 100,
        currency: 'EUR',
        unit: '1000 l',
        period,
        fetchedAt,
      },
    ]
  }
  return [
    ...row('diesel', 'RO', diesel),
    ...row('euro95', 'RO', romania.B),
    ...row('diesel', 'EU', eu?.C),
    ...row('euro95', 'EU', eu?.B),
  ]
}

/**
 * The Oil Bulletin's price history ("Price developments 2005 onwards", sheet "Prices with
 * taxes"): one row per week, newest first, one column per country and product. Row 1 has
 * codes such as `RO_price_with_tax_diesel`, row 3 the units. Returns Romania's diesel price
 * for the newest `weeks` weeks; throws when the layout has changed.
 */
export function historyRows(rows: SheetRow[], weeks = 53, fetchedAt = new Date()): MarketRow[] {
  const col = Object.entries(rows[0] ?? {}).find(([, v]) => v === 'RO_price_with_tax_diesel')?.[0]
  if (!col) throw new Error('Oil Bulletin history: no RO_price_with_tax_diesel column')
  const unit = rows[2]?.[col]?.trim()
  if (unit !== '1000 l') throw new Error(`Oil Bulletin history: unexpected unit "${unit}"`)
  const out: MarketRow[] = []
  for (const r of rows.slice(3)) {
    const serial = Number(r.A)
    const price = Number(r[col])
    if (!Number.isFinite(serial) || serial < 40_000 || !Number.isFinite(price) || price <= 0)
      continue
    out.push({
      source: 'eu-oil-bulletin',
      series: 'diesel',
      market: 'RO',
      price: Math.round(price * 100) / 100,
      currency: 'EUR',
      unit: '1000 l',
      period: excelDate(serial),
      fetchedAt,
    })
    if (out.length >= weeks) break
  }
  if (!out.length) throw new Error('Oil Bulletin history: no rows for Romania')
  return out
}

export const parseOilBulletinHistory = (file: Buffer, weeks = 53, fetchedAt = new Date()) =>
  historyRows(readFirstSheet(file), weeks, fetchedAt)

/** The history's columns for the four series the fuel page shows (Phase 7f). */
const historyColumns = [
  { code: 'RO_price_with_tax_diesel', series: 'diesel', market: 'RO' },
  { code: 'RO_price_with_tax_euro95', series: 'euro95', market: 'RO' },
  { code: 'EU_price_with_tax_diesel', series: 'diesel', market: 'EU' },
  { code: 'EU_price_with_tax_euro95', series: 'euro95', market: 'EU' },
] as const

/**
 * Romania's and the EU-27's weekly diesel and petrol prices from the history sheet, for the
 * newest `weeks` weeks. Throws when a column is missing or its unit changed.
 */
export function fuelHistoryRows(rows: SheetRow[], weeks: number, fetchedAt = new Date()) {
  const cols = historyColumns.map((c) => {
    const col = Object.entries(rows[0] ?? {}).find(([, v]) => v === c.code)?.[0]
    if (!col) throw new Error(`Oil Bulletin history: no ${c.code} column`)
    if (rows[2]?.[col]?.trim() !== '1000 l')
      throw new Error(`Oil Bulletin history: unexpected unit for ${c.code}`)
    return { ...c, col }
  })
  const out: MarketRow[] = []
  let seen = 0
  for (const r of rows.slice(3)) {
    const serial = Number(r.A)
    if (!Number.isFinite(serial) || serial < 40_000) continue
    if (++seen > weeks) break
    for (const c of cols) {
      const price = Number(r[c.col])
      if (!Number.isFinite(price) || price <= 0) continue
      out.push({
        source: 'eu-oil-bulletin',
        series: c.series,
        market: c.market,
        price: Math.round(price * 100) / 100,
        currency: 'EUR',
        unit: '1000 l',
        period: excelDate(serial),
        fetchedAt,
      })
    }
  }
  if (!out.length) throw new Error('Oil Bulletin history: no fuel rows')
  return out
}
