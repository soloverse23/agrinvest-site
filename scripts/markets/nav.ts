/**
 * Adds the Phase 7f market pages to the Prices menu panel and footer column on a site that is
 * already live. The seed writes the new menu on an empty database; this brings a live one in
 * line. It acts only on a panel or column whose links are exactly the previous set (the new set
 * minus the market pages), so anything staff edited is left alone. Safe to repeat.
 */
import type { Payload } from 'payload'

import { footerColumns, marketLinks, navigationItems, type Locale } from '../site/navigation'

const context = { skipChildren: true }
type Row = { link?: { href?: string | null } | null }
type Item = { link?: { href?: string | null } | null; children?: Row[] | null; blurb?: unknown }
type Column = { links?: Row[] | null }

const pricesHref: Record<Locale, string> = { ro: '/preturi', en: '/en/prices' }
const hrefsOf = (rows?: Row[] | null) => (rows ?? []).map((r) => r.link?.href ?? null)
const same = (a: (string | null)[], b: (string | null)[]) =>
  a.length === b.length && a.every((h, i) => h === b[i])

export async function refreshMarketsNav(payload: Payload, log: (s: string) => void = console.log) {
  for (const locale of ['ro', 'en'] as const) {
    const added = new Set(marketLinks(locale).map((l) => l.href))
    // The footer gains only Brent and the exchange rate; fertilisers were already there.
    const footerAdded = new Set(
      marketLinks(locale)
        .map((l) => l.href)
        .filter((h) => /brent|curs|exchange/.test(h)),
    )

    const target = navigationItems(locale) as unknown as Item[]
    const fresh = target.find((t) => t.link?.href === pricesHref[locale])
    const nav = await payload.findGlobal({ slug: 'navigation', locale, depth: 0 })
    const items = (nav.items ?? []) as unknown as (Item & Record<string, unknown>)[]
    let navChanged = false
    const nextItems = items.map((item) => {
      if (!fresh || item.link?.href !== pricesHref[locale]) return item
      const wanted = hrefsOf(fresh.children)
      const previous = wanted.filter((h) => !h || !added.has(h))
      const fert = locale === 'ro' ? '/preturi/ingrasaminte' : '/en/prices/fertilisers'
      // Old order: crops…, sell grain, fertilisers, diesel, calculator, simulator, all tools.
      const diesel = locale === 'ro' ? '/motorina' : '/en/diesel'
      const oldOrder = previous.flatMap((h) => (h === diesel ? [fert, diesel] : [h]))
      const have = hrefsOf(item.children)
      if (!same(have, oldOrder)) return item
      navChanged = true
      return { ...item, blurb: fresh.blurb, children: fresh.children }
    })
    if (navChanged) {
      await payload.updateGlobal({
        slug: 'navigation',
        locale,
        data: { items: nextItems } as never,
        context,
      })
      log(`markets nav: Prices panel (${locale}) now lists the market pages`)
    }

    const freshCol = (footerColumns(locale) as unknown as (Column & { title: string })[]).find(
      (c) => hrefsOf(c.links).includes(pricesHref[locale]),
    )
    const footer = await payload.findGlobal({ slug: 'footer', locale, depth: 0 })
    const columns = (footer.columns ?? []) as unknown as (Column & Record<string, unknown>)[]
    let footerChanged = false
    const nextColumns = columns.map((col) => {
      if (!freshCol) return col
      const old = hrefsOf(freshCol.links).filter((h) => !h || !footerAdded.has(h))
      if (!same(hrefsOf(col.links), old)) return col
      footerChanged = true
      return { ...col, links: freshCol.links }
    })
    if (footerChanged) {
      await payload.updateGlobal({
        slug: 'footer',
        locale,
        data: { columns: nextColumns } as never,
        context,
      })
      log(`markets nav: footer Prices column (${locale}) now lists Brent and the euro rate`)
    }
  }
}
