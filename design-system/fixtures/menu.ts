/** The five-item menu, the shop panel and the footer as sample content for stories and shots. */
import type { Locale } from '@/i18n/config'

import type { NavItem, ShopPanelData } from '../patterns/SiteHeader'
import type { SiteFooterProps } from '../patterns/SiteFooter'

const l = (locale: Locale, ro: string, en: string) => (locale === 'ro' ? ro : en)

export const menuNav = (locale: Locale): NavItem[] => {
  const ro = locale === 'ro'
  const crops = ro
    ? ['Grâu', 'Porumb', 'Floarea-soarelui', 'Rapiță', 'Orz']
    : ['Wheat', 'Corn', 'Sunflower', 'Rapeseed', 'Barley']
  const slug = ['grau', 'porumb', 'floarea-soarelui', 'rapita', 'orz']
  return [
    {
      href: '/magazin',
      label: l(locale, 'Magazin', 'Shop'),
      panel: 'shop',
      blurb: l(
        locale,
        'Semințe, protecția plantelor și nutriție, cu doze și prețuri pe ambalaj.',
        'Seeds, crop protection and plant nutrition, with doses and prices per pack.',
      ),
      promo: {
        title: l(locale, 'Inputuri cu rate după recoltă', 'Inputs, repaid after harvest'),
        text: l(
          locale,
          'Produsele din magazin se pot finanța prin Agrinvest Credit IFN. Aprobarea depinde de analiza cererii.',
          'Shop products can be financed through Agrinvest Credit IFN. Approval depends on the review of your application.',
        ),
        href: '/finantare',
        label: l(locale, 'Vezi finanțarea', 'See financing'),
      },
      children: [{ href: '/magazin/seminte', label: l(locale, 'Semințe', 'Seeds') }],
    },
    {
      href: '/preturi',
      label: l(locale, 'Prețuri și unelte', 'Prices and tools'),
      blurb: l(
        locale,
        'Prețul zilei la cereale, îngrășăminte și motorină, cu sursa fiecărui număr.',
        'Today’s grain, fertiliser and diesel prices, each with its source.',
      ),
      children: [
        ...crops.map((label, i) => ({
          href: `/preturi/${slug[i]}`,
          label,
          group: l(locale, 'Prețuri la cereale', 'Grain prices'),
        })),
        {
          href: '/preturi/ingrasaminte',
          label: l(locale, 'Îngrășăminte', 'Fertilisers'),
          description: l(locale, 'Pe ambalaj și pe kg', 'Per pack and per kg'),
          group: l(locale, 'Alte prețuri', 'Other prices'),
        },
        {
          href: '/motorina',
          label: l(locale, 'Motorină', 'Diesel'),
          description: l(locale, 'Preț și livrare la fermă', 'Price and farm delivery'),
          group: l(locale, 'Alte prețuri', 'Other prices'),
        },
        {
          href: '/preturi/calculator-pret-net',
          label: l(locale, 'Calculator preț net', 'Net price calculator'),
          description: l(
            locale,
            'Scăzământ la umiditate și impurități',
            'Moisture and impurity deductions',
          ),
          group: l(locale, 'Unelte', 'Tools'),
        },
        {
          href: '/finantare/simulator',
          label: l(locale, 'Simulator de rate', 'Repayment simulator'),
          description: l(locale, 'Ratele pe recoltele tale', 'Instalments on your harvests'),
          group: l(locale, 'Unelte', 'Tools'),
        },
        {
          href: '/unelte',
          label: l(locale, 'Toate uneltele', 'All tools'),
          group: l(locale, 'Unelte', 'Tools'),
        },
      ],
    },
    {
      href: '/finantare',
      label: l(locale, 'Finanțare', 'Financing'),
      blurb: l(
        locale,
        'Credite pentru producție și investiții prin Agrinvest Credit IFN, cu rate după recoltă.',
        'Production and investment loans from Agrinvest Credit IFN, repaid after harvest.',
      ),
      children: [
        {
          href: '/finantare/credit-productie',
          label: l(locale, 'Credit de producție', 'Production credit'),
          description: l(locale, 'Inputuri și lucrările sezonului', 'Inputs and the season’s work'),
          group: l(locale, 'Credite', 'Loans'),
        },
        {
          href: '/finantare/credit-investitii',
          label: l(locale, 'Credit de investiții', 'Investment credit'),
          description: l(
            locale,
            'Utilaje, irigații, depozitare, teren',
            'Machinery, irrigation, storage, land',
          ),
          group: l(locale, 'Credite', 'Loans'),
        },
        {
          href: '/finantare/simulator',
          label: l(locale, 'Simulator de rate', 'Repayment simulator'),
          description: l(locale, 'Ratele pe recoltele tale', 'Instalments on your harvests'),
          group: l(locale, 'Instrumente', 'Tools'),
        },
        {
          href: '/finantare/ghiduri',
          label: l(locale, 'Ghiduri de finanțare', 'Financing guides'),
          description: l(locale, 'Credit, subvenții, garanții', 'Credit, subsidies, guarantees'),
          group: l(locale, 'Instrumente', 'Tools'),
        },
      ],
    },
    {
      href: '/despre',
      label: l(locale, 'Compania', 'Company'),
      blurb: l(
        locale,
        'O companie agricolă cu capital românesc, care lucrează direct cu fermierii.',
        'A Romanian-owned agribusiness that works directly with farmers.',
      ),
      children: [
        {
          href: '/cereale',
          label: l(locale, 'Vinde cereale', 'Sell grain'),
          description: l(locale, 'Oferta pentru toate culturile', 'An offer for every crop'),
          group: l(locale, 'Vinde cereale', 'Sell grain'),
        },
        ...crops.map((label, i) => ({
          href: `/cereale/${slug[i]}`,
          label,
          group: l(locale, 'Vinde cereale', 'Sell grain'),
        })),
        {
          href: '/depozitare',
          label: l(locale, 'Depozitare și uscare', 'Storage and drying'),
          description: l(locale, 'Recepție, uscare, păstrare', 'Reception, drying, storage'),
          group: l(locale, 'Servicii', 'Services'),
        },
        {
          href: '/logistica',
          label: l(locale, 'Logistică', 'Logistics'),
          group: l(locale, 'Servicii', 'Services'),
        },
        {
          href: '/despre',
          label: l(locale, 'Despre Agrinvest', 'About Agrinvest'),
          group: l(locale, 'Companie', 'Company'),
        },
        {
          href: '/despre/cifre',
          label: l(locale, 'Agrinvest în cifre', 'Agrinvest in figures'),
          description: l(locale, 'Cu sursa fiecărei valori', 'With the source of every value'),
          group: l(locale, 'Companie', 'Company'),
        },
        {
          href: '/parteneri',
          label: l(locale, 'Parteneri', 'Partners'),
          group: l(locale, 'Companie', 'Company'),
        },
        {
          href: '/cariere',
          label: l(locale, 'Cariere', 'Careers'),
          group: l(locale, 'Companie', 'Company'),
        },
      ],
    },
    {
      href: '/ghiduri',
      label: l(locale, 'Știri și ghiduri', 'News and guides'),
      blurb: l(
        locale,
        'Răspunsuri verificate pentru fermieri: culturi, vânzare, depozitare și finanțare.',
        'Checked answers for farmers: crops, selling, storage and financing.',
      ),
      children: [
        {
          href: '/ghiduri',
          label: l(locale, 'Ghiduri pentru fermieri', 'Guides for farmers'),
          description: l(locale, 'Pe culturi și teme', 'By crop and topic'),
          group: l(locale, 'Ghiduri', 'Guides'),
        },
        {
          href: '/finantare/ghiduri',
          label: l(locale, 'Ghiduri de finanțare', 'Financing guides'),
          description: l(locale, 'Credit, APIA, garanții', 'Credit, APIA, guarantees'),
          group: l(locale, 'Ghiduri', 'Guides'),
        },
        {
          href: '/stiri',
          label: l(locale, 'Știri Agrinvest', 'Agrinvest news'),
          description: l(
            locale,
            'Noutăți de la baze și din piață',
            'From our bases and the market',
          ),
          group: l(locale, 'Știri', 'News'),
        },
        {
          href: '/stiri#flux',
          label: l(locale, 'Știri agricole', 'Farm news'),
          description: l(locale, 'Din presa agricolă', 'From the farm press'),
          group: l(locale, 'Știri', 'News'),
        },
        {
          href: '/piata',
          label: l(locale, 'Nota de piață', 'Market note'),
          description: l(locale, 'Săptămânal, cu sursele', 'Weekly, with sources'),
          group: l(locale, 'Știri', 'News'),
        },
      ],
    },
  ]
}

