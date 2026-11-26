import type { Locale } from '@/i18n/config'
import type { SectionIcon } from '@ds/icons/keys'

/**
 * The company section told as one season: what Agrinvest does for a farmer, step by step, from
 * inputs to the money for next year. Every company page shows this chain in its title band with
 * its own steps marked, so the pages read as one flow.
 */
export type StepId = 'inputs' | 'transport' | 'reception' | 'storage' | 'sale' | 'finance'

type Step = { id: StepId; icon: SectionIcon; label: string; body: string; href: string }

const steps: Record<Locale, Step[]> = {
  ro: [
    {
      id: 'inputs',
      icon: 'leaf',
      label: 'Inputuri',
      body: 'Semințe, îngrășăminte și protecția plantelor, cu sfatul agronomului.',
      href: '/magazin',
    },
    {
      id: 'transport',
      icon: 'truck',
      label: 'Transport',
      body: 'Flota proprie duce inputurile la fermă și recolta la bază.',
      href: '/logistica',
    },
    {
      id: 'reception',
      icon: 'scale',
      label: 'Recepție și uscare',
      body: 'Cântărire, analiza calității, precurățare și uscare.',
      href: '/depozitare/uscare',
    },
    {
      id: 'storage',
      icon: 'silo',
      label: 'Depozitare',
      body: 'Recolta stă în bazele noastre până alegi momentul vânzării.',
      href: '/depozitare',
    },
    {
      id: 'sale',
      icon: 'wheat',
      label: 'Vânzare',
      body: 'Vinzi direct din bază, la prețul zilei.',
      href: '/cereale',
    },
    {
      id: 'finance',
      icon: 'coins',
      label: 'Finanțare',
      body: 'Agrinvest Credit IFN finanțează sezonul următor și stocurile.',
      href: '/finantare',
    },
  ],
  en: [
    {
      id: 'inputs',
      icon: 'leaf',
      label: 'Inputs',
      body: 'Seed, fertiliser and crop protection, with an agronomist’s advice.',
      href: '/en/shop',
    },
    {
      id: 'transport',
      icon: 'truck',
      label: 'Transport',
      body: 'Our own fleet takes inputs to the farm and the harvest to the base.',
      href: '/en/logistics',
    },
    {
      id: 'reception',
      icon: 'scale',
      label: 'Reception and drying',
      body: 'Weighing, quality analysis, cleaning and drying.',
      href: '/en/storage/drying',
    },
    {
      id: 'storage',
      icon: 'silo',
      label: 'Storage',
      body: 'The harvest stays at our bases until you choose when to sell.',
      href: '/en/storage',
    },
    {
      id: 'sale',
      icon: 'wheat',
      label: 'Sale',
      body: 'Sell straight from the base at the day’s price.',
      href: '/en/grain',
    },
    {
      id: 'finance',
      icon: 'coins',
      label: 'Financing',
      body: 'Agrinvest Credit IFN finances the next season and grain stocks.',
      href: '/en/financing',
    },
  ],
}

type Action = { label: string; href: string }

/** What a company page adds to the chain: its marked steps, notes on steps, its actions. */
type PageChain = {
  kicker: string
  /** The chain card's title. */
  title: string
  /** Steps this page is about. None: the page is about the whole season. */
  current?: StepId[]
  /** A line under a step, for pages that read the chain their own way (partners, careers). */
  notes?: Partial<Record<StepId, string>>
  actions: [Action, ...Action[]]
}

