/**
 * Applies the reviewed finance files to the database. Runs on every deploy after the migrations
 * (`scripts/deploy/prepare-database.sh`) and on `npm run seed`, so it must be safe to repeat and
 * safe next to staff. It follows the rule of `scripts/products/apply.ts`, per data group:
 *   current = wanted            nothing to do
 *   current = what we last wrote, or empty   nobody touched it: write the file's version
 *   otherwise                   staff changed it in the admin: leave it and report it
 *
 * Unlike products, it creates what is missing. It never sets a review status: a new document is
 * a `draft` for the lawyer, however good the file is.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Payload } from 'payload'
import type { z } from 'zod'

import { canon, hashOf, prune } from '../products/view'
import { contentFor } from '../seed/content'
import { contentEn } from '../seed/content-en'
import { pages as seededPages } from '../seed/pages'
import { rt } from '../seed/richtext'
import { applyFigures } from './figures'
import {
  guideFile,
  hubFile,
  productFile,
  type GuideFile,
  type HubFile,
  type ProductFile,
} from './schema'

const context = { skipChildren: true }
const locales = ['ro', 'en'] as const
type Loc = (typeof locales)[number]
type Obj = Record<string, unknown>
type Ledger = { groups?: Record<string, string> }
type Collection = 'finance-products' | 'guides'

export type DocReport = { key: string; created: boolean; written: string[]; conflicts: string[] }
export type FinanceReport = { products: DocReport[]; guides: DocReport[]; hub: DocReport | null }

// ───────────────────────── comparing rich text ─────────────────────────

/**
 * Rich text as comparable Markdown. Links and bold count: a corrected link must reach the
 * page, so plain text would not be enough here.
 */
export function richView(node: unknown): string {
  const walk = (n: unknown): string => {
    if (!n || typeof n !== 'object') return ''
    const { text, format, children, type, fields } = n as {
      text?: string
      format?: number | string
      children?: unknown[]
      type?: string
      fields?: { url?: string }
    }
    if (typeof text === 'string') return format === 1 ? `**${text}**` : text
    const inner = (children ?? []).map(walk).join('')
    if (type === 'link') return `[${inner}](${fields?.url ?? ''})`
    return type === 'root' || type === 'list' ? inner : `${inner}\n`
  }
  return walk((node as { root?: unknown } | null | undefined)?.root ?? node).trim()
}

const md = (markdown: string) => richView(rt(markdown))

// ───────────────────────── reading the files ─────────────────────────

function readDir<S extends z.ZodType>(dir: string, schema: S): z.infer<S>[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => {
      const parsed = schema.safeParse(JSON.parse(readFileSync(resolve(dir, f), 'utf8')))
      if (!parsed.success)
        throw new Error(
          `${f}: ${parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`,
        )
      const data = parsed.data as { key: string }
      if (`${data.key}.json` !== f) throw new Error(`${f}: the key is ${data.key}`)
      return parsed.data
    })
}

export const financeDir = () => resolve('data/finance')

// ───────────────────────── views: file and database ─────────────────────────

type Views = Record<string, unknown>

/** Localized value of a `locale: 'all'` document. */
const at = (value: unknown, l: Loc) => (value as Partial<Record<Loc, unknown>> | undefined)?.[l]
const rich = (value: unknown, l: Loc) => richView(at(value, l))
const rowsAt = (value: unknown, l: Loc) => (at(value, l) ?? []) as Obj[]
const pick = (rows: Obj[], ...keys: string[]) =>
  rows.map((r) => Object.fromEntries(keys.map((k) => [k, r[k]])))
const sourceRows = (rows: unknown) =>
  ((rows ?? []) as Obj[]).map((r) => ({
    title: r.title,
    url: r.url,
    retrieved: String(r.retrieved ?? '').slice(0, 10),
  }))

type Names = {
  person: (id: unknown) => string | undefined
  product: (id: unknown) => string | undefined
  guide: (id: unknown) => string | undefined
}
const keysOf = (ids: unknown, to: (id: unknown) => string | undefined) =>
  ((ids ?? []) as unknown[])
    .map(to)
    .filter((k): k is string => Boolean(k))
    .sort()

