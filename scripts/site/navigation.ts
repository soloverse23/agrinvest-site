/**
 * The site's menu and footer, in one place (Phase 7b). The seed writes them on an empty
 * database and `apply:redesign` on a live one, so both stay the same. The panels of the old
 * entry-point helpers (`scripts/{finance,tools,articles}/entry-points.ts`) look for these
 * addresses at any depth and then leave the menu alone.
 *
 * Five items: Products and services · Shop · Prices and tools · Financing · News and guides.
 * The shop panel shows live categories with counts; the children listed here are what the
 * mobile menu and a crawler without the panel see.
 */
import { financeGroups, financeMenu } from '../finance/entry-points'

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

/** Phase 7f market pages in the Prices panel, group "Piețe" / "Markets". */
export function marketLinks(locale: Locale): NavChild[] {
  const ro = locale === 'ro'
  const group = ro ? 'Piețe' : 'Markets'
  return [
    {
      label: ro ? 'Carburanți' : 'Fuel prices',
      href: ro ? '/preturi/carburanti' : '/en/prices/fuel-prices',
      description: ro ? 'Motorină și benzină, România și UE' : 'Diesel and petrol, Romania and EU',
      group,
    },
    {
      label: ro ? 'Petrol Brent' : 'Brent crude',
      href: ro ? '/preturi/petrol-brent' : '/en/prices/brent-crude-oil',
      description: ro ? 'Dolari pe baril, zilnic' : 'Dollars per barrel, daily',
      group,
    },
    {
      label: ro ? 'Îngrășăminte' : 'Fertilisers',
      href: ro ? '/preturi/ingrasaminte' : '/en/prices/fertilisers',
      description: ro ? 'Uree, DAP, potasiu' : 'Urea, DAP, potash',
      group,
    },
    {
      label: ro ? 'Gaze naturale' : 'Natural gas',
      href: ro ? '/preturi/gaze-naturale' : '/en/prices/natural-gas',
      description: ro ? 'Europa, TTF' : 'Europe, TTF',
      group,
    },
    {
      label: ro ? 'Curs euro-leu' : 'Euro to leu rate',
      href: ro ? '/preturi/curs-euro-leu' : '/en/prices/euro-leu-exchange-rate',
      description: ro ? 'Cursul BCE și istoricul' : 'The ECB rate and its history',
      group,
    },
  ]
}

