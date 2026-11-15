import type { Locale } from '@/i18n/config'
import type { SectionIcon } from '@ds/icons/keys'

/**
 * The company section told as one season: what Agrinvest does for a farmer, step by step, from
 * inputs to the money for next year. Every company page shows this chain in its title band with
 * its own steps marked, and ends with the next step, so the pages read as one flow.
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
  /** The step the page hands over to, shown at its end. */
  next?: StepId
}

const pages: Record<Locale, Record<string, PageChain>> = {
  ro: {
    '/despre': {
      next: 'inputs',
      kicker: 'Compania',
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
        { label: 'Vezi bazele pe hartă', href: '/depozitare#baze' },
        { label: 'Despre Agrinvest', href: '/despre' },
      ],
    },
    '/depozitare': {
      next: 'sale',
      kicker: 'Recepție și depozitare',
      title: 'Unde intră depozitarea',
      current: ['reception', 'storage'],
      actions: [
        { label: 'Rezervă loc de depozitare', href: '#cerere' },
        { label: 'Vezi bazele pe hartă', href: '#baze' },
      ],
    },
    '/depozitare/uscare': {
      next: 'storage',
      kicker: 'Recepție și depozitare',
      title: 'Unde intră uscarea',
      current: ['reception'],
      actions: [
        { label: 'Întreabă de uscare', href: '#cerere' },
        { label: 'Vezi bazele pe hartă', href: '/depozitare#baze' },
      ],
    },
    '/logistica': {
      next: 'reception',
      kicker: 'Flota proprie',
      title: 'Unde intră transportul',
      current: ['transport'],
      notes: {
        inputs: 'Livrăm inputurile la fermă',
        reception: 'Aducem recolta la bază',
      },
      actions: [
        { label: 'Cere transport', href: '#cerere' },
        { label: 'Vezi bazele pe hartă', href: '/depozitare#baze' },
      ],
    },
    '/parteneri': {
      kicker: 'Parteneriate',
      title: 'Unde intră partenerii',
      current: ['inputs', 'sale', 'finance'],
      notes: {
        inputs: 'Producători de inputuri',
        sale: 'Procesatori și traderi',
        finance: 'Finanțatori',
      },
      actions: [{ label: 'Propune un parteneriat', href: '#cerere' }],
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
      next: 'inputs',
      kicker: 'The company',
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
        { label: 'See the bases on the map', href: '/en/storage#baze' },
        { label: 'About Agrinvest', href: '/en/about' },
      ],
    },
    '/en/storage': {
      next: 'sale',
      kicker: 'Reception and storage',
      title: 'Where storage fits',
      current: ['reception', 'storage'],
      actions: [
        { label: 'Ask about storage', href: '#cerere' },
        { label: 'See the bases on the map', href: '#baze' },
      ],
    },
    '/en/storage/drying': {
      next: 'storage',
      kicker: 'Reception and storage',
      title: 'Where drying fits',
      current: ['reception'],
      actions: [
        { label: 'Ask about drying', href: '#cerere' },
        { label: 'See the bases on the map', href: '/en/storage#baze' },
      ],
    },
    '/en/logistics': {
      next: 'reception',
      kicker: 'Our own fleet',
      title: 'Where transport fits',
      current: ['transport'],
      notes: {
        inputs: 'Inputs delivered to the farm',
        reception: 'The harvest brought to the base',
      },
      actions: [
        { label: 'Ask for transport', href: '#cerere' },
        { label: 'See the bases on the map', href: '/en/storage#baze' },
      ],
    },
    '/en/partners': {
      kicker: 'Partnerships',
      title: 'Where partners fit',
      current: ['inputs', 'sale', 'finance'],
      notes: {
        inputs: 'Input makers',
        sale: 'Processors and grain buyers',
        finance: 'Lenders',
      },
      actions: [{ label: 'Propose a partnership', href: '#cerere' }],
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
  ro: {
    here: 'Pagina aceasta',
    again: 'Și sezonul următor începe din nou.',
    next: 'Pasul următor',
    prev: 'Înapoi',
    forward: 'Mai departe',
    inSection: 'În secțiunea Compania',
  },
  en: {
    here: 'This page',
    again: 'And the next season starts again.',
    next: 'Next step',
    prev: 'Back',
    forward: 'Next',
    inSection: 'In the Company section',
  },
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

/** The step a page hands over to, with its number in the season, or null. */
export function nextStep(locale: Locale, url: string) {
  const chain = companyChain(locale, url)
  if (!chain?.next) return null
  const index = steps[locale].findIndex((s) => s.id === chain.next)
  return { ...steps[locale][index], number: index + 1, total: steps[locale].length }
}