function productDocView(doc: Obj, names: Names): Views {
  const example = (doc.example ?? {}) as Obj
  const seo = (doc.seo ?? {}) as Obj
  const text = (l: Loc) => ({
    title: at(doc.title, l),
    slug: at(doc.slug, l),
    answer: at(doc.answer, l),
    fits: rich(doc.fits, l),
    notFor: rich(doc.notFor, l),
    finances: rich(doc.finances, l),
    repayment: rich(doc.repayment, l),
    example: {
      title: at(example.title, l),
      scenario: rich(example.scenario, l),
      rows: pick(rowsAt(example.rows, l), 'label', 'value'),
    },
    risks: rich(doc.risks, l),
    guarantees: pick(rowsAt(doc.guarantees, l), 'kind', 'note'),
    documents: pick(rowsAt(doc.documents, l), 'audience', 'label'),
    process: pick(rowsAt(doc.process, l), 'title', 'body'),
    faq: pick(rowsAt(doc.faq, l), 'question', 'answer'),
    seo: { title: at(seo.title, l), description: at(seo.description, l) },
  })
  return {
    'text.ro': text('ro'),
    'text.en': text('en'),
    data: {
      order: doc.order,
      harvestCalendar: doc.harvestCalendar !== false,
      borrowers: [...((doc.borrowers ?? []) as string[])].sort(),
    },
    links: {
      parent: names.product(doc.parent),
      advisor: names.person(doc.advisor),
      relatedProducts: keysOf(doc.relatedProducts, names.product),
      relatedGuides: keysOf(doc.relatedGuides, names.guide),
      sources: sourceRows(doc.sources),
    },
  }
}

function productFileView(file: ProductFile): Views {
  const text = (l: Loc) => {
    const t = file.text[l]
    return {
      ...t,
      fits: md(t.fits),
      notFor: md(t.notFor),
      finances: md(t.finances),
      repayment: md(t.repayment),
      example: { ...t.example, scenario: md(t.example.scenario) },
      risks: md(t.risks),
    }
  }
  return {
    'text.ro': text('ro'),
    'text.en': text('en'),
    data: {
      order: file.order,
      harvestCalendar: file.harvestCalendar,
      borrowers: [...file.borrowers].sort(),
    },
    links: {
      parent: file.parent,
      advisor: file.advisor,
      relatedProducts: [...file.relatedProducts].sort(),
      relatedGuides: [...file.relatedGuides].sort(),
      sources: file.sources,
    },
  }
}

function guideDocView(doc: Obj, names: Names): Views {
  const seo = (doc.seo ?? {}) as Obj
  const text = (l: Loc) => ({
    title: at(doc.title, l),
    slug: at(doc.slug, l),
    summary: at(doc.summary, l),
    body: rich(doc.body, l),
    terms: pick(rowsAt(doc.terms, l), 'term', 'definition'),
    faq: pick(rowsAt(doc.faq, l), 'question', 'answer'),
    seo: { title: at(seo.title, l), description: at(seo.description, l) },
  })
  return {
    'text.ro': text('ro'),
    'text.en': text('en'),
    data: { section: doc.section },
    links: {
      author: names.person(doc.author),
      reviewer: names.person(doc.reviewer),
      relatedProducts: keysOf(doc.relatedProducts, names.product),
      relatedGuides: keysOf(doc.relatedGuides, names.guide),
      sources: sourceRows(doc.sources),
    },
  }
}

function guideFileView(file: GuideFile): Views {
  const text = (l: Loc) => ({ ...file.text[l], body: md(file.text[l].body) })
  return {
    'text.ro': text('ro'),
    'text.en': text('en'),
    data: { section: file.section },
    links: {
      author: file.author,
      reviewer: file.reviewer,
      relatedProducts: [...file.relatedProducts].sort(),
      relatedGuides: [...file.relatedGuides].sort(),
      sources: file.sources,
    },
  }
}

// ───────────────────────── what a group writes ─────────────────────────

