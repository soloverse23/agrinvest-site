/**
 * Grain prices for the pages and widgets: pure functions over the rows the loaders read
 * (`./load`). Agrinvest's prices come only from published `BuyPrices` rows; the market series
 * only from `MarketPrices`. Nothing here estimates a price.
 */
import type { GrainKey } from '@/lib/crops'
import { marketSources, type MarketSource } from '@/lib/sources'

import { cerealCrop } from './eu-agrifood'

export type BuyPriceRow = {
  crop: number
  base: { id: number; name: string; slug: string } | null
  price: number
  basis: 'la-baza' | 'la-ferma'
  validFrom: string
  note?: string | null
}

export type MarketPoint = {
  source: MarketSource
  series: string
  market: string
  price: number
  currency: string
  unit: string
  period: string
}

export type SeriesLine = {
  key: string
  series: string
  market: string
  currency: string
  unit: string
  points: { date: Date; value: number }[]
}

export type Freshness = 'ready' | 'stale' | 'empty'

const DAY = 86_400_000

/** The crop key a market series belongs to. Oilseeds join when their EU endpoint answers. */
export function marketCrop(point: Pick<MarketPoint, 'source' | 'series'>): GrainKey | null {
  if (point.source === 'eu-agrifood') return cerealCrop(point.series)
  return null
}

/** Each base's latest published price for one crop; a row without a base applies everywhere. */
export function latestByBase(rows: BuyPriceRow[], crop: number): BuyPriceRow[] {
  const seen = new Map<string, BuyPriceRow>()
  for (const r of [...rows].sort((a, b) => b.validFrom.localeCompare(a.validFrom))) {
    if (r.crop !== crop) continue
    const key = r.base ? String(r.base.id) : 'all'
    if (!seen.has(key)) seen.set(key, r)
  }
  return [...seen.values()].sort(
    (a, b) => b.price - a.price || (a.base?.name ?? '').localeCompare(b.base?.name ?? ''),
  )
}

/** The headline for a crop: lowest and highest current price, or null ("price on request"). */
export function priceRange(rows: BuyPriceRow[]) {
  if (!rows.length) return null
  const prices = rows.map((r) => r.price)
  const latest = rows.map((r) => r.validFrom).sort()
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    date: new Date(latest[latest.length - 1]),
    places: rows.length,
  }
}

/**
 * A crop's market lines over the last `weeks` weeks, longest first, at most `limit` of them.
 * One line per product and market (e.g. milling wheat, Constanța FOB).
 */
export function cropLines(
  points: MarketPoint[],
  crop: GrainKey,
  now = new Date(),
  weeks = 52,
  limit = 3,
): SeriesLine[] {
  const since = now.getTime() - weeks * 7 * DAY
  const lines = new Map<string, SeriesLine>()
  for (const p of points) {
    if (marketCrop(p) !== crop) continue
    const date = new Date(p.period)
    if (date.getTime() < since) continue
    const key = `${p.source}|${p.series}|${p.market}`
    const line = lines.get(key) ?? {
      key,
      series: p.series,
      market: p.market,
      currency: p.currency,
      unit: p.unit,
      points: [],
    }
    line.points.push({ date, value: p.price })
    lines.set(key, line)
  }
  for (const line of lines.values()) line.points.sort((a, b) => +a.date - +b.date)
  return [...lines.values()]
    .sort((a, b) => b.points.length - a.points.length || a.key.localeCompare(b.key))
    .slice(0, limit)
}

/** Latest value of a line, with the change from the point before. */
export function lastChange(line: SeriesLine) {
  const n = line.points.length
  if (!n) return null
  const last = line.points[n - 1]
  const prev = n > 1 ? line.points[n - 2] : undefined
  return { ...last, change: prev ? Math.round((last.value - prev.value) * 100) / 100 : 0 }
}

/** Ready while the newest point is within its source's cadence plus a week; then stale. */
export function freshness(
  latest: Date | undefined,
  source: MarketSource,
  now = new Date(),
): Freshness {
  if (!latest) return 'empty'
  const limit = (marketSources[source].cadenceDays + 7) * DAY
  return now.getTime() - latest.getTime() > limit ? 'stale' : 'ready'
}

/** "milling-wheat" → "Milling wheat": the EU's own product name, for labels. */
export const seriesLabel = (series: string) =>
  series.charAt(0).toUpperCase() + series.slice(1).replace(/-/g, ' ')
