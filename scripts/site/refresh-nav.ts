/**
 * Moves "Sell grain" from the Company panel to the Prices panel on a site that is already live
 * (menu and footer). The seed writes the new menu on an empty database; this step brings a
 * live one in line. It acts only on a panel or footer column that still has the 7b links
 * exactly, so anything staff edited is left alone. Safe to repeat: once the new links are
 * there, nothing matches the old set.
 */
import type { Payload } from 'payload'

import { footerColumns, navigationItems, type Locale } from './navigation'

const context = { skipChildren: true }
type Row = { link?: { href?: string | null } | null }
type Item = { link?: { href?: string | null } | null; children?: Row[] | null }
type Column = { links?: Row[] | null }

const grain: Record<Locale, { sell: string; crops: string[] }> = {
  ro: {
    sell: '/cereale',
    crops: ['grau', 'porumb', 'floarea-soarelui', 'rapita', 'orz'].map((s) => `/cereale/${s}`),
  },
  en: {
    sell: '/en/grain',
    crops: ['wheat', 'corn', 'sunflower', 'rapeseed', 'barley'].map((s) => `/en/grain/${s}`),
  },
}
const home: Record<Locale, { prices: string; company: string }> = {
  ro: { prices: '/preturi', company: '/despre' },
  en: { prices: '/en/prices', company: '/en/about' },
}

const hrefsOf = (rows?: Row[] | null) => (rows ?? []).map((r) => r.link?.href ?? null)
const same = (a: (string | null)[], b: string[]) =>
  a.length === b.length && a.every((h, i) => h === b[i])

export async function refreshSectionNav(payload: Payload, log: (s: string) => void = console.log) {
  for (const locale of ['ro', 'en'] as const) {
    const g = grain[locale]
    const target = navigationItems(locale) as unknown as Item[]
    const nav = await payload.findGlobal({ slug: 'navigation', locale, depth: 0 })
    const items = (nav.items ?? []) as unknown as (Item & Record<string, unknown>)[]
    let navChanged = false
    const nextItems = items.map((item) => {
      const href = item.link?.href
      const fresh = target.find((t) => t.link?.href === href)
      if (!fresh) return item
      const wanted = hrefsOf(fresh.children as Row[])
      const have = hrefsOf(item.children)
      const oldFor =
        href === home[locale].prices
          ? wanted.filter((h) => h !== g.sell)
          : href === home[locale].company
            ? [g.sell, ...g.crops, ...wanted]
            : null
      if (!oldFor || !same(have, oldFor as string[])) return item
      navChanged = true
      return { ...item, children: fresh.children }
    })
    if (navChanged) {
      await payload.updateGlobal({
        slug: 'navigation',
        locale,
        data: { items: nextItems } as never,
        context,
      })
      log(`section nav: menu panels (${locale}) moved Sell grain to Prices`)
    }

    const targetCols = footerColumns(locale) as unknown as (Column & { title: string })[]
    const footer = await payload.findGlobal({ slug: 'footer', locale, depth: 0 })
    const columns = (footer.columns ?? []) as unknown as (Column & Record<string, unknown>)[]
    let footerChanged = false
    const freshPrices = targetCols.find((c) => hrefsOf(c.links).includes(home[locale].prices))
    const freshCompany = targetCols.find((c) => hrefsOf(c.links).includes(home[locale].company))
    const nextColumns = columns.map((col) => {
      const have = hrefsOf(col.links)
      const pricesWanted = hrefsOf(freshPrices?.links) as string[]
      const companyWanted = hrefsOf(freshCompany?.links) as string[]
      let fresh: Column | undefined
      if (
        freshPrices &&
        same(
          have,
          pricesWanted.filter((h) => h !== g.sell),
        )
      )
        fresh = freshPrices
      else if (freshCompany && same(have, [g.sell, ...companyWanted])) fresh = freshCompany
      if (!fresh) return col
      footerChanged = true
      return { ...col, links: fresh.links }
    })
    if (footerChanged) {
      await payload.updateGlobal({
        slug: 'footer',
        locale,
        data: { columns: nextColumns } as never,
        context,
      })
      log(`section nav: footer columns (${locale}) moved Sell grain to Prices`)
    }
  }
}
