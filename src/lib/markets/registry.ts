import type { GrainKey } from '@/lib/crops'
import type { MarketSource } from '@/lib/sources'

/**
 * Every market series the Prices section shows (Phase 7f), and where each is stored in
 * `MarketPrices` (source, series, market). Pages, the hub, the ticker, the chart API and the
 * fetch jobs all read from here, so a market is added in one place.
 */

export type MarketGroup = 'energy' | 'grain' | 'fertiliser' | 'fx'

export type MarketKey =
  | 'brent'
  | 'diesel-ro'
  | 'petrol-ro'
  | 'diesel-eu'
  | 'petrol-eu'
  | 'gas-eu'
  | 'wheat-hrw'
  | 'wheat-srw'
  | 'maize'
  | 'sunflower-oil'
  | 'rapeseed-oil'
  | 'urea'
  | 'dap'
  | 'tsp'
  | 'potash'
  | 'eur-ron'
  | 'eur-usd'
  | 'usd-ron'

/**
 * A second figure in the unit farmers use, from the latest ECB rate: `factor` multiplies the
 * value after it is converted to `to` (e.g. € per 1,000 l → lei per litre is RON × 1/1000).
 */
export type Conversion = { to: 'RON' | 'EUR'; factor: number; unit: string; decimals: number }

export type Market = {
  key: MarketKey
  group: MarketGroup
  /** Where the rows are stored. `usd-ron` has none: it is EUR/RON ÷ EUR/USD. */
  store: { source: MarketSource; series: string; market: string } | null
  /** Currency of the value (`RON` for EUR/RON: lei per euro). */
  currency: 'USD' | 'EUR' | 'RON'
  /** Unit after the currency: `bbl`, `t`, `1000 l`, `MMBtu`; for a rate, the base currency. */
  unit: string
  decimals: number
  frequency: 'daily' | 'weekly' | 'monthly'
  convert?: Conversion
}

const wb = (series: string) => ({ source: 'world-bank' as const, series, market: 'world' })
const perTonne: Conversion = { to: 'RON', factor: 1, unit: 'lei/t', decimals: 0 }
const perLitre: Conversion = { to: 'RON', factor: 1 / 1000, unit: 'lei/l', decimals: 2 }

const list: Market[] = [
  {
    key: 'brent',
    group: 'energy',
    store: { source: 'eia-brent', series: 'brent', market: 'world' },
    currency: 'USD',
    unit: 'bbl',
    decimals: 2,
    frequency: 'daily',
  },
  {
    key: 'diesel-ro',
    group: 'energy',
    store: { source: 'eu-oil-bulletin', series: 'diesel', market: 'RO' },
    currency: 'EUR',
    unit: '1000 l',
    decimals: 0,
    frequency: 'weekly',
    convert: perLitre,
  },
  {
    key: 'petrol-ro',
    group: 'energy',
    store: { source: 'eu-oil-bulletin', series: 'euro95', market: 'RO' },
    currency: 'EUR',
    unit: '1000 l',
    decimals: 0,
    frequency: 'weekly',
    convert: perLitre,
  },
  {
    key: 'diesel-eu',
    group: 'energy',
    store: { source: 'eu-oil-bulletin', series: 'diesel', market: 'EU' },
    currency: 'EUR',
    unit: '1000 l',
    decimals: 0,
    frequency: 'weekly',
    convert: perLitre,
  },
  {
    key: 'petrol-eu',
    group: 'energy',
    store: { source: 'eu-oil-bulletin', series: 'euro95', market: 'EU' },
    currency: 'EUR',
    unit: '1000 l',
    decimals: 0,
    frequency: 'weekly',
    convert: perLitre,
  },
  {
    key: 'gas-eu',
    group: 'energy',
    store: wb('natural-gas-europe'),
    currency: 'USD',
    unit: 'MMBtu',
    decimals: 2,
    frequency: 'monthly',
    // 1 MMBtu = 0.293071 MWh; Europe quotes gas in €/MWh.
    convert: { to: 'EUR', factor: 1 / 0.293071, unit: '€/MWh', decimals: 2 },
  },
  {
    key: 'wheat-hrw',
    group: 'grain',
    store: wb('wheat-us-hrw'),
    currency: 'USD',
    unit: 't',
    decimals: 0,
    frequency: 'monthly',
    convert: perTonne,
  },
  {
    key: 'wheat-srw',
    group: 'grain',
    store: wb('wheat-us-srw'),
    currency: 'USD',
    unit: 't',
    decimals: 0,
    frequency: 'monthly',
    convert: perTonne,
  },
  {
    key: 'maize',
    group: 'grain',
    store: wb('maize'),
    currency: 'USD',
    unit: 't',
    decimals: 0,
    frequency: 'monthly',
    convert: perTonne,
  },
  {
    key: 'sunflower-oil',
    group: 'grain',
    store: wb('sunflower-oil'),
    currency: 'USD',
    unit: 't',
    decimals: 0,
    frequency: 'monthly',
    convert: perTonne,
  },
  {
    key: 'rapeseed-oil',
    group: 'grain',
    store: wb('rapeseed-oil'),
    currency: 'USD',
    unit: 't',
    decimals: 0,
    frequency: 'monthly',
    convert: perTonne,
  },
  {
    key: 'urea',
    group: 'fertiliser',
    store: wb('urea'),
    currency: 'USD',
    unit: 't',
    decimals: 0,
    frequency: 'monthly',
    convert: perTonne,
  },
  {
    key: 'dap',
    group: 'fertiliser',
    store: wb('dap'),
    currency: 'USD',
    unit: 't',
    decimals: 0,
    frequency: 'monthly',
    convert: perTonne,
  },
  {
    key: 'tsp',
    group: 'fertiliser',
    store: wb('tsp'),
    currency: 'USD',
    unit: 't',
    decimals: 0,
    frequency: 'monthly',
    convert: perTonne,
  },
  {
    key: 'potash',
    group: 'fertiliser',
    store: wb('potassium-chloride'),
    currency: 'USD',
    unit: 't',
    decimals: 0,
    frequency: 'monthly',
    convert: perTonne,
  },
  {
    key: 'eur-ron',
    group: 'fx',
    store: { source: 'ecb', series: 'eur-ron', market: 'ECB' },
    currency: 'RON',
    unit: 'EUR',
    decimals: 4,
    frequency: 'daily',
  },
  {
    key: 'eur-usd',
    group: 'fx',
    store: { source: 'ecb', series: 'eur-usd', market: 'ECB' },
    currency: 'USD',
    unit: 'EUR',
    decimals: 4,
    frequency: 'daily',
  },
  {
    key: 'usd-ron',
    group: 'fx',
    store: null,
    currency: 'RON',
    unit: 'USD',
    decimals: 4,
    frequency: 'daily',
  },
]

