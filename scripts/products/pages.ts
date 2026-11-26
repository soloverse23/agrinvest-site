/**
 * Pages that must exist on a site that was seeded before they were written (`data/pages.json`).
 * The seed runs only on an empty database, so this step creates what is missing. A page that
 * exists is replaced only while it still opens with a draft notice (DRAFT_TITLES): once staff
 * or the lawyer edit it, or the final text has replaced the draft, the page is left alone.
 */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Payload } from 'payload'

import { rt } from '../seed/richtext'

type Side = {
  title: string
  slug: string
  seoTitle: string
  summary: string
  body: string
  /** A notice above the text, e.g. "draft for the lawyer". Final texts have none. */
  notice?: { blockType: 'callout'; tone: string; title: string; body: string }
  /** Leave the page out of search engines. Defaults to true while a notice is shown. */
  noindex?: boolean
}
type PageFile = { key: string; ro: Side; en: Side }

const context = { skipChildren: true }

/** Titles of the draft notices the seed and the first legal drafts put on top of a page. */
const DRAFT_TITLES = ['Proiect în lucru', 'Text în lucru', 'Work in progress', 'Draft']

const dataOf = (side: Side) => ({
  title: side.title,
  slug: side.slug,
  summary: side.summary,
  // Drafts for the lawyer stay out of the index even after launch, until staff switch this off.
  seo: { title: side.seoTitle, noindex: side.noindex ?? Boolean(side.notice) },
  layout: [
    ...(side.notice ? [side.notice] : []),
    { blockType: 'richText', content: rt(side.body) },
  ],
  _status: 'published',
})

const isDraft = (layout: unknown) => {
  const first = Array.isArray(layout) ? (layout[0] as { blockType?: string; title?: string }) : null
  return first?.blockType === 'callout' && DRAFT_TITLES.includes(first.title ?? '')
}

export async function applyPages(payload: Payload, log: (s: string) => void) {
  const path = resolve('data/pages.json')
  if (!existsSync(path)) return
  const pages = JSON.parse(readFileSync(path, 'utf8')) as PageFile[]
  let created = 0
  let replaced = 0
  for (const page of pages) {
    const found = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.ro.slug } },
      locale: 'ro',
      depth: 0,
      limit: 1,
    })
    const existing = found.docs[0]
    if (existing) {
      if (page.ro.notice || !isDraft(existing.layout)) continue
      for (const locale of ['ro', 'en'] as const) {
        await payload.update({
          collection: 'pages',
          id: existing.id,
          locale,
          data: dataOf(page[locale]) as never,
          context,
        })
      }
      replaced++
      continue
    }
    const doc = await payload.create({
      collection: 'pages',
      locale: 'ro',
      data: { ...dataOf(page.ro), isHome: false, languages: ['ro', 'en'] } as never,
      context,
    })
    await payload.update({
      collection: 'pages',
      id: doc.id,
      locale: 'en',
      data: dataOf(page.en) as never,
      context,
    })
    created++
  }
  log(`pages: ${pages.length} in data/pages.json, ${created} created, ${replaced} drafts replaced`)
}
