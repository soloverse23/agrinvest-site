/**
 * Three readings of a product, in one comparable shape ("views"):
 * - the reviewed file (what we want),
 * - the database document (what is there now),
 * - the importer's plan (what the first load wrote, which is what "untouched by staff" means).
 *
 * A view has one entry per data group. Each group is canonicalised, so equal data gives equal
 * hashes whichever way it was written: empty values and row ids drop out, rich text becomes
 * plain text, and relations are slugs.
 */
import { createHash } from 'node:crypto'

import type { PlannedProduct } from '../import/woo-plan'
import { slugify } from '../../src/lib/slugify'
import { rt } from '../seed/richtext'
import type { Bilingual, ProductFile } from './schema'

export const locales = ['ro', 'en'] as const
export type Loc = (typeof locales)[number]

export const groups = [
  'identity',
  'text.ro',
  'text.en',
  'technical',
  'doses',
  'verification',
  'notes',
] as const
export type Group = (typeof groups)[number]
export type View = Record<Group, unknown>

type Obj = Record<string, unknown>

/** Plain text of a Lexical tree, one line per block. */
export function lexicalText(node: unknown): string {
  const walk = (n: unknown): string => {
    if (!n || typeof n !== 'object') return ''
    const { text, children } = n as { text?: string; children?: unknown[] }
    if (typeof text === 'string') return text
    const parts = (children ?? []).map(walk)
    const block =
      (n as { type?: string }).type !== 'root' && (n as { type?: string }).type !== 'list'
    return block ? parts.join('') + '\n' : parts.join('')
  }
  const root = (node as { root?: unknown } | null | undefined)?.root ?? node
  return walk(root)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

export const markdownText = (markdown: string) => lexicalText(rt(markdown))

const empty = (v: unknown) =>
  v === undefined ||
  v === null ||
  v === '' ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === 'object' && !Array.isArray(v) && Object.keys(v as Obj).length === 0)

/** Drops empty values and row ids, so absent and empty compare equal. */
export function prune(value: unknown): unknown {
  if (Array.isArray(value)) {
    const items = value.map(prune).filter((v) => !empty(v))
    return items.length ? items : undefined
  }
  if (value && typeof value === 'object') {
    const out: Obj = {}
    for (const key of Object.keys(value).sort()) {
      if (key === 'id') continue
      const v = prune((value as Obj)[key])
      if (!empty(v)) out[key] = v
    }
    return Object.keys(out).length ? out : undefined
  }
  return typeof value === 'string' ? value.trim() : value
}

export const canon = (value: unknown) => JSON.stringify(prune(value) ?? null)
export const hashOf = (value: unknown) =>
  createHash('sha256').update(canon(value)).digest('hex').slice(0, 16)

const day = (v: unknown) => (typeof v === 'string' && v ? v.slice(0, 10) : undefined)
const pair = (b?: Bilingual | { ro?: string; en?: string }) =>
  b ? { ro: b.ro, en: b.en } : undefined

/** Relations as the views carry them: slugs (crops by key). */
export type Names = {
  brand: (id: unknown) => string | undefined
  category: (id: unknown) => string | undefined
  crop: (id: unknown) => string | undefined
  target: (id: unknown) => string | undefined
  ingredient: (id: unknown) => string | undefined
}

const many = (ids: unknown, to: (id: unknown) => string | undefined) =>
  (Array.isArray(ids) ? ids : [])
    .map(to)
    .filter((s): s is string => Boolean(s))
    .sort()

// ───────────────────────── from the database (all locales) ─────────────────────────

type Doc = Obj & { productType?: string }

const rowsOf = (rows: unknown) => (Array.isArray(rows) ? (rows as Obj[]) : [])

