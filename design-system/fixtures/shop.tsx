import type { Locale } from '@/i18n/config'
import type { QuickAddState } from '@/lib/commerce/state'
import type { QuickRequestState } from '@/lib/leads/state'

import { ChoosePack, PayAtHarvestLink, type ProductCardProps } from '../patterns/ProductCard'
import { QuickAdd } from '../patterns/QuickAdd'
import { QuickRequest } from '../patterns/QuickRequest'

/** Shop card v2 sample data for stories: every action state. Prices and stock are samples. */
const l = (locale: Locale, ro: string, en: string) => (locale === 'ro' ? ro : en)

const later =
  <T,>(result: T) =>
  async (): Promise<T> =>
    new Promise((r) => setTimeout(() => r(result), 400))

export const cardLabels = (locale: Locale) => ({
  inStock: l(locale, 'În stoc', 'In stock'),
  onRequest: l(locale, 'La cerere', 'On request'),
  outOfStock: l(locale, 'Indisponibil', 'Out of stock'),
  from: l(locale, 'de la', 'from'),
  askPrice: l(locale, 'Preț la cerere', 'Price on request'),
})

const addLabels = (locale: Locale) => ({
  add: l(locale, 'Adaugă în coș', 'Add to cart'),
  adding: l(locale, 'Se adaugă…', 'Adding…'),
  added: l(locale, 'Adăugat în coș', 'Added to cart'),
  viewCart: l(locale, 'Vezi coșul', 'View cart'),
  failed: l(locale, 'Nu se poate comanda online.', 'This cannot be ordered online.'),
})

const Marker = () => (
  <span className="text-caption text-warning" title="de confirmat">
    *
  </span>
)

function add(locale: Locale, state?: QuickAddState) {
  return (
    <QuickAdd
      locale={locale}
      sku="story"
      cartHref={l(locale, '/cos', '/en/cart')}
      action={later<QuickAddState>({ status: 'added', count: 3 })}
      labels={addLabels(locale)}
      initialState={state}
    />
  )
}

function request(locale: Locale, blocked = false, state?: QuickRequestState) {
  return (
    <QuickRequest
      locale={locale}
      layout="compact"
      sourcePath="/magazin"
      privacyHref={l(locale, '/confidentialitate', '/en/privacy')}
      action={later<QuickRequestState>({ status: 'success', contact: 'phone' })}
      label={
        blocked
          ? l(locale, 'Se vinde doar prin consultant.', 'Sold through a consultant only.')
          : l(locale, 'Te sunăm cu prețul și stocul.', 'We call you with the price and stock.')
      }
      submitLabel={l(locale, 'Cere preț', 'Ask for price')}
      initialState={state}
    />
  )
}

const choose = (locale: Locale) => (
  <ChoosePack
    href="/magazin/fertilizanti-foliare/amino"
    label={l(locale, 'Alege ambalajul', 'Choose a pack')}
  />
)

export type SampleCard = Omit<ProductCardProps, 'locale' | 'labels'>

