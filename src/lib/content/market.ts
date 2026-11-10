import { unstable_cache } from 'next/cache'

import type { Locale } from '@/i18n/config'
import { marketNotePath } from '@/i18n/routes'
import { tags } from '@/lib/revalidate'
import type { Guide } from '@/payload-types'

import type { Alternates } from './pages'
import { payloadClient } from './payload'

/**
 * Weekly market notes: `Guides` with `section: 'piata'`. Published notes only, no language
 * fallback, so a note without an English text has no English page.
 */
const read = (locale: Locale) => ({
  locale,
  fallbackLocale: false as const,
  overrideAccess: false,
  pagination: false as const,
})

export type NoteCard = { id: number; slug: string; title: string; summary: string; date: string }

export const listMarketNotes = unstable_cache(
  async (locale: Locale): Promise<NoteCard[]> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'guides',
      ...read(locale),
      depth: 0,
      where: { section: { equals: 'piata' } },
      sort: '-createdAt',
      limit: 200,
      select: { slug: true, title: true, summary: true, createdAt: true },
    })
    return docs.flatMap((d) =>
      d.slug && d.title
        ? [{ id: d.id, slug: d.slug, title: d.title, summary: d.summary, date: d.createdAt }]
        : [],
    )
  },
  ['market:notes'],
  { tags: [tags.guides] },
)

const noteSlugs = unstable_cache(
  async (): Promise<{ id: number; slug: Partial<Record<Locale, string | null>> }[]> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'guides',
      locale: 'all',
      depth: 0,
      overrideAccess: false,
      pagination: false,
      where: { section: { equals: 'piata' } },
      select: { slug: true },
    })
    return docs.map((d) => ({ id: d.id, slug: d.slug as unknown as Record<Locale, string> }))
  },
  ['market:note-slugs'],
  { tags: [tags.guides] },
)

export async function marketNoteAlternates(id: number): Promise<Alternates> {
  const slug = (await noteSlugs()).find((n) => n.id === id)?.slug
  return {
    ...(slug?.ro ? { ro: marketNotePath(slug.ro, 'ro') } : {}),
    ...(slug?.en ? { en: marketNotePath(slug.en, 'en') } : {}),
  }
}

export const allMarketNoteAlternates = async () =>
  Promise.all((await noteSlugs()).map((n) => marketNoteAlternates(n.id)))

export const getMarketNote = unstable_cache(
  async (slug: string, locale: Locale): Promise<Guide | null> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'guides',
      ...read(locale),
      where: { slug: { equals: slug }, section: { equals: 'piata' } },
      depth: 1,
      limit: 1,
    })
    return docs[0] ?? null
  },
  ['market:note'],
  { tags: [tags.guides, tags.people] },
)
