import { describe, expect, it } from 'vitest'

import { withFinanceFooter } from '../../scripts/finance/entry-points'
import { footerColumns, navigationItems } from '../../scripts/site/navigation'
import {
  isPreviousFooter,
  previousFooter,
  previousPanels,
  withSimplePanels,
} from '../../scripts/site/structure'

const rows = (hrefs: string[]) => hrefs.map((href) => ({ link: { label: href, href } }))

describe('structure simplification on a live site', () => {
  it('replaces the unchanged panels once', () => {
    for (const locale of ['ro', 'en'] as const) {
      const live = Object.entries(previousPanels[locale]).map(([href, old]) => ({
        id: href,
        link: { label: old.label, href },
        // The stored order differs from the one listed here.
        children: rows([...old.hrefs].reverse()),
      }))
      const next = withSimplePanels(live, locale)
      for (const item of next) {
        const target = navigationItems(locale).find((i) => i.link.href === item.link.href)!
        expect(item.id).toBe(item.link.href)
        expect(item.link.label).toBe(target.link.label)
        expect(item.children).toEqual(target.children)
      }
      expect(withSimplePanels(next, locale)).toBe(next)
    }
  })

  it('leaves a panel staff edited', () => {
    const old = previousPanels.ro['/ghiduri']!
    const renamed = [{ link: { label: 'Altceva', href: '/ghiduri' }, children: rows(old.hrefs) }]
    expect(withSimplePanels(renamed, 'ro')).toBe(renamed)
    const added = [
      { link: { label: old.label, href: '/ghiduri' }, children: rows([...old.hrefs, '/x']) },
    ]
    expect(withSimplePanels(added, 'ro')).toBe(added)
  })

  it('replaces the previous footer, with or without Partners, and nothing else', () => {
    for (const locale of ['ro', 'en'] as const) {
      const columns = previousFooter[locale].map((hrefs) => ({ links: rows(hrefs) }))
      expect(isPreviousFooter(columns, locale)).toBe(true)
      const without = previousFooter[locale].map((hrefs) => ({
        links: rows(hrefs.filter((h) => !/parteneri|partners$/.test(h))),
      }))
      expect(isPreviousFooter(without, locale)).toBe(true)
      expect(isPreviousFooter(columns.slice(1), locale)).toBe(false)
      expect(isPreviousFooter(footerColumns(locale), locale)).toBe(false)
      // The finance step must not add its links back to the new footer.
      const fresh = footerColumns(locale)
      expect(withFinanceFooter(fresh, locale)).toBe(fresh)
    }
  })
})
