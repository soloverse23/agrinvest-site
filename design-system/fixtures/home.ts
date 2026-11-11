/**
 * The home sections below the hero (Phase 7b) with sample data, for stories and shots.
 * Copy is the real copy (src/i18n/home.ts); prices, headlines and dates are illustrative.
 */
import type { Locale } from '@/i18n/config'
import { homeUi } from '@/i18n/home'

import type {
  CompanySectionProps,
  FinanceToolsRowProps,
  ShopShowcaseProps,
} from '../patterns/HomeSections'
import type { FeedItem, LivePanelProps } from '../patterns/LivePanel'
import type { ProductCardProps } from '../patterns/ProductCard'
import { productCardProps } from './props'
import { crops, priceDate, products, weeklySeries } from './sample'

const at = (hoursBefore: number) => new Date(priceDate.getTime() - hoursBefore * 3_600_000)
const l = (locale: Locale, ro: string, en: string) => (locale === 'ro' ? ro : en)

/** Illustrative weekly lines, one per crop, ending at each crop's sample price. */
const lines: Record<string, [number, number, number]> = {
  wheat: [905, 2.2, 18],
  maize: [870, 1.2, 14],
  sunflower: [1980, 3.1, 40],
  rapeseed: [2150, 2.8, 30],
  barley: [820, 1.4, 12],
}

/** A sample line that ends at the crop's sample price (Agrinvest) or a fifth of it (€/t). */
function endAt(
  c: (typeof crops)[number],
  prices: boolean,
  start: number,
  drift: number,
  swing: number,
) {
  const points = weeklySeries(start, drift, swing, prices ? 16 : 52)
  const scale = prices ? 1 : 0.2
  const target = prices ? c.prices[0] : Math.round(c.prices[0] / 5)
  // With prices, the line runs to the price before and then steps by the sample change.
  const end = prices ? target - c.change : target
  const anchor = points[points.length - (prices ? 2 : 1)].value
  const line = points.map((p) => ({
    date: p.date,
    value: Math.round((p.value - anchor) * scale + end),
  }))
  if (prices) line[line.length - 1].value = target
  return line
}

const feed = (locale: Locale): FeedItem[] => [
  {
    id: 'price-wheat',
    kind: 'price',
    title: homeUi[locale].live.move(l(locale, 'Grâu', 'Wheat'), '+15'),
    href: '/preturi/grau',
    date: at(2),
    change: 15,
  },
  {
    id: 'note',
    kind: 'note',
    title: l(
      locale,
      'Nota de piață, săptămâna 45: grâul urcă la Constanța',
      'Market note, week 45: wheat rises at Constanța',
    ),
    href: '/piata/nota-2026-11-02',
    date: at(5),
  },
  {
    id: 'news-1',
    kind: 'news',
    title: l(
      locale,
      'APIA a început plata avansului pentru campania 2026',
      'APIA starts paying the 2026 advance',
    ),
    href: 'https://example.com/apia',
    external: true,
    source: 'Agrointel',
    date: at(7),
  },
  {
    id: 'agrinvest-1',
    kind: 'agrinvest',
    title: l(
      locale,
      'Baza Pogoanele primește porumb din noua recoltă',
      'The Pogoanele base takes new-crop maize',
    ),
    href: '/stiri/pogoanele-porumb',
    date: at(26),
  },
  {
    id: 'guide-1',
    kind: 'guide',
    title: l(
      locale,
      'Cum citești buletinul de analiză la recepție',
      'How to read the reception analysis sheet',
    ),
    href: '/ghiduri/vanzare/buletin-analiza',
    date: at(50),
  },
  {
    id: 'social-1',
    kind: 'social',
    title: l(
      locale,
      'Echipa Agrinvest la Indagra 2026: vă așteptăm la standul nostru',
      'The Agrinvest team at Indagra 2026: come and see us',
    ),
    href: 'https://www.linkedin.com/company/agrinvest',
    external: true,
    date: at(74),
  },
]

