import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { Locale } from '@/i18n/config'
import { shopUi } from '@/i18n/shop'

import { headerProps } from '../fixtures/props'
import { cardLabels, sampleCards } from '../fixtures/shop'
import { storyLocale } from '../fixtures/story'
import { SearchIcon } from '../icons/server'
import { CategoryRail, type RailCategory } from '../patterns/CategoryRail'
import { ProductCard } from '../patterns/ProductCard'
import { Accordion, SectionHeading } from '../patterns/Sections'
import {
  BrandStrip,
  CropTiles,
  PromoCard,
  ShopHero,
  TrustRow,
  type BrandItem,
  type CropTile,
} from '../patterns/ShopLanding'
import { ShopSearch, type ShopSearchIndex } from '../patterns/ShopSearch'
import { SiteHeader } from '../patterns/SiteHeader'

/**
 * The shop landing (/magazin, /en/shop), Phase 7c.2: search-first forest band, category rail,
 * then Recomandate, Pe culturi, Producători, the trust row and the FAQ. Each section shows
 * only when it has data. Counts, prices and FAQ answers here are sample data.
 */
const meta: Meta = {
  title: 'Pages/Shop landing',
  parameters: { layout: 'fullscreen', nextjs: { appDirectory: true } },
}
export default meta
type Story = StoryObj

const l = (locale: Locale, ro: string, en: string) => (locale === 'ro' ? ro : en)
const base = (locale: Locale) => (locale === 'ro' ? '/magazin' : '/en/shop')

const index: ShopSearchIndex = {
  h: {
    p: '/magazin/',
    k: '/magazin/',
    c: '/magazin/cultura/',
    b: '/magazin/producator/',
    i: '/magazin/substanta-activa/',
  },
  p: [
    ['Adengo 465 SC', 'erbicide/adengo-465-sc', 'Bayer', 'Izoxaflutol + tiencarbazon-metil'],
    ['Amazonas [Zn]', 'fertilizanti-foliare/amazonas-zn', 'Naturalis', 'Zn 7%'],
    ['Amino', 'fertilizanti-foliare/amino', 'Naturalis', 'Aminoacizi liberi · N 5%'],
    ['Ampligo 150 ZC', 'insecticide/ampligo', 'Syngenta', 'Clorantraniliprol + lambda-cihalotrin'],
  ],
  t: [
    ['i', 'Aminoacizi liberi', 'aminoacizi', 2],
    ['b', 'Adama', 'adama', 6],
  ],
}

const crumbs = (locale: Locale) => ({
  label: l(locale, 'Ești aici', 'You are here'),
  items: [
    { name: l(locale, 'Acasă', 'Home'), url: l(locale, '/', '/en') },
    { name: shopUi[locale].shop, url: base(locale) },
  ],
})

const crops = (locale: Locale) => ({
  label: shopUi[locale].landing.cropsLabel,
  items: [
    ['grau', 'Grâu', 'Wheat'],
    ['porumb', 'Porumb', 'Maize'],
    ['floarea-soarelui', 'Floarea-soarelui', 'Sunflower'],
    ['rapita', 'Rapiță', 'Rapeseed'],
    ['orz', 'Orz', 'Barley'],
    ['soia', 'Soia', 'Soya'],
  ].map(([slug, ro, en]) => ({
    href: `${base(locale)}/cultura/${slug}`,
    label: l(locale, ro, en),
  })),
  all: { href: `${base(locale)}#culturi`, label: shopUi[locale].landing.allCrops },
})

const rail = (locale: Locale): RailCategory[] => {
  const n = shopUi[locale].landing.products
  return [
    { href: '/magazin/seminte', label: l(locale, 'Semințe', 'Seeds'), count: n(17), icon: 'seed' },
    {
      href: '/magazin/erbicide',
      label: l(locale, 'Erbicide', 'Herbicides'),
      count: n(14),
      icon: 'herbicide',
    },
    {
      href: '/magazin/fungicide',
      label: l(locale, 'Fungicide', 'Fungicides'),
      count: n(9),
      icon: 'fungicide',
    },
    {
      href: '/magazin/insecticide',
      label: l(locale, 'Insecticide', 'Insecticides'),
      count: n(8),
      icon: 'insecticide',
    },
    {
      href: '/magazin/tratament-samanta',
      label: l(locale, 'Tratament sămânță', 'Seed treatment'),
      count: n(3),
      icon: 'seed-treatment',
    },
    {
      href: '/magazin/ingrasaminte',
      label: l(locale, 'Îngrășăminte', 'Fertilisers'),
      count: n(9),
      icon: 'fertiliser',
    },
    {
      href: '/magazin/fertilizanti-foliare',
      label: l(locale, 'Foliare', 'Foliar'),
      count: n(11),
      icon: 'foliar',
    },
  ]
}

