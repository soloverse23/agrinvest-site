/**
 * Dose maths for the shop: how much product an area needs, which packs to buy and what they
 * cost. Inputs are only the numbers parsed from the label or register (`doseMin`, `doseMax`,
 * `doseUnit`, `rateMin`…) and the product's own packs; nothing here guesses a dose. Plain
 * functions, so the rules are tested without a database.
 */

/** What the product is measured in. Volume is kept in millilitres, mass in grams. */
export type Dimension = 'volume' | 'mass' | 'seeds'

/** What a dose is "per": a hectare, a tonne of seed, or a share of the spray liquid. */
export type DoseBasis = 'ha' | 't' | 'percent'

export type DoseUnit = { dimension: Dimension; basis: DoseBasis; factor: number }

/** Millilitres or grams in one unit. Seeds count one by one. */
const amountUnits: Record<string, { dimension: Dimension; factor: number }> = {
  l: { dimension: 'volume', factor: 1000 },
  ml: { dimension: 'volume', factor: 1 },
  kg: { dimension: 'mass', factor: 1000 },
  g: { dimension: 'mass', factor: 1 },
  t: { dimension: 'mass', factor: 1_000_000 },
  seeds: { dimension: 'seeds', factor: 1 },
  boabe: { dimension: 'seeds', factor: 1 },
}

/**
 * `l/ha`, `kg/t`, `g/ha`, `ml/ha`, `%`. Null for anything else (`pieces`, an empty unit, a
 * typo): the page then shows the label text and sends the visitor to a consultant.
 */
export function parseDoseUnit(unit: string | null | undefined): DoseUnit | null {
  const u = (unit ?? '').trim().toLowerCase().replace(/\s+/g, '')
  if (u === '%' || u === '%v/v') return { dimension: 'volume', basis: 'percent', factor: 1 }
  const [amount, per] = u.split('/')
  const a = amountUnits[amount]
  if (!a || !per) return null
  if (per === 'ha') return { ...a, basis: 'ha' }
  if (per === 't' || per === 'tona') return { ...a, basis: 't' }
  return null
}

/** The dimension of a pack unit, or null for pieces and unknown units. */
export function packDimension(unit: string): { dimension: Dimension; factor: number } | null {
  return amountUnits[unit] ?? null
}

/**
 * A number as Romanian labels print it: `1.500` is fifteen hundred, `0,75` is a decimal.
 * A dot followed by exactly three digits is a thousands separator; otherwise it is a decimal.
 */
export function parseLabelNumber(text: string): number | null {
  const t = text.trim()
  if (!/^\d[\d.,]*$/.test(t)) return null
  const normal = /^\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)
    ? t.replace(/\./g, '').replace(',', '.')
    : t.replace(',', '.')
  const n = Number(normal)
  return Number.isFinite(n) ? n : null
}

export type Range = { min: number; max: number }

const NUMBER = String.raw`\d[\d.,]*`
const RANGE = new RegExp(String.raw`(${NUMBER})(?:\s*[–-]\s*(${NUMBER}))?`)

function parseRange(text: string): Range | null {
  const m = text.match(RANGE)
  if (!m) return null
  const min = parseLabelNumber(m[1])
  const max = m[2] ? parseLabelNumber(m[2]) : min
  if (min == null || max == null || min <= 0 || max < min) return null
  return { min, max }
}

/** `200–300 l/ha` → litres of water per hectare. Null when it is not stated per hectare. */
export function parseWaterVolume(text: string | null | undefined): Range | null {
  if (!text || !/l\s*(apă\s*)?\/\s*ha/i.test(text)) return null
  return parseRange(text)
}

/**
 * A seed's sowing rate per hectare, when the text states one: `60 kg/ha`, `200–220 kg/ha`,
 * `400.000–450.000 boabe germinabile/ha`. Plants or seeds per m² are a density, not a rate,
 * and return null.
 */
export function parseSowingRate(
  text: string | null | undefined,
): (Range & { dimension: 'mass' | 'seeds'; unit: 'kg' | 'seeds' }) | null {
  if (!text) return null
  const range = parseRange(text)
  if (!range) return null
  if (/^\s*[\d.,\s–-]+kg\s*\/\s*ha\s*$/i.test(text))
    return { ...range, dimension: 'mass', unit: 'kg' }
  if (/^\s*[\d.,\s–-]+(boabe|semin[țţ]e|seeds)[^/]*\/\s*ha\s*$/i.test(text))
    return { ...range, dimension: 'seeds', unit: 'seeds' }
  return null
}

export type DoseInput = {
  /** The dose picked by the visitor, already limited to the label range. */
  dose: number
  unit: DoseUnit
  /** Hectares, or tonnes of seed when the dose is per tonne. */
  amount: number
  /** Litres of water per hectare, needed only when the dose is a percentage. */
  waterVolume?: number | null
}

/**
 * Total product needed, in millilitres, grams or seeds. A percentage dose is a share of the
 * spray liquid: 0,05% in 1.000 l/ha is 0,5 l/ha. Null when an input is missing or not positive.
 */
export function totalNeeded({ dose, unit, amount, waterVolume }: DoseInput): number | null {
  if (!(dose > 0) || !(amount > 0)) return null
  if (unit.basis === 'percent') {
    if (!waterVolume || waterVolume <= 0) return null
    // Litres of water × share → litres of product → millilitres.
    return round((dose / 100) * waterVolume * amount * 1000)
  }
  return round(dose * unit.factor * amount)
}

