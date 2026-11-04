/**
 * Turns the old shop's export (`docs/audit/products-raw.json`) into clean products. It only
 * reads and returns data, so the importer, the redirect map and the report all share one
 * answer about what each old product became.
 *
 * It never guesses agronomic data: doses keep the wording of the source, numbers are parsed
 * only when the text is unambiguous, and everything doubtful becomes an issue in the report.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import * as cheerio from 'cheerio'

import { slugify } from '../../src/lib/slugify'

export type RawProduct = {
  id: number
  name: string
  slug: string
  permalink: string
  short_description: string
  description: string
  prices: { price: string; regular_price: string; currency_minor_unit: number }
  is_in_stock: boolean
  images: { src: string }[]
  categories: { slug: string }[]
}

export type PlannedVariant = {
  sku: string
  size: number
  unit: 'l' | 'ml' | 'kg' | 'g' | 't' | 'seeds' | 'pieces'
  price: number
  stock: 'in-stock' | 'out-of-stock'
}

export type PlannedDose = {
  cropText: string
  crops: string[]
  targetText?: string
  timing?: string
  doseText: string
  doseMin?: number
  doseMax?: number
  doseUnit?: string
  waterVolume?: string
  waitingPeriod?: number
  notes?: string
}

export type PlannedProduct = {
  slug: string
  name: { ro: string; en: string }
  productType: 'protection' | 'seed' | 'fertiliser'
  category: string
  secondary: string[]
  /** Published, or a draft held back until Agrinvest resolves a duplicate. */
  status: 'published' | 'draft'
  brand?: string
  crops: string[]
  summary?: string
  description: string
  variants: PlannedVariant[]
  ingredients: { name: string; concentration?: number; unit?: string }[]
  formulation?: string
  doses: PlannedDose[]
  species?: { ro: string; en: string }
  variety?: string
  source: string
  legacy: { slug: string; image?: string }[]
  issues: string[]
}

/** Final category of a product whose old category was wrong or the catch-all `pesticide`. */
const categoryFixes: Record<string, string> = {
  'insecticid-faster-magnum-500-ml': 'insecticide',
  'insecticid-closer-1l': 'insecticide',
  'decis-25-wg-0-6-kg': 'insecticide',
  'karate-zeon-1-l': 'insecticide',
  'principal-forte-480-g-adjuvant-vivolt-250-ml': 'erbicide',
  'titus-25-df-100-gr': 'erbicide',
  'erbicid-porumb-adengo-465-sc-1-litru': 'erbicide',
  'champ-77-wg-1-kg': 'fungicide',
  'orius-25-ew-5l': 'fungicide',
  'orius-2-ws-1-5-kg': 'tratament-samanta',
  jolpolt: 'adjuvanti',
  'listego-5l': 'erbicide',
}

/** Names and packs the rules below cannot derive. */
const fixes: Record<
  string,
  { ro?: string; en?: string; size?: number; unit?: PlannedVariant['unit'] }
> = {
  'principal-forte-480-g-adjuvant-vivolt-250-ml': {
    ro: 'Principal Forte + adjuvant Vivolt',
    en: 'Principal Forte + Vivolt adjuvant',
    size: 480,
    unit: 'g',
  },
  'seminte-rapita-pioneer-pt303': {
    ro: 'Sămânță de rapiță Pioneer PT303',
    en: 'Pioneer PT303 rapeseed seed',
  },
  'samanta-de-rapita-dk-excited-1-500-000-boabe': {
    ro: 'Sămânță de rapiță DK Excited',
    en: 'DK Excited rapeseed seed',
    size: 1_500_000,
    unit: 'seeds',
  },
  'roca-fosfatica-30': { ro: 'Rocă fosfatică 30% P2O5', en: 'Phosphate rock 30% P2O5' },
  'uree-egipt': { ro: 'Uree', en: 'Urea', size: 600, unit: 'kg' },
  azotat: { ro: 'Azotat de amoniu', en: 'Ammonium nitrate', size: 1000, unit: 'kg' },
  dap: {
    ro: 'DAP 18-46-0 (fosfat diamoniu)',
    en: 'DAP 18-46-0 (diammonium phosphate)',
    size: 600,
    unit: 'kg',
  },
  'zafiro-20l': { ro: 'Zafiro', en: 'Zafiro' },
  'crew-ace-5l': { ro: 'Crew Ace', en: 'Crew Ace', size: 5, unit: 'l' },
  'seed-max-1-kg': { ro: 'Seed Max', en: 'Seed Max', size: 1, unit: 'kg' },
}

