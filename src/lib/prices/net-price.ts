/**
 * The net-price calculator (scăzământ): pure functions, no I/O. The rules and their sources
 * are in `./net-price-rules`. The page is a GET form, so every result has its own URL and the
 * tool works without JavaScript.
 */

/** URL parameters, the same in both languages so a link works in either. */
export const netPriceParams = [
  'cultura',
  'cantitate',
  'pret',
  'umiditate',
  'impuritati',
  'hl',
  'umiditate_baza',
  'impuritati_baza',
  'hl_minim',
] as const
export type NetPriceParam = (typeof netPriceParams)[number]

export type RawParams = Record<string, string | string[] | undefined>

export type QualityLimits = {
  moisture?: number | null
  impurities?: number | null
  hectolitre?: number | null
}

export type NetPriceInput = {
  crop: string
  /** Tonnes. */
  quantity: number
  /** Lei per tonne. */
  price: number
  moisture: number
  impurities: number
  hectolitre?: number
  baseMoisture: number
  baseImpurities: number
  minHectolitre?: number
}

export type NetPriceResult = {
  gross: { quantity: number; value: number }
  moisture: { factor: number; deducted: number; percent: number }
  impurities: { factor: number; deducted: number; percent: number }
  net: { quantity: number; value: number; pricePerGrossTonne: number }
  /** True when the measured hectolitre weight is under the minimum. No quantity deduction. */
  lowHectolitre: boolean
}

export type Parsed = {
  submitted: boolean
  input?: NetPriceInput
  errors: Partial<Record<NetPriceParam, true>>
  values: Record<NetPriceParam, string>
}

/** Bounds that stop typing errors; they are not quality limits. */
export const bounds = {
  quantity: [0.001, 100_000],
  price: [1, 100_000],
  percent: [0, 60],
  hectolitre: [30, 100],
} as const

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? ''

/** "1.234,5", "1 234.5", "1234,5" → 1234.5; NaN when it is not a number. */
export function readNumber(text: string): number {
  let s = text.replace(/\s/g, '').replace(/%$/, '')
  if (!s) return NaN
  if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '').replace(',', '.')
  else if (s.includes(',')) s = s.replace(',', '.')
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '')
  return /^\d+(\.\d+)?$/.test(s) ? Number(s) : NaN
}

const within = (v: number, [lo, hi]: readonly [number, number]) => v >= lo && v <= hi

/**
 * Reads the form from the URL. Never throws: a bad value comes back as an error on its field.
 * `limits` fills the base fields when the visitor left them empty and Agrinvest has published
 * the crop's reception limits. Without either, the base field is required: no limit is assumed.
 */
export function parseNetPrice(
  params: RawParams,
  limitsOf: (crop: string) => QualityLimits | undefined,
  crops: readonly string[],
): Parsed {
  const submitted = netPriceParams.some((p) => params[p] !== undefined)
  const values = Object.fromEntries(netPriceParams.map((p) => [p, first(params[p])])) as Record<
    NetPriceParam,
    string
  >
  const limits = limitsOf(values.cultura)
  const fill = (p: NetPriceParam, v: number | null | undefined) => {
    if (!values[p] && v != null) values[p] = String(v).replace('.', ',')
  }
  fill('umiditate_baza', limits?.moisture)
  fill('impuritati_baza', limits?.impurities)
  fill('hl_minim', limits?.hectolitre)
  if (!submitted) return { submitted, errors: {}, values }

  const errors: Parsed['errors'] = {}
  const num = (p: NetPriceParam, range: readonly [number, number], optional = false) => {
    if (optional && !values[p]) return undefined
    const v = readNumber(values[p])
    if (!within(v, range)) errors[p] = true
    return v
  }
  if (!crops.includes(values.cultura)) errors.cultura = true
  const quantity = num('cantitate', bounds.quantity)!
  const price = num('pret', bounds.price)!
  const moisture = num('umiditate', bounds.percent)!
  const impurities = num('impuritati', bounds.percent)!
  const hectolitre = num('hl', bounds.hectolitre, true)
  const baseMoisture = num('umiditate_baza', bounds.percent)!
  const baseImpurities = num('impuritati_baza', bounds.percent)!
  const minHectolitre = num('hl_minim', bounds.hectolitre, true)
  if (Object.keys(errors).length) return { submitted, errors, values }
  return {
    submitted,
    errors,
    values,
    input: {
      crop: values.cultura,
      quantity,
      price,
      moisture,
      impurities,
      hectolitre,
      baseMoisture,
      baseImpurities,
      minHectolitre,
    },
  }
}

const kg = (t: number) => Math.round(t * 1000) / 1000
const lei = (v: number) => Math.round(v * 100) / 100

/** The share kept when a measured percentage is above the base: (100 − m) / (100 − b). */
export const keptFactor = (measured: number, base: number) =>
  measured > base ? (100 - measured) / (100 - base) : 1

/** Net quantity and value after the moisture, then the impurities deduction. */
export function netPrice(input: NetPriceInput): NetPriceResult {
  const mf = keptFactor(input.moisture, input.baseMoisture)
  const afterMoisture = input.quantity * mf
  const imf = keptFactor(input.impurities, input.baseImpurities)
  const net = afterMoisture * imf
  const netValue = net * input.price
  return {
    gross: { quantity: kg(input.quantity), value: lei(input.quantity * input.price) },
    moisture: {
      factor: mf,
      deducted: kg(input.quantity - afterMoisture),
      percent: Math.round((1 - mf) * 10_000) / 100,
    },
    impurities: {
      factor: imf,
      deducted: kg(afterMoisture - net),
      percent: Math.round((1 - imf) * 10_000) / 100,
    },
    net: {
      quantity: kg(net),
      value: lei(netValue),
      pricePerGrossTonne: lei(netValue / input.quantity),
    },
    lowHectolitre:
      input.hectolitre !== undefined &&
      input.minHectolitre !== undefined &&
      input.hectolitre < input.minHectolitre,
  }
}

/** The calculator link for a crop, carrying what a widget already knows. */
export function netPriceQuery(values: Partial<Record<NetPriceParam, string | number>>) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(values)) if (v !== undefined && v !== '') q.set(k, String(v))
  return q.toString()
}
