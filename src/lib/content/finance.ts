import { unstable_cache } from 'next/cache'

import type { Locale } from '@/i18n/config'
import { financeProductPath, guidePath, questionPath } from '@/i18n/routes'
import { tags } from '@/lib/revalidate'
import type { QuestionTopic } from '@/lib/finance/topics'
import type { FinanceProduct, FinanceQuestion, Guide } from '@/payload-types'

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
  /** The reviewed file's key: the same in every language (`data/finance/products`). */
  key: string
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
      select: { key: true, slug: true, title: true, answer: true, parent: true, updatedAt: true },
    })
    return docs.flatMap((d) =>
      d.slug && d.title
        ? [
            {
              id: d.id,
              key: d.key,
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
  [`finance:products:v2:${epoch}`],
  { tags: [tags.finance] },
)

/**
 * Links to finance products by key, for pages outside the section (shop, cart, crops, bases).
 * A product that is not published is left out, so no page links to a missing page.
 */
export async function financeLinks<K extends string>(keys: readonly K[], locale: Locale) {
  const products = await listFinanceProducts(locale)
  const out: Partial<Record<K, { href: string; title: string }>> = {}
  for (const key of keys) {
    const p = products.find((x) => x.key === key)
    if (p) out[key] = { href: financeProductPath(p.slug, locale, p.parentSlug), title: p.title }
  }
  return out
}

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

export type QuestionCard = {
  id: number
  key: string
  slug: string
  title: string
  answer: string
  topic: QuestionTopic
  order: number
  popular: boolean
  /** The matching credit's id: a credit page lists the questions that point at it. */
  product: number | null
  /** The library guide on the same subject, by id: a guide lists the questions that point at it. */
  guide: number | null
  updatedAt: string
}

/** Every published question of one language, in topic order then by `order`. */
export const listQuestions = unstable_cache(
  async (locale: Locale): Promise<QuestionCard[]> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'finance-questions',
      ...read(locale),
      depth: 0,
      sort: 'order',
      select: {
        key: true,
        slug: true,
        title: true,
        answer: true,
        topic: true,
        order: true,
        popular: true,
        product: true,
        guide: true,
        updatedAt: true,
      },
    })
    return docs.flatMap((d) =>
      d.slug && d.title && d.answer
        ? [
            {
              id: d.id,
              key: d.key,
              slug: d.slug,
              title: d.title,
              answer: d.answer,
              topic: d.topic,
              order: d.order ?? 100,
              popular: Boolean(d.popular),
              product: typeof d.product === 'number' ? d.product : (d.product?.id ?? null),
              guide: typeof d.guide === 'number' ? d.guide : (d.guide?.id ?? null),
              updatedAt: d.updatedAt,
            },
          ]
        : [],
    )
  },
  [`finance:questions:v2:${epoch}`],
  { tags: [tags.finance] },
)

export const getQuestion = unstable_cache(
  async (slug: string, locale: Locale): Promise<FinanceQuestion | null> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'finance-questions',
      ...read(locale),
      where: { slug: { equals: slug } },
      depth: 1,
      limit: 1,
    })
    return docs[0] ?? null
  },
  [`finance:question:${epoch}`],
  { tags: [tags.finance, tags.guides] },
)

export async function questionAlternates(id: number): Promise<Alternates> {
  const [ro, en] = await Promise.all([listQuestions('ro'), listQuestions('en')])
  const a = ro.find((q) => q.id === id)
  const b = en.find((q) => q.id === id)
  return {
    ...(a ? { ro: questionPath(a.slug, 'ro') } : {}),
    ...(b ? { en: questionPath(b.slug, 'en') } : {}),
  }
}

export const allQuestionAlternates = async () =>
  Promise.all((await listQuestions('ro')).map((q) => questionAlternates(q.id)))
