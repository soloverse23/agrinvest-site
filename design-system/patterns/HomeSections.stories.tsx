import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { Locale } from '@/i18n/config'

import { homeFaq } from '../../scripts/site/home'
import { heroSliderProps } from '../fixtures/hero'
import {
  companyProps,
  financeToolsProps,
  livePanelProps,
  shopCards,
  shopShowcaseProps,
} from '../fixtures/home'
import { menuNav } from '../fixtures/menu'
import { headerProps } from '../fixtures/props'
import { storyLocale } from '../fixtures/story'
import { HeroSlider } from './HeroSlider'
import { CompanySection, FinanceToolsRow, ShopShowcase } from './HomeSections'
import { LivePanel } from './LivePanel'
import { ProductCard } from './ProductCard'
import { Accordion, SectionHeading } from './Sections'
import { SiteHeader } from './SiteHeader'

const meta: Meta = { title: 'Patterns/Home sections', parameters: { layout: 'fullscreen' } }
export default meta
type Story = StoryObj

const Page = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-paper py-12 md:py-16">{children}</div>
)

/** Facts as the page shows them; the stories have no figures register. */
const facts: Record<string, Record<Locale, string>> = {
  S1: { ro: '17', en: '17' },
  C4: { ro: '11', en: '11' },
  C8: { ro: 'imediat după recepție', en: 'immediately after reception' },
  'F4.reply': { ro: 'în 24 h de la dosarul complet', en: 'within 24 h of complete documents' },
  'F5.instalments': {
    ro: 'maximum 2 rate pe an, după recoltele de vară și de toamnă',
    en: 'at most 2 instalments a year, after the summer and autumn harvests',
  },
}
const fill = (text: string, locale: Locale) =>
  text.replace(/\{\{([A-Za-z0-9.]+)\}\}/g, (_, k: string) => facts[k]?.[locale] ?? k)

const shop = (locale: Locale) => (
  <ShopShowcase
    {...shopShowcaseProps(locale)}
    products={{
      label: shopShowcaseProps(locale).products.label,
      cards: shopCards(locale).map((p) => <ProductCard key={p.href} {...p} className="w-full" />),
    }}
  />
)

const faq = (locale: Locale) => (
  <section className="mx-auto grid w-full max-w-page gap-8 px-4 md:px-8">
    <SectionHeading
      kicker={locale === 'ro' ? 'Pe scurt' : 'In short'}
      title={locale === 'ro' ? 'Întrebări frecvente' : 'Frequently asked questions'}
    />
    <Accordion
      items={homeFaq[locale].map((q) => ({
        question: q.question,
        answer: fill(q.answer, locale),
      }))}
    />
  </section>
)

/**
 * One panel: a tab per price (each crop's Agrinvest price, and diesel) that moves on every few
 * seconds until a tab is picked, the chart of the chosen price, and the six newest updates.
 */
export const Live: Story = {
  name: 'Live from the field',
  render: (_, { globals }) => (
    <Page>
      <LivePanel {...livePanelProps(storyLocale(globals))} />
    </Page>
  ),
}

/** Before Agrinvest publishes prices: the EU market lines per crop, no price moves in the feed. */
export const LiveMarket: Story = {
  name: 'Live from the field: market fallback',
  render: (_, { globals }) => (
    <Page>
      <LivePanel {...livePanelProps(storyLocale(globals), { prices: false })} />
    </Page>
  ),
}

/** Nothing published yet. */
export const LiveEmpty: Story = {
  name: 'Live from the field: empty',
  render: (_, { globals }) => (
    <Page>
      <LivePanel {...livePanelProps(storyLocale(globals), { empty: true })} />
    </Page>
  ),
}

/** Three category tiles with packshots, crop chips, six products that scroll sideways and snap. */
export const Shop: Story = {
  name: 'Shop',
  render: (_, { globals }) => <Page>{shop(storyLocale(globals))}</Page>,
}

export const FinanceTools: Story = {
  name: 'Financing and tools',
  render: (_, { globals }) => (
    <Page>
      <FinanceToolsRow {...financeToolsProps(storyLocale(globals))} />
    </Page>
  ),
}

export const Company: Story = {
  name: 'Agrinvest',
  render: (_, { globals }) => (
    <Page>
      <CompanySection {...companyProps(storyLocale(globals))} />
    </Page>
  ),
}

/** The whole home page in its new order, slider included (footage plays after load). */
export const HomePage: Story = {
  name: 'Home page',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <div className="bg-paper">
        <HeroSlider
          {...heroSliderProps(locale)}
          header={
            <SiteHeader
              {...headerProps(locale)}
              nav={menuNav(locale)}
              current="/"
              tone="overlay"
              ticker={undefined}
            />
          }
        />
        <div className="grid gap-20 py-16 md:gap-28 md:py-24">
          <LivePanel {...livePanelProps(locale)} />
          {shop(locale)}
          <FinanceToolsRow {...financeToolsProps(locale)} />
          <CompanySection {...companyProps(locale)} />
          {faq(locale)}
        </div>
      </div>
    )
  },
}
