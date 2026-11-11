import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { Locale } from '@/i18n/config'

import { heroSliderProps } from '../fixtures/hero'
import { menuNav } from '../fixtures/menu'
import { headerProps } from '../fixtures/props'
import { storyLocale } from '../fixtures/story'
import { HeroSlider } from './HeroSlider'
import { SiteHeader } from './SiteHeader'

const meta: Meta = { title: 'Patterns/Hero slider', parameters: { layout: 'fullscreen' } }
export default meta
type Story = StoryObj

/** The home header over the footage: five items, no ticker (the rail shows the prices). */
const header = (locale: Locale) => (
  <SiteHeader
    {...headerProps(locale)}
    nav={menuNav(locale)}
    current="/"
    tone="overlay"
    ticker={undefined}
  />
)

/**
 * Three slides over silent loops (after load and idle), ~7 s each. The bars are the tabs;
 * hover or keyboard focus holds the slide, the round button stops the rotation and the loop.
 * The rail of today's prices stays put; each price opens its own page.
 */
export const WithPrices: Story = {
  name: 'Home: with prices',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return <HeroSlider {...heroSliderProps(locale)} header={header(locale)} />
  },
}

/** Before Agrinvest publishes any price, the rail holds four quick links instead. */
export const WithoutPrices: Story = {
  name: 'Home: no prices yet',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return <HeroSlider {...heroSliderProps(locale, { prices: false })} header={header(locale)} />
  },
}

/** As under prefers-reduced-motion or Save-Data: posters only, rotation starts paused. */
export const ReducedMotion: Story = {
  name: 'Home: reduced motion',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return <HeroSlider {...heroSliderProps(locale)} header={header(locale)} still />
  },
}
