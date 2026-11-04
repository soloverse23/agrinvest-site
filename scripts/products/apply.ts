/**
 * Applies the reviewed enrichment files (`data/products/*.json`, `data/hubs/*.json`,
 * `data/targets.json`) to the database. Runs on every deploy (`scripts/deploy/prepare-database.sh`)
 * and on `npm run seed`, so it must be safe to repeat and safe next to staff.
 *
 * Per product and per data group (identity, text in each language, technical data, doses,
 * verification, notes) it compares three hashes:
 *   wanted   what the file says
 *   current  what the database holds
 *   known    what this step last wrote (the product's `enrichment` ledger), or, before the first
 *            run, what the importer wrote
 * - current = wanted          nothing to do (the ledger is brought up to date)
 * - current = known           nobody touched it: write the file's version
 * - current empty             nothing to lose: write the file's version
 * - otherwise                 staff changed it in the admin: leave it, and report the conflict
 *
 * It never creates products, never touches prices, stock, SKUs, photos, documents,
 * `commerceStatus` or related products, and never sets a verification status to "confirmed".
 * Nothing runs against a database other than the one in `DATABASE_URL`.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Payload } from 'payload'

import { slugify } from '../../src/lib/slugify'
import { planProducts } from '../import/woo-plan'
import { rt } from '../seed/richtext'
import { applyHubs, loadHubFiles, type HubReport } from './hubs'
import { productFile, targetsFile, type Dose, type ProductFile, type TargetEntry } from './schema'
import {
  canon,
  groups,
  hashOf,
  locales,
  viewOfDoc,
  viewOfFile,
  viewOfPlan,
  type Group,
  type Loc,
  type Names,
  type View,
} from './view'

const context = { skipChildren: true }
export const productsDir = () => resolve('data/products')
export const targetsPath = () => resolve('data/targets.json')

type Obj = Record<string, unknown>
type Ledger = { groups?: Partial<Record<Group, string>> }

export type ProductReport = {
  slug: string
  written: Group[]
  conflicts: Group[]
  unchanged: boolean
}
export type ApplyReport = {
  products: ProductReport[]
  missing: string[]
  hubs: HubReport[]
  targets: number
}

// ───────────────────────── reading the files ─────────────────────────

export function loadProductFiles(dir = productsDir()): ProductFile[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => {
      const parsed = productFile.safeParse(JSON.parse(readFileSync(resolve(dir, f), 'utf8')))
      if (!parsed.success)
        throw new Error(
          `${f}: ${parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`,
        )
      if (`${parsed.data.slug}.json` !== f) throw new Error(`${f}: the slug is ${parsed.data.slug}`)
      return parsed.data
    })
}

export function loadTargets(path = targetsPath()): TargetEntry[] {
  return existsSync(path) ? targetsFile.parse(JSON.parse(readFileSync(path, 'utf8'))) : []
}

// ───────────────────────── lookups ─────────────────────────

type Lookup = {
  names: Names
  ids: Record<'brand' | 'category' | 'crop' | 'target' | 'ingredient', Map<string, number>>
}

async function lookups(payload: Payload): Promise<Lookup> {
  const read = async (
    collection: 'brands' | 'categories' | 'crops' | 'targets' | 'active-ingredients',
    key: string,
  ) => {
    const { docs } = await payload.find({
      collection,
      locale: 'ro',
      depth: 0,
      pagination: false,
      draft: true,
    })
    const byId = new Map<number, string>()
    const bySlug = new Map<string, number>()
    for (const d of docs) {
      const k = (d as unknown as Record<string, string>)[key]
      byId.set(d.id, k)
      bySlug.set(k, d.id)
    }
    return { byId, bySlug }
  }
  const [brand, category, crop, target, ingredient] = await Promise.all([
    read('brands', 'slug'),
    read('categories', 'slug'),
    read('crops', 'key'),
    read('targets', 'slug'),
    read('active-ingredients', 'slug'),
  ])
  const name = (m: Map<number, string>) => (id: unknown) =>
    m.get(typeof id === 'object' && id ? (id as { id: number }).id : (id as number))
  return {
    names: {
      brand: name(brand.byId),
      category: name(category.byId),
      crop: name(crop.byId),
      target: name(target.byId),
      ingredient: name(ingredient.byId),
    },
    ids: {
      brand: brand.bySlug,
      category: category.bySlug,
      crop: crop.bySlug,
      target: target.bySlug,
      ingredient: ingredient.bySlug,
    },
  }
}

/** Targets are created when missing and never overwritten: staff own them afterwards. */
async function applyTargets(payload: Payload, entries: TargetEntry[], lookup: Lookup) {
  let created = 0
  for (const t of entries) {
    if (lookup.ids.target.has(t.slug)) continue
    const crops = t.crops.flatMap((k) => lookup.ids.crop.get(k) ?? [])
    const doc = await payload.create({
      collection: 'targets',
      locale: 'ro',
      data: { name: t.name.ro, slug: t.slug, kind: t.kind, crops } as never,
      context,
    })
    await payload.update({
      collection: 'targets',
      id: doc.id,
      locale: 'en',
      data: { name: t.name.en, slug: slugify(t.name.en) } as never,
      context,
    })
    lookup.ids.target.set(t.slug, doc.id)
    created++
  }
  return created
}