/** Counts as in the local database (2026-11-10). */
export const shopPanelData = (locale: Locale): ShopPanelData => {
  const ro = locale === 'ro'
  const line = (slug: string, label: string, count: number) => ({
    href: `/magazin/${slug}`,
    label,
    count,
  })
  return {
    all: { href: '/magazin', label: l(locale, 'Toate produsele', 'All products'), count: 75 },
    categories: [
      { ...line('seminte', ro ? 'Semințe' : 'Seeds', 17), children: [] },
      {
        ...line('protectia-plantelor', ro ? 'Protecția plantelor' : 'Crop protection', 36),
        children: [
          line('erbicide', ro ? 'Erbicide' : 'Herbicides', 14),
          line('fungicide', ro ? 'Fungicide' : 'Fungicides', 6),
          line('insecticide', ro ? 'Insecticide' : 'Insecticides', 9),
          line('tratament-samanta', ro ? 'Tratament sămânță' : 'Seed treatment', 3),
          line('adjuvanti', ro ? 'Adjuvanți' : 'Adjuvants', 3),
          line('regulatori-de-crestere', ro ? 'Regulatori de creștere' : 'Growth regulators', 1),
        ],
      },
      {
        ...line('nutritie', ro ? 'Nutriție' : 'Plant nutrition', 18),
        children: [
          line('ingrasaminte', ro ? 'Îngrășăminte' : 'Fertilisers', 9),
          line('fertilizanti-foliare', ro ? 'Fertilizanți foliari' : 'Foliar fertilisers', 9),
        ],
      },
    ],
    crops: (ro
      ? ['Grâu', 'Porumb', 'Floarea-soarelui', 'Rapiță', 'Orz', 'Soia', 'Cartof', 'Legume']
      : ['Wheat', 'Corn', 'Sunflower', 'Rapeseed', 'Barley', 'Soy', 'Potato', 'Vegetables']
    ).map((label, i) => ({ href: `/magazin/cultura/crop-${i}`, label, count: 40 - i * 3 })),
    brands: ['Bayer', 'Corteva', 'BASF', 'Syngenta', 'Adama', 'Yara'].map((label, i) => ({
      href: `/magazin/producator/${label.toLowerCase()}`,
      label,
      count: 14 - i * 2,
    })),
    search: { action: '/magazin/cautare', name: 'q' },
    labels: {
      crops: l(locale, 'Alege după cultură', 'Pick by crop'),
      brands: l(locale, 'Producători', 'Brands'),
      search: l(locale, 'Caută în magazin', 'Search the shop'),
      placeholder: l(
        locale,
        'Produs, substanță activă, cultură',
        'Product, active ingredient, crop',
      ),
    },
  }
}

