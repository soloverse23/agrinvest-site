import type { MarketSource } from '@/lib/sources'

/** One parsed market price, ready for `MarketPrices`. */
export type MarketRow = {
  source: MarketSource
  series: string
  market: string
  price: number
  currency: string
  unit: string
  /** Start of the week or month; stored as a UTC day. */
  period: Date
  fetchedAt: Date
}

export const dayKey = (d: Date) => d.toISOString().slice(0, 10)

export const marketKey = (r: Pick<MarketRow, 'source' | 'series' | 'market' | 'period'>) =>
  `${r.source}|${r.series}|${r.market}|${dayKey(r.period)}`
