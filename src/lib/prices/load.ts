import { unstable_cache } from 'next/cache'

import type { Locale } from '@/i18n/config'
import { payloadClient } from '@/lib/content/payload'
import { tags } from '@/lib/revalidate'

import type { BuyPriceRow, MarketPoint } from './grain'

/**
 * Cached reads for the price pages and widgets. Public reads only (`overrideAccess: false`),
 * so a draft buy price never reaches a page. Jobs and the `BuyPrices` hooks revalidate the
 * `prices` tag after each write.
 */

/** Published Agrinvest buy prices, newest first, with the base's name in `locale`. */
export const listBuyPrices = unstable_cache(
  async (locale: Locale): Promise<BuyPriceRow[]> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'buy-prices',
      where: { status: { equals: 'published' } },
      sort: '-validFrom',
      limit: 1000,
      pagination: false,
      depth: 1,
      locale,
      overrideAccess: false,
      populate: { bases: { name: true, slug: true } },
    })
    return docs.flatMap((d) => {
      const crop = typeof d.crop === 'object' ? d.crop?.id : d.crop
      if (!crop) return []
      const base =
        d.base && typeof d.base === 'object'
          ? { id: d.base.id, name: d.base.name, slug: d.base.slug as string }
          : null
      return [
        {
          crop,
          base,
          price: d.price,
          basis: d.basis,
          validFrom: d.validFrom,
          note: d.note,
        },
      ]
    })
  },
  ['prices:buy'],
  { tags: [tags.prices, tags.bases] },
)

/** Market prices from `since` on (ISO day), oldest first. */
export const listMarketPoints = unstable_cache(
  async (since: string): Promise<MarketPoint[]> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'market-prices',
      where: { period: { greater_than_equal: since } },
      sort: 'period',
      limit: 5000,
      pagination: false,
      depth: 0,
      overrideAccess: false,
      select: {
        source: true,
        series: true,
        market: true,
        price: true,
        currency: true,
        unit: true,
        period: true,
      },
    })
    return docs.map((d) => ({
      source: d.source,
      series: d.series,
      market: d.market,
      price: d.price,
      currency: d.currency,
      unit: d.unit,
      period: d.period,
    }))
  },
  ['prices:market'],
  // Jobs revalidate the tag at once; the hour covers writes from outside Next.js (the
  // deploy-time diesel backfill), which cannot reach the cache.
  { tags: [tags.prices], revalidate: 3600 },
)

/** The start of the week a year (53 weeks) back, so the cache key changes once a week. */
export function yearAgo(now = new Date()) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  d.setUTCDate(d.getUTCDate() - 53 * 7 - ((d.getUTCDay() + 6) % 7))
  return d.toISOString().slice(0, 10)
}
