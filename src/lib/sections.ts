import type { Locale } from '@/i18n/config'

/**
 * The sections of the site that are not finance (finance has its own `FinanceNav`): the pages
 * of each, in the order a visitor needs them. One map feeds the link row under every title,
 * so a page always shows where else to go. A page belongs to a section when its address
 * starts with one of the section's prefixes.
 */
export type SectionId = 'prices' | 'company' | 'news'
type Item = { label: string; href: string }
type Section = { label: string; prefixes: string[]; items: Item[] }

// Structure simplification (2026-11-26): grain buying and diesel delivery are services, so
// they sit in Products and services; Prices keeps the price pages and the tools.
const map: Record<Locale, Record<SectionId, Section>> = {
  ro: {
    prices: {
      label: 'În secțiunea Prețuri',
      prefixes: ['/preturi', '/unelte'],
      items: [
        { label: 'Prețuri la cereale', href: '/preturi' },
        { label: 'Carburanți', href: '/preturi/carburanti' },
        { label: 'Îngrășăminte', href: '/preturi/ingrasaminte' },
        { label: 'Curs euro-leu', href: '/preturi/curs-euro-leu' },
        { label: 'Calculator preț net', href: '/preturi/calculator-pret-net' },
        { label: 'Toate uneltele', href: '/unelte' },
      ],
    },
    company: {
      label: 'În secțiunea Produse și servicii',
      prefixes: [
        '/despre',
        '/depozitare',
        '/logistica',
        '/cereale',
        '/motorina',
        '/cariere',
        '/contact',
      ],
      items: [
        { label: 'Produse și servicii', href: '/despre' },
        { label: 'Logistică', href: '/logistica' },
        { label: 'Depozitare și uscare', href: '/depozitare' },
        { label: 'Vânzare cereale', href: '/cereale' },
        { label: 'Motorină la fermă', href: '/motorina' },
        { label: 'Cifre', href: '/despre/cifre' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    news: {
      label: 'În secțiunea Știri și ghiduri',
      prefixes: ['/stiri', '/piata', '/ghiduri', '/autori'],
      items: [
        { label: 'Știri', href: '/stiri' },
        { label: 'Nota de piață', href: '/piata' },
        { label: 'Ghiduri', href: '/ghiduri' },
      ],
    },
  },
  en: {
    prices: {
      label: 'In the Prices section',
      prefixes: ['/en/prices', '/en/tools'],
      items: [
        { label: 'Grain prices', href: '/en/prices' },
        { label: 'Fuel prices', href: '/en/prices/fuel-prices' },
        { label: 'Fertilisers', href: '/en/prices/fertilisers' },
        { label: 'Euro to leu', href: '/en/prices/euro-leu-exchange-rate' },
        { label: 'Net price calculator', href: '/en/prices/net-price-calculator' },
        { label: 'All tools', href: '/en/tools' },
      ],
    },
    company: {
      label: 'In the Products and services section',
      prefixes: [
        '/en/about',
        '/en/storage',
        '/en/logistics',
        '/en/grain',
        '/en/diesel',
        '/en/careers',
        '/en/contact',
        '/en/bases',
      ],
      items: [
        { label: 'Products and services', href: '/en/about' },
        { label: 'Logistics', href: '/en/logistics' },
        { label: 'Storage and drying', href: '/en/storage' },
        { label: 'Grain buying', href: '/en/grain' },
        { label: 'Diesel to the farm', href: '/en/diesel' },
        { label: 'Figures', href: '/en/about/figures' },
        { label: 'Contact', href: '/en/contact' },
      ],
    },
    news: {
      label: 'In the News and guides section',
      prefixes: ['/en/news', '/en/market', '/en/guides', '/en/authors'],
      items: [
        { label: 'News', href: '/en/news' },
        { label: 'Market note', href: '/en/market' },
        { label: 'Guides', href: '/en/guides' },
      ],
    },
  },
}

const within = (path: string, prefix: string) => path === prefix || path.startsWith(`${prefix}/`)

/** The section a page belongs to, from its address (the last breadcrumb), or null. */
export function sectionFor(locale: Locale, url: string) {
  const path = url.split(/[?#]/)[0].replace(/\/$/, '') || '/'
  for (const id of Object.keys(map[locale]) as SectionId[]) {
    const section = map[locale][id]
    if (section.prefixes.some((p) => within(path, p))) {
      // The best match is the longest item address the page sits under.
      const current = section.items
        .filter((i) => within(path, i.href))
        .sort((a, b) => b.href.length - a.href.length)[0]
      return { id, label: section.label, items: section.items, current: current?.href ?? null }
    }
  }
  return null
}