const cropTiles = (locale: Locale): CropTile[] => {
  const n = shopUi[locale].landing.products
  const links = (s: string) => [
    { href: `/magazin/seminte?cultura=${s}`, label: l(locale, 'Semințe', 'Seeds') },
    { href: `/magazin/erbicide?cultura=${s}`, label: l(locale, 'Erbicide', 'Herbicides') },
    { href: `/magazin/fungicide?cultura=${s}`, label: l(locale, 'Fungicide', 'Fungicides') },
  ]
  return [
    ['grau', 'Grâu', 'Wheat', 'wheat', 28],
    ['porumb', 'Porumb', 'Maize', 'maize', 24],
    ['floarea-soarelui', 'Floarea-soarelui', 'Sunflower', 'sunflower', 19],
    ['rapita', 'Rapiță', 'Rapeseed', 'rapeseed', 15],
    ['orz', 'Orz', 'Barley', 'barley', 13],
    ['soia', 'Soia', 'Soya', null, 7],
  ].map(([slug, ro, en, crop, count]) => ({
    href: `${base(locale)}/cultura/${slug}`,
    label: l(locale, ro as string, en as string),
    count: n(count as number),
    crop: crop as string | null,
    links: links(slug as string),
  }))
}

const brands = (locale: Locale): BrandItem[] =>
  (
    [
      ['bayer', 'Bayer', 9],
      ['basf', 'BASF', 9],
      ['corteva', 'Corteva', 9],
      ['nufarm', 'Nufarm', 8],
      ['sharda', 'Sharda', 8],
      ['adama', 'Adama', 6],
      ['dekalb', 'Dekalb', 6],
      ['syngenta', 'Syngenta', 6],
      ['pioneer', 'Pioneer', 5],
      ['sarabia', 'Exclusivas Sarabia', 5],
      ['naturalis', 'Naturalis', 4],
    ] as const
  ).map(([slug, name, count]) => ({
    href: `${base(locale)}/producator/${slug}`,
    name,
    count: shopUi[locale].landing.products(count),
  }))

const faq = (locale: Locale) => [
  {
    question: l(locale, 'Cine confirmă prețul și stocul?', 'Who confirms the price and stock?'),
    answer: l(
      locale,
      'Un consultant Agrinvest, înainte de factură. Prețurile marcate cu * sunt orientative până atunci.',
      'An Agrinvest consultant, before the invoice. Prices marked * are indicative until then.',
    ),
  },
  {
    question: l(
      locale,
      'Am nevoie de certificat pentru produsele de protecție?',
      'Do I need a certificate for crop protection products?',
    ),
    answer: l(
      locale,
      'Da, pentru produsele de uz profesional. Îl încarci la comandă.',
      'Yes, for professional-use products. You upload it with the order.',
    ),
  },
  {
    question: l(locale, 'Pot plăti inputurile la recoltă?', 'Can I pay for inputs at harvest?'),
    answer: l(
      locale,
      'Da, prin finanțarea de inputuri Agrinvest Credit.',
      'Yes, through Agrinvest Credit input financing.',
    ),
  },
]

function Search({ locale, open }: { locale: Locale; open?: boolean }) {
  const t = shopUi[locale]
  return (
    <ShopSearch
      action={l(locale, '/magazin/cautare', '/en/shop/search')}
      indexUrl="/shop-index.json"
      icon={<SearchIcon className="size-6" />}
      defaultQuery={open ? 'am' : ''}
      defaultOpen={open}
      index={open ? index : undefined}
      labels={{
        label: t.searchLabel,
        placeholder: t.landing.searchPlaceholder,
        submit: t.search,
        searchAll: t.landing.searchAll,
        kinds: t.landing.kinds,
        products: t.landing.suggestCount,
      }}
    />
  )
}