export const markets = Object.fromEntries(list.map((m) => [m.key, m])) as Record<MarketKey, Market>
export const marketKeys = list.map((m) => m.key)
export const isMarketKey = (k: string): k is MarketKey => k in markets

/**
 * World Bank Pink Sheet columns, by their header in the "Monthly Prices" sheet, and the series
 * each is stored as. The parser fails when a header is missing, so a changed layout is caught.
 */
export const worldBankColumns: Record<string, string> = {
  'Natural gas, Europe': 'natural-gas-europe',
  'Wheat, US HRW': 'wheat-us-hrw',
  'Wheat, US SRW': 'wheat-us-srw',
  Maize: 'maize',
  'Sunflower oil': 'sunflower-oil',
  'Rapeseed oil': 'rapeseed-oil',
  Urea: 'urea',
  DAP: 'dap',
  TSP: 'tsp',
  'Potassium chloride': 'potassium-chloride',
}

/** The world benchmark each grain crop's price page charts, main one first. */
export const cropMarkets: Record<GrainKey, MarketKey[]> = {
  wheat: ['wheat-hrw', 'wheat-srw'],
  maize: ['maize'],
  // The World Bank stopped its barley series in 2020; the barley page shows the EU's
  // Romanian prices only.
  barley: [],
  sunflower: ['sunflower-oil'],
  rapeseed: ['rapeseed-oil'],
}

/** Market pages with routes of their own (crop pages and fertilisers keep theirs). */
export type MarketPageId = 'brent' | 'fuel' | 'gas' | 'fx'

/** Each market page's markets, main one first. Slugs: `priceRoutes` in `@/i18n/routes`. */
export const marketPages: Record<MarketPageId, MarketKey[]> = {
  brent: ['brent'],
  fuel: ['diesel-ro', 'petrol-ro', 'diesel-eu', 'petrol-eu'],
  gas: ['gas-eu'],
  fx: ['eur-ron', 'eur-usd', 'usd-ron'],
}

export const marketPageIds = Object.keys(marketPages) as MarketPageId[]

/** The hub's groups, in order, with the page each tile links to. */
export const hubGroups: { group: MarketGroup; markets: MarketKey[] }[] = [
  { group: 'energy', markets: ['brent', 'diesel-ro', 'petrol-ro', 'gas-eu'] },
  {
    group: 'grain',
    markets: ['wheat-hrw', 'wheat-srw', 'maize', 'sunflower-oil', 'rapeseed-oil'],
  },
  { group: 'fertiliser', markets: ['urea', 'dap', 'potash', 'tsp'] },
  { group: 'fx', markets: ['eur-ron', 'eur-usd', 'usd-ron'] },
]

/** The quotes on the header ticker and the home hero rail (server-rendered, no chart code). */
export const tickerMarkets: MarketKey[] = ['brent', 'eur-ron', 'diesel-ro', 'wheat-hrw', 'urea']

const symbol = { USD: '$', EUR: '€', RON: 'lei' } as const

/** `$/bbl`, `€/1000 l`; a rate shows only its currency (`lei` for EUR/RON). */
export function unitOf(m: Market) {
  return m.group === 'fx' ? symbol[m.currency] : `${symbol[m.currency]}/${m.unit}`
}
