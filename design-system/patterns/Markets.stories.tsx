import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { marketsUi } from '@/i18n/markets'

import { storyLocale } from '../fixtures/story'
import { MarketChart } from './MarketChart'
import { HistoryTable, MarketHeadline, MarketTile, StaticLine, type MarketPoint } from './Markets'

const meta: Meta = { title: 'Patterns/Markets', parameters: { layout: 'padded' } }
export default meta
type Story = StoryObj

/** A year of made-up daily values around 80, so the stories need no data. */
const year: MarketPoint[] = Array.from({ length: 260 }, (_, i) => [
  Date.UTC(2025, 10, 10) + i * 1.4 * 86_400_000,
  Math.round((80 + 12 * Math.sin(i / 25) + i / 20) * 100) / 100,
])
const values = year.map((p) => p[1])
const last = year[year.length - 1]!

/** The hub's tiles: value, move, a one-year line and the farmer's unit when there is one. */
export const Tiles: Story = {
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    const t = marketsUi[locale]
    return (
      <ul className="grid max-w-5xl grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { name: t.markets.brent.name, unit: '$/bbl', decimals: 2, approx: undefined },
          {
            name: t.markets['diesel-ro'].name,
            unit: '€/1000 l',
            decimals: 0,
            approx: '≈ 10,88 lei/l',
          },
          { name: t.markets.urea.name, unit: '$/t', decimals: 0, approx: '≈ 2.033 lei/t' },
          { name: t.markets['eur-ron'].name, unit: 'lei', decimals: 4, approx: undefined },
        ].map((m, i) => (
          <li key={m.name}>
            <MarketTile
              locale={locale}
              name={m.name}
              href={i < 3 ? '/preturi/petrol-brent' : undefined}
              value={last[1] * (i + 1)}
              decimals={m.decimals}
              unit={m.unit}
              date={new Date(last[0])}
              changePct={i % 2 ? -1.83 : 2.2}
              approx={m.approx}
              spark={values}
              open={t.ui.open}
            />
          </li>
        ))}
      </ul>
    )
  },
}

/**
 * A market page's top: the headline figure and stats, then the chart. In Storybook there is no
 * `/api/markets`, so the chart keeps the server's static line (what search engines see).
 */
export const PageTop: Story = {
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    const t = marketsUi[locale]
    return (
      <div className="grid max-w-5xl gap-6">
        <MarketHeadline
          locale={locale}
          name={t.markets.brent.name}
          value={92.14}
          decimals={2}
          unit="$/bbl"
          date={new Date(last[0])}
          change={1.98}
          changePct={2.2}
          changeLabel={t.ui.change(t.ui.period.daily)}
          stats={[
            { label: t.ui.year, value: '+44,28%' },
            { label: t.ui.high, value: '138,21' },
            { label: t.ui.low, value: '59,93' },
          ]}
          benchmark={t.markets.brent.benchmark}
          labels={{ updated: t.ui.updated }}
        />
        <MarketChart
          locale={locale}
          series={[{ key: 'brent', label: t.markets.brent.name, tone: 'accent' }]}
          decimals={2}
          unit="$/bbl"
          ranges={['1M', '3M', '6M', '1Y', '5Y', 'MAX']}
          defaultRange="1Y"
          labels={t.chart}
        >
          <StaticLine points={year} locale={locale} decimals={2} />
        </MarketChart>
      </div>
    )
  },
}

/** Monthly averages, one column per market; scrolls sideways on phones. */
export const History: Story = {
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    const t = marketsUi[locale]
    return (
      <div className="max-w-xl">
        <HistoryTable
          caption={t.ui.monthly}
          head={[t.ui.month, 'EUR/RON (lei)', 'EUR/USD ($)']}
          rows={[
            { label: 'nov. 2026', values: [5.3435, 1.1172] },
            { label: 'oct. 2026', values: [5.3392, 1.1202] },
            { label: 'sept. 2026', values: [5.2833, null] },
          ]}
          locale={locale}
          decimals={4}
        />
      </div>
    )
  },
}