/** Same product in two packs: the old shop listed each pack as its own product. */
const families: string[][] = [
  ['amino', 'amino-20l'],
  ['obi-b', 'obi-b-20l'],
  ['amazonas-zn', 'amazonas-zn-20l'],
  ['napekhem-n-6-mg-s-6-11-micros', 'napekhem-n-6-mg-s-6-11-micros-20l'],
  ['lamdex-extra-1-kg', 'lamdex-extra-5-kg'],
]

/** The same pack listed twice at two prices. The first stays; the second waits for Agrinvest. */
const heldBack: Record<string, string> = {
  'samanta-grau-avenue-c1-1kg': 'samanta-grau-avenue-c1-800-kg',
}

/** Pages that list their substances over several lines: only the first is read. */
const partialStatement = new Set(['principal-forte-480-g-adjuvant-vivolt-250-ml'])

/** The composition these pages state is not a list of active substances. */
const noActiveSubstance = new Set(['ympact-completo-20l', 'kappa-o-5-kg', 'seed-max-1-kg'])

/** Manufacturers named in the product's own text. Everything else comes from enrichment. */
const brandsInText: Record<string, string> = {
  'insecticid-closer-1l': 'Corteva',
  'erbicid-porumb-adengo-465-sc-1-litru': 'Bayer',
  'seminte-rapita-pioneer-pt303': 'Pioneer',
  'samanta-de-rapita-dk-excited-1-500-000-boabe': 'Dekalb',
}

const seedSpecies = {
  grau: { ro: 'grâu', en: 'wheat', crop: 'wheat' },
  orz: { ro: 'orz', en: 'barley', crop: 'barley' },
  naut: { ro: 'năut', en: 'chickpea', crop: 'chickpea' },
  rapita: { ro: 'rapiță', en: 'rapeseed', crop: 'rapeseed' },
} as const

const typeOfCategory = (category: string): PlannedProduct['productType'] =>
  category === 'seminte'
    ? 'seed'
    : ['ingrasaminte', 'fertilizanti-foliare'].includes(category)
      ? 'fertiliser'
      : 'protection'

/** Fixes the old cedilla letters. Missing diacritics stay until the text is rewritten. */
const commaBelow = (s: string) =>
  s.replace(/ş/g, 'ș').replace(/ţ/g, 'ț').replace(/Ş/g, 'Ș').replace(/Ţ/g, 'Ț')

const textOf = (html: string) =>
  commaBelow(cheerio.load(`<div>${html}</div>`)('div').text())
    .replace(/\s+/g, ' ')
    .trim()

const plain = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

const decimal = (s: string) => Number(s.replace(',', '.'))

const unitWords: Record<string, PlannedVariant['unit']> = {
  l: 'l',
  litru: 'l',
  litri: 'l',
  ml: 'ml',
  kg: 'kg',
  g: 'g',
  gr: 'g',
}

const PACK = /[\s–-]*(\d+(?:[.,]\d+)?)\s*(litru|litri|ml|kg|gr|l|g)\s*$/i

/** Splits "ORIUS 2 WS 1.5 KG" into its name and pack. */
export function splitPack(name: string) {
  const match = PACK.exec(name)
  if (!match) return { name: name.trim() }
  return {
    name: name.slice(0, match.index).trim(),
    size: decimal(match[1]),
    unit: unitWords[match[2].toLowerCase()],
  }
}

const titleCase = (word: string) => word[0] + word.slice(1).toLowerCase()
const CAPS = /[A-ZĂÂÎȘȚ]{4,}/g

