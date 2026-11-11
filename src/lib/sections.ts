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

const map: Record<Locale, Record<SectionId, Section>> = {
  ro: {
    prices: {
      label: 'În secțiunea Prețuri și vânzare',
      prefixes: ['/preturi', '/motorina', '/cereale', '/unelte'],
      items: [
        { label: 'Prețuri cereale', href: '/preturi' },
        { label: 'Vinde cereale', href: '/cereale' },
        { label: 'Îngrășăminte', href: '/preturi/ingrasaminte' },
        { label: 'Motorină', href: '/motorina' },
        { label: 'Calculator preț net', href: '/preturi/calculator-pret-net' },
        { label: 'Toate uneltele', href: '/unelte' },
      ],
    },
    company: {
      label: 'În secțiunea Compania',
      prefixes: [
        '/despre',
        '/depozitare',
        '/logistica',
        '/parteneri',
        '/cariere',
        '/contact',
        '/baze',
      ],
      items: [
        { label: 'Despre Agrinvest', href: '/despre' },
        { label: 'Cifre', href: '/despre/cifre' },
        { label: 'Depozitare', href: '/depozitare' },
        { label: 'Logistică', href: '/logistica' },
        { label: 'Parteneri', href: '/parteneri' },
        { label: 'Cariere', href: '/cariere' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    news: {
      label: 'În secțiunea Știri și ghiduri',
      prefixes: ['/stiri', '/piata', '/ghiduri', '/autori'],
      items: [
        { label: 'Știri', href: '/stiri' },
        { label: 'Nota de piață', href: '/piata' },
        { label: 'Ghiduri pentru fermieri', href: '/ghiduri' },
        { label: 'Ghiduri de finanțare', href: '/finantare/ghiduri' },
      ],
    },
  },
  en: {
    prices: {
      label: 'In the Prices and selling section',
      prefixes: ['/en/prices', '/en/diesel', '/en/grain', '/en/tools'],
      items: [
        { label: 'Grain prices', href: '/en/prices' },
        { label: 'Sell grain', href: '/en/grain' },
        { label: 'Fertilisers', href: '/en/prices/fertilisers' },
        { label: 'Diesel', href: '/en/diesel' },
        { label: 'Net price calculator', href: '/en/prices/net-price-calculator' },
        { label: 'All tools', href: '/en/tools' },
      ],
    },
    company: {
      label: 'In the Company section',
      prefixes: [
        '/en/about',
        '/en/storage',
        '/en/logistics',
        '/en/partners',
        '/en/careers',
        '/en/contact',
        '/en/bases',
      ],
      items: [
        { label: 'About Agrinvest', href: '/en/about' },
        { label: 'Figures', href: '/en/about/figures' },
        { label: 'Storage', href: '/en/storage' },
        { label: 'Logistics', href: '/en/logistics' },
        { label: 'Partners', href: '/en/partners' },
        { label: 'Careers', href: '/en/careers' },
        { label: 'Contact', href: '/en/contact' },
      ],
    },
    news: {
      label: 'In the News and guides section',
      prefixes: ['/en/news', '/en/market', '/en/guides', '/en/authors'],
      items: [
        { label: 'News', href: '/en/news' },
        { label: 'Market note', href: '/en/market' },
        { label: 'Guides for farmers', href: '/en/guides' },
        { label: 'Financing guides', href: '/en/financing/guides' },
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
