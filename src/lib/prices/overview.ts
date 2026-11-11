import type { Locale } from '@/i18n/config'
import { cropPricePath } from '@/i18n/routes'
import { listCrops } from '@/lib/content/locations'
import { isGrainKey, type GrainKey } from '@/lib/crops'

import {
  cropLines,
  freshness,
  lastChange,
  latestByBase,
  priceRange,
  type BuyPriceRow,
  type Freshness,
  type MarketPoint,
  type SeriesLine,
} from './grain'
import { listBuyPrices, listMarketPoints, yearAgo } from './load'

export type CropOverview = {
  id: number
  key: GrainKey
  name: string
  slug: string
  href: string
  /** Each base's current published price (empty → "price on request"). */
  bases: BuyPriceRow[]
  range: ReturnType<typeof priceRange>
  lines: SeriesLine[]
  latest: ReturnType<typeof lastChange>
  state: Freshness
}

/** Every grain crop with its Agrinvest prices and EU lines, in the crops' own order. */
export async function grainOverview(locale: Locale, now = new Date()): Promise<CropOverview[]> {
  const [crops, buy, points] = await Promise.all([
    listCrops(locale),
    listBuyPrices(locale),
    listMarketPoints(yearAgo(now)),
  ])
  return crops.flatMap((c) => {
    if (!isGrainKey(c.key)) return []
    const bases = latestByBase(buy, c.id)
    const lines = cropLines(points, c.key, now)
    const latest = lines[0] ? lastChange(lines[0]) : null
    return [
      {
        id: c.id,
        key: c.key,
        name: c.name,
        slug: c.slug as string,
        href: cropPricePath(c.slug as string, locale),
        bases,
        range: priceRange(bases),
        lines,
        latest,
        state: freshness(latest?.date, 'eu-agrifood', now),
      },
    ]
  })
}

/** The widget's items, from the overview. */
export function grainItems(overview: CropOverview[]) {
  return overview.map((c) => ({
    crop: c.key,
    name: c.name,
    href: c.href,
    agrinvest: c.range ? { min: c.range.min, max: c.range.max } : null,
    market:
      c.latest && c.lines[0]
        ? {
            value: c.latest.value,
            unit: `${c.lines[0].currency === 'EUR' ? '€' : c.lines[0].currency}/${c.lines[0].unit}`,
            change: c.latest.change,
          }
        : null,
  }))
}

export type RailRow = {
  crop: GrainKey
  /** The crop's own slug, for its price page. */
  slug: string
  name: string
  price: number
  change: number
  /** The best price per day over the 30 days up to the latest, oldest first (trend line). */
  points: number[]
}

/** How far back the rail's trend lines reach. */
export const RAIL_DAYS = 30
const DAY = 86_400_000

/** A crop's Agrinvest price per day: the highest published price that day, by ISO day. */
function bestByDay(buy: BuyPriceRow[], crop: number): Map<string, number> {
  const byDay = new Map<string, number>()
  for (const r of buy) {
    if (r.crop !== crop) continue
    const day = r.validFrom.slice(0, 10)
    byDay.set(day, Math.max(byDay.get(day) ?? 0, r.price))
  }
  return byDay
}

/**
 * Agrinvest's published prices for the hero rail and the header ticker: per crop, the highest
 * price on its latest date and the change from the date before. Null while nothing is
 * published, so both stay hidden instead of showing a zero.
 */
export function railRows(
  crops: { id: number; key: string; name: string; slug?: string }[],
  buy: BuyPriceRow[],
): { rows: RailRow[]; date: Date } | null {
  const rows: RailRow[] = []
  let latest = ''
  for (const c of crops) {
    if (!isGrainKey(c.key)) continue
    const byDay = bestByDay(buy, c.id)
    const days = [...byDay.keys()].sort()
    const [last, before] = [...days].reverse()
    if (!last) continue
    if (last > latest) latest = last
    const price = byDay.get(last)!
    const from = new Date(Date.parse(last) - RAIL_DAYS * DAY).toISOString().slice(0, 10)
    rows.push({
      crop: c.key,
      slug: c.slug ?? c.key,
      name: c.name,
      price,
      change: before ? price - byDay.get(before)! : 0,
      points: days.filter((d) => d >= from).map((d) => byDay.get(d)!),
    })
  }
  return rows.length ? { rows, date: new Date(latest) } : null
}

export async function agrinvestRail(locale: Locale) {
  const [crops, buy] = await Promise.all([listCrops(locale), listBuyPrices(locale)])
  return railRows(
    crops.map((c) => ({ id: c.id, key: c.key, name: c.name, slug: c.slug })),
    buy,
  )
}

export type CropSeries = {
  crop: GrainKey
  slug: string
  name: string
  /** Agrinvest's best price per day; the EU market line when Agrinvest has fewer than two days. */
  source: 'agrinvest' | 'market'
  unit: string
  points: { date: Date; value: number }[]
}

/**
 * Per crop, the line the home "Live from the field" chart draws: Agrinvest's best published
 * price per day (the same numbers as the rail), oldest first. A crop with fewer than two such
 * days falls back to its EU market line, so the chart never draws a single dot. Crops with
 * neither are left out.
 */
export function cropSeries(
  crops: { id: number; key: string; name: string; slug?: string }[],
  buy: BuyPriceRow[],
  market: MarketPoint[],
  now = new Date(),
): CropSeries[] {
  return crops.flatMap((c): CropSeries[] => {
    if (!isGrainKey(c.key)) return []
    const slug = c.slug ?? c.key
    const own = [...bestByDay(buy, c.id)]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, value]) => ({ date: new Date(day), value }))
    if (own.length > 1)
      return [{ crop: c.key, slug, name: c.name, source: 'agrinvest', unit: 'lei/t', points: own }]
    const line = cropLines(market, c.key, now)[0]
    if (!line || line.points.length < 2) return []
    const currency = line.currency === 'EUR' ? '€' : line.currency
    return [
      {
        crop: c.key,
        slug,
        name: c.name,
        source: 'market',
        unit: `${currency}/${line.unit}`,
        points: line.points,
      },
    ]
  })
}

export async function agrinvestSeries(locale: Locale, now = new Date()) {
  const [crops, buy, market] = await Promise.all([
    listCrops(locale),
    listBuyPrices(locale),
    listMarketPoints(yearAgo(now)),
  ])
  return cropSeries(
    crops.map((c) => ({ id: c.id, key: c.key, name: c.name, slug: c.slug })),
    buy,
    market,
    now,
  )
}
