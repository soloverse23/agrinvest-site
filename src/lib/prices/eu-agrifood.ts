import type { GrainKey } from '@/lib/crops'
import { endpoints, fetchHeaders } from '@/lib/sources'
import { slugify } from '@/lib/slugify'

import type { MarketRow } from './types'

/**
 * EU Agri-food data portal (`api.tech.ec.europa.eu/agrifood/api`), CC BY 4.0. The gateway
 * rate-limits hard (HTTP 429 with `nextAccessTime`), so jobs make one request per run.
 * Response schemas: `/agrifood/v3/api-docs/cereals` and `/fertiliser`.
 */

/** "€205.50", "205,50", "1,234.50" or a number, as a number; NaN when it is not one. */
export function parsePrice(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return NaN
  let s = value.replace(/[^\d.,-]/g, '')
  if (s.includes(',') && s.includes('.')) s = s.replace(/,/g, '')
  else s = s.replace(',', '.')
  return s ? Number(s) : NaN
}

/** "dd/mm/yyyy" as a UTC date. */
export function parseEuDate(value: string): Date {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value?.trim() ?? '')
  if (!m) return new Date(NaN)
  return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]))
}

const formatEuDate = (d: Date) =>
  `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`

/** "€/t" → EUR per t. */
function unitOf(unit: string | undefined): { currency: string; unit: string } {
  const u = (unit ?? '').trim()
  const currency = /€|eur/i.test(u) ? 'EUR' : /lei|ron/i.test(u) ? 'RON' : 'EUR'
  const per = u.split('/')[1]?.trim() || 't'
  return { currency, unit: per }
}

type CerealPrice = {
  memberStateCode?: string
  beginDate?: string
  price?: string | number
  unit?: string
  productName?: string
  marketName?: string
  stageName?: string
}

/**
 * Romanian weekly cereal prices. `series` is the product as the EU names it, slugified
 * (e.g. `milling-wheat`, `feed-maize`); `cerealCrop` maps it to the site's crop key.
 */
export function parseCerealPrices(json: unknown, fetchedAt = new Date()): MarketRow[] {
  if (!Array.isArray(json)) throw new Error('EU cereal prices: expected an array')
  const rows: MarketRow[] = []
  for (const r of json as CerealPrice[]) {
    if (r.memberStateCode !== 'RO' || !r.productName) continue
    const price = parsePrice(r.price)
    const period = parseEuDate(r.beginDate ?? '')
    if (!Number.isFinite(price) || price <= 0 || Number.isNaN(period.getTime())) continue
    rows.push({
      source: 'eu-agrifood',
      series: slugify(r.productName),
      market: [r.marketName, r.stageName].filter(Boolean).join(' / ') || 'RO',
      price,
      ...unitOf(r.unit),
      period,
      fetchedAt,
    })
  }
  return rows
}

/**
 * The site's crop key for an EU cereal or oilseed product, or null for products we do not show.
 * Oilseeds (sunflower seed, rapeseed) are mapped ahead of the EU oilseed endpoint, which was
 * suspended when Phase 5 was built (decision 0008).
 */
export function cerealCrop(series: string): GrainKey | null {
  if (/durum|oil|meal|cake/.test(series)) return null
  if (/wheat/.test(series)) return 'wheat'
  if (/maize|corn/.test(series)) return 'maize'
  if (/barley/.test(series)) return 'barley'
  if (/sunflower/.test(series)) return 'sunflower'
  if (/rape/.test(series)) return 'rapeseed'
  return null
}

type FertiliserPrice = {
  year?: number
  month?: string | number
  memberStateName?: string
  product?: string
  price?: number | string
  unit?: string
}

const months = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

function monthIndex(value: string | number | undefined): number {
  if (typeof value === 'number') return value - 1
  const v = (value ?? '').trim().toLowerCase()
  if (/^\d+$/.test(v)) return Number(v) - 1
  return months.findIndex((m) => v.startsWith(m.slice(0, 3)))
}

/** Monthly fertiliser prices for the given markets (the EU publishes few member states). */
export function parseFertiliserPrices(
  json: unknown,
  markets: readonly string[],
  fetchedAt = new Date(),
): MarketRow[] {
  if (!Array.isArray(json)) throw new Error('EU fertiliser prices: expected an array')
  const rows: MarketRow[] = []
  for (const r of json as FertiliserPrice[]) {
    const market = r.memberStateName?.trim() ?? ''
    if (!markets.includes(market) || !r.product || !r.year) continue
    const month = monthIndex(r.month)
    const price = parsePrice(r.price)
    if (month < 0 || month > 11 || !Number.isFinite(price) || price <= 0) continue
    rows.push({
      source: 'eu-fertiliser',
      series: slugify(r.product),
      market,
      price,
      ...unitOf(r.unit),
      period: new Date(Date.UTC(r.year, month, 1)),
      fetchedAt,
    })
  }
  return rows
}

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: fetchHeaders, cache: 'no-store' })
  if (!res.ok) throw new Error(`${url} answered ${res.status}: ${(await res.text()).slice(0, 200)}`)
  return res.json()
}

/** The last `weeks` weeks of Romanian cereal prices. */
export async function fetchCerealPrices(now = new Date(), weeks = 8): Promise<MarketRow[]> {
  const begin = new Date(now.getTime() - weeks * 7 * 86_400_000)
  const url = `${endpoints.agrifood}/cereal/prices?memberStateCodes=RO&beginDate=${formatEuDate(begin)}&endDate=${formatEuDate(now)}`
  return parseCerealPrices(await getJson(url), now)
}

/** This year's and last year's monthly fertiliser prices. */
export async function fetchFertiliserPrices(
  markets: readonly string[],
  now = new Date(),
): Promise<MarketRow[]> {
  const y = now.getUTCFullYear()
  const url = `${endpoints.agrifood}/fertiliser/prices?years=${y - 1},${y}`
  return parseFertiliserPrices(await getJson(url), markets, now)
}
