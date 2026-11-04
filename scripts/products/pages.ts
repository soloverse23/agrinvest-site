/**
 * Pages that must exist on a site that was seeded before they were written (`data/pages.json`).
 * The seed runs only on an empty database, so this step creates what is missing. It never
 * updates a page that exists: from then on the text belongs to staff and the lawyer.
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
  notice: { blockType: 'callout'; tone: string; title: string; body: string }
}
type PageFile = { key: string; ro: Side; en: Side }

const context = { skipChildren: true }

const dataOf = (side: Side) => ({
  title: side.title,
  slug: side.slug,
  summary: side.summary,
  // Drafts for the lawyer stay out of the index even after launch, until staff switch this off.
  seo: { title: side.seoTitle, noindex: true },
  layout: [side.notice, { blockType: 'richText', content: rt(side.body) }],
  _status: 'published',
})

export async function applyPages(payload: Payload, log: (s: string) => void) {
  const path = resolve('data/pages.json')
  if (!existsSync(path)) return
  const pages = JSON.parse(readFileSync(path, 'utf8')) as PageFile[]
  let created = 0
  for (const page of pages) {
    const { totalDocs } = await payload.count({
      collection: 'pages',
      where: { slug: { equals: page.ro.slug } },
      locale: 'ro',
    })
    if (totalDocs) continue
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
  log(`pages: ${pages.length} in data/pages.json, ${created} created`)
}
