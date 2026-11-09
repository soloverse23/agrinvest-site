/**
 * The repayment simulator: pure functions, no I/O. It places the principal on the harvests
 * inside the term (at most two a year, `instalmentSeasons`). Agrinvest publishes no rate, so
 * interest appears only when the farmer types a rate of their own, and it is labelled as theirs.
 */
import {
  harvestCrops,
  instalmentSeasons,
  seasonOf,
  type HarvestCrop,
  type Season,
} from './calendar'

/** Bounds that stop typing errors. They are never shown as a lending limit. */
export const AMOUNT_MIN = 1_000
export const AMOUNT_MAX = 50_000_000
export const RATE_MAX = 50
/** How far ahead the first month may be. */
export const START_AHEAD = 12

/** URL parameters, the same in both languages so a link works in either. */
export const simulatorParams = ['suma', 'luni', 'culturi', 'start', 'dobanda'] as const
export type SimulatorParam = (typeof simulatorParams)[number]

export type SimulatorError = 'amount' | 'months' | 'crops' | 'start' | 'rate'

export type SimulatorInput = {
  amount: number
  months: number
  crops: HarvestCrop[]
  /** Month index: year × 12 + (month − 1). */
  start: number
  /** Annual rate in percent, typed by the farmer. */
  rate?: number
}

export type RawParams = Record<string, string | string[] | undefined>

export type Parsed = {
  /** False when the page was opened without the form being sent. */
  submitted: boolean
  input?: SimulatorInput
  errors: Partial<Record<SimulatorParam, SimulatorError>>
  /** What to show in the form again. */
  values: { suma: string; luni: string; culturi: HarvestCrop[]; start: string; dobanda: string }
}

export const monthIndex = (year: number, month: number) => year * 12 + (month - 1)
export const fromIndex = (index: number) => ({
  year: Math.floor(index / 12),
  month: (index % 12) + 1,
})
export const monthKey = (index: number) => {
  const { year, month } = fromIndex(index)
  return `${year}-${String(month).padStart(2, '0')}`
}
export const currentIndex = (today: Date) => monthIndex(today.getFullYear(), today.getMonth() + 1)

/** The months a farmer may choose as the first: this month up to `START_AHEAD` ahead. */
export const startOptions = (today: Date) =>
  Array.from({ length: START_AHEAD + 1 }, (_, i) => currentIndex(today) + i)

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? ''
const all = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v : v ? [v] : []).flatMap((s) => s.split(','))

/** "250.000", "250 000" and "250000" are the same amount. */
const wholeNumber = (text: string) => {
  const compact = text.replace(/[\s.]/g, '')
  return /^\d{1,12}$/.test(compact) ? Number(compact) : NaN
}

/** "9,5" and "9.5" are the same rate. */
const decimal = (text: string) => {
  const compact = text.replace(/\s/g, '').replace(',', '.').replace(/%$/, '')
  return /^\d{1,3}(\.\d{1,3})?$/.test(compact) ? Number(compact) : NaN
}

/**
 * Reads the form from the URL. Never throws: a bad value comes back as an error for its field.
 * `maxMonths` comes from the register (`F5.term` × 12).
 */
export function parseSimulator(params: RawParams, maxMonths: number, today = new Date()): Parsed {
  const submitted = simulatorParams.some((p) => params[p] !== undefined)
  const choices = startOptions(today)
  const values: Parsed['values'] = {
    suma: first(params.suma),
    luni: first(params.luni),
    culturi: [...new Set(all(params.culturi))].filter((c): c is HarvestCrop =>
      (harvestCrops as string[]).includes(c),
    ),
    start: first(params.start) || monthKey(choices[1]),
    dobanda: first(params.dobanda),
  }
  if (!submitted) return { submitted, errors: {}, values }

  const errors: Parsed['errors'] = {}
  const amount = wholeNumber(values.suma)
  if (!(amount >= AMOUNT_MIN && amount <= AMOUNT_MAX)) errors.suma = 'amount'
  const months = wholeNumber(values.luni)
  if (!(Number.isInteger(months) && months >= 1 && months <= maxMonths)) errors.luni = 'months'
  if (!values.culturi.length) errors.culturi = 'crops'
  const match = /^(\d{4})-(\d{2})$/.exec(values.start)
  const start = match ? monthIndex(Number(match[1]), Number(match[2])) : NaN
  if (!choices.includes(start)) errors.start = 'start'
  let rate: number | undefined
  if (values.dobanda) {
    rate = decimal(values.dobanda)
    if (!(rate > 0 && rate <= RATE_MAX)) errors.dobanda = 'rate'
  }
  if (Object.keys(errors).length) return { submitted, errors, values }
  return {
    submitted,
    errors,
    values,
    input: { amount, months, crops: values.culturi, start, rate },
  }
}

export type Instalment = {
  season: Season
  /** Month index. */
  index: number
  principal: number
  /** Principal still owed after this instalment. */
  remaining: number
  /** Only with a rate typed by the farmer. */
  interest?: number
}

export type Schedule =
  | { kind: 'schedule'; instalments: Instalment[]; totalInterest?: number; end: number }
  /** No harvest falls inside the term: the first harvest and the term that would reach it. */
  | { kind: 'no-harvest'; firstHarvest: number; season: Season; monthsNeeded: number; end: number }

/** Harvest months after `start`, up to and including `end`, for the chosen seasons. */
export function harvestMonths(seasons: Season[], start: number, end: number) {
  const out: { index: number; season: Season }[] = []
  for (let i = start + 1; i <= end; i++) {
    const month = (i % 12) + 1
    const season = seasons.find((s) => instalmentSeasons[s].month === month)
    if (season) out.push({ index: i, season })
  }
  return out
}

/**
 * The schedule: one instalment on every chosen harvest inside the term, the principal split
 * equally in whole lei, the last one taking the rounding. Interest, with a farmer's own rate,
 * runs on the principal still owed for the months since the money or the previous instalment.
 */
export function buildSchedule(input: SimulatorInput): Schedule {
  const seasons = [...new Set(input.crops.map(seasonOf))]
  const end = input.start + input.months
  const dates = harvestMonths(seasons, input.start, end)
  if (!dates.length) {
    const [next] = harvestMonths(seasons, input.start, input.start + 12)
    return {
      kind: 'no-harvest',
      firstHarvest: next.index,
      season: next.season,
      monthsNeeded: next.index - input.start,
      end,
    }
  }
  const share = Math.floor(input.amount / dates.length)
  let owed = input.amount
  let previous = input.start
  let totalInterest = 0
  const instalments = dates.map((d, i) => {
    const principal = i === dates.length - 1 ? owed : share
    const interest =
      input.rate === undefined
        ? undefined
        : Math.round((owed * input.rate * (d.index - previous)) / 1200)
    if (interest !== undefined) totalInterest += interest
    owed -= principal
    previous = d.index
    return { season: d.season, index: d.index, principal, remaining: owed, interest }
  })
  return {
    kind: 'schedule',
    instalments,
    totalInterest: input.rate === undefined ? undefined : totalInterest,
    end,
  }
}

/** The application link that carries the simulator's figures. */
export function applyQuery(input: Pick<SimulatorInput, 'amount' | 'months' | 'crops'>) {
  const q = new URLSearchParams({ suma: String(input.amount), luni: String(input.months) })
  q.set('culturi', input.crops.join(','))
  return q.toString()
}
