import { unstable_cache } from 'next/cache'

import { payloadClient } from '@/lib/content/payload'
import { tags } from '@/lib/revalidate'

import { markets, type Market, type MarketKey } from './registry'

/**
 * Cached reads of the market series (Phase 7f). One point is `[day, value]`, the day as UTC
 * milliseconds, oldest first: compact enough for the chart API and serialisable for the cache.
 * The fetch jobs revalidate the `prices` tag; the hour covers writes from outside Next.js.
 */

export type Point = [day: number, value: number]

async function stored(store: NonNullable<Market['store']>): Promise<Point[]> {
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'market-prices',
    where: {
      and: [
        { source: { equals: store.source } },
        { series: { equals: store.series } },
        { market: { equals: store.market } },
      ],
    },
    sort: 'period',
    limit: 0,
    pagination: false,
    depth: 0,
    overrideAccess: false,
    select: { period: true, price: true },
  })
  return docs.map((d) => [Date.parse(d.period), d.price])
}

/** USD/RON from the two ECB rates published on the same day (lei per euro ÷ dollars per euro). */
export function crossRate(eurRon: Point[], eurUsd: Point[]): Point[] {
  const usd = new Map(eurUsd)
  return eurRon.flatMap(([day, ron]) => {
    const u = usd.get(day)
    return u ? [[day, Math.round((ron / u) * 10_000) / 10_000] as Point] : []
  })
}

/** A market's whole stored history. */
export const marketSeries = unstable_cache(
  async (key: MarketKey): Promise<Point[]> => {
    const m = markets[key]
    if (m.store) return stored(m.store)
    const [ron, usd] = await Promise.all([
      stored(markets['eur-ron'].store!),
      stored(markets['eur-usd'].store!),
    ])
    return crossRate(ron, usd)
  },
  ['markets:series'],
  { tags: [tags.prices], revalidate: 3600 },
)

export type Quote = {
  key: MarketKey
  last: Point
  /** The point before the last one (the previous day, week or month). */
  previous: Point | null
  change: number | null
  changePct: number | null
  /** Change over a year, from the last point on or before the same day a year earlier. */
  yearPct: number | null
  high: number
  low: number
}

const pct = (from: number, to: number) => Math.round(((to - from) / from) * 10_000) / 100

/** The latest value of a series with its moves; null with no data. */
export function quoteOf(key: MarketKey, points: Point[]): Quote | null {
  const last = points[points.length - 1]
  if (!last) return null
  const previous = points[points.length - 2] ?? null
  const yearAgo = last[0] - 365 * 86_400_000
  const before = [...points].reverse().find(([d]) => d <= yearAgo) ?? null
  const year = points.filter(([d]) => d > yearAgo).map(([, v]) => v)
  return {
    key,
    last,
    previous,
    change: previous ? last[1] - previous[1] : null,
    changePct: previous ? pct(previous[1], last[1]) : null,
    yearPct: before ? pct(before[1], last[1]) : null,
    high: Math.max(...year),
    low: Math.min(...year),
  }
}

/** The points from `days` before the last point on. */
export function lastDays(points: Point[], days: number): Point[] {
  const last = points[points.length - 1]
  if (!last) return []
  const from = last[0] - days * 86_400_000
  return points.filter(([d]) => d >= from)
}

/** Monthly averages, newest first: `{ month: 'YYYY-MM', value, n }`. */
export function monthlyAverages(points: Point[]) {
  const months = new Map<string, { sum: number; n: number }>()
  for (const [d, v] of points) {
    const k = new Date(d).toISOString().slice(0, 7)
    const m = months.get(k) ?? { sum: 0, n: 0 }
    m.sum += v
    m.n++
    months.set(k, m)
  }
  return [...months]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, { sum, n }]) => ({ month, value: sum / n, n }))
}

/** Yearly averages, newest first. */
export function yearlyAverages(points: Point[]) {
  const years = new Map<number, { sum: number; n: number }>()
  for (const [d, v] of points) {
    const y = new Date(d).getUTCFullYear()
    const m = years.get(y) ?? { sum: 0, n: 0 }
    m.sum += v
    m.n++
    years.set(y, m)
  }
  return [...years]
    .sort(([a], [b]) => b - a)
    .map(([year, { sum, n }]) => ({ year, value: sum / n, n }))
}

/** The latest EUR/RON and EUR/USD rates, for the conversions; null before the first fetch. */
export async function latestRates() {
  const [ron, usd] = await Promise.all([marketSeries('eur-ron'), marketSeries('eur-usd')])
  const r = ron[ron.length - 1]
  const u = usd[usd.length - 1]
  return r && u ? { eurRon: r[1], eurUsd: u[1], day: r[0] } : null
}

export type Rates = NonNullable<Awaited<ReturnType<typeof latestRates>>>

/** `value` in the market's farmer unit (e.g. $/t → lei/t), or null without a conversion. */
export function converted(m: Market, value: number, rates: Rates | null): number | null {
  if (!m.convert || !rates) return null
  const toEur =
    m.currency === 'EUR' ? 1 : m.currency === 'USD' ? 1 / rates.eurUsd : 1 / rates.eurRon
  const inEur = value * toEur
  const out = m.convert.to === 'EUR' ? inEur : inEur * rates.eurRon
  return out * m.convert.factor
}