export const livePanelProps = (
  locale: Locale,
  { prices = true, empty = false }: { prices?: boolean; empty?: boolean } = {},
): LivePanelProps => {
  const t = homeUi[locale].live
  return {
    locale,
    title: t.title,
    updated: empty ? null : at(2),
    charts: empty
      ? []
      : [
          ...crops.map((c) => {
            const [start, drift, swing] = lines[c.key]
            return {
              key: c.key,
              name: c.name[locale],
              title: prices ? t.chart.agrinvest(c.name[locale]) : t.chart.market(c.name[locale]),
              unit: prices ? 'lei/t' : '€/t',
              points: endAt(c, prices, start, drift, swing),
              link: { href: `/preturi/${c.key}`, label: t.chart.link(c.name[locale]) },
            }
          }),
          {
            key: 'diesel' as const,
            name: l(locale, 'Motorină', 'Diesel'),
            title: t.chart.diesel,
            unit: '€/1000 l',
            // Weekly Oil Bulletin average, illustrative.
            points: weeklySeries(1_430, 1.1, 22, 26).map((p, i, all) =>
              i === all.length - 1 ? { ...p, value: all[i - 1].value - 6 } : p,
            ),
            link: { href: '/motorina', label: t.chart.dieselLink },
          },
        ],
    feed: empty ? [] : feed(locale).filter((i) => prices || i.kind !== 'price'),
    links: {
      news: { href: '/stiri', label: t.allNews },
      prices: { href: '/preturi', label: t.allPrices },
    },
    labels: {
      updated: t.updated,
      crops: t.crops,
      rotate: t.rotate,
      feed: t.feed,
      feedEmpty: t.feedEmpty,
      kinds: t.kinds,
      chart: t.chart,
    },
  }
}

/** Three more cards so the strip has six, across seeds, protection and nutrition. */
const extraCards = (locale: Locale): ProductCardProps[] => {
  const base = productCardProps(products[0], locale)
  const card = (
    slug: string,
    name: string,
    pack: string,
    image: string,
    category: string,
    price: number,
    unitPrice: string,
    crops: string,
  ): ProductCardProps => ({
    ...base,
    href: `/magazin/${slug}`,
    name,
    pack,
    image,
    category,
    active: undefined,
    crops,
    dose: undefined,
    price,
    unitPrice,
    inStock: true,
    payAtHarvestHref: undefined,
  })
  return [
    card(
      'seminte/avenue',
      'Grâu Avenue C1',
      '800 kg',
      '/products/samanta-grau-avenue-c1-800-kg-1.webp',
      l(locale, 'Semințe', 'Seeds'),
      2_480,
      '3,10 lei/kg',
      l(locale, 'Grâu de toamnă', 'Winter wheat'),
    ),
    card(
      'ingrasaminte/uree',
      l(locale, 'Uree 46%', 'Urea 46%'),
      '500 kg',
      '/products/uree-egipt-1.webp',
      l(locale, 'Îngrășăminte', 'Fertilisers'),
      1_350,
      '2,70 lei/kg',
      l(locale, 'Grâu, porumb, rapiță', 'Wheat, maize, rapeseed'),
    ),
    card(
      'foliare/amino',
      'Amino',
      '20 L',
      '/products/amino-20l-1.png',
      l(locale, 'Foliare', 'Foliar'),
      640,
      '32 lei/l',
      l(locale, 'Toate culturile', 'All crops'),
    ),
  ]
}

export const shopCards = (locale: Locale) => [
  ...extraCards(locale).slice(0, 2),
  ...products.map((p) => productCardProps(p, locale)),
  ...extraCards(locale).slice(2),
]