export function viewOfDoc(doc: Doc, names: Names): View {
  const l = (v: unknown, key: Loc) => (v as Record<string, unknown> | undefined)?.[key]
  const loc = (v: unknown) => ({ ro: l(v, 'ro'), en: l(v, 'en') })
  const p = (doc.protection ?? {}) as Obj
  const s = (doc.seed ?? {}) as Obj
  const f = (doc.fertiliser ?? {}) as Obj
  const verification = (doc.verification ?? {}) as Obj
  const seo = (doc.seo ?? {}) as Obj

  const technical =
    doc.productType === 'protection'
      ? {
          activeIngredients: rowsOf(p.activeIngredients).map((r) => ({
            ingredient: names.ingredient(r.ingredient),
            concentration: r.concentration,
            unit: r.unit,
          })),
          formulation: p.formulation,
          registrationNumber: p.registrationNumber,
          registrationValidUntil: day(p.registrationValidUntil),
          modeOfAction: loc(p.modeOfAction),
          resistanceGroup: p.resistanceGroup,
          toxicityClass: p.toxicityClass,
          safety: loc(p.safety),
          professionalUse: p.professionalUse,
          compatibility: loc(p.compatibility),
        }
      : doc.productType === 'seed'
        ? {
            species: loc(s.species),
            variety: s.variety,
            faoGroup: s.faoGroup,
            maturity: loc(s.maturity),
            sowingDensity: loc(s.sowingDensity),
            sowingRate: loc(s.sowingRate),
            yieldPotential: loc(s.yieldPotential),
            resistances: loc(s.resistances),
            recommendedZones: loc(s.recommendedZones),
            seedTreatment: loc(s.seedTreatment),
          }
        : {
            nutrients: rowsOf(f.nutrients).map((r) => ({
              nutrient: r.nutrient,
              percent: r.percent,
            })),
            form: loc(f.form),
            granuleSize: f.granuleSize,
            storage: loc(f.storage),
          }

  const doses =
    doc.productType === 'protection'
      ? rowsOf(p.doses).map((r) => ({
          cropText: loc(r.cropText),
          crops: many(r.crops, names.crop),
          targetText: loc(r.targetText),
          targets: many(r.target, names.target),
          timing: loc(r.timing),
          bbch: r.bbch,
          doseText: loc(r.doseText),
          doseMin: r.doseMin,
          doseMax: r.doseMax,
          doseUnit: r.doseUnit,
          waterVolume: r.waterVolume,
          maxTreatments: r.maxTreatments,
          waitingPeriod: r.waitingPeriod,
          notes: loc(r.notes),
        }))
      : rowsOf(f.rates).map((r) => ({
          cropText: loc(r.cropText),
          crops: many(r.crops, names.crop),
          timing: loc(r.timing),
          doseText: loc(r.rateText),
          doseMin: r.rateMin,
          doseMax: r.rateMax,
          doseUnit: r.rateUnit,
        }))

  const text = (key: Loc) => ({
    summary: l(doc.summary, key),
    description: lexicalText(l(doc.description, key)),
    faq: rowsOf(l(doc.faq, key)).map((r) => ({ question: r.question, answer: r.answer })),
    seoTitle: l(seo.title, key),
    seoDescription: l(seo.description, key),
  })

  const ver = (g: string) => {
    const v = (verification[g] ?? {}) as Obj
    return { status: v.status, source: v.source }
  }

  return {
    identity: {
      productType: doc.productType,
      brand: names.brand(doc.brand),
      primaryCategory: names.category(doc.primaryCategory),
      secondaryCategories: many(doc.secondaryCategories, names.category),
      crops: many(doc.crops, names.crop),
      targets: many(doc.targets, names.target),
    },
    'text.ro': text('ro'),
    'text.en': text('en'),
    technical,
    doses,
    verification: { technical: ver('technical'), doses: ver('doses') },
    notes: doc.sourceNotes,
  }
}

// ───────────────────────── from the reviewed file ─────────────────────────

/** The text of `sourceNotes`: the sources, gaps and conflicts, for staff only. */
export function notesOf(file: ProductFile) {
  const lines = [
    ...file.sources.technical.map(
      (s) => `Technical data (${s.kind}, ${s.retrieved}): ${s.url}${s.note ? ` – ${s.note}` : ''}`,
    ),
    ...file.sources.doses.map(
      (s) => `Doses (${s.kind}, ${s.retrieved}): ${s.url}${s.note ? ` – ${s.note}` : ''}`,
    ),
    ...file.gaps.map((g) => `Gap: ${g}`),
    ...file.conflicts.map((c) => `Conflict: ${c}`),
  ]
  return lines.join('\n')
}

