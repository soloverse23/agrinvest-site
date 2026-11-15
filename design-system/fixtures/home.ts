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
import type { StoryCardData } from '../patterns/NewsStories'
import { newsUi } from '@/i18n/news'
import { priceDate } from './sample'

const at = (hoursBefore: number) => new Date(priceDate.getTime() - hoursBefore * 3_600_000)
const l = (locale: Locale, ro: string, en: string) => (locale === 'ro' ? ro : en)

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

/** Made-up ranked stories for the panel's design; the links go nowhere. */
const sampleStories = (locale: Locale): StoryCardData[] =>
  [
    [
      'APIA începe plata în avans pentru fermieri de luni',
      'Agrointel',
      3,
      'Fermierii care au depus cererile unice primesc avansul din subvenții începând de luni.',
    ],
    ['Ukraine hopes for grain exports breakthrough', 'Reuters', 6, ''],
    ['Seceta lovește culturile de rapiță din Dobrogea', 'Revista Ferma', 9, ''],
    ['Comisia Europeană propune noi cote pentru importurile din Ucraina', 'Mediafax', 12, ''],
    ['Focar de pestă porcină africană confirmat în Tulcea', 'MADR', 20, ''],
  ].map(([title, source, h, excerpt], i) => ({
    key: String(i + 1),
    rank: i + 1,
    title: title as string,
    href: '#',
    topic: { label: '' },
    lang: (source === 'Reuters' ? 'en' : 'ro') as 'ro' | 'en',
    date: at(h as number),
    excerpt: excerpt ? { text: excerpt as string, source: source as string } : null,
    sources:
      i === 0
        ? [
            { name: 'Agrointel', title: title as string, url: '#a' },
            {
              name: 'MADR',
              title: l(locale, 'Plata în avans începe luni', 'Advance payment starts Monday'),
              url: '#b',
            },
          ]
        : [{ name: source as string, title: title as string, url: `#${i}` }],
  }))

export const livePanelProps = (
  locale: Locale,
  { empty = false }: { empty?: boolean } = {},
): LivePanelProps => {
  const t = homeUi[locale].live
  return {
    locale,
    title: t.title,
    updated: empty ? null : at(1),
    storySources: 9,
    stories: empty ? [] : sampleStories(locale),
    feed: empty ? [] : feed(locale).filter((i) => i.kind !== 'price'),
    links: { news: { href: '/stiri', label: t.allNews } },
    labels: {
      updated: newsUi[locale].updated,
      own: t.own,
      empty: t.feedEmpty,
      kinds: t.kinds,
      story: { more: newsUi[locale].more, via: newsUi[locale].via },
    },
  }
}

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
        icon: 'seed',
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
        icon: 'protection',
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
        icon: 'fertiliser',
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
