import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { Locale } from '@/i18n/config'
import { formatNumber } from '@/lib/format'

import { priceDate, weeklySeries } from '../../fixtures/sample'
import { storyLocale } from '../../fixtures/story'
import { LineChart } from '../LineChart'
import { WidgetFrame } from './WidgetFrame'

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
