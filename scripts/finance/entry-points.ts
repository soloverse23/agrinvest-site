/**
 * Finance entry points on a site that is already live (4.5): the mega menu, the footer and a
 * few links in pages. The seed runs only on an empty database, so its new menu never reaches
 * such a site: this step brings it in line. Safe to repeat, and it leaves alone anything staff
 * changed in the admin: it only adds what is missing and only rewrites a link that still has
 * the seed's exact old label and address.
 */
import type { Payload } from 'payload'

import { keepUrl } from './corrections'

const context = { skipChildren: true }
type Locale = 'ro' | 'en'
type Link = { label: string; href: string }
type Obj = Record<string, unknown>

/** The finance menu panel, as the seed writes it (`scripts/seed/pages.ts`). */
export const financeMenu: Record<
  Locale,
  { href: string; blurb: string; children: (Link & { description: string })[] }
> = {
  ro: {
    href: '/finantare',
    blurb:
      'Credite pentru producție și investiții prin Agrinvest Credit IFN, cu rate după recoltă.',
    children: [
      {
        label: 'Credit de producție',
        href: '/finantare/credit-productie',
        description: 'Inputuri și lucrările sezonului',
      },
      {
        label: 'Credit de investiții',
        href: '/finantare/credit-investitii',
        description: 'Utilaje, irigații, depozitare, teren',
      },
      {
        label: 'Credit pe contract de cereale',
        href: '/finantare/credit-contracte-cereale',
        description: 'Bani înainte de livrare',
      },
      {
        label: 'Finanțarea stocurilor',
        href: '/finantare/finantare-stocuri',
        description: 'Până vinzi recolta',
      },
      {
        label: 'Simulator de rate',
        href: '/finantare/simulator',
        description: 'Ratele pe recoltele tale',
      },
      {
        label: 'Cerere de credit',
        href: '/finantare/aplica',
        description: 'Trimite cererea online',
      },
      {
        label: 'Ghiduri de finanțare',
        href: '/finantare/ghiduri',
        description: 'Credit, subvenții, garanții',
      },
      {
        label: 'Despre Agrinvest Credit IFN',
        href: '/finantare/despre-ifn',
        description: 'Cine suntem și cum lucrăm',
      },
    ],
  },
  en: {
    href: '/en/financing',
    blurb: 'Production and investment loans from Agrinvest Credit IFN, repaid after harvest.',
    children: [
      {
        label: 'Production credit',
        href: '/en/financing/production-credit',
        description: 'Inputs and the season’s work',
      },
      {
        label: 'Investment credit',
        href: '/en/financing/investment-credit',
        description: 'Machinery, irrigation, storage, land',
      },
      {
        label: 'Grain contract credit',
        href: '/en/financing/grain-contract-credit',
        description: 'Cash before delivery',
      },
      {
        label: 'Stock financing',
        href: '/en/financing/stock-financing',
        description: 'Until you sell the harvest',
      },
      {
        label: 'Repayment simulator',
        href: '/en/financing/simulator',
        description: 'Instalments on your harvests',
      },
      {
        label: 'Loan application',
        href: '/en/financing/apply',
        description: 'Apply online',
      },
      {
        label: 'Financing guides',
        href: '/en/financing/guides',
        description: 'Credit, subsidies, guarantees',
      },
      {
        label: 'About Agrinvest Credit IFN',
        href: '/en/financing/about-ifn',
        description: 'Who we are and how we work',
      },
    ],
  },
}

/** The first four panel links are loans; the rest are tools and information. */
export const financeLoanCount = 4
export const financeGroups: Record<Locale, [string, string]> = {
  ro: ['Credite', 'Instrumente și informații'],
  en: ['Loans', 'Tools and information'],
}

/** The finance column of the footer (Phase 7d, finance tidy). */
export const financeFooterColumn: Record<Locale, Link[]> = {
  ro: [
    { label: 'Finanțare', href: '/finantare' },
    { label: 'Credit de producție', href: '/finantare/credit-productie' },
    { label: 'Credit de investiții', href: '/finantare/credit-investitii' },
    { label: 'Simulator de rate', href: '/finantare/simulator' },
    { label: 'Cerere de credit', href: '/finantare/aplica' },
    { label: 'Ghiduri de finanțare', href: '/finantare/ghiduri' },
    { label: 'Despre IFN', href: '/finantare/despre-ifn' },
    { label: 'Întrebări frecvente', href: '/finantare/intrebari-frecvente' },
  ],
  en: [
    { label: 'Financing', href: '/en/financing' },
    { label: 'Production credit', href: '/en/financing/production-credit' },
    { label: 'Investment credit', href: '/en/financing/investment-credit' },
    { label: 'Repayment simulator', href: '/en/financing/simulator' },
    { label: 'Loan application', href: '/en/financing/apply' },
    { label: 'Financing guides', href: '/en/financing/guides' },
    { label: 'About the IFN', href: '/en/financing/about-ifn' },
    { label: 'FAQ', href: '/en/financing/faq' },
  ],
}

