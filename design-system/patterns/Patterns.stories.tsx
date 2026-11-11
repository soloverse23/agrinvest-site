import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  figureItems,
  financeProps,
  headerProps,
  heroProps,
  priceTableProps,
  priceTiles,
} from '../fixtures/props'
import { storyLocale } from '../fixtures/story'
import { FigureStrip, FinanceBand } from './Bands'
import { Hero } from './Hero'
import { PriceTable } from './PriceTable'
import { PriceTile } from './PriceTile'
import { SiteHeader } from './SiteHeader'

const meta: Meta = { title: 'Patterns', parameters: { layout: 'fullscreen' } }
export default meta
type Story = StoryObj

const Page = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto max-w-page px-4 py-8 md:px-8">{children}</div>
)

/** Ticker with today's prices and the phone, then logo, sections, language and one CTA. */
export const Header: Story = {
  render: (_, { globals }) => <SiteHeader {...headerProps(storyLocale(globals))} />,
}

/** Full-bleed footage, transparent header over it, today's prices on the bottom rail. */
export const HomeHero: Story = {
  name: 'Hero',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <Hero
        {...heroProps(locale)}
        header={
          <SiteHeader {...headerProps(locale)} current="/" tone="overlay" ticker={undefined} />
        }
      />
    )
  },
}

export const PriceTiles: Story = {
  name: 'Price tiles',
  render: (_, { globals }) => (
    <Page>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {priceTiles(storyLocale(globals)).map((tile) => (
          <li key={tile.crop}>
            <PriceTile {...tile} />
          </li>
        ))}
      </ul>
    </Page>
  ),
}

/** Table from 768 px; one card per crop on phones, so nothing scrolls sideways. */
export const Prices: Story = {
  name: 'Price table',
  render: (_, { globals }) => (
    <Page>
      <PriceTable {...priceTableProps(storyLocale(globals))} />
    </Page>
  ),
}

export const Figures: Story = {
  render: (_, { globals }) => (
    <Page>
      <FigureStrip locale={storyLocale(globals)} items={figureItems(storyLocale(globals))} />
    </Page>
  ),
}

export const Finance: Story = {
  name: 'Finance band',
  render: (_, { globals }) => (
    <Page>
      <FinanceBand {...financeProps(storyLocale(globals))} />
    </Page>
  ),
}