const round = (n: number) => Math.round(n * 1000) / 1000

export type PackOption = {
  sku: string
  size: number
  unit: string
  price?: number | null
  stock: 'in-stock' | 'on-request' | 'out-of-stock'
}

export type PackMix = {
  packs: { sku: string; size: number; unit: string; count: number }[]
  /** In the same base unit as the need (ml, g or seeds). */
  supplied: number
  waste: number
  count: number
}

/** The cart takes at most this many packs of one SKU (`MAX_QUANTITY` in pricing). */
const MAX_PER_SKU = 999

/**
 * The packs to buy for a need: the least product left over, then the fewest packs. Only
 * in-stock packs with a price and the same dimension as the need are used.
 *
 * In an optimal mix the smaller packs number fewer than `largest / gcd` (otherwise some of them
 * add up to a whole number of large packs and can be swapped for fewer of those), so the search
 * enumerates the small packs within that bound and fills the rest with the largest pack.
 */
export function packMix(need: number, dimension: Dimension, options: PackOption[]): PackMix | null {
  if (!(need > 0)) return null
  const packs = options
    .filter((o) => o.stock === 'in-stock' && o.price != null && o.size > 0)
    .flatMap((o) => {
      const d = packDimension(o.unit)
      return d && d.dimension === dimension ? [{ ...o, base: round(o.size * d.factor) }] : []
    })
    .sort((a, b) => b.base - a.base)
  if (!packs.length) return null

  const [largest, ...smaller] = packs
  const scale = 1000 // compare in thousandths so 0,25 l packs stay whole numbers
  const ints = packs.map((p) => Math.round(p.base * scale))
  const g = ints.reduce(gcd)
  const bound = Math.min(Math.ceil(ints[0] / g), 200)

  let best: { counts: number[]; supplied: number; count: number } | null = null
  const consider = (counts: number[]) => {
    const small = counts.reduce((sum, c, i) => sum + c * smaller[i].base, 0)
    const big = Math.max(0, Math.ceil(round((need - small) / largest.base)))
    if (big > MAX_PER_SKU) return
    const all = [big, ...counts]
    const supplied = round(big * largest.base + small)
    if (supplied < need) return
    const count = all.reduce((a, b) => a + b, 0)
    if (!best || supplied < best.supplied || (supplied === best.supplied && count < best.count))
      best = { counts: all, supplied, count }
  }
  const walk = (i: number, counts: number[], used: number) => {
    if (i === smaller.length) return consider(counts)
    for (let c = 0; used + c < bound; c++) {
      walk(i + 1, [...counts, c], used + c)
      // More of this pack than the need itself is never better.
      if (c * smaller[i].base >= need) break
    }
  }
  walk(0, [], 0)
  if (!best) return null
  const { counts, supplied, count } = best as { counts: number[]; supplied: number; count: number }
  return {
    packs: packs
      .map((p, i) => ({ sku: p.sku, size: p.size, unit: p.unit, count: counts[i] }))
      .filter((p) => p.count > 0),
    supplied,
    waste: round(supplied - need),
    count,
  }
}

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)

/** Lei for a mix, from the packs' own prices. Null when a pack in it has no price. */
export function mixCost(mix: PackMix, options: PackOption[]): number | null {
  let total = 0
  for (const p of mix.packs) {
    const price = options.find((o) => o.sku === p.sku)?.price
    if (price == null) return null
    total += price * p.count
  }
  return Math.round(total * 100) / 100
}

/** A base amount back in the unit a farmer reads: `12500` ml → `{ 12.5, 'l' }`. */
export function displayAmount(base: number, dimension: Dimension): { value: number; unit: string } {
  if (dimension === 'volume') return { value: round(base / 1000), unit: 'l' }
  if (dimension === 'mass') return { value: round(base / 1000), unit: 'kg' }
  return { value: base, unit: 'seeds' }
}

/** A dose limited to the label range: the calculator never goes outside it. */
export const clampDose = (value: number, range: Range) =>
  Math.min(Math.max(value, range.min), range.max)

/**
 * One dose range for a listing row, from the label's numeric rows: the unit most rows use
 * (the first one on a tie), from the lowest minimum to the highest maximum in that unit. A row
 * without a number or a unit is left out; null when none is left.
 */
export function doseSummary(
  rows: { min?: number | null; max?: number | null; unit?: string | null }[],
): { min: number; max: number; unit: string } | null {
  const usable = rows.flatMap((r) => {
    const unit = r.unit?.trim()
    const min = r.min ?? r.max
    const max = r.max ?? r.min
    return unit && min != null && max != null && min > 0 && max >= min ? [{ min, max, unit }] : []
  })
  if (!usable.length) return null
  const counts = new Map<string, number>()
  for (const r of usable) counts.set(r.unit, (counts.get(r.unit) ?? 0) + 1)
  const unit = [...counts.entries()].reduce((best, e) => (e[1] > best[1] ? e : best))[0]
  const same = usable.filter((r) => r.unit === unit)
  return {
    min: Math.min(...same.map((r) => r.min)),
    max: Math.max(...same.map((r) => r.max)),
    unit,
  }
}