/** Clean Romanian and English names, without the pack. */
function namesOf(cleaned: string) {
  const seed = /^Samanta (Grau|Orz|Naut) (.+)$/i.exec(cleaned)
  if (seed) {
    const species = seedSpecies[seed[1].toLowerCase() as keyof typeof seedSpecies]
    const variety = seed[2]
      .split(' ')
      .map((w) => (/^[A-ZĂÂÎȘȚ]{2,}$/.test(w) ? titleCase(w) : w))
      .join(' ')
    return {
      ro: `Sămânță de ${species.ro} ${variety}`,
      en: `${variety} ${species.en} seed`,
    }
  }
  const name = cleaned
    .replace(/^(Insecticid|Erbicid porumb|Erbicid)\s+/i, '')
    .replace(/^\[([A-Z]+)\]$/, '$1')
    .replace(/\s*[-–]\s*$/, '')
    .replace(CAPS, titleCase)
  return { ro: name, en: name }
}

/** Crops named in a text. Straw cereals cover the crops the term means, for filters only. */
export function cropsIn(text: string): string[] {
  const t = plain(text)
  const found = new Set<string>()
  const rules: [RegExp, string[]][] = [
    [/\bgrau\b/, ['wheat']],
    [/\borz\b/, ['barley']],
    [/\bporumb/, ['maize']],
    [/floarea.soarelui/, ['sunflower']],
    [/\brapita\b/, ['rapeseed']],
    [/\bsoia\b/, ['soybean']],
    [/\btriticale\b/, ['triticale']],
    [/\bnaut\b/, ['chickpea']],
    [/\bcartof/, ['potato']],
    [/sfecl/, ['sugar-beet']],
    [/\blucern/, ['alfalfa']],
    [/\bsecara\b/, ['rye']],
    [/\bmazare\b/, ['peas']],
    [/\b(legume|tomate|castraveti|ardei|varza|ceapa|praz|vinete)\b/, ['vegetables']],
    [/\b(pomi|meri|livezi|pruni|ciresi|mar|par|prun|cires|piersic|samburoase)\b/, ['fruit-trees']],
    [/\b(vita de vie|vie)\b/, ['grapevine']],
    [/\bcereale\b/, ['wheat', 'barley', 'triticale']],
  ]
  for (const [pattern, keys] of rules) if (pattern.test(t)) keys.forEach((k) => found.add(k))
  return [...found]
}

/** "3,5 – 4 l/ha" → numbers and unit. Anything less plain keeps its text only. */
export function parseDose(text: string) {
  const match =
    /^\s*(\d+(?:[.,]\d+)?)(?:\s*[–-]\s*(\d+(?:[.,]\d+)?))?\s*([a-zA-Z%][^\s,;]*)\s*$/.exec(text)
  if (!match) return {}
  const doseMin = decimal(match[1])
  return { doseMin, doseMax: match[2] ? decimal(match[2]) : doseMin, doseUnit: match[3] }
}

/** The text of a page, one line per paragraph, heading, list item or line break. */
const linesOf = (html: string) =>
  html
    .split(/<br\s*\/?>|<\/p>|<\/h\d>|<\/li>|<\/div>|\n/i)
    .map((l) => textOf(l))
    .filter(Boolean)

const INGREDIENT_LABEL = /^[•\s]*(?:substan[tț][aăe]\s+activ[aăe]|compozi[tț]ie)\s*:?\s*(.*)$/i
const HAS_AMOUNT = /\d\s*(g\/|%)/i
const AMOUNT = /(\d+(?:[.,]\d+)?)\s*(g\/l|g\/kg|%)/gi

/** One spelling per substance: the sources write it several ways. */
const ingredientNames: Record<string, string> = {
  'lambda cihalotrin': 'lambda-cihalotrin',
  'lambda - cihalotrin': 'lambda-cihalotrin',
  'lambda – cihalotrin': 'lambda-cihalotrin',
  'cupru metalic sub forma de hidroxid de cupru': 'cupru metalic (hidroxid de cupru)',
}