const productTextData = (file: ProductFile, l: Loc) => {
  const t = file.text[l]
  return {
    title: t.title,
    slug: t.slug,
    // Or Payload makes the slug from the title again, and the URL is no longer the file's.
    generateSlug: false,
    answer: t.answer,
    fits: rt(t.fits),
    notFor: rt(t.notFor),
    finances: rt(t.finances),
    repayment: rt(t.repayment),
    example: { title: t.example.title, scenario: rt(t.example.scenario), rows: t.example.rows },
    risks: rt(t.risks),
    guarantees: t.guarantees,
    documents: t.documents,
    process: t.process,
    faq: t.faq,
    seo: t.seo,
  }
}

const guideTextData = (file: GuideFile, l: Loc) => {
  const t = file.text[l]
  return {
    title: t.title,
    slug: t.slug,
    generateSlug: false,
    summary: t.summary,
    body: rt(t.body),
    terms: t.terms,
    faq: t.faq,
    seo: t.seo,
  }
}

// ───────────────────────── one document ─────────────────────────

/** Keeps a group only when the file may overwrite it. */
function decide(wanted: Views, current: Views | null, ledger: Ledger, report: DocReport) {
  const next: Record<string, string> = { ...ledger.groups }
  const write = new Set<string>()
  for (const group of Object.keys(wanted)) {
    const hash = hashOf(wanted[group])
    if (!current) {
      write.add(group)
      next[group] = hash
      continue
    }
    const now = hashOf(current[group])
    if (now === hash) next[group] = hash
    else if (now === ledger.groups?.[group] || prune(current[group]) === undefined) {
      write.add(group)
      next[group] = hash
    } else report.conflicts.push(group)
  }
  report.written = [...write]
  return { next, write }
}

type Spec<F> = {
  collection: Collection
  file: F & { key: string }
  wanted: Views
  textData: (l: Loc) => Obj
  data: Obj
  links: () => Obj
  view: (doc: Obj) => Views
  log: (s: string) => void
}

async function findByKey(payload: Payload, collection: Collection, key: string) {
  const { docs } = await payload.find({
    collection,
    where: { key: { equals: key } },
    locale: 'all',
    depth: 0,
    limit: 1,
    draft: true,
  })
  return (docs[0] as unknown as Obj | undefined) ?? null
}

async function applyDoc<F>(payload: Payload, spec: Spec<F>): Promise<DocReport> {
  const { collection, file, wanted } = spec
  const report: DocReport = { key: file.key, created: false, written: [], conflicts: [] }
  const doc = await findByKey(payload, collection, file.key)
  const ledger = (doc?.enrichment ?? {}) as Ledger
  const { next, write } = decide(wanted, doc ? spec.view(doc) : null, ledger, report)
  for (const group of report.conflicts)
    spec.log(`  ${file.key}: "${group}" was edited in the admin, left as it is`)

  const id =
    (doc?.id as number | undefined) ??
    (
      await payload.create({
        collection,
        locale: 'ro',
        data: {
          key: file.key,
          ...spec.textData('ro'),
          ...spec.data,
          _status: 'published',
        } as never,
        context,
      })
    ).id
  report.created = !doc
  const draft = doc?._status === 'draft'
  const update = (locale: Loc, data: Obj) =>
    payload.update({ collection, id, locale, data: data as never, context, draft })

  if (doc && write.has('text.ro')) await update('ro', spec.textData('ro'))
  if (write.has('text.en')) await update('en', spec.textData('en'))
  if (doc && write.has('data')) await update('ro', spec.data)
  if (write.has('links')) await update('ro', spec.links())
  if (canon(next) !== canon(ledger.groups ?? {}))
    await update('ro', { enrichment: { groups: next } })
  return report
}

// ───────────────────────── the finance hub (a CMS page) ─────────────────────────

const blockView = (block: Obj) => {
  const { id: _id, blockName: _name, ...rest } = block
  return block.blockType === 'richText' ? { ...rest, content: richView(block.content) } : rest
}

