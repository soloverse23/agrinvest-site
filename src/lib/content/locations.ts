import { unstable_cache } from 'next/cache'

import type { Locale } from '@/i18n/config'
import { byHarvest } from '@/lib/crops'
import { tags } from '@/lib/revalidate'

import { payloadClient } from './payload'

export const listBases = unstable_cache(
  async (locale: Locale) => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'bases',
      locale,
      depth: 1,
      limit: 200,
      pagination: false,
      sort: 'name',
      overrideAccess: false,
    })
    return docs
  },
  // The deploy's commit in the key: deploy scripts (apply:*, seed:demo) write bases outside
  // Next, where revalidateTag does nothing, and Vercel's data cache outlives deploys. Without
  // it the live map kept a list from before the bases had coordinates and showed no bases.
  ['bases:list', process.env.VERCEL_GIT_COMMIT_SHA ?? ''],
  { tags: [tags.bases, tags.counties, tags.people] },
)

export async function getBase(slug: string, locale: Locale) {
  return (await listBases(locale)).find((b) => b.slug === slug) ?? null
}

/** Crops Agrinvest buys: the ones with grain pages. The shop has its own crop loader. */
export const listCrops = unstable_cache(
  async (locale: Locale) => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'crops',
      where: { isGrain: { equals: true } },
      locale,
      depth: 0,
      limit: 50,
      pagination: false,
      sort: 'createdAt',
      overrideAccess: false,
    })
    return byHarvest(docs)
  },
  // A new key: Vercel's data cache outlives deploys and holds the list in its old order.
  ['crops:list:harvest'],
  { tags: [tags.crops] },
)

export async function getCrop(slug: string, locale: Locale) {
  return (await listCrops(locale)).find((c) => c.slug === slug) ?? null
}

export const listCounties = unstable_cache(
  async () => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'counties',
      depth: 0,
      limit: 100,
      pagination: false,
      sort: 'name',
    })
    return docs
  },
  ['counties:list'],
  { tags: [tags.counties] },
)