/** Reads the "Substanță activă: …" statement, which may sit on the line after its label. */
export function parseIngredients(lines: string[]): PlannedProduct['ingredients'] {
  const found = lines.flatMap((line, i) => {
    const match = INGREDIENT_LABEL.exec(line)
    if (!match) return []
    const own = match[1].trim()
    const next = lines[i + 1] ?? ''
    if (own && (HAS_AMOUNT.test(own) || own.length < 80)) return [{ text: own, own: true }]
    return !own && HAS_AMOUNT.test(next) ? [{ text: next, own: false }] : []
  })
  // A statement on the label's own line is complete; the line after a bare label may not be.
  const statement = (found.find((f) => f.own) ?? found[0])?.text
  if (!statement) return []
  return statement
    .replace(/\.\s*$/, '')
    .split(/\s\+\s|,\s/)
    .map((part) => {
      const amounts = [...part.matchAll(AMOUNT)]
      // "50% (500 g/l)": the mass per volume is the label's figure.
      const amount = amounts.find((a) => a[2].includes('/')) ?? amounts[0]
      const name = part
        .replace(/\([^)]*\)/g, ' ')
        .replace(AMOUNT, ' ')
        .replace(/\bcontine\b/i, ' ')
        .replace(/[^\p{L}\s–-]/gu, ' ')
        .replace(/\s+/g, ' ')
        .replace(/^[\s–-]+|[\s–-]+$/g, '')
        .toLowerCase()
      return {
        name: ingredientNames[name] ?? name,
        ...(amount ? { concentration: decimal(amount[1]), unit: amount[2].toLowerCase() } : {}),
      }
    })
    .filter((i) => i.name.length >= 3 && i.name.length <= 60)
}

const headerKind = (header: string) => {
  const h = plain(header)
  if (h.startsWith('cultur')) return 'crop'
  if (/boli|daunator|buruien|scop|tint/.test(h)) return 'target'
  if (h.startsWith('moment')) return 'timing'
  if (h.startsWith('doz')) return 'dose'
  if (h.startsWith('volum')) return 'water'
  if (/pauza/.test(h)) return 'waiting'
  if (h.startsWith('mod')) return 'notes'
  return null
}

/** Dose tables of the old pages, with the source wording kept as it is. */
export function parseDoseTables(html: string): PlannedDose[] {
  const $ = cheerio.load(html)
  const rows: PlannedDose[] = []
  $('table').each((_, table) => {
    const kinds = $(table)
      .find('tr')
      .first()
      .find('th, td')
      .map((__, cell) => headerKind($(cell).text()) ?? '')
      .get()
    if (!kinds.includes('crop') || !kinds.includes('dose')) return
    // Cells merged across rows continue in the rows below, which do not repeat them.
    const carried: { text: string; left: number }[] = []
    $(table)
      .find('tr')
      .slice(1)
      .each((__, tr) => {
        const own = $(tr).find('td').toArray()
        const cells: string[] = []
        for (let column = 0; column < kinds.length; column++) {
          if (carried[column]?.left > 0) {
            carried[column].left--
            cells.push(carried[column].text)
            continue
          }
          const td = own.shift()
          const text = td ? commaBelow($(td).text()).replace(/\s+/g, ' ').trim() : ''
          const span = Number(td ? $(td).attr('rowspan') : 1) || 1
          carried[column] = { text, left: span - 1 }
          cells.push(text)
        }
        const at = (kind: string) => cells[(kinds as string[]).indexOf(kind)] || undefined
        const cropText = at('crop')
        // Some pages write l/ha with a capital i.
        const doseText = at('dose')?.replace(/(\d\s*)I\/ha/g, '$1l/ha')
        if (!cropText || !doseText) return
        const waiting = /^(\d+)\s*zile$/i.exec(at('waiting') ?? '')
        rows.push({
          cropText,
          crops: cropsIn(cropText),
          targetText: at('target'),
          timing: at('timing'),
          doseText,
          ...parseDose(doseText),
          waterVolume: at('water'),
          waitingPeriod: waiting ? Number(waiting[1]) : undefined,
          notes: at('notes'),
        })
      })
  })
  return rows
}

/** "Floarea-soarelui: preemergent, în doza de 3,5 – 4 l/ha" lines of older pages. */
export function parseDoseLines(html: string): PlannedDose[] {
  return linesOf(html).flatMap((line) => {
    const match =
      /^([\p{L} -]{3,30}):\s*(.*?),?\s*[îi]n doz[aă] de\s+([\d,.]+(?:\s*[–-]\s*[\d,.]+)?\s*[a-z]+\/ha)/iu.exec(
        line,
      )
    if (!match || !cropsIn(match[1]).length) return []
    return [
      {
        cropText: match[1],
        crops: cropsIn(match[1]),
        timing: match[2] || undefined,
        doseText: match[3],
        ...parseDose(match[3]),
      },
    ]
  })
}