export const footerColumns = (locale: Locale): SiteFooterProps['columns'] => {
  const ro = locale === 'ro'
  const col = (title: string, links: [string, string][]) => ({
    title,
    links: links.map(([label, href]) => ({ label, href })),
  })
  return [
    col(ro ? 'Magazin' : 'Shop', [
      [ro ? 'Toate produsele' : 'All products', '/magazin'],
      [ro ? 'Semințe' : 'Seeds', '/magazin/seminte'],
      [ro ? 'Erbicide' : 'Herbicides', '/magazin/erbicide'],
      [ro ? 'Fungicide' : 'Fungicides', '/magazin/fungicide'],
      [ro ? 'Insecticide' : 'Insecticides', '/magazin/insecticide'],
      [ro ? 'Îngrășăminte' : 'Fertilisers', '/magazin/ingrasaminte'],
    ]),
    col(ro ? 'Prețuri și unelte' : 'Prices and tools', [
      [ro ? 'Prețuri cereale' : 'Grain prices', '/preturi'],
      [ro ? 'Calculator preț net' : 'Net price calculator', '/preturi/calculator-pret-net'],
      [ro ? 'Prețuri îngrășăminte' : 'Fertiliser prices', '/preturi/ingrasaminte'],
      [ro ? 'Motorină' : 'Diesel', '/motorina'],
      [ro ? 'Toate uneltele' : 'All tools', '/unelte'],
    ]),
    col(ro ? 'Finanțare' : 'Financing', [
      [ro ? 'Finanțare' : 'Financing', '/finantare'],
      [ro ? 'Credit de producție' : 'Production credit', '/finantare/credit-productie'],
      [ro ? 'Credit de investiții' : 'Investment credit', '/finantare/credit-investitii'],
      [ro ? 'Simulator de rate' : 'Repayment simulator', '/finantare/simulator'],
      [ro ? 'Cerere de credit' : 'Loan application', '/finantare/aplica'],
    ]),
    col(ro ? 'Compania' : 'Company', [
      [ro ? 'Vinde cereale' : 'Sell grain', '/cereale'],
      [ro ? 'Depozitare' : 'Storage', '/depozitare'],
      [ro ? 'Uscare și precurățare' : 'Drying and cleaning', '/depozitare/uscare'],
      [ro ? 'Logistică' : 'Logistics', '/logistica'],
      [ro ? 'Despre Agrinvest' : 'About Agrinvest', '/despre'],
      [ro ? 'Agrinvest în cifre' : 'Agrinvest in figures', '/despre/cifre'],
      [ro ? 'Parteneri' : 'Partners', '/parteneri'],
      [ro ? 'Cariere' : 'Careers', '/cariere'],
    ]),
    col(ro ? 'Știri și ghiduri' : 'News and guides', [
      [ro ? 'Ghiduri pentru fermieri' : 'Guides for farmers', '/ghiduri'],
      [ro ? 'Ghiduri de finanțare' : 'Financing guides', '/finantare/ghiduri'],
      [ro ? 'Știri Agrinvest' : 'Agrinvest news', '/stiri'],
      [ro ? 'Știri agricole' : 'Farm news', '/stiri#flux'],
      [ro ? 'Nota de piață' : 'Market note', '/piata'],
      [ro ? 'Buletin săptămânal' : 'Weekly newsletter', '/stiri#buletin'],
    ]),
  ]
}
