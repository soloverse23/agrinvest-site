/**
 * Sample content for stories: real Agrinvest copy, figures and products, in RO and EN.
 * Prices of grain are illustrative. Product data comes from the agrinvestshop.ro export
 * (docs/audit/products-raw.json); figures are tied to docs/audit/figures-register.md rows.
 * Photos and product images are local-only (data/raw/, served by Storybook when present).
 */
import type { Locale } from '@/i18n/config'

export type Localized = Record<Locale, string>
export type CropKey = 'wheat' | 'maize' | 'sunflower' | 'rapeseed' | 'barley'

export const nav: { href: string; label: Localized }[] = [
  { href: '/cereale', label: { ro: 'Vinde cereale', en: 'Sell grain' } },
  { href: '/depozitare', label: { ro: 'Depozitare', en: 'Storage' } },
  { href: '/magazin', label: { ro: 'Magazin', en: 'Shop' } },
  { href: '/finantare', label: { ro: 'Finanțare', en: 'Financing' } },
  { href: '/preturi', label: { ro: 'Prețuri', en: 'Prices' } },
  { href: '/meteo', label: { ro: 'Meteo', en: 'Weather' } },
]

/** Figures register rows S1, S2, L1 (status: to confirm). */
export const figures = [
  { key: 'bases', value: 17, ref: 'S1', label: { ro: 'baze de depozitare', en: 'storage bases' } },
  {
    key: 'capacity',
    value: 238_000,
    unit: 't',
    ref: 'S2',
    label: { ro: 'capacitate de depozitare', en: 'storage capacity' },
  },
  { key: 'trucks', value: 55, ref: 'L1', label: { ro: 'camioane proprii', en: 'own trucks' } },
] as const

/** Real bases (figures register S3). */
export const bases = ['Pogoanele', 'Crețești', 'Sărățuica'] as const

export const crops: {
  key: CropKey
  name: Localized
  prices: [number, number, number]
  change: number
  trend: number[]
}[] = [
  {
    key: 'wheat',
    name: { ro: 'Grâu', en: 'Wheat' },
    prices: [1_020, 1_005, 1_010],
    change: 15,
    trend: [985, 990, 1_000, 995, 1_005, 1_008, 1_020],
  },
  {
    key: 'maize',
    name: { ro: 'Porumb', en: 'Maize' },
    prices: [930, 915, 925],
    change: -10,
    trend: [950, 946, 944, 942, 941, 940, 930],
  },
  {
    key: 'sunflower',
    name: { ro: 'Floarea-soarelui', en: 'Sunflower' },
    prices: [2_150, 2_120, 2_140],
    change: 30,
    trend: [2_080, 2_095, 2_090, 2_110, 2_115, 2_120, 2_150],
  },
  {
    key: 'rapeseed',
    name: { ro: 'Rapiță', en: 'Rapeseed' },
    prices: [2_300, 2_280, 2_290],
    change: 0,
    trend: [2_290, 2_300, 2_295, 2_300, 2_298, 2_300, 2_300],
  },
  {
    key: 'barley',
    name: { ro: 'Orz', en: 'Barley' },
    prices: [890, 875, 880],
    change: -5,
    trend: [900, 898, 896, 897, 895, 895, 890],
  },
]

export const priceDate = new Date('2026-11-02T12:00:00Z')

export type SampleProduct = {
  slug: string
  name: string
  pack: string
  image: string
  category: Localized
  active: Localized
  crops: Localized
  dose: Localized
  price: number
  regularPrice?: number
  /** Litres or kilograms in the pack, for the unit price. */
  amount: number
  amountUnit: 'l' | 'kg'
  inStock: boolean
}

const herbicide = { ro: 'Erbicid', en: 'Herbicide' }

export const products: SampleProduct[] = [
  {
    slug: 'wing-p',
    name: 'Wing® P',
    pack: '10 L',
    image: '/products/wing-p-1.png',
    category: herbicide,
    active: {
      ro: 'pendimetalin 250 g/l + dimetenamid-P 212,5 g/l',
      en: 'pendimethalin 250 g/l + dimethenamid-P 212.5 g/l',
    },
    crops: { ro: 'Floarea-soarelui, porumb, soia', en: 'Sunflower, maize, soya' },
    dose: { ro: '3,5–4 l/ha', en: '3.5–4 l/ha' },
    price: 720,
    regularPrice: 1_450,
    amount: 10,
    amountUnit: 'l',
    inStock: true,
  },
  {
    slug: 'crew-ace',
    name: 'Crew Ace',
    pack: '5 L',
    image: '/products/crew-ace-5l-1.png',
    category: herbicide,
    active: { ro: 'nicosulfuron 40 g/l', en: 'nicosulfuron 40 g/l' },
    crops: { ro: 'Porumb', en: 'Maize' },
    dose: { ro: '0,8–1,5 l/ha', en: '0.8–1.5 l/ha' },
    price: 612,
    amount: 5,
    amountUnit: 'l',
    inStock: true,
  },
  {
    slug: 'fusilade-forte',
    name: 'Fusilade Forte',
    pack: '5 L',
    image: '/products/fusilade-forte-5l-1.png',
    category: herbicide,
    active: { ro: 'fluazifop-P-butil 150 g/l', en: 'fluazifop-P-butyl 150 g/l' },
    crops: { ro: 'Floarea-soarelui, rapiță', en: 'Sunflower, rapeseed' },
    dose: { ro: '1–1,5 l/ha', en: '1–1.5 l/ha' },
    price: 918,
    amount: 5,
    amountUnit: 'l',
    inStock: false,
  },
]