const pages: Record<Locale, Record<string, PageChain>> = {
  ro: {
    '/despre': {
      kicker: 'Agrinvest',
      title: 'Un sezon cu Agrinvest',
      actions: [
        { label: 'Agrinvest în cifre', href: '/despre/cifre' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    '/despre/cifre': {
      kicker: 'Compania',
      title: 'Cifrele, pas cu pas',
      notes: {
        transport: 'Camioanele flotei proprii',
        storage: 'Baze și capacitate totală',
        finance: 'Agrinvest Credit IFN',
      },
      current: ['transport', 'storage', 'finance'],
      actions: [
        { label: 'Vezi bazele pe hartă', href: '/despre#baze' },
        { label: 'Despre Agrinvest', href: '/despre' },
      ],
    },
    '/depozitare': {
      kicker: 'Recepție și depozitare',
      title: 'Unde intră depozitarea',
      current: ['reception', 'storage'],
      actions: [
        { label: 'Rezervă loc de depozitare', href: '#cerere' },
        { label: 'Vezi bazele pe hartă', href: '#baze' },
      ],
    },
    '/depozitare/uscare': {
      kicker: 'Recepție și depozitare',
      title: 'Unde intră uscarea',
      current: ['reception'],
      actions: [
        { label: 'Întreabă de uscare', href: '#cerere' },
        { label: 'Vezi bazele pe hartă', href: '/despre#baze' },
      ],
    },
    '/logistica': {
      kicker: 'Flota proprie',
      title: 'Unde intră transportul',
      current: ['transport'],
      notes: {
        inputs: 'Livrăm inputurile la fermă',
        reception: 'Aducem recolta la bază',
      },
      actions: [
        { label: 'Cere transport', href: '#cerere' },
        { label: 'Vezi bazele pe hartă', href: '/despre#baze' },
      ],
    },
    '/cariere': {
      kicker: 'Echipa',
      title: 'Unde poți lucra',
      current: ['inputs', 'transport', 'storage', 'finance'],
      notes: {
        inputs: 'Vânzări și agronomie',
        transport: 'Logistică și șoferi',
        storage: 'Echipele din baze',
        finance: 'Agrinvest Credit IFN',
      },
      actions: [{ label: 'Trimite-ne datele tale', href: '#cerere' }],
    },
    '/contact': {
      kicker: 'Suntem aici',
      title: 'Despre ce vrei să vorbim?',
      actions: [{ label: 'Scrie-ne', href: '#cerere' }],
    },
  },
  en: {
    '/en/about': {
      kicker: 'Agrinvest',
      title: 'A season with Agrinvest',
      actions: [
        { label: 'Agrinvest in figures', href: '/en/about/figures' },
        { label: 'Contact', href: '/en/contact' },
      ],
    },
    '/en/about/figures': {
      kicker: 'The company',
      title: 'The figures, step by step',
      notes: {
        transport: 'Our own truck fleet',
        storage: 'Bases and total capacity',
        finance: 'Agrinvest Credit IFN',
      },
      current: ['transport', 'storage', 'finance'],
      actions: [
        { label: 'See the bases on the map', href: '/en/about#baze' },
        { label: 'About Agrinvest', href: '/en/about' },
      ],
    },
    '/en/storage': {
      kicker: 'Reception and storage',
      title: 'Where storage fits',
      current: ['reception', 'storage'],
      actions: [
        { label: 'Ask about storage', href: '#cerere' },
        { label: 'See the bases on the map', href: '#baze' },
      ],
    },
    '/en/storage/drying': {
      kicker: 'Reception and storage',
      title: 'Where drying fits',
      current: ['reception'],
      actions: [
        { label: 'Ask about drying', href: '#cerere' },
        { label: 'See the bases on the map', href: '/en/about#baze' },
      ],
    },
    '/en/logistics': {
      kicker: 'Our own fleet',
      title: 'Where transport fits',
      current: ['transport'],
      notes: {
        inputs: 'Inputs delivered to the farm',
        reception: 'The harvest brought to the base',
      },
      actions: [
        { label: 'Ask for transport', href: '#cerere' },
        { label: 'See the bases on the map', href: '/en/about#baze' },
      ],
    },
    '/en/careers': {
      kicker: 'The team',
      title: 'Where you could work',
      current: ['inputs', 'transport', 'storage', 'finance'],
      notes: {
        inputs: 'Sales and agronomy',
        transport: 'Logistics and drivers',
        storage: 'The base teams',
        finance: 'Agrinvest Credit IFN',
      },
      actions: [{ label: 'Send us your details', href: '#cerere' }],
    },
    '/en/contact': {
      kicker: 'We are here',
      title: 'What would you like to talk about?',
      actions: [{ label: 'Write to us', href: '#cerere' }],
    },
  },
}

const ui = {
  ro: { here: 'Pagina aceasta', again: 'Și sezonul următor începe din nou.' },
  en: { here: 'This page', again: 'And the next season starts again.' },
}

export const companyUi = ui

/** The chain for a company page (by its public address), or null for any other page. */
export function companyChain(locale: Locale, url: string) {
  const page = pages[locale][url.replace(/\/$/, '')]
  if (!page) return null
  const current = new Set(page.current ?? [])
  return {
    ...page,
    steps: steps[locale].map((s) => ({
      ...s,
      current: current.has(s.id),
      note: page.notes?.[s.id],
    })),
  }
}

/** The page that lists the whole package: /despre leads with it and shows a photo, not the chain. */
export const servicesPage: Record<Locale, string> = { ro: '/despre', en: '/en/about' }

/** The links under each service on the services page, beyond the service's own page. */
const more: Record<Locale, Record<StepId, Action[]>> = {
  ro: {
    inputs: [
      { label: 'Semințe', href: '/magazin/seminte' },
      { label: 'Îngrășăminte', href: '/magazin/ingrasaminte' },
      { label: 'Erbicide', href: '/magazin/erbicide' },
      { label: 'Motorină la fermă', href: '/motorina' },
    ],
    transport: [{ label: 'Cere transport', href: '/logistica#cerere' }],
    reception: [{ label: 'Întreabă de uscare', href: '/depozitare/uscare#cerere' }],
    storage: [
      { label: 'Bazele pe hartă', href: '/despre#baze' },
      { label: 'Rezervă loc', href: '/depozitare#cerere' },
    ],
    sale: [
      { label: 'Prețuri agricole', href: '/preturi' },
      { label: 'Calculator preț net', href: '/preturi/calculator-pret-net' },
    ],
    finance: [
      { label: 'Simulator', href: '/finantare/simulator' },
      { label: 'Ghiduri de finanțare', href: '/finantare/ghiduri' },
    ],
  },
  en: {
    inputs: [
      { label: 'Seeds', href: '/en/shop/seeds' },
      { label: 'Fertilisers', href: '/en/shop/fertilisers' },
      { label: 'Herbicides', href: '/en/shop/herbicides' },
      { label: 'Diesel to the farm', href: '/en/diesel' },
    ],
    transport: [{ label: 'Ask for transport', href: '/en/logistics#cerere' }],
    reception: [{ label: 'Ask about drying', href: '/en/storage/drying#cerere' }],
    storage: [
      { label: 'The bases on the map', href: '/en/about#baze' },
      { label: 'Ask about storage', href: '/en/storage#cerere' },
    ],
    sale: [
      { label: 'Farm prices', href: '/en/prices' },
      { label: 'Net price calculator', href: '/en/prices/net-price-calculator' },
    ],
    finance: [
      { label: 'Simulator', href: '/en/financing/simulator' },
      { label: 'Financing guides', href: '/en/financing/guides' },
    ],
  },
}

const servicesUi = {
  ro: {
    kicker: 'Pachetul complet',
    title: 'Tot ce facem pentru o fermă',
    intro:
      'Șase servicii, în ordinea unui sezon. Poți lucra cu noi pentru unul singur sau pentru tot sezonul.',
    about: 'Despre Agrinvest',
    cover: 'Recoltarea florii-soarelui cu camioanele Agrinvest, văzută de sus',
    map: {
      kicker: 'Baze',
      title: 'Unde ne găsești',
      lead: 'Atinge un județ ca să vezi bazele din el.',
      links: [
        { label: 'Depozitare cereale', href: '/depozitare' },
        { label: 'Uscare', href: '/depozitare/uscare' },
        { label: 'Rezervă loc de depozitare', href: '/depozitare#cerere' },
      ],
    },
  },
  en: {
    kicker: 'The whole package',
    title: 'Everything we do for a farm',
    intro:
      'Six services, in the order of a season. Work with us for one of them or for the whole season.',
    about: 'About Agrinvest',
    cover: 'Sunflower harvest with Agrinvest trucks, seen from above',
    map: {
      kicker: 'Bases',
      title: 'Where to find us',
      lead: 'Tap a county to see its bases.',
      links: [
        { label: 'Grain storage', href: '/en/storage' },
        { label: 'Drying', href: '/en/storage/drying' },
        { label: 'Ask about storage', href: '/en/storage#cerere' },
      ],
    },
  },
}

/** Stills from Agrinvest's own film (`public/media/company`), one per service. */
const photos: Record<StepId, Record<Locale, string>> = {
  inputs: {
    ro: 'Saci mari cu sigla Agrinvest, stivuiți în depozit',
    en: 'Agrinvest big bags stacked in a warehouse',
  },
  transport: { ro: 'Camioane din flota Agrinvest', en: 'Trucks from the Agrinvest fleet' },
  reception: {
    ro: 'Camion Agrinvest pe cântarul unei baze, lângă silozuri',
    en: 'An Agrinvest truck on a base weighbridge, by the silos',
  },
  storage: {
    ro: 'Silozurile unei baze Agrinvest, cu camioane în față',
    en: 'Silos at an Agrinvest base, with trucks in front',
  },
  sale: { ro: 'Boabe de cereale, de aproape', en: 'Cereal grains, close up' },
  finance: {
    ro: 'Sigla Agrinvest Credit pe peretele biroului',
    en: 'The Agrinvest Credit sign on an office wall',
  },
}

/** The photo at the top of the services page. */
export const companyCover = '/media/company/harvest.webp'

/** The services page: every step of the season with its photo and links, then the bases map. */
export function companyServices(locale: Locale) {
  return {
    ...servicesUi[locale],
    services: steps[locale].map((s) => ({
      ...s,
      more: more[locale][s.id],
      photo: {
        src: `/media/company/${s.id === 'finance' ? 'credit-sign' : s.id}.webp`,
        alt: photos[s.id][locale],
      },
    })),
  }
}

/**
 * The head office on the base map: Bd. Pipera, Voluntari (Ilfov), shown with București as one
 * region. The address comes from the figures register (`figure`); the point is only for the
 * map (about 1 km per map unit), so street-level precision does not matter.
 */
export const headOffice = {
  figure: 'C12',
  counties: ['B', 'IF'],
  lng: 26.12,
  lat: 44.49,
} as const
