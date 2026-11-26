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
import { withCompanyFirst, withServicesItem } from '../../scripts/site/company-first'
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

  it('moves Company to the front of the previous menu, once', () => {
    for (const locale of ['ro', 'en'] as const) {
      const wanted = navigationItems(locale)
      const [company, shop, prices, finance, news] = wanted
      expect(company!.link.href).toBe(locale === 'ro' ? '/despre' : '/en/about')
      const previous = [shop!, prices!, finance!, company!, news!]
      expect(withCompanyFirst(previous, locale)).toEqual(wanted)
      expect(withCompanyFirst(wanted, locale)).toBe(wanted)
      // A menu staff reordered is theirs.
      const theirs = [prices!, shop!, finance!, company!, news!]
      expect(withCompanyFirst(theirs, locale)).toBe(theirs)
    }
  })

  it('turns the seeded Company item into Products and services, once', () => {
    const old = {
      ro: [
        'Compania',
        ['/depozitare', '/logistica', '/despre', '/despre/cifre', '/parteneri', '/cariere'],
      ],
      en: [
        'Company',
        [
          '/en/storage',
          '/en/logistics',
          '/en/about',
          '/en/about/figures',
          '/en/partners',
          '/en/careers',
        ],
      ],
    } as const
    for (const locale of ['ro', 'en'] as const) {
      const wanted = navigationItems(locale)
      const [label, hrefs] = old[locale]
      const seeded = {
        ...wanted[0]!,
        link: { ...wanted[0]!.link, label },
        children: hrefs.map((href) => ({
          link: { label: href, href },
          description: null,
          group: null,
        })),
      }
      const live = [seeded, ...wanted.slice(1)]
      const next = withServicesItem(live, locale)
      expect(next[0]!.link.label).toBe(
        locale === 'ro' ? 'Produse și servicii' : 'Products and services',
      )
      expect(next[0]!.children).toEqual(wanted[0]!.children)
      expect(next.slice(1)).toEqual(live.slice(1))
      expect(withServicesItem(next, locale)).toBe(next)
      // Staff renamed it: theirs.
      const renamed = [{ ...seeded, link: { ...seeded.link, label: 'Noi' } }, ...wanted.slice(1)]
      expect(withServicesItem(renamed, locale)).toBe(renamed)
    }
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
