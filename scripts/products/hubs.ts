/**
 * Hub enrichment: brands, active ingredients, crops (their shop hub) and categories. Same rules
 * as products (see `apply.ts`): a group the step last wrote, or that is still as the first load
 * left it, is updated; a group staff edited is left alone and reported.
 *
 * Two groups per hub: `text` (intro, FAQ, SEO, buying advice) and `data` (the facts and the
 * `indexable` switch). The hub rules in `src/lib/shop/rules.ts` still decide whether a hub is
 * indexed: an intro and at least 3 products.
 */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Payload } from 'payload'

import { slugify } from '../../src/lib/slugify'
import { categories as seededCategories } from '../seed/data'
import { rt } from '../seed/richtext'
import { hubFiles, type HubKind } from './schema'
import { canon, hashOf, lexicalText, markdownText } from './view'

const context = { skipChildren: true }
type Obj = Record<string, unknown>
type Entry = Obj & { slug?: string; key?: string }
type HubGroup = 'text' | 'data'
const hubGroups: HubGroup[] = ['text', 'data']

export type HubReport = { kind: HubKind; id: string; written: HubGroup[]; conflicts: HubGroup[] }
export type LoadedHubs = Record<HubKind, Entry[]>

const collections = {
  brands: 'brands',
  ingredients: 'active-ingredients',
  crops: 'crops',
  categories: 'categories',
} as const

export const hubsDir = () => resolve('data/hubs')

export function loadHubFiles(dir = hubsDir()): LoadedHubs {
  const out = { brands: [], ingredients: [], crops: [], categories: [] } as LoadedHubs
  for (const kind of Object.keys(hubFiles) as HubKind[]) {
    const path = resolve(dir, `${kind}.json`)
    if (!existsSync(path)) continue
    out[kind] = hubFiles[kind].parse(JSON.parse(readFileSync(path, 'utf8'))) as Entry[]
  }
  return out
}

const idOf = (kind: HubKind, e: Entry) =>
  kind === 'crops' ? (e.key as string) : (e.slug as string)
const whereOf = (kind: HubKind, e: Entry) =>
  kind === 'crops' ? { key: { equals: e.key } } : { slug: { equals: e.slug } }

const both = (b: unknown) => {
  const v = b as { ro?: string; en?: string } | undefined
  return { ro: v?.ro, en: v?.en }
}
const flag = (v: unknown) => (v ? true : undefined)

// ───────────────────────── views: file and database ─────────────────────────

function viewOfEntry(kind: HubKind, e: Entry): Record<HubGroup, unknown> {
  const seo = e.seo as { ro: Obj; en: Obj }
  const faq = e.faq as { ro: unknown[]; en: unknown[] }
  const text: Obj = {
    intro: both(e.intro),
    seo: { ro: seo.ro, en: seo.en },
    ...(kind === 'crops' ? {} : { faq: { ro: faq.ro, en: faq.en } }),
    ...(kind === 'categories' && e.buyingAdvice
      ? {
          buyingAdvice: {
            ro: markdownText((e.buyingAdvice as { ro: string }).ro),
            en: markdownText((e.buyingAdvice as { en: string }).en),
          },
        }
      : {}),
  }
  const data: Obj = { indexable: flag(e.indexable) }
  if (kind === 'brands') Object.assign(data, { country: both(e.country), website: e.website })
  if (kind === 'ingredients')
    Object.assign(data, {
      nameEn: (e.name as { en: string }).en,
      chemicalGroup: both(e.chemicalGroup),
      resistanceGroup: e.resistanceGroup,
    })
  return { text, data }
}

const loc = (v: unknown, key: 'ro' | 'en') => (v as Obj | undefined)?.[key]
const locPair = (v: unknown) => ({ ro: loc(v, 'ro'), en: loc(v, 'en') })

