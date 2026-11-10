/**
 * Writes each brief (`briefs.ts`) as a draft farmer guide, once. A brief already in the
 * database is never touched again: editors own it from then on. The draft has no summary and
 * no text, so it cannot be published until it is written (both fields are required).
 */
import type { Payload } from 'payload'

import { briefs, type Brief } from './briefs'

export const briefKey = (b: Brief) => `ghid-${b.slug.ro}`

export function briefFields(b: Brief) {
  return {
    // Approved by the owner on 2026-11-10 (for now, until the experts are named).
    status: 'aprobat' as const,
    intent: b.intent,
    plannedFor: b.planned,
    refreshBy: b.refresh ?? null,
    serpNotes: [b.serp, '', 'Surse de verificat:', ...b.sources.map((s) => `- ${s}`)].join('\n'),
    outline: b.outline.map((h) => `- ${h}`).join('\n'),
    links: b.links.join('\n'),
    faqIdeas: b.faq.map((q) => `- ${q}`).join('\n'),
  }
}

export async function applyBriefs(payload: Payload, log: (s: string) => void = console.log) {
  let created = 0
  for (const b of briefs) {
    const key = briefKey(b)
    const { docs } = await payload.find({
      collection: 'guides',
      where: { key: { equals: key } },
      limit: 1,
      depth: 0,
      draft: true,
    })
    if (docs[0]) continue
    const doc = await payload.create({
      collection: 'guides',
      locale: 'ro',
      draft: true,
      data: {
        key,
        section: 'ghid',
        pillar: b.pillar,
        title: b.title.ro,
        slug: b.slug.ro,
        generateSlug: false,
        brief: {
          ...briefFields(b),
          primaryKeyword: b.keyword.ro,
          secondaryKeywords: b.secondary.ro,
        },
      } as never,
    })
    await payload.update({
      collection: 'guides',
      id: doc.id,
      locale: 'en',
      draft: true,
      data: {
        title: b.title.en,
        slug: b.slug.en,
        generateSlug: false,
        brief: { primaryKeyword: b.keyword.en, secondaryKeywords: b.secondary.en },
      } as never,
    })
    created++
  }
  log(`briefs: ${created} created, ${briefs.length - created} already there`)
}