/** What the 7b menu and footer had, so a refresh knows an untouched panel from an edited one. */
const oldMenuHrefs: Record<Locale, string[]> = {
  ro: [
    '/finantare/credit-productie',
    '/finantare/credit-investitii',
    '/finantare/simulator',
    '/finantare/ghiduri',
  ],
  en: [
    '/en/financing/production-credit',
    '/en/financing/investment-credit',
    '/en/financing/simulator',
    '/en/financing/guides',
  ],
}
const oldFooterHrefs: Record<Locale, string[]> = {
  ro: [
    '/finantare',
    '/finantare/credit-productie',
    '/finantare/credit-investitii',
    '/finantare/simulator',
    '/finantare/aplica',
  ],
  en: [
    '/en/financing',
    '/en/financing/production-credit',
    '/en/financing/investment-credit',
    '/en/financing/simulator',
    '/en/financing/apply',
  ],
}

/** Footer links added after the finance link, in the same column. */
export const financeFooter: Record<Locale, { after: string; links: Link[] }> = {
  ro: {
    after: '/finantare',
    links: [
      { label: 'Simulator de rate', href: '/finantare/simulator' },
      { label: 'Cerere de credit', href: '/finantare/aplica' },
    ],
  },
  en: {
    after: '/en/financing',
    links: [
      { label: 'Repayment simulator', href: '/en/financing/simulator' },
      { label: 'Loan application', href: '/en/financing/apply' },
    ],
  },
}

/**
 * Links in pages: the seed's old label and address → the new ones. `within` narrows a rewrite to
 * the card whose text contains it, where the same link means something else elsewhere.
 */
export const linkRewrites: { from: Link; to: Link; within?: string }[] = [
  {
    from: { label: 'Cere o ofertă', href: '/finantare#cerere' },
    to: { label: 'Trimite o cerere', href: '/finantare/aplica' },
  },
  {
    from: { label: 'Ask for an offer', href: '/en/financing#cerere' },
    to: { label: 'Apply', href: '/en/financing/apply' },
  },
  {
    from: { label: 'Finanțare', href: '/finantare' },
    to: { label: 'Finanțarea stocurilor', href: '/finantare/finantare-stocuri' },
    within: 'până la vânzare',
  },
  {
    from: { label: 'Financing', href: '/en/financing' },
    to: { label: 'Stock financing', href: '/en/financing/stock-financing' },
    within: 'before you sell',
  },
]

const isLink = (v: unknown, l: Link) =>
  !!v && typeof v === 'object' && (v as Obj).label === l.label && (v as Obj).href === l.href

/** A copy of some content with the matching links rewritten. */
export function rewriteLinks(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(rewriteLinks)
  if (!value || typeof value !== 'object') return value
  const obj = value as Obj
  const text = JSON.stringify(obj)
  const out: Obj = {}
  for (const [k, v] of Object.entries(obj)) {
    const rule = linkRewrites.find(
      (r) => isLink(v, r.from) && (!r.within || text.includes(r.within)),
    )
    out[k] = rule ? { ...(v as Obj), ...rule.to } : rewriteLinks(v)
  }
  return out
}

type NavItem = {
  link?: { label?: string | null; href?: string | null } | null
  blurb?: string | null
  children?: unknown[] | null
}

/** The navigation with the finance panel filled in, only if staff have not given it one. */
export function withFinanceMenu(items: NavItem[], locale: Locale): NavItem[] {
  const menu = financeMenu[locale]
  return items.map((item) =>
    item.link?.href === menu.href && !item.children?.length
      ? {
          ...item,
          blurb: item.blurb || menu.blurb,
          children: menu.children.map(({ label, href, description }) => ({
            link: { label, href },
            description,
          })),
        }
      : item,
  )
}

type FooterColumn = { links?: { link?: { href?: string | null } | null }[] | null }