/** The old description as Markdown for the rich-text builder, without its tables. */
export function toMarkdown(html: string) {
  const $ = cheerio.load(html)
  // A table moves to the dose section, and its heading goes with it.
  $('table').prev('h1, h2, h3, h4, h5, h6').remove()
  $('table').remove()
  const blocks: string[] = []
  $('body')
    .children()
    .each((_, el) => {
      const tag = el.tagName
      const text = commaBelow($(el).text()).replace(/\s+/g, ' ').trim()
      if (!text) return
      if (/^h[1-6]$/.test(tag)) blocks.push(`### ${text.replace(/:$/, '')}`)
      else if (tag === 'ul' || tag === 'ol')
        blocks.push(
          $(el)
            .find('li')
            .map((__, li) => `- ${commaBelow($(li).text()).replace(/\s+/g, ' ').trim()}`)
            .get()
            .join('\n'),
        )
      else blocks.push(text)
    })
  return blocks.join('\n\n')
}

/** Answer paragraph: the old short text without its statements of composition. */
function summaryOf(short: string) {
  const text = textOf(short)
    .replace(/substan[tț][aă]\s+activ[aă]\s*:.*$/i, '')
    .replace(/\s*(formulare|conditionare|condiționare)\s*:.*$/i, '')
    .trim()
  if (text.length <= 320) return text
  const cut = text.slice(0, 320)
  return cut.slice(0, Math.max(cut.lastIndexOf('. ') + 1, 200)).trim()
}

function planOne(raw: RawProduct): PlannedProduct {
  const issues: string[] = []
  const decoded = commaBelow(cheerio.load(`<div>${raw.name}</div>`)('div').text())
    .replace(/\s+/g, ' ')
    .trim()
  const fix = fixes[raw.slug] ?? {}
  const pack = splitPack(decoded)
  const names = fix.ro && fix.en ? { ro: fix.ro, en: fix.en } : namesOf(pack.name)
  const old = raw.categories.map((c) => c.slug)
  const category =
    categoryFixes[raw.slug] ?? old.find((c) => c !== 'agricultura-bio' && c !== 'pesticide')
  if (!category) throw new Error(`No category for ${raw.slug}`)
  const productType = typeOfCategory(category)
  const size = fix.size ?? pack.size
  const unit = fix.unit ?? pack.unit
  if (!size) issues.push('Pack size missing from the name: shown without one.')

  const price = Number(raw.prices.price) / 10 ** raw.prices.currency_minor_unit
  const regular = Number(raw.prices.regular_price) / 10 ** raw.prices.currency_minor_unit
  if (regular > price) issues.push(`Old shop price ${regular} lei, sale price ${price} lei.`)

  const short = textOf(raw.short_description)
  const all = `${short} ${textOf(raw.description)}`
  let summary: string | undefined = summaryOf(raw.short_description)

  // The old shop reused texts: a summary that never names the product may be another's.
  const nameWord =
    plain(names.ro)
      .split(/[\s[\]]+/)
      .find((w) => w.length >= 3) ?? ''
  if (productType !== 'seed' && summary && !plain(summary).includes(nameWord)) {
    issues.push(`Short text does not name the product: "${summary.slice(0, 60)}…". Not used.`)
    summary = undefined
  }

  const speciesKey = /^Samanta (Grau|Orz|Naut)/i.exec(decoded)?.[1]?.toLowerCase()
  const rapeseed = /rapit/i.test(decoded) && productType === 'seed'
  const species = speciesKey
    ? seedSpecies[speciesKey as keyof typeof seedSpecies]
    : rapeseed
      ? seedSpecies.rapita
      : undefined
  if (speciesKey === 'orz' && /gr[aâ]ul/i.test(all)) {
    issues.push('A barley seed described as wheat. Summary not used.')
    summary = undefined
  }

  const doses = [...parseDoseTables(raw.description), ...parseDoseLines(raw.description)]
  const lines = linesOf(`${raw.short_description}\n${raw.description}`)
  const handEntered = category === 'adjuvanti' || noActiveSubstance.has(raw.slug)
  const ingredients = productType === 'protection' && !handEntered ? parseIngredients(lines) : []
  if (handEntered)
    issues.push(`Composition to enter by hand: "${lines.find((l) => INGREDIENT_LABEL.test(l))}".`)
  else if (productType === 'protection' && !ingredients.length)
    issues.push('No active ingredient found.')
  else if (ingredients.length === 1 && partialStatement.has(raw.slug))
    issues.push('Only part of the composition could be read.')
  if (productType !== 'seed' && !doses.length) issues.push('No dose table found.')
  for (const d of doses)
    if (!d.crops.length) issues.push(`Crop not recognised in a dose row: "${d.cropText}".`)

  const formulation =
    productType === 'protection'
      ? /\b(SC|EC|WG|WS|SL|FS|EW|DF|SP|SG|OD|EG|SE|CS|ME)\b/.exec(decoded)?.[1]
      : undefined

  return {
    slug: slugify(names.ro),
    name: names,
    productType,
    category,
    secondary: old.includes('agricultura-bio') ? ['agricultura-bio'] : [],
    status: heldBack[raw.slug] ? 'draft' : 'published',
    brand: brandsInText[raw.slug],
    crops: [...new Set([...(species ? [species.crop] : []), ...doses.flatMap((d) => d.crops)])],
    summary: summary || undefined,
    description: toMarkdown(raw.description),
    variants: [
      {
        sku: `AGR-${raw.id}`,
        size: size ?? 1,
        unit: size ? (unit as PlannedVariant['unit']) : 'pieces',
        price,
        stock: raw.is_in_stock ? 'in-stock' : 'out-of-stock',
      },
    ],
    ingredients,
    formulation,
    doses,
    species: species ? { ro: species.ro, en: species.en } : undefined,
    variety: species ? names.ro.replace(/^Sămânță de \S+ /, '') : undefined,
    source: raw.permalink,
    legacy: [{ slug: raw.slug, image: raw.images[0]?.src }],
    issues,
  }
}

