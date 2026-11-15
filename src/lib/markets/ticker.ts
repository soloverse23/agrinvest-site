import type { Quote } from '@ds/patterns/QuoteStrip'
import type { Locale } from '@/i18n/config'
import { marketsUi } from '@/i18n/markets'

import { converted, latestRates, marketSeries, type Point } from './load'
import { markets, tickerMarkets, unitOf, type MarketKey } from './registry'

/** Points behind each trend line: about a month of daily data, a quarter or a year otherwise. */
const trendPoints = { daily: 22, weekly: 13, monthly: 12 } as const

/**
 * Market quotes for the header ticker and the home hero rail (Phase 7f), server-rendered with
 * no chart code. Diesel is shown in lei per litre (the farmer's unit) from the ECB rate; the
 * others in their source unit. Null before any market has data, so both stay hidden.
 */
export async function marketTicker(
  locale: Locale,
  hrefs: Partial<Record<MarketKey, string>>,
): Promise<{ quotes: Quote[]; date: Date } | null> {
  const t = marketsUi[locale]
  const [series, rates] = await Promise.all([
    Promise.all(tickerMarkets.map((k) => marketSeries(k))),
    latestRates(),
  ])
  let latest = 0
  const quotes = tickerMarkets.flatMap((key, i): Quote[] => {
    const m = markets[key]
    const raw: Point[] = series[i]!.slice(-trendPoints[m.frequency])
    const last = raw[raw.length - 1]
    const href = hrefs[key]
    if (!last || !href) return []
    // Diesel in lei per litre when a rate exists; everything else as the source quotes it.
    const local = key === 'diesel-ro' && m.convert && rates
    const value = (v: number) => (local ? converted(m, v, rates)! : v)
    const points = raw.map(([, v]) => value(v))
    latest = Math.max(latest, last[0])
    const before = points[points.length - 2]
    return [
      {
        key,
        name: t.ticker.names[key] ?? t.markets[key].name,
        href,
        price: points[points.length - 1]!,
        unit: local ? m.convert!.unit : unitOf(m),
        showUnit: true,
        decimals: local ? m.convert!.decimals : m.decimals,
        change: before === undefined ? undefined : points[points.length - 1]! - before,
        points,
        fuel: key === 'diesel-ro',
      },
    ]
  })
  return quotes.length ? { quotes, date: new Date(latest) } : null
}
