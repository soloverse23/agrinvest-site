import { unstable_cache } from 'next/cache'

import type { Locale } from '@/i18n/config'
import { financeProductPath, guidePath } from '@/i18n/routes'
import { tags } from '@/lib/revalidate'
import type { FinanceProduct, Guide } from '@/payload-types'

import type { Alternates } from './pages'
import { payloadClient } from './payload'

/**
 * Finance data. Reads use no language fallback, so Romanian never appears on an English page.
 * Cache keys carry the data epoch: the apply step runs outside Next.js.
 */
const epoch = process.env.ENRICHMENT_EPOCH ?? 'dev'
const read = (locale: Locale) => ({
  locale,
  fallbackLocale: false as const,
  overrideAccess: false,
  pagination: false,
})

type Slugs = { ro?: string | null; en?: string | null }
export type GuideCard = {
  id: number
  slug: string
  title: string
  summary: string
  updatedAt: string
}

export const listGuides = unstable_cache(
  async (locale: Locale): Promise<GuideCard[]> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'guides',
      ...read(locale),
      depth: 0,
      where: { section: { equals: 'finantare' } },
      sort: 'title',
      select: { slug: true, title: true, summary: true, updatedAt: true },
    })
    return docs.flatMap((d) =>
      d.slug && d.title
        ? [{ id: d.id, slug: d.slug, title: d.title, summary: d.summary, updatedAt: d.updatedAt }]
        : [],
    )
  },
  [`finance:guides:${epoch}`],
  { tags: [tags.guides] },
)

const guideSlugs = unstable_cache(
  async (): Promise<{ id: number; slug: Slugs }[]> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'guides',
      locale: 'all',
      depth: 0,
      overrideAccess: false,
      pagination: false,
      where: { section: { equals: 'finantare' } },
      select: { slug: true },
    })
    return docs.map((d) => ({ id: d.id, slug: d.slug as unknown as Slugs }))
  },
  [`finance:guide-slugs:${epoch}`],
  { tags: [tags.guides] },
)

export async function guideAlternates(id: number): Promise<Alternates> {
  const slug = (await guideSlugs()).find((g) => g.id === id)?.slug
  return {
    ...(slug?.ro ? { ro: guidePath(slug.ro, 'ro') } : {}),
    ...(slug?.en ? { en: guidePath(slug.en, 'en') } : {}),
  }
}

export const allGuideAlternates = async () =>
  Promise.all((await guideSlugs()).map((g) => guideAlternates(g.id)))

export const getGuide = unstable_cache(
  async (
    slug: string,
    locale: Locale,
    section: 'finantare' | 'pagina-finantare' = 'finantare',
  ): Promise<Guide | null> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'guides',
      ...read(locale),
      where: { slug: { equals: slug }, section: { equals: section } },
      depth: 2,
      limit: 1,
    })
    return docs[0] ?? null
  },
  [`finance:guide:${epoch}`],
  { tags: [tags.guides, tags.finance, tags.people] },
)

/** A fixed page of the section, kept in Guides: about the IFN, the FAQ. */
export const getFinancePage = (slug: string, locale: Locale) =>
  getGuide(slug, locale, 'pagina-finantare')

export type ProductCard = {
  id: number
  slug: string
  title: string
  answer: string
  parentSlug: string | null
  updatedAt: string
}

export const listFinanceProducts = unstable_cache(
  async (locale: Locale): Promise<ProductCard[]> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'finance-products',
      ...read(locale),
      depth: 1,
      sort: 'order',
      select: { slug: true, title: true, answer: true, parent: true, updatedAt: true },
    })
    return docs.flatMap((d) =>
      d.slug && d.title
        ? [
            {
              id: d.id,
              slug: d.slug,
              title: d.title,
              answer: d.answer,
              parentSlug: typeof d.parent === 'object' ? (d.parent?.slug ?? null) : null,
              updatedAt: d.updatedAt,
            },
          ]
        : [],
    )
  },
  [`finance:products:${epoch}`],
  { tags: [tags.finance] },
)

export async function productAlternates(id: number): Promise<Alternates> {
  const [ro, en] = await Promise.all([listFinanceProducts('ro'), listFinanceProducts('en')])
  const a = ro.find((p) => p.id === id)
  const b = en.find((p) => p.id === id)
  return {
    ...(a ? { ro: financeProductPath(a.slug, 'ro', a.parentSlug) } : {}),
    ...(b ? { en: financeProductPath(b.slug, 'en', b.parentSlug) } : {}),
  }
}

export const allProductAlternates = async () =>
  Promise.all((await listFinanceProducts('ro')).map((p) => productAlternates(p.id)))

export const getFinanceProduct = unstable_cache(
  async (slug: string, locale: Locale): Promise<FinanceProduct | null> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'finance-products',
      ...read(locale),
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
    })
    return docs[0] ?? null
  },
  [`finance:product:${epoch}`],
  { tags: [tags.finance, tags.guides, tags.people] },
)
