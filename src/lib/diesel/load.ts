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

/**
 * Diesel for the header ticker: Agrinvest's own price when one is published, otherwise the
 * Oil Bulletin average for Romania with its change since the week before and its last 30 days
 * (the trend line). Null with neither.
 */
export async function dieselTicker(locale: Locale) {
  const [own, series] = await Promise.all([getDieselPrice(locale), nationalDiesel()])
  if (own) return { price: own.price, unit: 'lei/l', change: undefined, points: undefined }
  const last = series[series.length - 1]
  if (!last) return null
  const before = series[series.length - 2]
  // The weekly points of the last 30 days, plus the week before, so the line always has two.
  const from = last.date.getTime() - 30 * 86_400_000
  const recent = series.filter((p) => p.date.getTime() >= from)
  const points = (recent.length > 1 ? recent : series.slice(-2)).map((p) => p.value)
  return {
    price: last.value,
    unit: `€/${last.unit}`,
    change: before ? last.value - before.value : undefined,
    points,
  }
}