function Landing({
  locale,
  promo,
  open,
}: {
  locale: Locale
  promo: 'staff' | 'season'
  open?: boolean
}) {
  const t = shopUi[locale]
  const L = t.landing
  const cards = [...sampleCards(locale)]
  return (
    <div className="min-h-screen overflow-x-clip bg-paper pb-24 text-ink">
      <SiteHeader {...headerProps(locale)} />
      <main>
        <ShopHero
          crumbs={crumbs(locale)}
          kicker={L.kicker}
          title={t.title}
          counts={[L.products(71), L.inStock(54)]}
          search={<Search locale={locale} open={open} />}
          crops={crops(locale)}
          promo={
            promo === 'staff' ? (
              <PromoCard
                kicker={l(locale, 'Până pe 30 noiembrie', 'Until 30 November')}
                title={l(locale, 'Uree și azotat pentru toamnă', 'Urea and nitrate for autumn')}
                text={l(
                  locale,
                  'Fertilizarea de bază pentru cerealele de toamnă, cu ridicare de la bază.',
                  'Base dressing for winter cereals, collected from a base.',
                )}
                href="/magazin/ingrasaminte"
                linkLabel={L.promoLink}
                packshots={[
                  '/products/uree-egipt-1.webp',
                  '/products/napekhem-s65-20l-1.png',
                  '/products/amino-20l-1.png',
                ]}
                icon="fertiliser"
              />
            ) : (
              <PromoCard
                kicker={L.seasonKicker}
                title={l(locale, 'Îngrășăminte', 'Fertilisers')}
                text={L.seasonText(9)}
                href="/magazin/ingrasaminte"
                linkLabel={L.seasonLink(l(locale, 'Îngrășăminte', 'Fertilisers'))}
                packshots={[
                  '/products/uree-egipt-1.webp',
                  '/products/napekhem-s65-20l-1.png',
                  '/products/napekhem-20-20-0-plus-20l-1.png',
                ]}
                icon="fertiliser"
              />
            )
          }
          rail={<CategoryRail label={t.categories} items={rail(locale)} />}
        />

        <section
          aria-labelledby="recomandate"
          className="mx-auto mt-14 grid max-w-page gap-8 px-4 md:mt-20 md:px-8"
        >
          <SectionHeading
            id="recomandate"
            title={L.recommended}
            action={{
              href: l(locale, '/magazin/cautare', '/en/shop/search'),
              label: L.allProducts,
            }}
          />
          <ul className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
            {cards.map((c) => (
              <li key={c.href}>
                <ProductCard
                  {...c}
                  locale={locale}
                  labels={cardLabels(locale)}
                  className="h-full"
                />
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="culturi"
          className="mx-auto mt-16 grid max-w-page gap-8 px-4 md:mt-24 md:px-8"
        >
          <SectionHeading id="culturi" title={L.byCrop} />
          <CropTiles items={cropTiles(locale)} />
        </section>

        <section
          aria-labelledby="producatori"
          className="mx-auto mt-16 grid max-w-page gap-8 px-4 md:mt-24 md:px-8"
        >
          <SectionHeading id="producatori" title={L.brands} />
          <BrandStrip items={brands(locale)} all={{ href: '#', label: L.allBrands }} />
        </section>

        <section
          aria-labelledby="incredere"
          className="mx-auto mt-16 grid max-w-page gap-8 px-4 md:mt-24 md:px-8"
        >
          <h2 id="incredere" className="sr-only">
            {L.trust}
          </h2>
          <TrustRow
            items={[
              { icon: 'consultant', ...L.trustItems.consultant },
              {
                icon: 'pickup',
                title: L.trustItems.pickup.title,
                text: `${L.trustItems.pickup.before}${l(locale, '17 silozuri și depozite de cereale', '17 silos and grain warehouses')}${L.trustItems.pickup.after}`,
              },
              {
                icon: 'finance',
                title: L.trustItems.finance.title,
                text: L.trustItems.finance.text,
                link: {
                  href: '/finantare/inputuri-plata-la-recolta',
                  label: L.trustItems.finance.link,
                },
              },
              { icon: 'certificate', ...L.trustItems.certificate },
            ]}
          />
        </section>

        <section
          aria-labelledby="intrebari"
          className="mx-auto mt-16 grid max-w-page gap-8 px-4 md:mt-24 md:px-8 lg:grid-cols-12"
        >
          <div className="lg:col-span-4">
            <SectionHeading id="intrebari" title={L.faq} />
          </div>
          <div className="lg:col-span-8">
            <Accordion items={faq(locale)} />
          </div>
        </section>
      </main>
    </div>
  )
}

export const Default: Story = {
  name: 'Seasonal promo (computed default)',
  render: (_, { globals }) => <Landing locale={storyLocale(globals)} promo="season" />,
}

export const StaffPromo: Story = {
  name: 'Staff promo (ShopHome)',
  render: (_, { globals }) => <Landing locale={storyLocale(globals)} promo="staff" />,
}

export const Suggestions: Story = {
  name: 'Search suggestions open',
  render: (_, { globals }) => <Landing locale={storyLocale(globals)} promo="season" open />,
}