const hubDocView = (doc: Obj): Views => {
  const seo = (doc.seo ?? {}) as Obj
  const text = (l: Loc) => ({
    title: at(doc.title, l),
    summary: at(doc.summary, l),
    layout: rowsAt(doc.layout, l).map(blockView),
    faq: pick(rowsAt(doc.faq, l), 'question', 'answer'),
    seo: { title: at(seo.title, l), description: at(seo.description, l) },
  })
  return { 'text.ro': text('ro'), 'text.en': text('en') }
}

/** Markdown in `richText` blocks becomes rich text. */
const hubBlocks = (layout: HubFile['text']['ro']['layout']) =>
  layout.map((b) =>
    b.blockType === 'richText' ? { ...b, content: rt(b.content as string) } : b,
  ) as Obj[]

const hubFileView = (file: HubFile): Views => {
  const text = (l: Loc) => ({
    ...file.text[l],
    layout: hubBlocks(file.text[l].layout).map(blockView),
  })
  return { 'text.ro': text('ro'), 'text.en': text('en') }
}

/**
 * What the seed put on the page, so the first run can tell "untouched" from "edited". The seed
 * has no ledger: it ran on this site before this step existed.
 */
function hubBaseline(): Record<string, string> {
  const seed = seededPages.find((p) => p.key === 'finantare')
  const ctx = { people: {}, media: {} }
  const ro = contentFor('finantare', ctx)
  const en = contentEn('finantare', ctx)
  if (!seed?.en || !ro || !en) return {}
  const text = (
    side: { title: string; summary: string; seoTitle: string },
    layout: unknown,
    faq: unknown,
  ) => ({
    title: side.title,
    summary: side.summary,
    layout: (layout as Obj[]).map(blockView),
    faq: pick((faq ?? []) as Obj[], 'question', 'answer'),
    seo: { title: side.seoTitle },
  })
  return {
    'text.ro': hashOf(text(seed.ro, ro.ro, ro.faq?.ro)),
    'text.en': hashOf(text(seed.en, en.blocks, en.faq)),
  }
}

async function applyHub(
  payload: Payload,
  file: HubFile,
  log: (s: string) => void,
): Promise<DocReport | null> {
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'finantare' } },
    locale: 'all',
    depth: 0,
    limit: 1,
    draft: true,
  })
  const doc = docs[0] as unknown as Obj | undefined
  if (!doc) {
    log('  no "finantare" page: hub file skipped')
    return null
  }
  const report: DocReport = { key: 'hub', created: false, written: [], conflicts: [] }
  const stored = (doc.enrichment ?? {}) as Ledger
  const ledger = stored.groups ? stored : { groups: hubBaseline() }
  const { next, write } = decide(hubFileView(file), hubDocView(doc), ledger, report)
  for (const group of report.conflicts)
    log(`  hub: "${group}" was edited in the admin, left as it is`)
  for (const l of locales) {
    if (!write.has(`text.${l}`)) continue
    const t = file.text[l]
    await payload.update({
      collection: 'pages',
      id: doc.id as number,
      locale: l,
      data: {
        title: t.title,
        summary: t.summary,
        layout: hubBlocks(t.layout),
        faq: t.faq,
        seo: t.seo,
      } as never,
      context,
    })
  }
  if (canon(next) !== canon(stored.groups ?? {}))
    await payload.update({
      collection: 'pages',
      id: doc.id as number,
      locale: 'ro',
      data: { enrichment: { groups: next } } as never,
      context,
    })
  return report
}

// ───────────────────────── everything ─────────────────────────

type IdMaps = {
  people: Map<string, number>
  products: Map<string, number>
  guides: Map<string, number>
}

