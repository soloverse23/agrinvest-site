/**
 * Guides entry points (Phase 6): a "Ghiduri" menu panel after the prices item and a footer
 * column. Safe to repeat: it only adds what is missing and leaves staff edits alone.
 */
import type { Payload } from 'payload'

type Locale = 'ro' | 'en'
type Link = { label: string; href: string }

export const guidesMenu: Record<
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
    label: 'Ghiduri',
    href: '/ghiduri',
    after: '/preturi',
    blurb: 'Răspunsuri verificate pentru fermieri: culturi, vânzare, depozitare și finanțare.',
    children: [
      { label: 'Ghiduri pentru fermieri', href: '/ghiduri', description: 'Pe culturi și teme' },
      {
        label: 'Ghiduri de finanțare',
        href: '/finantare/ghiduri',
        description: 'Credit, APIA, garanții',
      },
      { label: 'Știri Agrinvest', href: '/stiri', description: 'Noutăți de la baze și din piață' },
      { label: 'Nota de piață', href: '/piata', description: 'Săptămânal, cu sursele' },
    ],
  },
  en: {
    label: 'Guides',
    href: '/en/guides',
    after: '/en/prices',
    blurb: 'Checked answers for farmers: crops, selling, storage and financing.',
    children: [
      { label: 'Guides for farmers', href: '/en/guides', description: 'By crop and topic' },
      {
        label: 'Financing guides',
        href: '/en/financing/guides',
        description: 'Credit, APIA, guarantees',
      },
      { label: 'Agrinvest news', href: '/en/news', description: 'From our bases and the market' },
      { label: 'Market note', href: '/en/market', description: 'Weekly, with sources' },
    ],
  },
}

export const guidesFooter: Record<Locale, { title: string; links: Link[] }> = {
  ro: {
    title: 'Ghiduri',
    links: [
      { label: 'Ghiduri pentru fermieri', href: '/ghiduri' },
      { label: 'Ghiduri de finanțare', href: '/finantare/ghiduri' },
      { label: 'Știri Agrinvest', href: '/stiri' },
    ],
  },
  en: {
    title: 'Guides',
    links: [
      { label: 'Guides for farmers', href: '/en/guides' },
      { label: 'Financing guides', href: '/en/financing/guides' },
      { label: 'Agrinvest news', href: '/en/news' },
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

export function withGuidesMenu(items: NavItem[], locale: Locale): NavItem[] {
  const m = guidesMenu[locale]
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

export function withGuidesFooter(columns: FooterColumn[], locale: Locale): FooterColumn[] {
  const f = guidesFooter[locale]
  const has = columns.some((c) => (c.links ?? []).some((l) => l.link?.href === f.links[0].href))
  if (has) return columns
  return [...columns, { title: f.title, links: f.links.map((link) => ({ link })) }]
}

export async function applyGuidesEntryPoints(
  payload: Payload,
  log: (s: string) => void = console.log,
) {
  for (const locale of ['ro', 'en'] as const) {
    const nav = await payload.findGlobal({ slug: 'navigation', locale, depth: 0 })
    const items = withGuidesMenu((nav.items ?? []) as NavItem[], locale)
    if (items.length !== (nav.items ?? []).length) {
      await payload.updateGlobal({ slug: 'navigation', locale, data: { items } as never })
      log(`entry points: guides menu (${locale}) added`)
    }
    const footer = await payload.findGlobal({ slug: 'footer', locale, depth: 0 })
    const columns = withGuidesFooter((footer.columns ?? []) as FooterColumn[], locale)
    if (columns.length !== (footer.columns ?? []).length) {
      await payload.updateGlobal({ slug: 'footer', locale, data: { columns } as never })
      log(`entry points: guides footer column (${locale}) added`)
    }
  }
}
