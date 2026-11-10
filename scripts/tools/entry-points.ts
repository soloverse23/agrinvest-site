/**
 * Price and tool entry points (Phase 5): a "Prețuri" menu panel after the grain item and a
 * footer column. The seed writes them on an empty database; on a live site this step adds
 * them once. Safe to repeat: it only adds what is missing and leaves staff edits alone.
 */
import type { Payload } from 'payload'

type Locale = 'ro' | 'en'
type Link = { label: string; href: string }

export const toolsMenu: Record<
  Locale,
  {
    label: string
    href: string
    after: string
    blurb: string
    children: (Link & { description: string })[]
  }
> = {
  ro: {
    label: 'Prețuri',
    href: '/preturi',
    after: '/cereale',
    blurb: 'Prețul zilei la cereale, îngrășăminte și motorină, cu sursa fiecărui număr.',
    children: [
      { label: 'Prețuri cereale', href: '/preturi', description: 'Agrinvest pe baze și piața UE' },
      {
        label: 'Calculator preț net',
        href: '/preturi/calculator-pret-net',
        description: 'Scăzământ la umiditate și impurități',
      },
      {
        label: 'Prețuri îngrășăminte',
        href: '/preturi/ingrasaminte',
        description: 'Pe ambalaj și pe kg',
      },
      { label: 'Motorină', href: '/motorina', description: 'Preț și livrare la fermă' },
      { label: 'Știri agricole', href: '/stiri', description: 'Presa agricolă și nota de piață' },
    ],
  },
  en: {
    label: 'Prices',
    href: '/en/prices',
    after: '/en/grain',
    blurb: 'Today’s grain, fertiliser and diesel prices, each with its source.',
    children: [
      {
        label: 'Grain prices',
        href: '/en/prices',
        description: 'Agrinvest by base and the EU market',
      },
      {
        label: 'Net price calculator',
        href: '/en/prices/net-price-calculator',
        description: 'Moisture and impurity deductions',
      },
      {
        label: 'Fertiliser prices',
        href: '/en/prices/fertilisers',
        description: 'Per pack and per kg',
      },
      { label: 'Diesel', href: '/en/diesel', description: 'Price and farm delivery' },
      { label: 'Farm news', href: '/en/news', description: 'The farm press and the market note' },
    ],
  },
}

export const toolsFooter: Record<Locale, { title: string; links: Link[] }> = {
  ro: {
    title: 'Prețuri și unelte',
    links: [
      { label: 'Prețuri cereale', href: '/preturi' },
      { label: 'Calculator preț net', href: '/preturi/calculator-pret-net' },
      { label: 'Prețuri îngrășăminte', href: '/preturi/ingrasaminte' },
      { label: 'Motorină', href: '/motorina' },
      { label: 'Știri agricole', href: '/stiri' },
      { label: 'Nota de piață', href: '/piata' },
    ],
  },
  en: {
    title: 'Prices and tools',
    links: [
      { label: 'Grain prices', href: '/en/prices' },
      { label: 'Net price calculator', href: '/en/prices/net-price-calculator' },
      { label: 'Fertiliser prices', href: '/en/prices/fertilisers' },
      { label: 'Diesel', href: '/en/diesel' },
      { label: 'Farm news', href: '/en/news' },
      { label: 'Market note', href: '/en/market' },
    ],
  },
}

type NavItem = {
  link?: { label?: string | null; href?: string | null } | null
  [k: string]: unknown
}
type FooterColumn = {
  title?: string | null
  links?: { link?: { href?: string | null } | null }[] | null
}

/** The navigation with the prices panel after the grain item, unless it is already there. */
export function withToolsMenu(items: NavItem[], locale: Locale): NavItem[] {
  const m = toolsMenu[locale]
  if (items.some((i) => i.link?.href === m.href)) return items
  const item: NavItem = {
    link: { label: m.label, href: m.href },
    blurb: m.blurb,
    children: m.children.map(({ label, href, description }) => ({
      link: { label, href },
      description,
    })),
  }
  const at = items.findIndex((i) => i.link?.href === m.after)
  return at < 0 ? [...items, item] : [...items.slice(0, at + 1), item, ...items.slice(at + 1)]
}

/** The footer with a "Prices and tools" column after the first one, unless one links the hub. */
export function withToolsFooter(columns: FooterColumn[], locale: Locale): FooterColumn[] {
  const f = toolsFooter[locale]
  const has = columns.some((c) => (c.links ?? []).some((l) => l.link?.href === f.links[0].href))
  if (has) return columns
  const column = { title: f.title, links: f.links.map((link) => ({ link })) }
  return [...columns.slice(0, 1), column, ...columns.slice(1)]
}

export async function applyToolsEntryPoints(
  payload: Payload,
  log: (s: string) => void = console.log,
) {
  for (const locale of ['ro', 'en'] as const) {
    const nav = await payload.findGlobal({ slug: 'navigation', locale, depth: 0 })
    const items = withToolsMenu((nav.items ?? []) as NavItem[], locale)
    if (items.length !== (nav.items ?? []).length) {
      await payload.updateGlobal({ slug: 'navigation', locale, data: { items } as never })
      log(`entry points: prices menu (${locale}) added`)
    }
    const footer = await payload.findGlobal({ slug: 'footer', locale, depth: 0 })
    const columns = withToolsFooter((footer.columns ?? []) as FooterColumn[], locale)
    if (columns.length !== (footer.columns ?? []).length) {
      await payload.updateGlobal({ slug: 'footer', locale, data: { columns } as never })
      log(`entry points: prices footer column (${locale}) added`)
    }
  }
}