/** Joins the packs of one family into a product, keeping the smallest pack's text. */
function merge(members: PlannedProduct[]): PlannedProduct {
  const [first, ...rest] = members
  const prices = new Set(rest.map((m) => m.summary))
  return {
    ...first,
    variants: members.flatMap((m) => m.variants),
    legacy: members.flatMap((m) => m.legacy),
    issues: [...new Set([...first.issues, ...rest.flatMap((m) => m.issues)])].concat(
      prices.size > 1 ? ['Family members have different texts.'] : [],
    ),
  }
}

export function planProducts(
  raw: RawProduct[] = JSON.parse(
    readFileSync(resolve('docs/audit/products-raw.json'), 'utf8'),
  ) as RawProduct[],
): PlannedProduct[] {
  const planned = new Map(raw.map((r) => [r.slug, planOne(r)]))
  const out: PlannedProduct[] = []
  const inFamily = new Set(families.flat())
  for (const family of families) {
    const members = family.flatMap((slug) => planned.get(slug) ?? [])
    if (members.length) out.push(merge(members))
  }
  for (const [slug, product] of planned) if (!inFamily.has(slug)) out.push(product)
  // A held-back duplicate needs its own slug, since it shares its twin's name.
  for (const [slug, twin] of Object.entries(heldBack)) {
    const product = out.find((p) => p.legacy.some((l) => l.slug === slug))
    if (!product) continue
    product.slug = `${product.slug}-duplicat`
    product.issues.push(`Same product and pack as ${twin}, at another price: held back as a draft.`)
  }
  const seen = new Set<string>()
  for (const p of out) {
    if (seen.has(p.slug)) throw new Error(`Duplicate slug ${p.slug}`)
    seen.add(p.slug)
  }
  return out
}

/** Where an old shop slug leads now. A held-back product points to its published twin. */
export function newSlugOf(plan: PlannedProduct[], oldSlug: string) {
  const twin = heldBack[oldSlug]
  return plan.find((p) => p.legacy.some((l) => l.slug === (twin ?? oldSlug)))
}
