import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { Locale } from '@/i18n/config'
import { formatNumber } from '@/lib/format'

import { priceDate, weeklySeries } from '../../fixtures/sample'
import { storyLocale } from '../../fixtures/story'
import { LineChart } from '../LineChart'
import { DieselCard } from './DieselCard'
import { GrainPrices, type GrainPriceItem } from './GrainPrices'
import { NewsList } from './NewsList'
import { NetPriceMini } from './NetPriceMini'
import { WidgetFrame } from './WidgetFrame'
import { pricesUi } from '@/i18n/prices'
import { toolsUi } from '@/i18n/tools'

const meta: Meta = { title: 'Patterns/Widgets', parameters: { layout: 'padded' } }
export default meta
type Story = StoryObj

const chartLabels = {
  ro: { table: 'Arată datele', date: 'Săptămâna', empty: 'Nu avem încă date pentru grafic.' },
  en: { table: 'Show the data', date: 'Week', empty: 'There is no data for this chart yet.' },
}

const copy = {
  ro: {
    wheat: 'Grâu',
    maize: 'Porumb',
    chart: 'Grâu, ultimele 52 de săptămâni',
    eu: 'Prețul în România (UE)',
    fob: 'FOB Constanța',
    widget: 'Prețul grâului',
    source: 'Comisia Europeană, portalul de date agroalimentare',
    link: 'Toate prețurile',
    onRequest: 'Prețul Agrinvest se dă la cerere: sună-ne sau trimite o cerere.',
  },
  en: {
    wheat: 'Wheat',
    maize: 'Maize',
    chart: 'Wheat, last 52 weeks',
    eu: 'Price in Romania (EU)',
    fob: 'FOB Constanța',
    widget: 'Wheat price',
    source: 'European Commission, Agri-food data portal',
    link: 'All prices',
    onRequest: "Agrinvest's price is given on request: call us or send a request.",
  },
}

const Box = ({ children }: { children: React.ReactNode }) => (
  <div className="max-w-2xl">{children}</div>
)

/** 52 weeks of one series: HTML axis labels, the line, the last point and the data table. */
export const Chart: Story = {
  render: (_, { globals }) => {
    const l = storyLocale(globals)
    return (
      <Box>
        <LineChart
          title={copy[l].chart}
          unit="€/t"
          locale={l}
          labels={chartLabels[l]}
          series={[{ label: copy[l].eu, points: weeklySeries(205, 0.3, 9) }]}
        />
      </Box>
    )
  },
}

/** Two series: the second is dashed as well as a different colour, so colour is not the only cue. */
export const ChartTwoSeries: Story = {
  name: 'Chart, two series',
  render: (_, { globals }) => {
    const l = storyLocale(globals)
    return (
      <Box>
        <LineChart
          title={copy[l].chart}
          unit="€/t"
          locale={l}
          labels={chartLabels[l]}
          series={[
            { label: copy[l].eu, points: weeklySeries(205, 0.3, 9) },
            { label: copy[l].fob, points: weeklySeries(222, 0.2, 7), tone: 'info' },
          ]}
        />
      </Box>
    )
  },
}

/** One point cannot make a line: the table alone. */
export const ChartOnePoint: Story = {
  name: 'Chart, one point',
  render: (_, { globals }) => {
    const l = storyLocale(globals)
    return (
      <Box>
        <LineChart
          title={copy[l].chart}
          unit="€/t"
          locale={l}
          labels={chartLabels[l]}
          series={[{ label: copy[l].eu, points: weeklySeries(205, 0, 0, 1) }]}
        />
      </Box>
    )
  },
}

export const ChartEmpty: Story = {
  name: 'Chart, no data',
  render: (_, { globals }) => {
    const l = storyLocale(globals)
    return (
      <Box>
        <LineChart
          title={copy[l].chart}
          unit="€/t"
          locale={l}
          labels={chartLabels[l]}
          series={[]}
        />
      </Box>
    )
  },
}

const sampleBody = (l: Locale) => (
  <p className="flex items-baseline gap-1.5">
    <span className="text-figure font-semibold tabular-nums">{formatNumber(214, l)}</span>
    <span className="text-small text-muted">€/t</span>
  </p>
)

const frameProps = (l: Locale) => ({
  locale: l,
  title: copy[l].widget,
  source: { name: copy[l].source, url: 'https://agridata.ec.europa.eu/', date: priceDate },
  link: { href: '#', label: copy[l].link },
})

/** The shared frame in its three states: ready, stale (last good data, dated) and empty. */
export const Frame: Story = {
  name: 'Widget frame',
  render: (_, { globals }) => {
    const l = storyLocale(globals)
    return (
      <div className="grid max-w-4xl gap-4 md:grid-cols-3">
        <WidgetFrame {...frameProps(l)} state="ready">
          {sampleBody(l)}
        </WidgetFrame>
        <WidgetFrame {...frameProps(l)} state="stale">
          {sampleBody(l)}
        </WidgetFrame>
        <WidgetFrame {...frameProps(l)} state="empty" emptyText={copy[l].onRequest} />
      </div>
    )
  },
}