function viewOfDoc(kind: HubKind, doc: Obj): Record<HubGroup, unknown> {
  const hub = (kind === 'crops' ? doc.shop : doc) as Obj | undefined
  const seo = (hub?.seo ?? {}) as Obj
  const text: Obj = {
    intro: locPair(hub?.intro),
    seo: {
      ro: { title: loc(seo.title, 'ro'), description: loc(seo.description, 'ro') },
      en: { title: loc(seo.title, 'en'), description: loc(seo.description, 'en') },
    },
  }
  if (kind !== 'crops')
    text.faq = {
      ro: ((loc(doc.faq, 'ro') as Obj[] | undefined) ?? []).map((r) => ({
        question: r.question,
        answer: r.answer,
      })),
      en: ((loc(doc.faq, 'en') as Obj[] | undefined) ?? []).map((r) => ({
        question: r.question,
        answer: r.answer,
      })),
    }
  if (kind === 'categories')
    text.buyingAdvice = {
      ro: lexicalText(loc(doc.buyingAdvice, 'ro')),
      en: lexicalText(loc(doc.buyingAdvice, 'en')),
    }
  const data: Obj = { indexable: flag(hub?.indexable) }
  if (kind === 'brands')
    Object.assign(data, { country: locPair(doc.country), website: doc.website })
  if (kind === 'ingredients')
    Object.assign(data, {
      nameEn: loc(doc.name, 'en'),
      chemicalGroup: locPair(doc.chemicalGroup),
      resistanceGroup: doc.resistanceGroup,
    })
  return { text, data }
}

/** What the first load left. Only categories carry an intro and `indexable` from the seed. */
function baselineOf(kind: HubKind, doc: Obj): Record<HubGroup, unknown> {
  if (kind === 'categories') {
    const seeded = seededCategories.find((c) => c.slug.ro === doc.slug_ro)
    return { text: { intro: seeded ? seeded.intro : {} }, data: { indexable: true } }
  }
  if (kind === 'ingredients') return { text: {}, data: { nameEn: loc(doc.name, 'ro') } }
  return { text: {}, data: {} }
}

// ───────────────────────── writing ─────────────────────────

const orNull = <T>(v: T | undefined) => (v === undefined || v === '' ? null : v)

function writeOf(kind: HubKind, group: HubGroup, e: Entry): { ro: Obj; en: Obj } {
  const w = { ro: {} as Obj, en: {} as Obj }
  const into = (key: 'ro' | 'en', data: Obj) =>
    Object.assign(kind === 'crops' ? ((w[key].shop ??= {}) as Obj) : w[key], data)
  if (group === 'text') {
    const seo = e.seo as { ro: Obj; en: Obj }
    const faq = e.faq as { ro: unknown[]; en: unknown[] }
    for (const key of ['ro', 'en'] as const) {
      into(key, {
        intro: (e.intro as Record<string, string>)[key],
        seo: { title: seo[key].title, description: seo[key].description },
      })
      if (kind !== 'crops') w[key].faq = faq[key]
      if (kind === 'categories')
        w[key].buyingAdvice = e.buyingAdvice
          ? rt((e.buyingAdvice as Record<string, string>)[key])
          : null
    }
  } else {
    into('ro', { indexable: Boolean(e.indexable) })
    if (kind === 'brands') {
      const c = both(e.country)
      w.ro.country = orNull(c.ro)
      w.en.country = orNull(c.en)
      w.ro.website = orNull(e.website)
    }
    if (kind === 'ingredients') {
      const c = both(e.chemicalGroup)
      w.ro.chemicalGroup = orNull(c.ro)
      w.en.chemicalGroup = orNull(c.en)
      w.ro.resistanceGroup = orNull(e.resistanceGroup)
      w.en.name = (e.name as { en: string }).en
    }
  }
  return w
}

