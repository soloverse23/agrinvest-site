/**
 * Corrections from the owner (2026-11-05) for a site that is already live. The seed runs only on
 * an empty database, so its new text never reaches such a site: this step brings pages, menus
 * and people in line with it. Safe to repeat: once a text is corrected, nothing matches.
 *
 * Golden Relationship has stopped, and nothing about it is published until a new programme
 * starts. Its page is unpublished, not deleted, so it can come back.
 */
import type { Payload } from 'payload'

const context = { skipChildren: true }
type Obj = Record<string, unknown>

const topic = /golden[- ]relationship/i
const inTopic = (value: unknown) => topic.test(JSON.stringify(value) ?? '')

/** Old register key → the keys that replaced it. Empty means it left the site. */
export const splitKeys: Record<string, string[]> = {
  F4: ['F4.reply', 'F4.money'],
  F5: ['F5.term', 'F5.instalments'],
  C2: [],
  'C9.phone': [],
  P1: [],
}

/** In text. The long forms come first: their wording changed with the split. */
const textRewrites: [string, string][] = [
  ['{{F5}}, corelate cu recoltele', '{{F5.term}}, {{F5.instalments}}'],
  ['{{F5}}, aligned with the harvests', '{{F5.term}}, {{F5.instalments}}'],
  ['{{F4}}', '{{F4.reply}}'],
  ['{{F5}}', '{{F5.term}}, {{F5.instalments}}'],
  ['în {{S1}} baze.', 'în {{S1}} silozuri și depozite de cereale.'],
  ['across {{S1}} bases.', 'across {{S1}} silos and grain warehouses.'],
  [
    'Parteneriate pe termen lung, inclusiv prin programul Golden Relationship.',
    'Parteneriate pe termen lung.',
  ],
  [
    'Long-term partnerships, including the Golden Relationship programme.',
    'Long-term partnerships.',
  ],
]

export const rewriteText = (text: string) =>
  textRewrites.reduce((out, [from, to]) => out.split(from).join(to), text)

/**
 * A copy of some content with the corrections made. Children first, so a card about the
 * programme goes while the list that holds it stays.
 */
export function correct(value: unknown, field?: string): unknown {
  if (typeof value === 'string') return rewriteText(value)
  if (Array.isArray(value)) {
    if (field === 'keys') return value.flatMap((v) => splitKeys[v as string] ?? [v])
    return value.map((v) => correct(v)).filter((v) => !inTopic(v))
  }
  if (value && typeof value === 'object') {
    // A card with its own title stands without the link. A menu item is its link, so it keeps
    // it here, and the list above drops the whole item.
    const hasTitle = 'title' in value
    const entries = Object.entries(value).map(([k, v]) => {
      const fixed = correct(v, k)
      return [k, k === 'link' && hasTitle && inTopic(fixed) ? null : fixed] as const
    })
    return Object.fromEntries(entries)
  }
  return value
}

async function correctPages(payload: Payload, log: (s: string) => void) {
  let changed = 0
  for (const locale of ['ro', 'en'] as const) {
    const { docs } = await payload.find({
      collection: 'pages',
      locale,
      depth: 0,
      pagination: false,
      draft: true,
    })
    for (const doc of docs) {
      if (doc.slug === 'golden-relationship') continue
      const before = { summary: doc.summary, layout: doc.layout, faq: doc.faq }
      const after = correct(before) as Obj
      if (JSON.stringify(after) === JSON.stringify(before)) continue
      await payload.update({
        collection: 'pages',
        id: doc.id,
        locale,
        data: after as never,
        draft: doc._status === 'draft',
        context,
      })
      changed++
    }
  }
  if (changed) log(`corrections: ${changed} page version(s) updated`)
}

async function unpublishProgramme(payload: Payload, log: (s: string) => void) {
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'golden-relationship' }, _status: { equals: 'published' } },
    depth: 0,
    pagination: false,
  })
  for (const doc of docs) {
    await payload.update({
      collection: 'pages',
      id: doc.id,
      data: { _status: 'draft' } as never,
      context,
    })
    log('corrections: Golden Relationship page unpublished')
  }
}

async function correctMenus(payload: Payload, log: (s: string) => void) {
  for (const slug of ['navigation', 'footer'] as const) {
    for (const locale of ['ro', 'en'] as const) {
      const before = await payload.findGlobal({ slug, locale, depth: 0 })
      const after = correct(before)
      if (JSON.stringify(after) === JSON.stringify(before)) continue
      await payload.updateGlobal({ slug, locale, data: after as never, context })
      log(`corrections: ${slug} (${locale}) updated`)
    }
  }
}

async function correctPeople(payload: Payload) {
  const { docs } = await payload.find({
    collection: 'people',
    locale: 'all',
    depth: 0,
    pagination: false,
  })
  for (const doc of docs) {
    const role = doc.role as unknown as Record<'ro' | 'en', string | undefined> | undefined
    if (inTopic(role)) {
      await payload.update({
        collection: 'people',
        id: doc.id,
        locale: 'ro',
        data: { role: 'Inginer agronom' },
        context,
      })
      await payload.update({
        collection: 'people',
        id: doc.id,
        locale: 'en',
        data: { role: 'Agronomist' },
        context,
      })
    }
    // The main phone left the site; the person's own number is a different matter.
    if (doc.name === 'Agrinvest' && doc.phone)
      await payload.update({
        collection: 'people',
        id: doc.id,
        data: { phone: null, publishPhone: false },
        context,
      })
  }
}

export async function applyCorrections(payload: Payload, log: (s: string) => void) {
  await unpublishProgramme(payload, log)
  await correctPages(payload, log)
  await correctMenus(payload, log)
  await correctPeople(payload)
}
