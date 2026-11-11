/**
 * The site's menu and footer, in one place (Phase 7b). The seed writes them on an empty
 * database and `apply:redesign` on a live one, so both stay the same. The panels of the old
 * entry-point helpers (`scripts/{finance,tools,articles}/entry-points.ts`) look for these
 * addresses at any depth and then leave the menu alone.
 *
 * Five items: Shop · Prices and tools · Financing · Company · News and guides. The shop
 * panel shows live categories with counts; the children listed here are what the mobile
 * menu and a crawler without the panel see.
 */
import { financeMenu } from '../finance/entry-points'

export type Locale = 'ro' | 'en'
type Link = { label: string; href: string }

export type NavChild = Link & { description?: string; group?: string }
export type NavEntry = Link & {
  blurb: string
  panel?: 'links' | 'shop'
  /** A card on the right of the panel. Hints only; it never promises an approval. */
  promo?: { title: string; text: string; link: Link }
  children: NavChild[]
}
export type FooterColumnData = { title: string; links: Link[] }

const cropNames: Record<Locale, [string, string][]> = {
  ro: [
    ['grau', 'Grâu'],
    ['porumb', 'Porumb'],
    ['floarea-soarelui', 'Floarea-soarelui'],
    ['rapita', 'Rapiță'],
    ['orz', 'Orz'],
  ],
  en: [
    ['wheat', 'Wheat'],
    ['corn', 'Corn'],
    ['sunflower', 'Sunflower'],
    ['rapeseed', 'Rapeseed'],
    ['barley', 'Barley'],
  ],
}

/** Group headings that the finance panel's four links fall under, in order. */
const financeGroups: Record<Locale, [string, string]> = {
  ro: ['Credite', 'Instrumente'],
  en: ['Loans', 'Tools'],
}