async function create(payload: Payload, kind: HubKind, e: Entry) {
  const collection = collections[kind]
  if (kind === 'crops') return null // crops come from the seed: a missing one is a data error
  const name = kind === 'ingredients' ? (e.name as { ro: string; en: string }) : null
  const data = {
    name: name ? name.ro : (e.name as string),
    slug: e.slug,
    _status: 'published',
  }
  if (kind === 'categories') return null // the tree comes from the seed
  const doc = await payload.create({
    collection,
    locale: 'ro',
    data: data as never,
    context,
  })
  if (kind === 'ingredients')
    await payload.update({
      collection,
      id: doc.id,
      locale: 'en',
      // Like the importer: English starts as the Romanian name; the apply step sets its own.
      data: { name: name!.ro, slug: e.slug, _status: 'published' } as never,
      context,
    })
  return doc.id
}

export async function applyHubs(
  payload: Payload,
  files: LoadedHubs,
  log: (s: string) => void,
): Promise<HubReport[]> {
  const reports: HubReport[] = []
  for (const kind of Object.keys(files) as HubKind[]) {
    for (const e of files[kind]) {
      const collection = collections[kind]
      const find = () =>
        payload.find({
          collection,
          where: whereOf(kind, e) as never,
          locale: 'all',
          depth: 0,
          limit: 1,
          draft: true,
        })
      let { docs } = await find()
      let fresh = false
      if (!docs[0]) {
        const id = await create(payload, kind, e)
        if (id === null) {
          log(`  no ${kind} entry "${idOf(kind, e)}" in the database: skipped`)
          continue
        }
        ;({ docs } = await find())
        fresh = true
      }
      const doc = docs[0] as unknown as Obj & { id: number; _status?: string }
      // `slug` is a per-language field: the baseline needs the Romanian one.
      const slugRo = (doc.slug as Record<string, string> | string | undefined) ?? ''
      const named = { ...doc, slug_ro: typeof slugRo === 'string' ? slugRo : slugRo.ro }
      const wanted = viewOfEntry(kind, e)
      const current = viewOfDoc(kind, doc)
      const before = baselineOf(kind, named)
      const ledger =
        ((doc.enrichment ?? {}) as { groups?: Partial<Record<HubGroup, string>> }).groups ?? {}
      const next = { ...ledger }
      const report: HubReport = { kind, id: idOf(kind, e), written: [], conflicts: [] }
      const write = { ro: {} as Obj, en: {} as Obj }
      let changed = false
      for (const group of hubGroups) {
        const w = hashOf(wanted[group])
        const c = hashOf(current[group])
        if (w === c) {
          if (next[group] !== w) {
            next[group] = w
            changed = true
          }
          continue
        }
        const known = ledger[group] ?? hashOf(before[group])
        // A hub created a moment ago holds nothing staff could have edited.
        if (!fresh && c !== known && canon(current[group]) !== 'null') {
          report.conflicts.push(group)
          log(`  conflict ${kind}/${report.id} · ${group}: edited in the admin, left as it is`)
          continue
        }
        const part = writeOf(kind, group, e)
        for (const key of ['ro', 'en'] as const) {
          const target = write[key]
          for (const [k, v] of Object.entries(part[key]))
            target[k] = k === 'shop' && target.shop ? { ...(target.shop as Obj), ...(v as Obj) } : v
        }
        next[group] = w
        report.written.push(group)
        changed = true
      }
      reports.push(report)
      if (!changed) continue
      const draft = doc._status === 'draft'
      if (Object.keys(write.ro).length)
        await payload.update({
          collection,
          id: doc.id,
          locale: 'ro',
          data: write.ro as never,
          context,
          draft,
        })
      await payload.update({
        collection,
        id: doc.id,
        locale: 'en',
        data: { ...write.en, enrichment: { groups: next } } as never,
        context,
        draft,
      })
    }
  }
  const written = reports.filter((r) => r.written.length).length
  log(`hubs: ${reports.length} entries, ${written} written`)
  return reports
}

export { slugify }
