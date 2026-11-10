import { unstable_cache } from 'next/cache'

import type { Locale } from '@/i18n/config'
import { articlePath, authorPath, newsArticlePath } from '@/i18n/routes'
import { pillarByKey } from '@/lib/articles/pillars'
import { tags } from '@/lib/revalidate'
import type { Guide, Media, Person } from '@/payload-types'

import type { Alternates } from './pages'
import { payloadClient } from './payload'

/**
 * Farmer guides (`section: 'ghid'`) and Agrinvest news (`section: 'stiri'`), both `Guides`.
 * Published only, no language fallback: a text without an English version has no English page.
 */
export type ArticleSection = 'ghid' | 'stiri'

const read = (locale: Locale) => ({
  locale,
  fallbackLocale: false as const,
  overrideAccess: false,
  pagination: false as const,
})

export type ArticleCardData = {
  id: number
  section: ArticleSection
  slug: string
  title: string
  summary: string
  pillar: string | null
  date: string
  updatedAt: string
  image: { src: string; alt: string } | null
  href: string
}

export const imageOf = (media: Guide['cover'] | Person['photo']) =>
  typeof media === 'object' && media?.url
    ? { src: media.url, alt: (media as Media).alt ?? '' }
    : null

/** The public URL of a text in a language, or null if it has none there. */
export function hrefOf(
  doc: { section?: string | null; pillar?: string | null },
  slug: string,
  locale: Locale,
): string | null {
  if (doc.section === 'stiri') return newsArticlePath(slug, locale)
  const pillar = pillarByKey(doc.pillar)
  return doc.section === 'ghid' && pillar ? articlePath(pillar.slug[locale], slug, locale) : null
}

export const listArticles = unstable_cache(
  async (locale: Locale, section: ArticleSection): Promise<ArticleCardData[]> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'guides',
      ...read(locale),
      depth: 1,
      where: { section: { equals: section } },
      sort: '-publishedAt',
      limit: 500,
      select: {
        slug: true,
        title: true,
        summary: true,
        section: true,
        pillar: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        cover: true,
      },
    })
    return docs.flatMap((d) => {
      const href = d.slug && d.title ? hrefOf(d, d.slug, locale) : null
      if (!href) return []
      return [
        {
          id: d.id,
          section,
          slug: d.slug as string,
          title: d.title,
          summary: d.summary,
          pillar: d.pillar ?? null,
          date: d.publishedAt ?? d.createdAt,
          updatedAt: d.updatedAt,
          image: imageOf(d.cover),
          href,
        },
      ]
    })
  },
  ['articles:list'],
  { tags: [tags.guides] },
)

const articleSlugs = unstable_cache(
  async () => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'guides',
      locale: 'all',
      depth: 0,
      overrideAccess: false,
      pagination: false,
      where: { section: { in: ['ghid', 'stiri'] } },
      select: { slug: true, section: true, pillar: true },
    })
    return docs.map((d) => ({
      id: d.id,
      section: d.section,
      pillar: d.pillar ?? null,
      slug: d.slug as unknown as Partial<Record<Locale, string | null>>,
    }))
  },
  ['articles:slugs'],
  { tags: [tags.guides] },
)

export async function articleAlternates(id: number): Promise<Alternates> {
  const doc = (await articleSlugs()).find((d) => d.id === id)
  if (!doc) return {}
  const out: Alternates = {}
  for (const locale of ['ro', 'en'] as const) {
    const slug = doc.slug?.[locale]
    const href = slug ? hrefOf(doc, slug, locale) : null
    if (href) out[locale] = href
  }
  return out
}

export const allArticleAlternates = async () =>
  Promise.all((await articleSlugs()).map((d) => articleAlternates(d.id)))

export const getArticle = unstable_cache(
  async (section: ArticleSection, slug: string, locale: Locale): Promise<Guide | null> => {
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
  ['articles:one'],
  { tags: [tags.guides, tags.people, tags.products] },
)

/** Authors with a public page: `isAuthor` people with a slug. */
export const listAuthors = unstable_cache(
  async (): Promise<Person[]> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'people',
      overrideAccess: false,
      pagination: false,
      depth: 1,
      where: { isAuthor: { equals: true } },
    })
    return docs.filter((p) => p.slug)
  },
  ['articles:authors'],
  { tags: [tags.people] },
)

export const getAuthor = unstable_cache(
  async (slug: string, locale: Locale): Promise<Person | null> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'people',
      locale,
      overrideAccess: false,
      depth: 1,
      limit: 1,
      where: { slug: { equals: slug }, isAuthor: { equals: true } },
    })
    return docs[0] ?? null
  },
  ['articles:author'],
  { tags: [tags.people] },
)

/** What a person wrote and reviewed, among farmer guides, news and finance guides. */
export const listByPerson = unstable_cache(
  async (id: number, locale: Locale) => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'guides',
      ...read(locale),
      depth: 0,
      where: { or: [{ author: { equals: id } }, { reviewer: { equals: id } }] },
      sort: '-updatedAt',
      limit: 200,
      select: {
        slug: true,
        title: true,
        summary: true,
        section: true,
        pillar: true,
        author: true,
        reviewer: true,
        publishedAt: true,
        createdAt: true,
      },
    })
    return docs
  },
  ['articles:by-person'],
  { tags: [tags.guides, tags.people] },
)

/**
 * An expert author: `/autori/{slug}`, `/en/authors/{slug}`. The slug is shared. A language
 * version is indexed and paired only when the person has a published text in it.
 */
export async function authorAlternates(id: number, slug: string): Promise<Alternates> {
  const out: Alternates = {}
  for (const l of ['ro', 'en'] as const)
    if ((await listByPerson(id, l)).length) out[l] = authorPath(slug, l)
  return out
}