export const shopShowcaseProps = (
  locale: Locale,
): Omit<ShopShowcaseProps, 'products'> & { products: { label: string } } => {
  const t = homeUi[locale].shop
  return {
    kicker: t.kicker,
    title: t.title,
    categories: [
      {
        href: '/magazin/seminte',
        title: l(locale, 'Semințe', 'Seeds'),
        count: t.products(17),
        icon: 'leaf',
        images: [
          { src: '/products/samanta-grau-avenue-c1-800-kg-1.webp', alt: '' },
          { src: '/products/samanta-orz-cardinal-c1-600kg-1.png', alt: '' },
          { src: '/products/samanta-de-rapita-dk-excited-1-500-000-boabe-1.png', alt: '' },
        ],
        links: [
          { href: '/magazin/cultura/grau', label: l(locale, 'Grâu', 'Wheat') },
          { href: '/magazin/cultura/orz', label: l(locale, 'Orz', 'Barley') },
          { href: '/magazin/cultura/rapita', label: l(locale, 'Rapiță', 'Rapeseed') },
        ],
      },
      {
        href: '/magazin/protectia-plantelor',
        title: l(locale, 'Protecția plantelor', 'Crop protection'),
        count: t.products(36),
        icon: 'drop',
        images: [
          { src: '/products/wing-p-1.png', alt: '' },
          { src: '/products/karate-zeon-1-l-1.png', alt: '' },
          { src: '/products/custodia-320-sc-5l-1.png', alt: '' },
        ],
        links: [
          { href: '/magazin/erbicide', label: l(locale, 'Erbicide', 'Herbicides') },
          { href: '/magazin/insecticide', label: l(locale, 'Insecticide', 'Insecticides') },
          { href: '/magazin/fungicide', label: l(locale, 'Fungicide', 'Fungicides') },
        ],
      },
      {
        href: '/magazin/nutritie',
        title: l(locale, 'Nutriție', 'Nutrition'),
        count: t.products(18),
        icon: 'scale',
        images: [
          { src: '/products/uree-egipt-1.webp', alt: '' },
          { src: '/products/napekhem-20-20-0-plus-20l-1.png', alt: '' },
          { src: '/products/amino-20l-1.png', alt: '' },
        ],
        links: [
          { href: '/magazin/ingrasaminte', label: l(locale, 'Îngrășăminte', 'Fertilisers') },
          {
            href: '/magazin/fertilizanti-foliare',
            label: l(locale, 'Fertilizanți foliari', 'Foliar fertilisers'),
          },
        ],
      },
    ],
    crops: {
      label: t.crops,
      items: [
        ['grau', 'Grâu', 'Wheat'],
        ['porumb', 'Porumb', 'Maize'],
        ['floarea-soarelui', 'Floarea-soarelui', 'Sunflower'],
        ['rapita', 'Rapiță', 'Rapeseed'],
        ['orz', 'Orz', 'Barley'],
        ['soia', 'Soia', 'Soya'],
      ].map(([slug, ro, en]) => ({ href: `/magazin/cultura/${slug}`, label: l(locale, ro, en) })),
    },
    products: { label: t.picks },
    all: { href: '/magazin', label: t.all },
  }
}

export const financeToolsProps = (locale: Locale): FinanceToolsRowProps => {
  const t = homeUi[locale]
  return {
    finance: {
      kicker: t.finance.kicker,
      title: t.finance.title,
      instalments: t.finance.instalments,
      cta: { href: '/finantare', label: t.finance.cta },
    },
    tools: {
      title: t.tools.title,
      items: [
        { key: 'netPrice', href: '/preturi/calculator-pret-net', label: t.tools.netPrice },
        { key: 'simulator', href: '/finantare/simulator', label: t.tools.simulator },
        { key: 'fertilisers', href: '/preturi/ingrasaminte', label: t.tools.fertilisers },
        { key: 'diesel', href: '/motorina', label: t.tools.diesel },
      ],
      all: { href: '/unelte', label: t.tools.all },
    },
  }
}

/** Register values S2, S1, C4, L1 and C8 (all "to confirm"). */
export const companyProps = (locale: Locale): CompanySectionProps => {
  const t = homeUi[locale].company
  return {
    kicker: t.kicker,
    title: t.title,
    figures: [
      { key: 'S2', value: l(locale, '275.000 t', '275,000 t'), label: t.figures.S2 },
      { key: 'S1', value: '17', label: t.figures.S1 },
      { key: 'C4', value: '11', label: t.figures.C4 },
      { key: 'L1', value: '55', label: t.figures.L1 },
    ],
    tiles: [
      {
        href: '/cereale',
        icon: 'wheat',
        title: t.tiles.grain.title,
        line: t.tiles.grain.line.replace(
          '{{C8}}',
          l(locale, 'imediat după recepție', 'immediately after reception'),
        ),
      },
      {
        href: '/depozitare',
        icon: 'silo',
        title: t.tiles.storage.title,
        line: t.tiles.storage.line,
      },
      {
        href: '/logistica',
        icon: 'truck',
        title: t.tiles.logistics.title,
        line: t.tiles.logistics.line,
      },
      { href: '/despre', icon: 'handshake', title: t.tiles.about.title, line: t.tiles.about.line },
    ],
  }
}
