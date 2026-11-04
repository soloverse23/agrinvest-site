import { unstable_cache } from 'next/cache'

import { isLocale, localePath, locales, type Locale } from '@/i18n/config'
import { tags } from '@/lib/revalidate'
import type { Page } from '@/payload-types'

import { payloadClient } from './payload'

/** Public URL of the same document in each language it is published in. */
export type Alternates = Partial<Record<Locale, string>>

type Localized<T> = Partial<Record<Locale, T>>

export type PageSummary = {
  id: number
  paths: Localized<string>
  languages: Locale[]
  updatedAt: string
  noindex: boolean
}

const languagesOf = (doc: Pick<Page, 'languages'>): Locale[] =>
  (doc.languages ?? []).filter(isLocale)

/** Public URLs for every language the page is published in. */
export function alternatesOf(summary: Pick<PageSummary, 'paths' | 'languages'>): Alternates {
  const out: Alternates = {}
  for (const l of summary.languages) {
    const path = summary.paths[l]
    if (path) out[l] = localePath(path, l)
  }
  return out
}

/** Every published page with its paths in all locales (sitemaps, static params, llms.txt). */
export const listPages = unstable_cache(
  async (): Promise<PageSummary[]> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'pages',
      locale: 'all',
      depth: 0,
      limit: 1000,
      pagination: false,
      overrideAccess: false,
      select: { path: true, languages: true, updatedAt: true, seo: { noindex: true } },
    })
    return docs.map((doc) => ({
      id: doc.id,
      paths: doc.path as unknown as Localized<string>,
      languages: languagesOf(doc),
      updatedAt: doc.updatedAt,
      noindex: Boolean(doc.seo?.noindex),
    }))
  },
  ['pages:list'],
  { tags: [tags.pages] },
)

async function findPage(path: string, locale: Locale, draft: boolean): Promise<Page | null> {
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: { path: { equals: path } },
    locale,
    depth: 2,
    limit: 1,
    draft,
    // Drafts are only requested from preview mode, after the staff session is checked.
    overrideAccess: draft,
  })
  const doc = docs[0]
  return doc && languagesOf(doc).includes(locale) ? doc : null
}

const findPublishedPage = unstable_cache(
  (path: string, locale: Locale) => findPage(path, locale, false),
  ['pages:by-path'],
  { tags: [tags.pages] },
)

/** The page at a locale-relative path (`/depozitare/uscare`), or null. */
export async function getPage(
  path: string,
  locale: Locale,
  draft = false,
): Promise<{ page: Page; alternates: Alternates } | null> {
  const page = draft ? await findPage(path, locale, true) : await findPublishedPage(path, locale)
  if (!page) return null
  const summary = (await listPages()).find((p) => p.id === page.id)
  const alternates = summary ? alternatesOf(summary) : { [locale]: localePath(path, locale) }
  return { page, alternates }
}

/** Static params for the catch-all route: every published page in every language it has. */
export async function pageParams(): Promise<{ locale: Locale; path: string[] }[]> {
  const pages = await listPages()
  return pages.flatMap((p) =>
    locales
      .filter((l) => p.languages.includes(l) && p.paths[l])
      .map((l) => ({ locale: l, path: (p.paths[l] as string).split('/').filter(Boolean) })),
  )
}

/** Breadcrumb trail from the populated parent chain (depth 2 covers the IA's nesting). */
export function trailOf(page: Page, locale: Locale): { name: string; url: string }[] {
  const chain: { title: string; path?: string | null }[] = []
  let node: Page | number | null | undefined = page
  while (node && typeof node === 'object') {
    chain.unshift({ title: node.title, path: node.path })
    node = node.parent
  }
  return chain
    .filter((n) => n.path && n.path !== '/')
    .map((n) => ({ name: n.title, url: localePath(n.path as string, locale) }))
}
