import { describe, expect, it } from 'vitest'

import {
  hasSlides,
  isOldFooter,
  isOldMenu,
  withFiguresMap,
  withoutBaseList,
  withPosters,
} from '../../scripts/redesign/apply'
import { homeLayout } from '../../scripts/seed/home'
import { footerColumns, navigationItems } from '../../scripts/site/navigation'

describe('apply:redesign', () => {
  it('replaces only the old long menu and footer, never its own', () => {
    const old = Array.from({ length: 8 }, () => ({ panel: 'links' }))
    expect(isOldMenu(old)).toBe(true)
    for (const locale of ['ro', 'en'] as const) {
      expect(isOldMenu(navigationItems(locale))).toBe(false)
      expect(isOldFooter(footerColumns(locale), locale)).toBe(false)
    }
    // A menu staff trimmed to five items is theirs.
    expect(isOldMenu(old.slice(0, 5))).toBe(false)
    expect(isOldFooter([{ links: [{ link: { href: '/preturi' } }] }], 'ro')).toBe(true)
  })

  it('writes the slider once, then only fills missing posters', () => {
    const bare = homeLayout('ro', {}) as never[]
    expect(hasSlides([{ blockType: 'hero' }, { blockType: 'baseList' }])).toBe(false)
    expect(hasSlides(bare)).toBe(true)
    const filled = withPosters(bare, 'ro', { 'hero:grain': 7, 'hero:shop': 8, 'hero:finance': 9 })
    const posters = (filled[0] as { slides: { poster: number }[] }).slides.map((s) => s.poster)
    expect(posters).toEqual([7, 8, 9])
    expect(withPosters(filled, 'ro', { 'hero:grain': 1 })).toBe(filled)
  })

  it('moves the bases map from /cereale to the figures page, once', () => {
    const cereale = [{ blockType: 'hero' }, { blockType: 'baseList' }, { blockType: 'faq' }]
    expect(withoutBaseList(cereale).map((b) => b.blockType)).toEqual(['hero', 'faq'])
    const clean = withoutBaseList(cereale)
    expect(withoutBaseList(clean)).toBe(clean)

    const figures = [
      { blockType: 'figureTable', heading: 'Despre companie', keys: ['C1'] },
      { blockType: 'figureTable', heading: 'Baze și capacitate', keys: ['S1', 'S2'] },
      { blockType: 'figureTable', heading: 'Flota', keys: ['L1'] },
    ]
    const withMap = withFiguresMap(figures)
    expect(withMap.map((b) => b.heading ?? b.blockType)).toEqual([
      'Despre companie',
      'Baze și capacitate',
      'baseList',
      'Flota',
    ])
    expect(withMap[2]).toEqual({ blockType: 'baseList', showMap: true })
    expect(withFiguresMap(withMap)).toBe(withMap)
  })
})
