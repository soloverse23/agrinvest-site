/**
 * Brings the first menu item in line on a site that is already live: "Company" moves to the
 * front, becomes "Products and services" and lists the whole package (the six services in
 * season order, then the company pages). The /despre page takes the matching title. The seed
 * writes all of this on an empty database. Each change acts only on what still has the
 * previous default (order, links, title), so anything staff changed is left alone. Safe to
 * repeat.
 */
import type { Payload } from 'payload'

import { navigationItems, type Locale } from './navigation'

type Row = { link?: { href?: string | null; label?: string | null } | null }
type Item = Row & { blurb?: string | null; children?: Row[] | null }

/** The menu with Company first, or the same array when it is not in the previous order. */
export function withCompanyFirst<T extends Item>(items: T[], locale: Locale): T[] {
  const [company, ...rest] = navigationItems(locale).map((i) => i.link.href)
  const previous = [...rest.slice(0, 3), company, ...rest.slice(3)]
  const old =
    items.length === previous.length && items.every((i, n) => i.link?.href === previous[n])
  return old ? [items[3]!, ...items.slice(0, 3), ...items.slice(4)] : items
}

/** The Company item as the seed wrote it before it became "Products and services". */
const oldCompany: Record<Locale, { label: string; hrefs: string[] }> = {
  ro: {
    label: 'Compania',
    hrefs: ['/depozitare', '/logistica', '/despre', '/despre/cifre', '/parteneri', '/cariere'],
  },
  en: {
    label: 'Company',
    hrefs: [
      '/en/storage',
      '/en/logistics',
      '/en/about',
      '/en/about/figures',
      '/en/partners',
      '/en/careers',
    ],
  },
}

/** The menu with the old Company item replaced, or the same array when there is none. */
export function withServicesItem<T extends Item>(items: T[], locale: Locale): T[] {
  const fresh = navigationItems(locale)[0]!
  const old = oldCompany[locale]
  const at = items.findIndex((i) => i.link?.href === fresh.link.href)
  const item = items[at]
  const hrefs = (item?.children ?? []).map((c) => c.link?.href)
  // Partners was dropped on 2026-11-26 (/parteneri redirects to Contact): a step that takes it
  // out of the live menu may run first, so the seeded links without it count as unchanged too.
  const partners = new Set(['/parteneri', '/en/partners'])
  const same = (list: string[]) =>
    hrefs.length === list.length && hrefs.every((h, n) => h === list[n])
  const unchanged =
    item?.link?.label === old.label &&
    (same(old.hrefs) || same(old.hrefs.filter((h) => !partners.has(h))))
  if (!item || !unchanged) return items
  const next = [...items]
  next[at] = {
    ...item,
    link: { ...item.link, label: fresh.link.label },
    blurb: fresh.blurb,
    children: fresh.children,
  }
  return next
}

/** The /despre page's seeded title and SEO lines, before and after. */
export const aboutPage: Record<
  Locale,
  {
    old: { title: string; seoTitle: string }
    next: { title: string; seoTitle: string; summary: string }
  }
> = {
  ro: {
    old: {
      title: 'Despre Agrinvest',
      seoTitle: 'Despre Agrinvest: companie agricolă cu capital românesc',
    },
    next: {
      title: 'Produse și servicii',
      seoTitle: 'Produse și servicii Agrinvest pentru fermieri',
      summary:
        'Inputuri, transport, recepție și uscare, depozitare, vânzarea recoltei și finanțare prin Agrinvest Credit IFN: tot ce facem pentru o fermă.',
    },
  },
  en: {
    old: { title: 'About Agrinvest', seoTitle: 'About Agrinvest: a Romanian-owned agribusiness' },
    next: {
      title: 'Products and services',
      seoTitle: 'Agrinvest products and services for farmers',
      summary:
        'Inputs, transport, reception and drying, storage, grain buying and financing through Agrinvest Credit IFN: everything we do for a farm.',
    },
  },
}

export async function moveCompanyFirst(payload: Payload, log: (s: string) => void = console.log) {
  for (const locale of ['ro', 'en'] as const) {
    const nav = await payload.findGlobal({ slug: 'navigation', locale, depth: 0 })
    const items = (nav.items ?? []) as Item[]
    const moved = withCompanyFirst(items, locale)
    const next = withServicesItem(moved, locale)
    if (next !== items) {
      await payload.updateGlobal({
        slug: 'navigation',
        locale,
        data: { items: next } as never,
        context: { skipChildren: true },
      })
      if (moved !== items) log(`menu: Company moved to the front (${locale})`)
      if (next !== moved)
        log(`menu: Company is now ${navigationItems(locale)[0]!.link.label} (${locale})`)
    }

    const { old, next: page } = aboutPage[locale]
    const found = await payload.find({
      collection: 'pages',
      locale,
      depth: 0,
      limit: 1,
      where: { slug: { equals: locale === 'ro' ? 'despre' : 'about' } },
    })
    const doc = found.docs[0]
    const seo = doc?.seo
    if (doc && doc.title === old.title && (!seo?.title || seo.title === old.seoTitle)) {
      await payload.update({
        collection: 'pages',
        id: doc.id,
        locale,
        data: { title: page.title, summary: page.summary, seo: { ...seo, title: page.seoTitle } },
        context: { skipChildren: true },
      })
      log(`pages: ${old.title} is now ${page.title} (${locale})`)
    }
  }
}