export const sampleCards = (locale: Locale): SampleCard[] => [
  {
    href: '/magazin/erbicide/adengo-465-sc',
    brand: 'Bayer',
    name: 'Adengo 465 SC',
    image: '/products/erbicid-porumb-adengo-465-sc-1-litru-1.png',
    line: l(
      locale,
      'Izoxaflutol 225 g/l + tiencarbazon-metil 90 g/l',
      'Isoxaflutole 225 g/l + thiencarbazone-methyl 90 g/l',
    ),
    chips: ['SC', l(locale, 'Porumb', 'Maize')],
    pack: '1 l',
    price: 612,
    unitPrice: '612 lei/l',
    priceNote: <Marker />,
    stock: 'in-stock',
    action: add(locale),
    extra: (
      <PayAtHarvestLink
        href="/finantare/inputuri-plata-la-recolta"
        label={l(locale, 'Plătești la recoltă', 'Pay at harvest')}
      />
    ),
  },
  {
    href: '/magazin/fertilizanti-foliare/amino',
    brand: 'Naturalis',
    name: 'Amino',
    image: '/products/amino-1.png',
    line: l(locale, 'Aminoacizi liberi · N 5%', 'Free amino acids · N 5%'),
    chips: [l(locale, 'Lichid', 'Liquid'), l(locale, 'Toate culturile', 'All crops')],
    pack: '1 l · 20 l',
    price: 99,
    fromPrice: true,
    unitPrice: '99 lei/l',
    priceNote: <Marker />,
    stock: 'in-stock',
    action: choose(locale),
  },
  {
    href: '/magazin/insecticide/lamdex-extra',
    brand: 'Adama',
    name: 'Lamdex Extra',
    image: '/products/lamdex-extra-5-kg-1.png',
    line: l(locale, 'Lambda-cihalotrin 25 g/kg', 'Lambda-cyhalothrin 25 g/kg'),
    chips: ['WG', l(locale, 'Grâu, rapiță', 'Wheat, rapeseed')],
    pack: '1 kg · 5 kg',
    price: 178.5,
    fromPrice: true,
    unitPrice: '178,5 lei/kg',
    priceNote: <Marker />,
    stock: 'in-stock',
    action: choose(locale),
  },
  {
    href: '/magazin/seminte/avenue',
    brand: 'Limagrain',
    name: l(locale, 'Grâu Avenue C1', 'Avenue wheat C1'),
    image: '/products/samanta-grau-avenue-c1-800-kg-1.webp',
    line: l(locale, 'Grâu de toamnă, soi semitimpuriu', 'Winter wheat, mid-early'),
    chips: ['Avenue', l(locale, 'Grâu', 'Wheat')],
    pack: '800 kg',
    price: null,
    stock: 'on-request',
    action: request(locale),
  },
  {
    href: '/magazin/fertilizanti-foliare/amazonas-zn',
    brand: 'Naturalis',
    name: 'Amazonas [Zn]',
    image: '/products/amazonas-zn-1.png',
    line: 'Zn 7%',
    chips: [l(locale, 'Lichid', 'Liquid'), l(locale, 'Porumb', 'Maize')],
    pack: '1 l · 20 l',
    price: 89,
    fromPrice: true,
    unitPrice: '89 lei/l',
    priceNote: <Marker />,
    stock: 'in-stock',
    action: add(locale, { status: 'added', count: 2 }),
  },
  {
    href: '/magazin/ingrasaminte/napekhem-s65',
    brand: 'NaPeKhem',
    name: 'NaPeKhem S65',
    image: '/products/napekhem-s65-20l-1.png',
    line: 'S 65%',
    chips: [l(locale, 'Lichid', 'Liquid'), l(locale, 'Rapiță', 'Rapeseed')],
    pack: '20 l',
    price: null,
    stock: 'in-stock',
    action: request(locale),
  },
  {
    href: '/magazin/insecticide/produs-ghs06',
    brand: 'FMC',
    name: l(locale, 'Insecticid (GHS06)', 'Insecticide (GHS06)'),
    line: l(
      locale,
      'Toxicitate acută 1–3: nu se vinde online',
      'Acute toxicity 1–3: not sold online',
    ),
    chips: ['EC', l(locale, 'Floarea-soarelui', 'Sunflower')],
    pack: '5 l',
    price: 410,
    unitPrice: '82 lei/l',
    priceNote: <Marker />,
    stock: 'in-stock',
    action: request(locale, true),
  },
  {
    href: '/magazin/ingrasaminte/uree',
    brand: 'Agrinvest',
    name: l(locale, 'Uree 46%', 'Urea 46%'),
    image: '/products/uree-egipt-1.webp',
    line: 'N 46%',
    chips: [l(locale, 'Granule', 'Granules'), l(locale, 'Cereale', 'Cereals')],
    pack: '500 kg',
    price: 1450,
    unitPrice: '2,9 lei/kg',
    priceNote: <Marker />,
    stock: 'out-of-stock',
    action: request(locale),
  },
]
