/**
 * The structure simplification (2026-11-26) on a site that is already live: the Prices,
 * Financing and News panels and the footer take the shorter version in `./navigation.ts`.
 * The Company panel is `./company-first.ts`'s. The seed writes all of this on an empty
 * database. A panel or the footer changes only while it still links exactly what the previous
 * default linked, so anything staff changed is left alone. Safe to repeat.
 */
import type { Payload } from 'payload'

import { withHarvestLinks } from './harvest-order'
import { footerColumns, navigationItems, type Locale } from './navigation'

type Row = { link?: { href?: string | null; label?: string | null } | null }
type Item = Row & { blurb?: string | null; children?: Row[] | null }
type Column = { links?: Row[] | null }

const locales: Locale[] = ['ro', 'en']
const context = { skipChildren: true }

const words = (text: string) => text.trim().split(/\s+/)

/** The panels as they were, by address: their label and the addresses they linked. */
export const previousPanels: Record<Locale, Record<string, { label: string; hrefs: string[] }>> = {
  ro: {
    '/preturi': {
      label: 'Prețuri și unelte',
      hrefs: words(`
        /preturi/orz /preturi/grau /preturi/rapita /preturi/floarea-soarelui /preturi/porumb
        /cereale /motorina /preturi/carburanti /preturi/petrol-brent /preturi/ingrasaminte
        /preturi/gaze-naturale /preturi/curs-euro-leu /preturi/calculator-pret-net
        /finantare/simulator /unelte`),
    },
    '/finantare': {
      label: 'Finanțare',
      hrefs: words(`
        /finantare/credit-productie /finantare/credit-investitii
        /finantare/credit-contracte-cereale /finantare/finantare-stocuri /finantare/intrebari
        /finantare/simulator /finantare/ghiduri /finantare#consultant`),
    },
    '/ghiduri': {
      label: 'Știri și ghiduri',
      hrefs: words('/ghiduri /finantare/ghiduri /stiri /stiri#flux /piata'),
    },
  },
  en: {
    '/en/prices': {
      label: 'Prices and tools',
      hrefs: words(`
        /en/prices/barley /en/prices/wheat /en/prices/rapeseed /en/prices/sunflower
        /en/prices/corn /en/grain /en/diesel /en/prices/fuel-prices /en/prices/brent-crude-oil
        /en/prices/fertilisers /en/prices/natural-gas /en/prices/euro-leu-exchange-rate
        /en/prices/net-price-calculator /en/financing/simulator /en/tools`),
    },
    '/en/financing': {
      label: 'Financing',
      hrefs: words(`
        /en/financing/production-credit /en/financing/investment-credit
        /en/financing/grain-contract-credit /en/financing/stock-financing
        /en/financing/questions /en/financing/simulator /en/financing/guides
        /en/financing#consultant`),
    },
    '/en/guides': {
      label: 'News and guides',
      hrefs: words('/en/guides /en/financing/guides /en/news /en/news#flux /en/market'),
    },
  },
}

/** The footer as it was: the addresses of each column. */
export const previousFooter: Record<Locale, string[][]> = {
  ro: [
    words(`/magazin /magazin/seminte /magazin/erbicide /magazin/fungicide /magazin/insecticide
      /magazin/ingrasaminte`),
    words(`/preturi /cereale /preturi/calculator-pret-net /preturi/ingrasaminte
      /preturi/petrol-brent /preturi/curs-euro-leu /motorina /unelte`),
    words(`/finantare /finantare/credit-productie /finantare/credit-investitii
      /finantare/intrebari /finantare/simulator /finantare/ghiduri /finantare/despre-ifn
      /finantare#consultant`),
    words(`/depozitare /depozitare/uscare /logistica /despre /despre/cifre /parteneri /cariere`),
    words(`/ghiduri /finantare/ghiduri /stiri /stiri#flux /piata /stiri#buletin`),
  ],
  en: [
    words(`/en/shop /en/shop/seeds /en/shop/herbicides /en/shop/fungicides /en/shop/insecticides
      /en/shop/fertilisers`),
    words(`/en/prices /en/grain /en/prices/net-price-calculator /en/prices/fertilisers
      /en/prices/brent-crude-oil /en/prices/euro-leu-exchange-rate /en/diesel /en/tools`),
    words(`/en/financing /en/financing/production-credit /en/financing/investment-credit
      /en/financing/questions /en/financing/simulator /en/financing/guides
      /en/financing/about-ifn /en/financing#consultant`),
    words(`/en/storage /en/storage/drying /en/logistics /en/about /en/about/figures /en/partners
      /en/careers`),
    words('/en/guides /en/financing/guides /en/news /en/news#flux /en/market /en/news#buletin'),
  ],
}

/** The Partners page is gone (2026-11-26): a menu without its link still counts as unchanged. */
const withoutPartners = (hrefs: (string | null | undefined)[]) =>
  hrefs.filter((h) => h !== '/parteneri' && h !== '/en/partners')

const hrefsOf = (rows?: Row[] | null) => (rows ?? []).map((r) => r.link?.href)
const same = (a: (string | null | undefined)[], b: (string | null | undefined)[]) =>
  a.length === b.length && a.every((h, i) => h === b[i])

/** The menu with each unchanged panel replaced, or the same array when none is. */
export function withSimplePanels<T extends Item>(items: T[], locale: Locale): T[] {
  const fresh = navigationItems(locale)
  let changed = false
  const next = items.map((item) => {
    const href = item.link?.href ?? ''
    const old = previousPanels[locale][href]
    const target = fresh.find((f) => f.link.href === href)
    if (!old || !target || item.link?.label !== old.label) return item
    // The crop links may still be in the order before `./harvest-order.ts`.
    const have = hrefsOf(withHarvestLinks(item.children ?? [], locale))
    if (!same(have, old.hrefs)) return item
    changed = true
    return {
      ...item,
      link: { ...item.link, label: target.link.label },
      blurb: target.blurb,
      children: target.children,
    }
  })
  return changed ? next : items
}

/** Whether the footer still links what the previous default linked, in its columns. */
export function isPreviousFooter(columns: Column[], locale: Locale) {
  const previous = previousFooter[locale]
  return (
    columns.length === previous.length &&
    columns.every((c, i) => same(withoutPartners(hrefsOf(c.links)), withoutPartners(previous[i]!)))
  )
}

export async function simplifyStructure(payload: Payload, log: (s: string) => void = console.log) {
  for (const locale of locales) {
    const nav = await payload.findGlobal({ slug: 'navigation', locale, depth: 0 })
    const items = (nav.items ?? []) as Item[]
    const next = withSimplePanels(items, locale)
    if (next !== items) {
      await payload.updateGlobal({
        slug: 'navigation',
        locale,
        context,
        data: { items: next } as never,
      })
      log(`structure: menu panels (${locale}) simplified`)
    }
    const footer = await payload.findGlobal({ slug: 'footer', locale, depth: 0 })
    if (isPreviousFooter((footer.columns ?? []) as Column[], locale)) {
      await payload.updateGlobal({
        slug: 'footer',
        locale,
        context,
        data: { columns: footerColumns(locale) } as never,
      })
      log(`structure: footer (${locale}) follows the menu`)
    }
  }
}
