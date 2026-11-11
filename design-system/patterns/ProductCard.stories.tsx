import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { Locale } from '@/i18n/config'

import { storyLocale } from '../fixtures/story'
import {
  cardLabels as labels,
  sampleCards as cards,
  type SampleCard as Card,
} from '../fixtures/shop'
import { ProductCard } from './ProductCard'

/**
 * Shop card v2 (Phase 7c). One action per card, chosen by `cardAction`:
 * one buyable pack → quick add; several packs → "choose a pack" (the product page);
 * no price, on request, out of stock or blocked by OUG 53/2025 → the compact quick request.
 * 4 columns at 1440 px, 2 on phones. Prices and stock here are sample data.
 */
const meta: Meta = { title: 'Patterns/Product card v2', parameters: { layout: 'padded' } }
export default meta
type Story = StoryObj

const Grid = ({ locale, items }: { locale: Locale; items: Card[] }) => (
  <ul className="mx-auto grid max-w-page grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
    {items.map((c) => (
      <li key={c.href}>
        <ProductCard {...c} locale={locale} labels={labels(locale)} className="h-full" />
      </li>
    ))}
  </ul>
)

/** The listing grid: every action state side by side. */
export const AllStates: Story = {
  name: 'Grid, all action states',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return <Grid locale={locale} items={cards(locale)} />
  },
}

const one = (index: number) => ({
  render: (_: unknown, { globals }: { globals: Record<string, unknown> }) => {
    const locale = storyLocale(globals)
    return (
      <div className="max-w-sm">
        <ProductCard {...cards(locale)[index]} locale={locale} labels={labels(locale)} />
      </div>
    )
  },
})

export const OnePack: Story = { name: 'One pack: quick add', ...one(0) }
export const OnePackAdded: Story = { name: 'One pack: added', ...one(4) }
export const SeveralPacks: Story = { name: 'Several packs: choose', ...one(1) }
export const NoPrice: Story = { name: 'No price: quick request', ...one(5) }
export const Blocked: Story = { name: 'Blocked (OUG 53): quick request', ...one(6) }