/** Frames from the 2022 Agrinvest film (scripts/brand/frames.ts). Internal review only. */
export const photos = {
  harvest: {
    src: '/frames/harvest-wheat.webp',
    alt: {
      ro: 'Combine și un camion Agrinvest la recoltare',
      en: 'Combines and an Agrinvest truck at harvest',
    },
  },
  sunflower: {
    src: '/frames/harvest-sunflower.webp',
    alt: { ro: 'Recoltare de floarea-soarelui, din aer', en: 'Sunflower harvest from the air' },
  },
  silos: {
    src: '/frames/base-silos.webp',
    alt: { ro: 'Bază de depozitare cu silozuri', en: 'A storage base with silos' },
  },
  combine: {
    src: '/frames/combine.webp',
    alt: { ro: 'Combină în lanul de grâu', en: 'A combine in a wheat field' },
  },
  fleet: {
    src: '/frames/fleet.webp',
    alt: { ro: 'Flota de camioane Agrinvest', en: 'The Agrinvest truck fleet' },
  },
} as const

export const copy = {
  hero: {
    eyebrow: { ro: 'Din 2003, alături de fermieri', en: 'Working with farmers since 2003' },
    title: {
      ro: 'Cumpărăm, depozităm și finanțăm recolta ta.',
      en: 'We buy, store and finance your harvest.',
    },
    accent: { ro: 'recolta ta', en: 'your harvest' },
    lead: {
      ro: 'Preț de achiziție la fiecare bază, plata imediat după recepție, inputuri pentru sezon și credit pe care îl plătești la recoltă.',
      en: 'A buying price at every base, payment right after reception, inputs for the season and credit you repay at harvest.',
    },
    primary: { ro: 'Vezi prețul de azi', en: 'See today’s price' },
    secondary: { ro: 'Vorbește cu un consilier', en: 'Talk to an advisor' },
  },
  prices: {
    title: { ro: 'Prețuri de achiziție', en: 'Buying prices' },
    today: { ro: 'Prețurile de azi', en: 'Today’s prices' },
    unit: { ro: 'lei/t, franco bază', en: 'lei/t, delivered to base' },
    crop: { ro: 'Cultură', en: 'Crop' },
    change: { ro: 'Față de săpt. trecută', en: 'Vs last week' },
    updated: { ro: 'Actualizat', en: 'Updated' },
    sample: {
      ro: 'Exemplu: prețuri ilustrative, nu oferte reale.',
      en: 'Sample: illustrative prices, not real offers.',
    },
    all: { ro: 'Toate prețurile', en: 'All prices' },
    trend: { ro: 'Evoluție pe 7 săptămâni', en: '7-week trend' },
  },
  product: {
    activeLabel: { ro: 'Substanțe active', en: 'Active ingredients' },
    cropsLabel: { ro: 'Culturi', en: 'Crops' },
    doseLabel: { ro: 'Doză', en: 'Dose' },
    inStock: { ro: 'În stoc', en: 'In stock' },
    outOfStock: { ro: 'La comandă', en: 'On order' },
    details: { ro: 'Vezi produsul', en: 'View product' },
    from: { ro: 'de la', en: 'from' },
    askPrice: { ro: 'Preț la cerere', en: 'Price on request' },
    payAtHarvest: { ro: 'Plătești la recoltă', en: 'Pay at harvest' },
  },
  finance: {
    kicker: { ro: 'Agrinvest Credit IFN', en: 'Agrinvest Credit IFN' },
    title: { ro: 'Inputuri acum, plata la recoltă.', en: 'Inputs now, payment at harvest.' },
    body: {
      ro: 'Finanțăm semințele, îngrășămintele și tratamentele pentru sezon. Rambursezi în cel mult două rate pe an, după recoltă.',
      en: 'We finance seeds, fertilisers and crop protection for the season. You repay in at most two instalments a year, after harvest.',
    },
    cta: { ro: 'Simulează finanțarea', en: 'Simulate financing' },
    secondary: { ro: 'Cum funcționează', en: 'How it works' },
  },
  header: {
    cta: { ro: 'Vinde cereale', en: 'Sell grain' },
    menu: { ro: 'Meniu', en: 'Menu' },
    main: { ro: 'Navigare principală', en: 'Main navigation' },
    language: { ro: 'Limba', en: 'Language' },
  },
} as const