/** Ingredients named in a file but not yet in the database, created like the importer does. */
async function ensureIngredients(payload: Payload, file: ProductFile, lookup: Lookup) {
  for (const i of file.protection?.activeIngredients ?? []) {
    const slug = slugify(i.name)
    if (lookup.ids.ingredient.has(slug)) continue
    const data = { name: i.name, slug, _status: 'published' }
    const doc = await payload.create({
      collection: 'active-ingredients',
      locale: 'ro',
      data: data as never,
      context,
    })
    await payload.update({
      collection: 'active-ingredients',
      id: doc.id,
      locale: 'en',
      data: data as never,
      context,
    })
    lookup.ids.ingredient.set(slug, doc.id)
  }
}

// ───────────────────────── writing ─────────────────────────

const orNull = <T>(v: T | undefined) => (v === undefined || v === '' ? null : v)

type Write = { ro: Obj; en: Obj }
const merge = (into: Obj, from: Obj) => {
  for (const [k, v] of Object.entries(from)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && into[k] && typeof into[k] === 'object')
      merge(into[k] as Obj, v as Obj)
    else into[k] = v
  }
}

const idsOf = (lookup: Lookup, kind: keyof Lookup['ids'], slugs: string[]) =>
  slugs.map((s) => {
    const id = lookup.ids[kind].get(s)
    if (id === undefined) throw new Error(`Unknown ${kind} "${s}"`)
    return id
  })

