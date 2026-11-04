import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { Locale } from '@/i18n/config'

import {
  figureItems,
  financeProps,
  headerProps,
  heroProps,
  priceTableProps,
  priceTiles,
  productCards,
} from '../fixtures/props'
import { storyLocale } from '../fixtures/story'
import { ArrowRightIcon } from '../icons/icons'
import { FigureStrip, FinanceBand } from '../patterns/Bands'
import { Hero } from '../patterns/Hero'
import { PriceTable } from '../patterns/PriceTable'
import { PriceTile } from '../patterns/PriceTile'
import { ProductCard } from '../patterns/ProductCard'
import { SiteHeader } from '../patterns/SiteHeader'
import { Button } from '../primitives/Button'

const t = {
  ro: {
    pricesKicker: 'Prețuri',
    pricesTitle: 'Știi prețul înainte să încarci camionul.',
    pricesLead:
      'Prețul de achiziție pe fiecare bază, actualizat zilnic. Plata se face imediat după recepție.',
    shopKicker: 'Magazin',
    shopTitle: 'Inputuri cu fișa tehnică completă.',
    shopLead:
      'Doză, culturi și momentul aplicării pe fiecare produs, verificate de agronomii noștri.',
    shopAll: 'Tot magazinul',
  },
  en: {
    pricesKicker: 'Prices',
    pricesTitle: 'Know the price before you load the truck.',
    pricesLead: 'The buying price at every base, updated daily. Payment right after reception.',
    shopKicker: 'Shop',
    shopTitle: 'Inputs with the full technical sheet.',
    shopLead: 'Dose, crops and timing on every product, checked by our agronomists.',
    shopAll: 'The whole shop',
  },
}

function SectionHead({
  kicker,
  title,
  lead,
  action,
}: {
  kicker: string
  title: string
  lead: string
  action?: React.ReactNode
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6">
      <div className="grid max-w-2xl gap-3">
        <p className="text-small font-semibold text-accent">{kicker}</p>
        <h2 className="text-h2 font-semibold text-balance">{title}</h2>
        <p className="text-lead text-muted">{lead}</p>
      </div>
      {action}
    </header>
  )
}

function HomeSketch({ locale }: { locale: Locale }) {
  const l = t[locale]
  return (
    <div lang={locale}>
      <Hero
        {...heroProps(locale)}
        header={
          <SiteHeader {...headerProps(locale)} current="/" tone="overlay" ticker={undefined} />
        }
      />
      <main className="mx-auto grid max-w-page gap-20 px-4 pb-16 md:gap-28 md:px-8 md:pb-24">
        <FigureStrip locale={locale} items={figureItems(locale)} />

        <section className="grid gap-8">
          <SectionHead kicker={l.pricesKicker} title={l.pricesTitle} lead={l.pricesLead} />
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {priceTiles(locale).map((tile) => (
              <li key={tile.crop}>
                <PriceTile {...tile} />
              </li>
            ))}
          </ul>
          <PriceTable {...priceTableProps(locale)} />
        </section>

        <section className="grid gap-8">
          <SectionHead
            kicker={l.shopKicker}
            title={l.shopTitle}
            lead={l.shopLead}
            action={
              <Button href="/magazin" variant="secondary" icon={<ArrowRightIcon />}>
                {l.shopAll}
              </Button>
            }
          />
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {productCards(locale).map((p) => (
              <li key={p.href}>
                <ProductCard {...p} className="h-full" />
              </li>
            ))}
          </ul>
        </section>

        <FinanceBand {...financeProps(locale)} />
      </main>
    </div>
  )
}

/** The patterns composed into a homepage, to judge the system as a whole. */
const meta: Meta = { title: 'Pages/Home', parameters: { layout: 'fullscreen' } }
export default meta

export const Sketch: StoryObj = {
  render: (_, { globals }) => <HomeSketch locale={storyLocale(globals)} />,
}