/** The footer with the tool links after the finance link, unless the footer has them. */
export function withFinanceFooter<C extends FooterColumn>(columns: C[], locale: Locale): C[] {
  const { after, links } = financeFooter[locale]
  const hrefs = new Set(columns.flatMap((c) => (c.links ?? []).map((l) => l.link?.href)))
  const missing = links.filter((l) => !hrefs.has(l.href))
  if (!missing.length) return columns
  return columns.map((c) => {
    const list = c.links ?? []
    const at = list.findIndex((l) => l.link?.href === after)
    if (at < 0) return c
    return {
      ...c,
      links: [
        ...list.slice(0, at + 1),
        ...missing.map((link) => ({ link })),
        ...list.slice(at + 1),
      ],
    }
  })
}

export async function applyEntryPoints(payload: Payload, log: (s: string) => void = console.log) {
  await refreshFinanceNav(payload, log)
  for (const locale of ['ro', 'en'] as const) {
    const nav = await payload.findGlobal({ slug: 'navigation', locale, depth: 0 })
    const items = withFinanceMenu((nav.items ?? []) as NavItem[], locale)
    if (JSON.stringify(items) !== JSON.stringify(nav.items ?? [])) {
      await payload.updateGlobal({ slug: 'navigation', locale, data: { items } as never, context })
      log(`entry points: finance menu (${locale}) added`)
    }
    const footer = await payload.findGlobal({ slug: 'footer', locale, depth: 0 })
    const columns = withFinanceFooter((footer.columns ?? []) as FooterColumn[], locale)
    if (JSON.stringify(columns) !== JSON.stringify(footer.columns ?? [])) {
      await payload.updateGlobal({ slug: 'footer', locale, data: { columns } as never, context })
      log(`entry points: finance footer links (${locale}) added`)
    }
    const { docs } = await payload.find({
      collection: 'pages',
      locale,
      depth: 0,
      pagination: false,
      draft: true,
    })
    for (const doc of docs) {
      const before = { layout: doc.layout }
      const after = rewriteLinks(before) as Obj
      if (JSON.stringify(after) === JSON.stringify(before)) continue
      await payload.update({
        collection: 'pages',
        id: doc.id,
        locale,
        data: { ...after, ...keepUrl(doc.path, doc.slug) } as never,
        draft: doc._status === 'draft',
        context,
      })
      log(`entry points: links on ${doc.path} (${locale}) updated`)
    }
  }
}

type NavChildRow = { link?: { label?: string | null; href?: string | null } | null }
type NavFooterColumn = { title?: string | null; links?: { link?: Link | null }[] | null }

const sameHrefs = (have: (string | null | undefined)[], want: string[]) =>
  have.length === want.length && have.every((h, i) => h === want[i])

/**
 * Brings the finance panel of the menu and the finance footer column to the tidied version,
 * only where they still have the 7b links exactly (so a panel staff edited is left alone).
 * Safe to repeat: once the new links are there, nothing matches the old set.
 */
export async function refreshFinanceNav(payload: Payload, log: (s: string) => void = console.log) {
  for (const locale of ['ro', 'en'] as const) {
    const menu = financeMenu[locale]
    const nav = await payload.findGlobal({ slug: 'navigation', locale, depth: 0 })
    const items = (nav.items ?? []) as unknown as {
      link?: Link | null
      children?: NavChildRow[] | null
    }[]
    const [loans, tools] = financeGroups[locale]
    let navChanged = false
    const nextItems = items.map((item) => {
      if (item.link?.href !== menu.href) return item
      const hrefs = (item.children ?? []).map((c) => c.link?.href)
      if (!sameHrefs(hrefs, oldMenuHrefs[locale])) return item
      navChanged = true
      return {
        ...item,
        children: menu.children.map(({ label, href, description }, i) => ({
          link: { label, href },
          description,
          group: i < financeLoanCount ? loans : tools,
        })),
      }
    })
    if (navChanged) {
      await payload.updateGlobal({
        slug: 'navigation',
        locale,
        data: { items: nextItems } as never,
        context,
      })
      log(`finance nav: menu panel (${locale}) tidied`)
    }
    const footer = await payload.findGlobal({ slug: 'footer', locale, depth: 0 })
    const columns = (footer.columns ?? []) as NavFooterColumn[]
    let footerChanged = false
    const nextColumns = columns.map((col) => {
      const hrefs = (col.links ?? []).map((l) => l.link?.href)
      if (!sameHrefs(hrefs, oldFooterHrefs[locale])) return col
      footerChanged = true
      return { ...col, links: financeFooterColumn[locale].map((link) => ({ link })) }
    })
    if (footerChanged) {
      await payload.updateGlobal({
        slug: 'footer',
        locale,
        data: { columns: nextColumns } as never,
        context,
      })
      log(`finance nav: footer column (${locale}) tidied`)
    }
  }
}