/** The database fields of one group, per language. Language-free fields go in the Romanian pass. */
function writeOf(
  group: Group,
  file: ProductFile,
  type: string,
  lookup: Lookup,
  wanted: View,
): Write {
  const w: Write = { ro: {}, en: {} }
  if (group === 'identity') {
    w.ro = {
      productType: type,
      brand: file.brand ? idsOf(lookup, 'brand', [file.brand])[0] : null,
      primaryCategory: idsOf(lookup, 'category', [file.category])[0],
      secondaryCategories: idsOf(lookup, 'category', file.secondaryCategories),
      crops: idsOf(lookup, 'crop', file.crops),
      targets: idsOf(lookup, 'target', file.targets),
    }
  } else if (group === 'text.ro' || group === 'text.en') {
    const key: Loc = group === 'text.ro' ? 'ro' : 'en'
    const t = file.text[key]
    w[key] = {
      summary: t.summary,
      description: rt(t.description),
      faq: t.faq,
      seo: { title: t.seo.title, description: t.seo.description },
    }
  } else if (group === 'technical') {
    const p = file.protection
    const s = file.seed
    const f = file.fertiliser
    const both = (b?: { ro: string; en: string }) => ({
      ro: orNull(b?.ro),
      en: orNull(b?.en),
    })
    if (type === 'protection') {
      const ro: Obj = (w.ro.protection = {
        activeIngredients: (p?.activeIngredients ?? []).map((i) => ({
          ingredient: idsOf(lookup, 'ingredient', [slugify(i.name)])[0],
          concentration: i.concentration,
          unit: i.unit,
        })),
        formulation: orNull(p?.formulation),
        registrationNumber: orNull(p?.registrationNumber),
        registrationValidUntil: orNull(p?.registrationValidUntil),
        resistanceGroup: orNull(p?.resistanceGroup),
        toxicityClass: orNull(p?.toxicityClass),
        professionalUse: p?.professionalUse ?? true,
      })
      const en: Obj = (w.en.protection = {})
      for (const name of ['modeOfAction', 'safety', 'compatibility'] as const) {
        ro[name] = both(p?.[name]).ro
        en[name] = both(p?.[name]).en
      }
    } else if (type === 'seed') {
      const ro: Obj = (w.ro.seed = {
        species: orNull(s?.species.ro),
        variety: orNull(s?.variety),
        faoGroup: orNull(s?.faoGroup),
      })
      const en: Obj = (w.en.seed = { species: orNull(s?.species.en) })
      for (const name of [
        'maturity',
        'sowingDensity',
        'sowingRate',
        'yieldPotential',
        'resistances',
        'recommendedZones',
        'seedTreatment',
      ] as const) {
        ro[name] = orNull(s?.[name]?.ro)
        en[name] = orNull(s?.[name]?.en)
      }
    } else if (type === 'fertiliser') {
      w.ro.fertiliser = {
        nutrients: (f?.nutrients ?? []).map((n) => ({ nutrient: n.nutrient, percent: n.percent })),
        form: orNull(f?.form?.ro),
        granuleSize: orNull(f?.granuleSize),
        storage: orNull(f?.storage?.ro),
      }
      w.en.fertiliser = { form: orNull(f?.form?.en), storage: orNull(f?.storage?.en) }
    }
  } else if (group === 'doses') {
    // Rows go in with Romanian text first. The English pass needs the row ids (see `apply`).
    const rows = file.doses.map((d: Dose) => doseRow(d, type, lookup, 'ro'))
    if (type === 'protection') w.ro.protection = { doses: rows }
    else if (type === 'fertiliser') w.ro.fertiliser = { rates: rows }
  } else if (group === 'verification') {
    const v = wanted.verification as Record<string, { status: string; source?: string }>
    w.ro.verification = {
      technical: { status: v.technical.status, source: orNull(v.technical.source) },
      doses: { status: v.doses.status, source: orNull(v.doses.source) },
    }
  } else if (group === 'notes') {
    w.ro.sourceNotes = orNull(wanted.notes as string)
  }
  return w
}

function doseRow(d: Dose, type: string, lookup: Lookup, key: Loc): Obj {
  const pick = (b?: { ro: string; en: string }) => orNull(b?.[key])
  if (type === 'protection')
    return {
      cropText: pick(d.cropText),
      crops: key === 'ro' ? idsOf(lookup, 'crop', d.crops) : undefined,
      targetText: pick(d.targetText),
      target: key === 'ro' ? idsOf(lookup, 'target', d.targets) : undefined,
      timing: pick(d.timing),
      bbch: key === 'ro' ? orNull(d.bbch) : undefined,
      doseText: pick(d.doseText),
      doseMin: key === 'ro' ? orNull(d.doseMin) : undefined,
      doseMax: key === 'ro' ? orNull(d.doseMax) : undefined,
      doseUnit: key === 'ro' ? orNull(d.doseUnit) : undefined,
      waterVolume: key === 'ro' ? orNull(d.waterVolume) : undefined,
      maxTreatments: key === 'ro' ? orNull(d.maxTreatments) : undefined,
      waitingPeriod: key === 'ro' ? orNull(d.waitingPeriod) : undefined,
      notes: pick(d.notes),
    }
  return {
    cropText: pick(d.cropText),
    crops: key === 'ro' ? idsOf(lookup, 'crop', d.crops) : undefined,
    timing: pick(d.timing),
    rateText: pick(d.doseText),
    rateMin: key === 'ro' ? orNull(d.doseMin) : undefined,
    rateMax: key === 'ro' ? orNull(d.doseMax) : undefined,
    rateUnit: key === 'ro' ? orNull(d.doseUnit) : undefined,
  }
}

// ───────────────────────── one product ─────────────────────────

