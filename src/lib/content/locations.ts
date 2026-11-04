import { unstable_cache } from 'next/cache'

import type { Locale } from '@/i18n/config'
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
  ['bases:list'],
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
    return docs
  },
  ['crops:list'],
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
