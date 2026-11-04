/**
 * Shape of the reviewed enrichment files: `data/products/{slug}.json` and `data/hubs/*.json`.
 *
 * Rules the shape enforces:
 * - A file owns whole groups. A field left out is empty, not "unchanged".
 * - Every agronomic group (technical data, doses) names its sources. Nothing here is ever
 *   `confirmed`: only Agrinvest confirms, in the admin.
 * - Text exists in both languages.
 */
import { z } from 'zod'

const text = z.string().trim().min(1)
/** A text in both languages. */
export const bilingual = z.object({ ro: text, en: text })
export type Bilingual = z.infer<typeof bilingual>
const optionalBilingual = bilingual.optional()

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const slug = z.string().regex(slugPattern)

export const sourceKinds = [
  'register', // the official ANF register or a meeting's decisions
  'eu-database', // the EU plant protection products database
  'classification', // HRAC / IRAC resistance classification of a substance
  'label', // a manufacturer's label
  'technical-sheet', // a manufacturer's technical sheet
  'catalogue', // a seed or fertiliser catalogue
  'old-shop', // the old agrinvestshop.ro text: the weakest source
] as const

export const source = z.object({
  url: z.url(),
  kind: z.enum(sourceKinds),
  /** Which statement of the source supports which values, in a few words. */
  note: z.string().optional(),
  /** Day the source was read (YYYY-MM-DD). */
  retrieved: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})
export type Source = z.infer<typeof source>

const faqItem = z.object({ question: text, answer: text })

const localeText = z.object({
  /** The direct answer shown at the top of the page: 1–3 sentences. */
  summary: text,
  /** Markdown: paragraphs, `### ` headings and `- ` lists. */
  description: text,
  /** Only real questions a buyer asks. May be empty. */
  faq: z.array(faqItem),
  seo: z.object({ title: text, description: text }),
})

const ingredient = z.object({
  /** The ingredient's own name, as the hub shows it (lower case, Romanian). */
  name: text,
  concentration: z.number().positive().optional(),
  unit: z.enum(['g/l', 'g/kg', '%', 'cfu/g', 'cfu/ml']).optional(),
})

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const protection = z.object({
  activeIngredients: z.array(ingredient),
  formulation: z.string().optional(),
  registrationNumber: z.string().optional(),
  registrationValidUntil: date.optional(),
  modeOfAction: optionalBilingual,
  resistanceGroup: z.string().optional(),
  toxicityClass: z.string().optional(),
  safety: optionalBilingual,
  professionalUse: z.boolean().default(true),
  compatibility: optionalBilingual,
})

const seed = z.object({
  species: bilingual,
  variety: z.string(),
  faoGroup: z.string().optional(),
  maturity: optionalBilingual,
  sowingDensity: optionalBilingual,
  sowingRate: optionalBilingual,
  yieldPotential: optionalBilingual,
  resistances: optionalBilingual,
  recommendedZones: optionalBilingual,
  seedTreatment: optionalBilingual,
})

const fertiliser = z.object({
  nutrients: z.array(z.object({ nutrient: text, percent: z.number().nonnegative() })),
  form: optionalBilingual,
  granuleSize: z.string().optional(),
  storage: optionalBilingual,
})

/** One row of a dose table (protection) or a rate table (fertiliser). */
export const dose = z.object({
  cropText: bilingual,
  crops: z.array(z.string()),
  targetText: optionalBilingual,
  targets: z.array(slug).default([]),
  timing: optionalBilingual,
  bbch: z.string().optional(),
  /** As printed on the label or in the register. */
  doseText: bilingual,
  doseMin: z.number().nonnegative().optional(),
  doseMax: z.number().nonnegative().optional(),
  doseUnit: z.string().optional(),
  waterVolume: z.string().optional(),
  maxTreatments: z.number().int().positive().optional(),
  /** Days. */
  waitingPeriod: z.number().int().nonnegative().optional(),
  notes: optionalBilingual,
})
export type Dose = z.infer<typeof dose>

export const productFile = z
  .object({
    slug,
    /** Keyword-map keyword this page targets (informational; checked against the map). */
    primaryKeyword: z.object({ ro: text, en: text }),
    /** Set only to correct the type the importer chose (e.g. a microbial fertiliser filed as protection). */
    productType: z.enum(['protection', 'seed', 'fertiliser']).optional(),
    /** Empty while the manufacturer is unknown: that goes in `gaps`. */
    brand: slug.optional(),
    category: slug,
    secondaryCategories: z.array(slug).default([]),
    crops: z.array(z.string()).default([]),
    targets: z.array(slug).default([]),
    /** Filled in: the product cannot be ordered, and the page gives this reason. */
    saleBlock: optionalBilingual,
    text: z.object({ ro: localeText, en: localeText }),
    protection: protection.optional(),
    seed: seed.optional(),
    fertiliser: fertiliser.optional(),
    doses: z.array(dose).default([]),
    sources: z.object({
      technical: z.array(source),
      doses: z.array(source),
    }),
    /** Named gaps, in English, for the Agrinvest list. One short sentence each. */
    gaps: z.array(text).default([]),
    /** Doubts and conflicts between sources, for the Agrinvest list. */
    conflicts: z.array(text).default([]),
  })
  .strict()
export type ProductFile = z.infer<typeof productFile>

export const target = z.object({
  slug,
  kind: z.enum(['weed', 'disease', 'pest', 'deficiency']),
  name: bilingual,
  crops: z.array(z.string()).default([]),
})
export const targetsFile = z.array(target)
export type TargetEntry = z.infer<typeof target>

const hubBase = {
  slug,
  intro: bilingual,
  faq: z.object({ ro: z.array(faqItem), en: z.array(faqItem) }).default({ ro: [], en: [] }),
  seo: z.object({
    ro: z.object({ title: text, description: text }),
    en: z.object({ title: text, description: text }),
  }),
  /** The hub rules (`isHubIndexable`) still apply: an intro and at least 3 products. */
  indexable: z.boolean().default(true),
}

export const brandEntry = z.object({
  ...hubBase,
  name: text,
  country: optionalBilingual,
  website: z.url().optional(),
})
export const ingredientEntry = z.object({
  ...hubBase,
  /** Romanian and English names. The slug stays the one the import made. */
  name: bilingual,
  chemicalGroup: optionalBilingual,
  resistanceGroup: z.string().optional(),
})
/** Crop hubs are keyed by the crop's stable English key. */
export const cropEntry = z
  .object({ ...hubBase, key: z.string(), slug: z.string().optional() })
  .omit({ faq: true })
export const categoryEntry = z.object({ ...hubBase, buyingAdvice: optionalBilingual })

export type BrandEntry = z.infer<typeof brandEntry>
export type IngredientEntry = z.infer<typeof ingredientEntry>
export type CropEntry = z.infer<typeof cropEntry>
export type CategoryEntry = z.infer<typeof categoryEntry>

export const hubFiles = {
  brands: z.array(brandEntry),
  ingredients: z.array(ingredientEntry),
  crops: z.array(cropEntry),
  categories: z.array(categoryEntry),
} as const
export type HubKind = keyof typeof hubFiles
