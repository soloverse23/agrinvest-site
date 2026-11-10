import { unstable_cache } from 'next/cache'

import type { Locale } from '@/i18n/config'
import { payloadClient } from '@/lib/content/payload'
import { listMarketPoints, yearAgo } from '@/lib/prices/load'
import { tags } from '@/lib/revalidate'

/** Agrinvest's latest published diesel price, with its delivery counties; null → on request. */
export const getDieselPrice = unstable_cache(
  async (locale: Locale) => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'diesel-prices',
      where: { status: { equals: 'published' } },
      sort: '-validFrom',
      limit: 1,
      depth: 1,
      locale,
      overrideAccess: false,
      populate: { counties: { name: true } },
    })
    const d = docs[0]
    if (!d) return null
    return {
      price: d.price,
      vat: d.vat,
      validFrom: d.validFrom,
      minimumLitres: d.minimumLitres ?? null,
      counties: (d.counties ?? []).flatMap((c) => (typeof c === 'object' ? [c.name] : [])),
      note: d.note ?? null,
    }
  },
  ['diesel:own'],
  { tags: [tags.diesel, tags.counties] },
)

export type DieselPrice = NonNullable<Awaited<ReturnType<typeof getDieselPrice>>>

/** Romania's weekly diesel price from the Oil Bulletin, oldest first (€ per 1,000 l). */
export async function nationalDiesel(now = new Date()) {
  const points = await listMarketPoints(yearAgo(now))
  return points
    .filter((p) => p.source === 'eu-oil-bulletin' && p.series === 'diesel' && p.market === 'RO')
    .map((p) => ({ date: new Date(p.period), value: p.price, unit: p.unit, currency: p.currency }))
}