const cropNames: Record<Locale, [string, string][]> = {
  ro: [
    ['orz', 'Orz'],
    ['grau', 'Grâu'],
    ['rapita', 'Rapiță'],
    ['floarea-soarelui', 'Floarea-soarelui'],
    ['porumb', 'Porumb'],
  ],
  en: [
    ['barley', 'Barley'],
    ['wheat', 'Wheat'],
    ['rapeseed', 'Rapeseed'],
    ['sunflower', 'Sunflower'],
    ['corn', 'Corn'],
  ],
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
  const services = ro ? 'Servicii' : 'Services'
  const company = ro ? 'Compania' : 'Company'

  return [
    {
      // The whole package, in the order of a season (the chain in `src/lib/company.ts`), then
      // the company pages.
      label: ro ? 'Produse și servicii' : 'Products and services',
      href: path.about,
      panel: 'links',
      blurb: ro
        ? 'Tot ce face Agrinvest pentru o fermă, de la inputuri la finanțarea sezonului următor.'
        : 'Everything Agrinvest does for a farm, from inputs to financing the next season.',
      children: [
        {
          label: ro ? 'Inputuri' : 'Inputs',
          href: path.shop,
          description: ro
            ? 'Semințe, îngrășăminte, protecția plantelor'
            : 'Seed, fertiliser, crop protection',
          group: services,
        },
        {
          label: ro ? 'Transport' : 'Transport',
          href: ro ? '/logistica' : '/en/logistics',
          description: ro ? 'Flota proprie, de la fermă la bază' : 'Our own fleet, farm to base',
          group: services,
        },
        {
          // Structure simplification (2026-11-26): reception and drying live on the storage
          // page; `/depozitare/uscare` stays reachable from there.
          label: ro ? 'Depozitare și uscare' : 'Storage and drying',
          href: path.storage,
          description: ro
            ? 'Recepție, uscare și păstrare la bază'
            : 'Reception, drying and storage at the base',
          group: services,
        },
        {
          label: ro ? 'Vânzare cereale' : 'Grain buying',
          href: path.grain,
          description: ro ? 'Cumpărăm recolta la prețul zilei' : 'We buy at the day’s price',
          group: services,
        },
        {
          // A delivery service, so it sits with the services, not under Prices.
          label: ro ? 'Motorină la fermă' : 'Diesel to the farm',
          href: ro ? '/motorina' : '/en/diesel',
          description: ro ? 'Livrare și ofertă' : 'Delivery and a quote',
          group: services,
        },
        {
          label: ro ? 'Finanțare' : 'Financing',
          href: ro ? '/finantare' : '/en/financing',
          description: ro ? 'Prin Agrinvest Credit IFN' : 'Through Agrinvest Credit IFN',
          group: services,
        },
        {
          label: ro ? 'Despre Agrinvest' : 'About Agrinvest',
          href: `${path.about}#compania`,
          group: company,
        },
        {
          label: ro ? 'Agrinvest în cifre' : 'Agrinvest in figures',
          href: ro ? '/despre/cifre' : '/en/about/figures',
          description: ro ? 'Cu sursa fiecărei valori' : 'With the source of every value',
          group: company,
        },
        {
          label: ro ? 'Cariere' : 'Careers',
          href: ro ? '/cariere' : '/en/careers',
          group: company,
        },
      ],
    },
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
            { label: 'Semințe', href: '/magazin/seminte', description: 'Orz, grâu, rapiță, năut' },
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
              description: 'Barley, wheat, rapeseed, chickpea',
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
      label: ro ? 'Prețuri' : 'Prices',
      href: path.prices,
      panel: 'links',
      blurb: ro
        ? 'Cereale, motorină, Brent, îngrășăminte și curs euro, cu sursa fiecărui număr.'
        : 'Grain, diesel, Brent, fertiliser and the euro rate, each with its source.',
      // Structure simplification (2026-11-26): one link per kind of price. The crop pages
      // and Brent / gas stay live, linked from `/preturi` and each market's "other markets".
      children: [
        {
          label: ro ? 'Prețuri la cereale' : 'Grain prices',
          href: path.prices,
          description: crops.map(([, label]) => label).join(', '),
          group: ro ? 'Prețuri' : 'Prices',
        },
        ...marketLinks(locale).filter(
          (m) => !/petrol-brent|brent-crude|gaze-naturale|natural-gas/.test(m.href),
        ),
        {
          label: ro ? 'Calculator preț net' : 'Net price calculator',
          href: ro ? '/preturi/calculator-pret-net' : '/en/prices/net-price-calculator',
          description: ro
            ? 'Scăzământ la umiditate și impurități'
            : 'Moisture and impurity deductions',
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
      // Structure simplification (2026-11-26): the credits by need (the hub's three groups),
      // then the two tools and the request. Each credit page stays linked from its group.
      children: [
        {
          label: ro ? 'Bani pentru sezon' : 'Money for the season',
          href: `${finance.href}#grupa-season`,
          description: ro
            ? 'Inputuri, APIA, contracte de cereale'
            : 'Inputs, APIA, grain contracts',
          group: loans,
        },
        {
          label: ro ? 'Investiții în fermă' : 'Investing in the farm',
          href: `${finance.href}#grupa-invest`,
          description: ro
            ? 'Utilaje, irigații, depozite, teren'
            : 'Machinery, irrigation, stores, land',
          group: loans,
        },
        {
          label: ro ? 'Situații speciale' : 'Special cases',
          href: `${finance.href}#grupa-special`,
          description: ro
            ? 'Stocuri, procesare, restructurare'
            : 'Stocks, processing, restructuring',
          group: loans,
        },
        {
          label: ro ? 'Simulator de rate' : 'Repayment simulator',
          href: ro ? '/finantare/simulator' : '/en/financing/simulator',
          description: ro ? 'Ratele pe recoltele tale' : 'Instalments on your harvests',
          group: instruments,
        },
        {
          label: ro ? 'Întrebări despre credit' : 'Loan questions',
          href: ro ? '/finantare/intrebari' : '/en/financing/questions',
          group: instruments,
        },
        {
          label: ro ? 'Cere finanțare' : 'Apply for financing',
          href: ro ? '/finantare/aplica' : '/en/financing/apply',
          group: instruments,
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
      // Structure simplification (2026-11-26): one guides entry (the hub lists the financing
      // guides too) and one news entry (Agrinvest news and the farm press share `/stiri`).
      children: [
        {
          label: ro ? 'Ghiduri' : 'Guides',
          href: path.guides,
          description: ro
            ? 'Culturi, vânzare, depozitare, finanțare'
            : 'Crops, selling, storage, financing',
          group: ro ? 'Ghiduri' : 'Guides',
        },
        {
          label: ro ? 'Știri' : 'News',
          href: path.news,
          description: ro
            ? 'De la baze și din presa agricolă'
            : 'From our bases and the farm press',
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

/**
 * Structure simplification (2026-11-26): the footer follows the menu, one column per menu item,
 * the main pages only. Subcategories, single markets and the finance pages are on their hubs.
 */
export const siteFooter: Record<Locale, { columns: FooterColumnData[]; legal: string }> = {
  ro: {
    columns: [
      {
        title: 'Produse și servicii',
        links: [
          { label: 'Produse și servicii', href: '/despre' },
          { label: 'Logistică', href: '/logistica' },
          { label: 'Depozitare și uscare', href: '/depozitare' },
          { label: 'Vânzare cereale', href: '/cereale' },
          { label: 'Motorină la fermă', href: '/motorina' },
          { label: 'Agrinvest în cifre', href: '/despre/cifre' },
          { label: 'Cariere', href: '/cariere' },
        ],
      },
      {
        title: 'Magazin',
        links: [
          { label: 'Toate produsele', href: '/magazin' },
          { label: 'Semințe', href: '/magazin/seminte' },
          { label: 'Protecția plantelor', href: '/magazin/protectia-plantelor' },
          { label: 'Nutriție', href: '/magazin/nutritie' },
        ],
      },
      {
        title: 'Prețuri',
        links: [
          { label: 'Prețuri la cereale', href: '/preturi' },
          { label: 'Carburanți', href: '/preturi/carburanti' },
          { label: 'Îngrășăminte', href: '/preturi/ingrasaminte' },
          { label: 'Curs euro-leu', href: '/preturi/curs-euro-leu' },
          { label: 'Toate uneltele', href: '/unelte' },
        ],
      },
      {
        title: 'Finanțare',
        links: [
          { label: 'Finanțare', href: '/finantare' },
          { label: 'Simulator de rate', href: '/finantare/simulator' },
          { label: 'Întrebări despre credit', href: '/finantare/intrebari' },
          { label: 'Despre IFN', href: '/finantare/despre-ifn' },
          { label: 'Cere finanțare', href: '/finantare/aplica' },
        ],
      },
      {
        title: 'Știri și ghiduri',
        links: [
          { label: 'Ghiduri', href: '/ghiduri' },
          { label: 'Știri', href: '/stiri' },
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
        title: 'Products and services',
        links: [
          { label: 'Products and services', href: '/en/about' },
          { label: 'Logistics', href: '/en/logistics' },
          { label: 'Storage and drying', href: '/en/storage' },
          { label: 'Grain buying', href: '/en/grain' },
          { label: 'Diesel to the farm', href: '/en/diesel' },
          { label: 'Agrinvest in figures', href: '/en/about/figures' },
          { label: 'Careers', href: '/en/careers' },
        ],
      },
      {
        title: 'Shop',
        links: [
          { label: 'All products', href: '/en/shop' },
          { label: 'Seeds', href: '/en/shop/seeds' },
          { label: 'Crop protection', href: '/en/shop/crop-protection' },
          { label: 'Plant nutrition', href: '/en/shop/plant-nutrition' },
        ],
      },
      {
        title: 'Prices',
        links: [
          { label: 'Grain prices', href: '/en/prices' },
          { label: 'Fuel prices', href: '/en/prices/fuel-prices' },
          { label: 'Fertilisers', href: '/en/prices/fertilisers' },
          { label: 'Euro to leu rate', href: '/en/prices/euro-leu-exchange-rate' },
          { label: 'All tools', href: '/en/tools' },
        ],
      },
      {
        title: 'Financing',
        links: [
          { label: 'Financing', href: '/en/financing' },
          { label: 'Repayment simulator', href: '/en/financing/simulator' },
          { label: 'Loan questions', href: '/en/financing/questions' },
          { label: 'About the IFN', href: '/en/financing/about-ifn' },
          { label: 'Apply for financing', href: '/en/financing/apply' },
        ],
      },
      {
        title: 'News and guides',
        links: [
          { label: 'Guides', href: '/en/guides' },
          { label: 'News', href: '/en/news' },
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
