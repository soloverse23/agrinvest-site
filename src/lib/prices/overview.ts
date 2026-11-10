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