const grainItems = (l: Locale, own: boolean): GrainPriceItem[] => [
  {
    crop: 'wheat',
    name: copy[l].wheat,
    href: '#',
    agrinvest: own ? { min: 930, max: 960 } : null,
    market: { value: 214, unit: '€/t', change: 3.5 },
  },
  {
    crop: 'maize',
    name: copy[l].maize,
    href: '#',
    agrinvest: own ? { min: 820, max: 820 } : null,
    market: { value: 188, unit: '€/t', change: -2 },
  },
  {
    crop: 'sunflower',
    name: l === 'ro' ? 'Floarea-soarelui' : 'Sunflower',
    href: '#',
    agrinvest: null,
    market: null,
  },
]

const grainProps = (l: Locale) => {
  const w = pricesUi[l].widget
  return {
    locale: l,
    title: w.grainTitle,
    labels: { agrinvest: w.agrinvest, market: w.eu, onRequest: w.onRequest, empty: w.empty },
    source: { name: copy[l].source, url: 'https://agridata.ec.europa.eu/', date: priceDate },
    link: { href: '#', label: w.grainLink },
  }
}

/**
 * Grain prices: Agrinvest’s published price per crop, or “on request”, next to the latest EU
 * price for Romania. Ready with own prices, stale with only old market data, and empty.
 */
export const GrainPricesStates: Story = {
  name: 'Grain prices',
  render: (_, { globals }) => {
    const l = storyLocale(globals)
    return (
      <div className="grid max-w-5xl gap-4 lg:grid-cols-3">
        <GrainPrices {...grainProps(l)} state="ready" items={grainItems(l, true)} />
        <GrainPrices {...grainProps(l)} state="stale" items={grainItems(l, false)} />
        <GrainPrices {...grainProps(l)} state="empty" items={[]} />
      </div>
    )
  },
}

/** A plain GET form into the net-price calculator; no script. */
export const NetPrice: Story = {
  name: 'Net price (mini)',
  render: (_, { globals }) => {
    const l = storyLocale(globals)
    const c = pricesUi[l].calc
    return (
      <div className="max-w-md">
        <NetPriceMini
          locale={l}
          title={pricesUi[l].widget.netTitle}
          action="#"
          crop="wheat"
          crops={[
            { value: 'wheat', label: copy[l].wheat },
            { value: 'maize', label: copy[l].maize },
          ]}
          link={{ href: '#', label: pricesUi[l].widget.netLink }}
          labels={{
            crop: c.crop,
            choose: c.choose,
            quantity: c.quantity,
            price: c.price,
            moisture: c.moisture,
            impurities: c.impurities,
            submit: c.submit,
          }}
        />
      </div>
    )
  },
}

const dieselProps = (l: Locale) => {
  const t = toolsUi[l].today
  return {
    locale: l,
    title: t.diesel,
    labels: {
      agrinvest: t.agrinvest,
      national: t.national,
      onRequest: t.onRequest,
      empty: t.dieselEmpty,
    },
    source: { name: 'European Commission, Weekly Oil Bulletin', url: '#', date: priceDate },
    link: { href: '#', label: t.dieselLink },
  }
}

/** Diesel: Agrinvest’s price, or “on request”, and Romania’s weekly average. */
export const Diesel: Story = {
  render: (_, { globals }) => {
    const l = storyLocale(globals)
    return (
      <div className="grid max-w-4xl gap-4 md:grid-cols-3">
        <DieselCard
          {...dieselProps(l)}
          state="ready"
          own={{ price: 6.42, vat: toolsUi[l].diesel.vat['fara-tva'] }}
          national={{ value: 2071, unit: '€/1000 l' }}
        />
        <DieselCard
          {...dieselProps(l)}
          state="ready"
          own={null}
          national={{ value: 2071, unit: '€/1000 l' }}
        />
        <DieselCard
          {...dieselProps(l)}
          state="stale"
          own={null}
          national={{ value: 2035, unit: '€/1000 l' }}
        />
      </div>
    )
  },
}

/** Headlines with source and date, each linking to the original; and the empty state. */
export const News: Story = {
  render: (_, { globals }) => {
    const l = storyLocale(globals)
    const t = toolsUi[l].today
    const items = [
      {
        id: 1,
        title: 'Prețul grâului a crescut în portul Constanța',
        url: '#',
        source: 'Agrointel',
        date: priceDate,
      },
      {
        id: 2,
        title: 'APIA: calendarul plăților în avans pentru 2026',
        url: '#',
        source: 'Revista Ferma',
        date: priceDate,
      },
      {
        id: 3,
        title: 'Semănatul grâului, aproape încheiat în sud',
        url: '#',
        source: 'Agrointel',
        date: priceDate,
      },
    ]
    return (
      <div className="grid max-w-4xl gap-4 md:grid-cols-2">
        <NewsList
          locale={l}
          title={t.news}
          state="ready"
          items={items}
          emptyText={t.newsEmpty}
          link={{ href: '#', label: t.newsLink }}
        />
        <NewsList locale={l} title={t.news} state="empty" items={[]} emptyText={t.newsEmpty} />
      </div>
    )
  },
}