function build(locale: Locale): NavEntry[] {
  const ro = locale === 'ro'
  const crops = cropNames[locale]
  const finance = financeMenu[locale]
  const [loans, instruments] = financeGroups[locale]
  const path = {
    shop: ro ? '/magazin' : '/en/shop',
    prices: ro ? '/preturi' : '/en/prices',
    guides: ro ? '/ghiduri' : '/en/guides',
    news: ro ? '/stiri' : '/en/news',
    market: ro ? '/piata' : '/en/market',
    grain: ro ? '/cereale' : '/en/grain',
    storage: ro ? '/depozitare' : '/en/storage',
    about: ro ? '/despre' : '/en/about',
  }

  return [
    {
      label: ro ? 'Magazin' : 'Shop',
      href: path.shop,
      panel: 'shop',
      blurb: ro
        ? 'Semințe, protecția plantelor și nutriție, cu doze și prețuri pe ambalaj.'
        : 'Seeds, crop protection and plant nutrition, with doses and prices per pack.',
      promo: ro
        ? {
            title: 'Inputuri cu rate după recoltă',
            text: 'Produsele din magazin se pot finanța prin Agrinvest Credit IFN. Aprobarea depinde de analiza cererii.',
            link: { label: 'Vezi finanțarea', href: financeMenu.ro.href },
          }
        : {
            title: 'Inputs, repaid after harvest',
            text: 'Shop products can be financed through Agrinvest Credit IFN. Approval depends on the review of your application.',
            link: { label: 'See financing', href: financeMenu.en.href },
          },
      children: ro
        ? [
            { label: 'Semințe', href: '/magazin/seminte', description: 'Grâu, orz, rapiță, năut' },
            {
              label: 'Protecția plantelor',
              href: '/magazin/protectia-plantelor',
              description: 'Erbicide, fungicide, insecticide',
            },
            {
              label: 'Nutriție',
              href: '/magazin/nutritie',
              description: 'Îngrășăminte și fertilizanți foliari',
            },
          ]
        : [
            {
              label: 'Seeds',
              href: '/en/shop/seeds',
              description: 'Wheat, barley, rapeseed, chickpea',
            },
            {
              label: 'Crop protection',
              href: '/en/shop/crop-protection',
              description: 'Herbicides, fungicides, insecticides',
            },
            {
              label: 'Plant nutrition',
              href: '/en/shop/plant-nutrition',
              description: 'Fertilisers and foliar products',
            },
          ],
    },
    {
      label: ro ? 'Prețuri și unelte' : 'Prices and tools',
      href: path.prices,
      panel: 'links',
      blurb: ro
        ? 'Prețul zilei la cereale, îngrășăminte și motorină, cu sursa fiecărui număr.'
        : 'Today’s grain, fertiliser and diesel prices, each with its source.',
      children: [
        ...crops.map(([slug, label]) => ({
          label,
          href: `${path.prices}/${slug}`,
          group: ro ? 'Prețuri la cereale' : 'Grain prices',
        })),
        {
          label: ro ? 'Îngrășăminte' : 'Fertilisers',
          href: ro ? '/preturi/ingrasaminte' : '/en/prices/fertilisers',
          description: ro ? 'Pe ambalaj și pe kg' : 'Per pack and per kg',
          group: ro ? 'Alte prețuri' : 'Other prices',
        },
        {
          label: ro ? 'Motorină' : 'Diesel',
          href: ro ? '/motorina' : '/en/diesel',
          description: ro ? 'Preț și livrare la fermă' : 'Price and farm delivery',
          group: ro ? 'Alte prețuri' : 'Other prices',
        },
        {
          label: ro ? 'Calculator preț net' : 'Net price calculator',
          href: ro ? '/preturi/calculator-pret-net' : '/en/prices/net-price-calculator',
          description: ro
            ? 'Scăzământ la umiditate și impurități'
            : 'Moisture and impurity deductions',
          group: ro ? 'Unelte' : 'Tools',
        },
        {
          label: ro ? 'Simulator de rate' : 'Repayment simulator',
          href: ro ? '/finantare/simulator' : '/en/financing/simulator',
          description: ro ? 'Ratele pe recoltele tale' : 'Instalments on your harvests',
          group: ro ? 'Unelte' : 'Tools',
        },
        {
          label: ro ? 'Toate uneltele' : 'All tools',
          href: ro ? '/unelte' : '/en/tools',
          group: ro ? 'Unelte' : 'Tools',
        },
      ],
    },
    {
      label: ro ? 'Finanțare' : 'Financing',
      href: finance.href,
      panel: 'links',
      blurb: finance.blurb,
      children: finance.children.map((c, i) => ({ ...c, group: i < 2 ? loans : instruments })),
    },
    {
      label: ro ? 'Compania' : 'Company',
      href: path.about,
      panel: 'links',
      blurb: ro
        ? 'O companie agricolă cu capital românesc, care lucrează direct cu fermierii.'
        : 'A Romanian-owned agribusiness that works directly with farmers.',
      children: [
        {
          label: ro ? 'Vinde cereale' : 'Sell grain',
          href: path.grain,
          description: ro ? 'Oferta pentru toate culturile' : 'An offer for every crop',
          group: ro ? 'Vinde cereale' : 'Sell grain',
        },
        ...crops.map(([slug, label]) => ({
          label,
          href: `${path.grain}/${slug}`,
          group: ro ? 'Vinde cereale' : 'Sell grain',
        })),
        {
          label: ro ? 'Depozitare și uscare' : 'Storage and drying',
          href: path.storage,
          description: ro ? 'Recepție, uscare, păstrare' : 'Reception, drying, storage',
          group: ro ? 'Servicii' : 'Services',
        },
        {
          label: ro ? 'Logistică' : 'Logistics',
          href: ro ? '/logistica' : '/en/logistics',
          group: ro ? 'Servicii' : 'Services',
        },
        {
          label: ro ? 'Despre Agrinvest' : 'About Agrinvest',
          href: path.about,
          group: ro ? 'Companie' : 'Company',
        },
        {
          label: ro ? 'Agrinvest în cifre' : 'Agrinvest in figures',
          href: ro ? '/despre/cifre' : '/en/about/figures',
          description: ro ? 'Cu sursa fiecărei valori' : 'With the source of every value',
          group: ro ? 'Companie' : 'Company',
        },
        {
          label: ro ? 'Parteneri' : 'Partners',
          href: ro ? '/parteneri' : '/en/partners',
          group: ro ? 'Companie' : 'Company',
        },
        {
          label: ro ? 'Cariere' : 'Careers',
          href: ro ? '/cariere' : '/en/careers',
          group: ro ? 'Companie' : 'Company',
        },
      ],
    },
    {
      label: ro ? 'Știri și ghiduri' : 'News and guides',
      href: path.guides,
      panel: 'links',
      blurb: ro
        ? 'Răspunsuri verificate pentru fermieri: culturi, vânzare, depozitare și finanțare.'
        : 'Checked answers for farmers: crops, selling, storage and financing.',
      children: [
        {
          label: ro ? 'Ghiduri pentru fermieri' : 'Guides for farmers',
          href: path.guides,
          description: ro ? 'Pe culturi și teme' : 'By crop and topic',
          group: ro ? 'Ghiduri' : 'Guides',
        },
        {
          label: ro ? 'Ghiduri de finanțare' : 'Financing guides',
          href: ro ? '/finantare/ghiduri' : '/en/financing/guides',
          description: ro ? 'Credit, APIA, garanții' : 'Credit, APIA, guarantees',
          group: ro ? 'Ghiduri' : 'Guides',
        },
        {
          label: ro ? 'Știri Agrinvest' : 'Agrinvest news',
          href: path.news,
          description: ro ? 'Noutăți de la baze și din piață' : 'From our bases and the market',
          group: ro ? 'Știri' : 'News',
        },
        {
          label: ro ? 'Știri agricole' : 'Farm news',
          href: `${path.news}#flux`,
          description: ro ? 'Din presa agricolă' : 'From the farm press',
          group: ro ? 'Știri' : 'News',
        },
        {
          label: ro ? 'Nota de piață' : 'Market note',
          href: path.market,
          description: ro ? 'Săptămânal, cu sursele' : 'Weekly, with sources',
          group: ro ? 'Știri' : 'News',
        },
      ],
    },
  ]
}

