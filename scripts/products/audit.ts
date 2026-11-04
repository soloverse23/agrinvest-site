/**
 * What is complete, missing or unconfirmed in the enrichment files. Pure functions: the
 * `check:products` script prints them and the tests exercise them. They read files, never the
 * database, so they run anywhere.
 */
import { categories, crops as grainCrops, shopCrops } from '../seed/data'
import type { ProductFile } from './schema'

export type Audit = {
  slug: string
  /** Filled groups. */
  filled: string[]
  /** Groups still empty, each with the reason a person needs. */
  gaps: string[]
  /** Everything is `to-confirm` until Agrinvest confirms it in the admin. */
  unconfirmed: string[]
  /** Data without a source URL. */
  missingSources: string[]
  /** Breaks a rule: the check fails on these. */
  errors: string[]
  /** Flagged for Agrinvest: registration problems and conflicts between sources. */
  flags: string[]
}

export type Context = {
  brands: Set<string>
  targets: Set<string>
  today: Date
}

export const cropKeys = new Set<string>([...grainCrops, ...shopCrops].map((c) => c.key))
export const categorySlugs = new Set<string>(categories.map((c) => c.slug.ro))

const CEDILLA = /[şţŞŢ]/
const empty = (v: unknown) =>
  v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)

/** Every text of a file, for the language rules. */
function textsOf(file: ProductFile): string[] {
  const out: string[] = []
  const walk = (v: unknown) => {
    if (typeof v === 'string') out.push(v)
    else if (Array.isArray(v)) v.forEach(walk)
    else if (v && typeof v === 'object') Object.values(v).forEach(walk)
  }
  walk(file.text)
  walk(file.protection)
  walk(file.seed)
  walk(file.fertiliser)
  walk(file.doses)
  return out
}

export function auditProduct(file: ProductFile, type: string, ctx: Context): Audit {
  const a: Audit = {
    slug: file.slug,
    filled: [],
    gaps: [],
    unconfirmed: [],
    missingSources: [],
    errors: [],
    flags: [],
  }
  const have = (name: string, ok: boolean, gap: string) =>
    (ok ? a.filled : a.gaps).push(ok ? name : gap)

  // Identity
  have('brand', Boolean(file.brand), 'brand')
  if (file.brand && !ctx.brands.has(file.brand))
    a.errors.push(`brand "${file.brand}" has no entry in data/hubs/brands.json`)
  if (!categorySlugs.has(file.category)) a.errors.push(`unknown category "${file.category}"`)
  for (const c of [...file.crops, ...file.doses.flatMap((d) => d.crops)])
    if (!cropKeys.has(c)) a.errors.push(`unknown crop key "${c}"`)
  for (const t of [...file.targets, ...file.doses.flatMap((d) => d.targets)])
    if (!ctx.targets.has(t)) a.errors.push(`unknown target "${t}"`)
  have('crops', file.crops.length > 0, 'crops')
  have('targets', file.targets.length > 0, 'targets')

  // Text
  a.filled.push('text ro+en')
  have('faq', file.text.ro.faq.length > 0 && file.text.en.faq.length > 0, 'faq')
  if (file.text.ro.faq.length !== file.text.en.faq.length)
    a.errors.push('the Romanian and English FAQ have different numbers of questions')
  for (const l of ['ro', 'en'] as const) {
    const { title, description } = file.text[l].seo
    if (title.length < 30 || title.length > 60)
      a.errors.push(`${l} SEO title is ${title.length} characters (30–60)`)
    if (description.length < 70 || description.length > 160)
      a.errors.push(`${l} SEO description is ${description.length} characters (70–160)`)
  }
  if (textsOf(file).some((t) => CEDILLA.test(t)))
    a.errors.push('text uses cedilla letters (ş ţ): use comma below (ș ț)')

  // Technical data and doses, by type
  const p = file.protection
  const s = file.seed
  const f = file.fertiliser
  if (type === 'protection') {
    if (!p) a.errors.push('a protection product needs a "protection" group')
    have('active ingredients', Boolean(p?.activeIngredients.length), 'active ingredients')
    have('formulation', Boolean(p?.formulation), 'formulation')
    have('registration number', Boolean(p?.registrationNumber), 'registration number')
    have('registration validity', Boolean(p?.registrationValidUntil), 'registration validity date')
    have('mode of action', Boolean(p?.modeOfAction), 'mode of action')
    have('toxicity and safety', Boolean(p?.safety || p?.toxicityClass), 'toxicity and safety')
    have('doses', file.doses.length > 0, 'doses')
    if (file.doses.length) {
      have(
        'waiting periods',
        file.doses.every((d) => d.waitingPeriod !== undefined),
        'waiting periods',
      )
      have(
        'water volume',
        file.doses.every((d) => !empty(d.waterVolume)),
        'water volume',
      )
    }
    // A protection product with no registration, or an expired one, is flagged.
    // Adjuvants are not always authorised as plant protection products: Agrinvest decides.
    if (file.category === 'adjuvanti') {
      if (!p?.registrationNumber) a.flags.push('Adjuvant: check whether it needs an authorisation')
    } else if (!p?.registrationNumber)
      a.flags.push('REGISTRATION MISSING: no registration number from the register or a label')
    else if (p.registrationValidUntil && new Date(p.registrationValidUntil) < ctx.today)
      a.flags.push(`REGISTRATION EXPIRED on ${p.registrationValidUntil}`)
  } else if (type === 'seed') {
    if (!s) a.errors.push('a seed product needs a "seed" group')
    have('species', Boolean(s?.species), 'species')
    have('variety', Boolean(s?.variety), 'variety')
    have('maturity', Boolean(s?.maturity), 'maturity')
    have('sowing rate', Boolean(s?.sowingRate), 'sowing rate')
    have('yield potential', Boolean(s?.yieldPotential), 'yield potential')
    have('resistances', Boolean(s?.resistances), 'resistances')
    if (file.doses.length) a.errors.push('seed products carry sowing data, not dose rows')
  } else if (type === 'fertiliser') {
    if (!f) a.errors.push('a fertiliser product needs a "fertiliser" group')
    have('nutrients', Boolean(f?.nutrients.length), 'nutrients')
    have('form', Boolean(f?.form), 'form')
    have('storage', Boolean(f?.storage), 'storage')
    have('rates by crop', file.doses.length > 0, 'rates by crop')
  }

  // Sources: data without one is an error; a gap without a named reason is too.
  const technical = [p, s, f].some(Boolean)
  if (technical && !file.sources.technical.length) a.missingSources.push('technical data')
  if (file.doses.length && !file.sources.doses.length) a.missingSources.push('doses')
  if (!file.gaps.length && a.gaps.length)
    a.errors.push(`gaps found (${a.gaps.join(', ')}) but none named in "gaps"`)
  // The register and labels are the only sources for a dose or a registration number.
  const onlyOldShop = (list: { kind: string }[]) =>
    list.length > 0 && list.every((x) => x.kind === 'old-shop')
  if (type === 'protection') {
    if (file.doses.length && (!file.sources.doses.length || onlyOldShop(file.sources.doses)))
      a.errors.push('dose rows need the register or a label as their source, not the old shop')
    if (p?.registrationNumber && onlyOldShop(file.sources.technical))
      a.errors.push('a registration number needs the register or a label as its source')
  }

  a.unconfirmed.push('technical', 'doses', 'price')
  return a
}