async function idMaps(payload: Payload): Promise<{ ids: IdMaps; names: Names }> {
  const read = async (collection: 'people' | Collection, key: string) => {
    const { docs } = await payload.find({
      collection,
      locale: 'ro',
      depth: 0,
      pagination: false,
      draft: true,
    })
    return new Map(docs.map((d) => [(d as unknown as Record<string, string>)[key], d.id as number]))
  }
  const ids = {
    people: await read('people', 'name'),
    products: await read('finance-products', 'key'),
    guides: await read('guides', 'key'),
  }
  const reverse = (map: Map<string, number>) => {
    const byId = new Map([...map].map(([k, v]) => [v, k]))
    return (id: unknown) => byId.get(id as number)
  }
  return {
    ids,
    names: {
      person: reverse(ids.people),
      product: reverse(ids.products),
      guide: reverse(ids.guides),
    },
  }
}

const idsOf = (keys: string[], map: Map<string, number>, what: string) =>
  keys.map((k) => {
    const id = map.get(k)
    if (!id) throw new Error(`Unknown ${what}: "${k}"`)
    return id
  })

export async function applyFinance(
  payload: Payload,
  log: (s: string) => void = console.log,
  dir = financeDir(),
): Promise<FinanceReport> {
  await applyFigures(payload, log)

  const products = readDir(resolve(dir, 'products'), productFile)
  const guides = readDir(resolve(dir, 'guides'), guideFile)

  // Two passes: documents first, because relations may point at any of them.
  const place = async (withLinks: boolean) => {
    const { ids, names } = await idMaps(payload)
    const out = { products: [] as DocReport[], guides: [] as DocReport[] }
    for (const file of products) {
      const wanted = productFileView(file)
      out.products.push(
        await applyDoc(payload, {
          collection: 'finance-products',
          file,
          wanted: withLinks ? wanted : withoutLinks(wanted),
          textData: (l) => productTextData(file, l),
          data: {
            order: file.order,
            harvestCalendar: file.harvestCalendar,
            borrowers: file.borrowers,
          },
          links: () => ({
            parent: file.parent ? idsOf([file.parent], ids.products, 'product')[0] : null,
            advisor: file.advisor ? idsOf([file.advisor], ids.people, 'person')[0] : null,
            relatedProducts: idsOf(file.relatedProducts, ids.products, 'product'),
            relatedGuides: idsOf(file.relatedGuides, ids.guides, 'guide'),
            sources: file.sources,
          }),
          view: (doc) => productDocView(doc, names),
          log,
        }),
      )
    }
    for (const file of guides) {
      const wanted = guideFileView(file)
      out.guides.push(
        await applyDoc(payload, {
          collection: 'guides',
          file,
          wanted: withLinks ? wanted : withoutLinks(wanted),
          textData: (l) => guideTextData(file, l),
          data: { section: file.section },
          links: () => ({
            author: file.author ? idsOf([file.author], ids.people, 'person')[0] : null,
            reviewer: file.reviewer ? idsOf([file.reviewer], ids.people, 'person')[0] : null,
            relatedProducts: idsOf(file.relatedProducts, ids.products, 'product'),
            relatedGuides: idsOf(file.relatedGuides, ids.guides, 'guide'),
            sources: file.sources,
          }),
          view: (doc) => guideDocView(doc, names),
          log,
        }),
      )
    }
    return out
  }
  const first = await place(false)
  const second = await place(true)

  const hubPath = resolve(dir, 'hub.json')
  const hub = existsSync(hubPath)
    ? await applyHub(payload, hubFile.parse(JSON.parse(readFileSync(hubPath, 'utf8'))), log)
    : null

  const merge = (a: DocReport[], b: DocReport[]) =>
    a.map((r, i) => ({
      ...r,
      written: [...new Set([...r.written, ...b[i].written])],
      conflicts: [...new Set([...r.conflicts, ...b[i].conflicts])],
    }))
  const report = {
    products: merge(first.products, second.products),
    guides: merge(first.guides, second.guides),
    hub,
  }
  const count = (list: DocReport[]) => list.filter((r) => r.written.length).length
  log(
    `finance: ${products.length} products (${count(report.products)} written), ` +
      `${guides.length} guides (${count(report.guides)} written), ` +
      `hub ${hub ? (hub.written.length ? 'written' : 'current') : 'none'}`,
  )
  return report
}

const withoutLinks = ({ links: _links, ...rest }: Views): Views => rest