export const siteNavigation: Record<Locale, NavEntry[]> = { ro: build('ro'), en: build('en') }

export const siteCta: Record<Locale, Link> = {
  ro: { label: 'Contact', href: '/contact' },
  en: { label: 'Contact', href: '/en/contact' },
}

export const siteFooter: Record<Locale, { columns: FooterColumnData[]; legal: string }> = {
  ro: {
    columns: [
      {
        title: 'Magazin',
        links: [
          { label: 'Toate produsele', href: '/magazin' },
          { label: 'Semințe', href: '/magazin/seminte' },
          { label: 'Erbicide', href: '/magazin/erbicide' },
          { label: 'Fungicide', href: '/magazin/fungicide' },
          { label: 'Insecticide', href: '/magazin/insecticide' },
          { label: 'Îngrășăminte', href: '/magazin/ingrasaminte' },
        ],
      },
      {
        title: 'Prețuri și unelte',
        links: [
          { label: 'Prețuri cereale', href: '/preturi' },
          { label: 'Calculator preț net', href: '/preturi/calculator-pret-net' },
          { label: 'Prețuri îngrășăminte', href: '/preturi/ingrasaminte' },
          { label: 'Motorină', href: '/motorina' },
          { label: 'Toate uneltele', href: '/unelte' },
        ],
      },
      {
        title: 'Finanțare',
        links: [
          { label: 'Finanțare', href: '/finantare' },
          { label: 'Credit de producție', href: '/finantare/credit-productie' },
          { label: 'Credit de investiții', href: '/finantare/credit-investitii' },
          { label: 'Simulator de rate', href: '/finantare/simulator' },
          { label: 'Cerere de credit', href: '/finantare/aplica' },
        ],
      },
      {
        title: 'Compania',
        links: [
          { label: 'Vinde cereale', href: '/cereale' },
          { label: 'Depozitare', href: '/depozitare' },
          { label: 'Uscare și precurățare', href: '/depozitare/uscare' },
          { label: 'Logistică', href: '/logistica' },
          { label: 'Despre Agrinvest', href: '/despre' },
          { label: 'Agrinvest în cifre', href: '/despre/cifre' },
          { label: 'Parteneri', href: '/parteneri' },
          { label: 'Cariere', href: '/cariere' },
        ],
      },
      {
        title: 'Știri și ghiduri',
        links: [
          { label: 'Ghiduri pentru fermieri', href: '/ghiduri' },
          { label: 'Ghiduri de finanțare', href: '/finantare/ghiduri' },
          { label: 'Știri Agrinvest', href: '/stiri' },
          { label: 'Știri agricole', href: '/stiri#flux' },
          { label: 'Nota de piață', href: '/piata' },
          { label: 'Buletin săptămânal', href: '/stiri#buletin' },
        ],
      },
    ],
    legal: 'Agrinvest SRL și Agrinvest Credit IFN SA, companii cu capital românesc.',
  },
  en: {
    columns: [
      {
        title: 'Shop',
        links: [
          { label: 'All products', href: '/en/shop' },
          { label: 'Seeds', href: '/en/shop/seeds' },
          { label: 'Herbicides', href: '/en/shop/herbicides' },
          { label: 'Fungicides', href: '/en/shop/fungicides' },
          { label: 'Insecticides', href: '/en/shop/insecticides' },
          { label: 'Fertilisers', href: '/en/shop/fertilisers' },
        ],
      },
      {
        title: 'Prices and tools',
        links: [
          { label: 'Grain prices', href: '/en/prices' },
          { label: 'Net price calculator', href: '/en/prices/net-price-calculator' },
          { label: 'Fertiliser prices', href: '/en/prices/fertilisers' },
          { label: 'Diesel', href: '/en/diesel' },
          { label: 'All tools', href: '/en/tools' },
        ],
      },
      {
        title: 'Financing',
        links: [
          { label: 'Financing', href: '/en/financing' },
          { label: 'Production credit', href: '/en/financing/production-credit' },
          { label: 'Investment credit', href: '/en/financing/investment-credit' },
          { label: 'Repayment simulator', href: '/en/financing/simulator' },
          { label: 'Loan application', href: '/en/financing/apply' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'Sell grain', href: '/en/grain' },
          { label: 'Storage', href: '/en/storage' },
          { label: 'Drying and cleaning', href: '/en/storage/drying' },
          { label: 'Logistics', href: '/en/logistics' },
          { label: 'About Agrinvest', href: '/en/about' },
          { label: 'Agrinvest in figures', href: '/en/about/figures' },
          { label: 'Partners', href: '/en/partners' },
          { label: 'Careers', href: '/en/careers' },
        ],
      },
      {
        title: 'News and guides',
        links: [
          { label: 'Guides for farmers', href: '/en/guides' },
          { label: 'Financing guides', href: '/en/financing/guides' },
          { label: 'Agrinvest news', href: '/en/news' },
          { label: 'Farm news', href: '/en/news#flux' },
          { label: 'Market note', href: '/en/market' },
          { label: 'Weekly newsletter', href: '/en/news#buletin' },
        ],
      },
    ],
    legal: 'Agrinvest SRL and Agrinvest Credit IFN SA, Romanian-owned companies.',
  },
}

/** A menu in the shape of the `navigation` global. */
export function navigationItems(locale: Locale) {
  return siteNavigation[locale].map((e) => ({
    link: { label: e.label, href: e.href },
    blurb: e.blurb,
    panel: e.panel ?? 'links',
    promo: e.promo
      ? { title: e.promo.title, text: e.promo.text, link: e.promo.link }
      : { title: null, text: null, link: { label: null, href: null } },
    children: e.children.map((c) => ({
      link: { label: c.label, href: c.href },
      description: c.description ?? null,
      group: c.group ?? null,
    })),
  }))
}

/** The footer columns in the shape of the `footer` global. */
export function footerColumns(locale: Locale) {
  return siteFooter[locale].columns.map((col) => ({
    title: col.title,
    links: col.links.map((link) => ({ link })),
  }))
}