async function applyProduct(
  payload: Payload,
  file: ProductFile,
  lookup: Lookup,
  baseline: Map<string, View>,
  log: (s: string) => void,
): Promise<ProductReport | null> {
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: file.slug } },
    locale: 'all',
    depth: 0,
    limit: 1,
    draft: true,
  })
  const doc = docs[0] as unknown as Obj & { id: number; productType: string; _status?: string }
  if (!doc) return null
  const type = file.productType ?? doc.productType

  await ensureIngredients(payload, file, lookup)

  const wanted = viewOfFile(file, type)
  const current = viewOfDoc(doc, lookup.names)
  const before = baseline.get(file.slug)
  const ledger = ((doc.enrichment ?? {}) as Ledger).groups ?? {}
  const report: ProductReport = { slug: file.slug, written: [], conflicts: [], unchanged: true }
  const next: Partial<Record<Group, string>> = { ...ledger }
  const write: Write = { ro: {}, en: {} }

  for (const group of groups) {
    const wantedHash = hashOf(wanted[group])
    const currentHash = hashOf(current[group])
    if (wantedHash === currentHash) {
      if (next[group] !== wantedHash) {
        next[group] = wantedHash
        report.unchanged = false
      }
      continue
    }
    const known = ledger[group] ?? (before ? hashOf(before[group]) : undefined)
    const untouched = currentHash === known || canon(current[group]) === 'null'
    if (!untouched) {
      report.conflicts.push(group)
      log(`  conflict ${file.slug} · ${group}: edited in the admin, left as it is`)
      continue
    }
    const part = writeOf(group, file, type, lookup, wanted)
    merge(write.ro, part.ro)
    merge(write.en, part.en)
    next[group] = wantedHash
    report.written.push(group)
    report.unchanged = false
  }
  if (report.unchanged) return report

  const draft = doc._status === 'draft'
  if (Object.keys(write.ro).length)
    await payload.update({
      collection: 'products',
      id: doc.id,
      locale: 'ro',
      data: write.ro as never,
      context,
      draft,
    })
  // Rows with localized text are matched by id, so the English pass reuses the Romanian rows.
  if (report.written.includes('doses') && type !== 'seed') {
    const fresh = (await payload.findByID({
      collection: 'products',
      id: doc.id,
      locale: 'ro',
      depth: 0,
      draft: true,
    })) as unknown as Obj
    const rows = (
      type === 'protection'
        ? (fresh.protection as Obj | undefined)?.doses
        : (fresh.fertiliser as Obj | undefined)?.rates
    ) as { id?: string }[] | undefined
    const en = file.doses.map((d, i) => ({ id: rows?.[i]?.id, ...doseRow(d, type, lookup, 'en') }))
    merge(
      write.en,
      type === 'protection' ? { protection: { doses: en } } : { fertiliser: { rates: en } },
    )
  }
  await payload.update({
    collection: 'products',
    id: doc.id,
    locale: 'en',
    data: { ...write.en, enrichment: { groups: next } } as never,
    context,
    draft,
  })
  return report
}

// ───────────────────────── everything ─────────────────────────

/** Where the files are (tests point elsewhere) and, for products the importer did not make, what they looked like at the start. */
export type Sources = {
  products?: string
  hubs?: string
  targets?: string
  baseline?: Map<string, View>
}

export async function applyEnrichment(
  payload: Payload,
  log: (s: string) => void = console.log,
  from: Sources = {},
): Promise<ApplyReport> {
  const files = loadProductFiles(from.products)
  const hubFiles = loadHubFiles(from.hubs)
  const lookup = await lookups(payload)
  const targets = await applyTargets(payload, loadTargets(from.targets), lookup)

  // Hubs first: products point at brands.
  const hubs = await applyHubs(payload, hubFiles, log)
  const refreshed = await lookups(payload)
  lookup.names = refreshed.names
  lookup.ids = refreshed.ids

  const baseline = new Map([
    ...planProducts().map((p) => [p.slug, viewOfPlan(p)] as const),
    ...(from.baseline ?? []),
  ])
  const products: ProductReport[] = []
  const missing: string[] = []
  for (const file of files) {
    const r = await applyProduct(payload, file, lookup, baseline, log)
    if (r) products.push(r)
    else missing.push(file.slug)
  }
  const written = products.filter((p) => p.written.length)
  const conflicts = products.filter((p) => p.conflicts.length)
  log(
    `enrichment: ${files.length} files, ${written.length} products written, ` +
      `${products.length - written.length - conflicts.length} already current, ` +
      `${conflicts.length} with groups edited in the admin, ${missing.length} without a product`,
  )
  for (const slug of missing) log(`  no product "${slug}" in the database: file skipped`)
  return { products, missing, hubs, targets }
}

export { locales }
