import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { pricesUi } from '@/i18n/prices'

import { crops } from '../fixtures/sample'
import { storyLocale } from '../fixtures/story'
import { CarouselNav } from './CarouselNav'
import { QuoteStrip, type Quote } from './QuoteStrip'

const meta: Meta = { title: 'Patterns/Quote strip', parameters: { layout: 'fullscreen' } }
export default meta
type Story = StoryObj

const quotes = (locale: 'ro' | 'en'): Quote[] => [
  ...crops.map((c) => ({
    key: c.key,
    name: c.name[locale],
    href: `/preturi/${c.key}`,
    price: c.prices[0],
    unit: 'lei/t',
    change: c.change,
    points: c.trend,
  })),
  {
    key: 'diesel',
    name: locale === 'ro' ? 'Motorină' : 'Diesel',
    href: '/motorina',
    price: 7.12,
    unit: 'lei/l',
    decimals: 2,
    change: -0.04,
    points: [7.2, 7.18, 7.16, 7.16, 7.12],
    fuel: true,
  },
]

/**
 * The home hero's row: name, price, the 30-day line with a dotted mark at the previous price,
 * and the change in units and percent. Narrow it to see the ‹ › buttons and the swipe.
 */
export const Hero: Story = {
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <div className="bg-forest px-4 py-4 text-on-forest md:px-8">
        <QuoteStrip
          id="story-hero"
          locale={locale}
          quotes={quotes(locale)}
          variant="hero"
          nav={
            <CarouselNav
              track="story-hero"
              labels={pricesUi[locale].rail}
              tone="forest"
              hideIdle
              className="hidden shrink-0 md:flex"
            />
          }
        />
      </div>
    )
  },
}

/** The one-line strip above the header on inner pages: swipe or trackpad, no buttons. */
export const Bar: Story = {
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <div className="bg-forest text-caption text-on-forest">
        <QuoteStrip id="story-bar" locale={locale} quotes={quotes(locale)} variant="bar" />
      </div>
    )
  },
}