export function viewOfFile(file: ProductFile, type: string): View {
  const p = file.protection
  const s = file.seed
  const f = file.fertiliser
  const technical =
    type === 'protection' && p
      ? {
          activeIngredients: p.activeIngredients.map((i) => ({
            ingredient: slugify(i.name),
            concentration: i.concentration,
            unit: i.unit,
          })),
          formulation: p.formulation,
          registrationNumber: p.registrationNumber,
          registrationValidUntil: p.registrationValidUntil,
          modeOfAction: pair(p.modeOfAction),
          resistanceGroup: p.resistanceGroup,
          toxicityClass: p.toxicityClass,
          safety: pair(p.safety),
          professionalUse: p.professionalUse,
          compatibility: pair(p.compatibility),
        }
      : type === 'seed' && s
        ? {
            species: pair(s.species),
            variety: s.variety,
            faoGroup: s.faoGroup,
            maturity: pair(s.maturity),
            sowingDensity: pair(s.sowingDensity),
            sowingRate: pair(s.sowingRate),
            yieldPotential: pair(s.yieldPotential),
            resistances: pair(s.resistances),
            recommendedZones: pair(s.recommendedZones),
            seedTreatment: pair(s.seedTreatment),
          }
        : type === 'fertiliser' && f
          ? {
              nutrients: f.nutrients,
              form: pair(f.form),
              granuleSize: f.granuleSize,
              storage: pair(f.storage),
            }
          : {}
  const doses = file.doses.map((d) =>
    type === 'protection'
      ? {
          cropText: pair(d.cropText),
          crops: [...d.crops].sort(),
          targetText: pair(d.targetText),
          targets: [...d.targets].sort(),
          timing: pair(d.timing),
          bbch: d.bbch,
          doseText: pair(d.doseText),
          doseMin: d.doseMin,
          doseMax: d.doseMax,
          doseUnit: d.doseUnit,
          waterVolume: d.waterVolume,
          maxTreatments: d.maxTreatments,
          waitingPeriod: d.waitingPeriod,
          notes: pair(d.notes),
        }
      : {
          cropText: pair(d.cropText),
          crops: [...d.crops].sort(),
          timing: pair(d.timing),
          doseText: pair(d.doseText),
          doseMin: d.doseMin,
          doseMax: d.doseMax,
          doseUnit: d.doseUnit,
        },
  )
  const text = (key: Loc) => ({
    summary: file.text[key].summary,
    description: markdownText(file.text[key].description),
    faq: file.text[key].faq,
    seoTitle: file.text[key].seo.title,
    seoDescription: file.text[key].seo.description,
  })
  const sources = (list: { url: string }[]) => list[0]?.url
  return {
    identity: {
      productType: file.productType ?? type,
      brand: file.brand,
      primaryCategory: file.category,
      secondaryCategories: [...file.secondaryCategories].sort(),
      crops: [...file.crops].sort(),
      targets: [...file.targets].sort(),
    },
    'text.ro': text('ro'),
    'text.en': text('en'),
    technical,
    doses,
    // Only Agrinvest confirms: the file never sets anything but "to-confirm".
    verification: {
      technical: { status: 'to-confirm', source: sources(file.sources.technical) },
      doses: { status: 'to-confirm', source: sources(file.sources.doses) },
    },
    notes: notesOf(file),
  }
}

// ───────────────────────── from the importer's plan ─────────────────────────

/** What `scripts/import/woo.ts` wrote. Used only to tell "untouched since import" from "edited". */
export function viewOfPlan(p: PlannedProduct): View {
  const ro = (v: unknown) => ({ ro: v })
  const doses =
    p.productType === 'protection'
      ? p.doses.map((d) => ({
          cropText: ro(d.cropText),
          crops: [...d.crops].sort(),
          targetText: ro(d.targetText),
          timing: ro(d.timing),
          doseText: ro(d.doseText),
          doseMin: d.doseMin,
          doseMax: d.doseMax,
          doseUnit: d.doseUnit,
          waterVolume: d.waterVolume,
          waitingPeriod: d.waitingPeriod,
          notes: ro(d.notes),
        }))
      : p.doses.map((d) => ({
          cropText: ro(d.cropText),
          crops: [...d.crops].sort(),
          timing: ro(d.timing),
          doseText: ro(d.doseText),
          doseMin: d.doseMin,
          doseMax: d.doseMax,
          doseUnit: d.doseUnit,
        }))
  const technical =
    p.productType === 'protection'
      ? {
          activeIngredients: p.ingredients.map((i) => ({
            ingredient: slugify(i.name),
            concentration: i.concentration,
            unit: i.unit,
          })),
          formulation: p.formulation,
          // The collection's default.
          professionalUse: true,
        }
      : p.productType === 'seed'
        ? { species: { ro: p.species?.ro, en: p.species?.en }, variety: p.variety }
        : {}
  return {
    identity: {
      productType: p.productType,
      brand: p.brand ? slugify(p.brand) : undefined,
      primaryCategory: p.category,
      secondaryCategories: [...p.secondary].sort(),
      crops: [...p.crops].sort(),
      targets: [],
    },
    'text.ro': {
      summary: p.summary,
      description: p.description ? markdownText(p.description) : '',
    },
    'text.en': {},
    technical,
    doses,
    verification: {
      technical: { status: 'to-confirm', source: p.source },
      doses: { status: 'to-confirm', source: p.source },
    },
    notes: p.issues.join('\n'),
  }
}
