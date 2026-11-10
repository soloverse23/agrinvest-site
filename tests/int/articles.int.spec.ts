import { describe, expect, it } from 'vitest'

import { digestBody } from '@/lib/articles/digest'
import { pillarBySlug, pillars } from '@/lib/articles/pillars'
import { hrefOf } from '@/lib/content/articles'
import { article } from '@/lib/schema'
import { slugify } from '@/lib/slugify'

import { briefFields } from '../../scripts/articles/apply'
import { briefs } from '../../scripts/articles/briefs'
import { withGuidesFooter, withGuidesMenu } from '../../scripts/articles/entry-points'

describe('pillars', () => {
  it('have unique, diacritic-free slugs in both languages', () => {
    for (const l of ['ro', 'en'] as const) {
      const slugs = pillars.map((p) => p.slug[l])
      expect(new Set(slugs).size).toBe(slugs.length)
      for (const s of slugs) expect(slugify(s)).toBe(s)
    }
    expect(pillars.every((p) => p.key === p.slug.ro)).toBe(true)
  })

  it('give each pillar money links in both languages', () => {
    for (const p of pillars)
      for (const l of ['ro', 'en'] as const) {
        const links = p.links(l)
        expect(links.length).toBeGreaterThan(0)
        for (const link of links) expect(link.href.startsWith(l === 'en' ? '/en/' : '/')).toBe(true)
      }
  })

  it('resolve a pillar by its slug in each language', () => {
    expect(pillarBySlug('wheat', 'en')?.key).toBe('grau')
    expect(pillarBySlug('grau', 'en')).toBeUndefined()
  })
})

describe('article URLs', () => {
  it('build guide and news paths per language', () => {
    expect(hrefOf({ section: 'ghid', pillar: 'grau' }, 'umiditate', 'ro')).toBe(
      '/ghiduri/grau/umiditate',
    )
    expect(hrefOf({ section: 'ghid', pillar: 'porumb' }, 'density', 'en')).toBe(
      '/en/guides/corn/density',
    )
    expect(hrefOf({ section: 'stiri' }, 'receptie', 'ro')).toBe('/stiri/receptie')
    expect(hrefOf({ section: 'ghid', pillar: null }, 'x', 'ro')).toBeNull()
    expect(hrefOf({ section: 'finantare' }, 'x', 'ro')).toBeNull()
  })

  it('mark an author with a page as a Person', () => {
    const data = article({
      url: '/ghiduri/grau/x',
      headline: 'X',
      locale: 'ro',
      authorName: 'Dan',
      authorUrl: '/autori/dan',
      type: 'NewsArticle',
    }) as unknown as { '@type': string; author: { '@type': string; url: string } }
    expect(data['@type']).toBe('NewsArticle')
    expect(data.author['@type']).toBe('Person')
    expect(data.author.url).toMatch(/\/autori\/dan$/)
  })
})

describe('briefs', () => {
  it('are twenty, with known pillars and unique clean slugs', () => {
    expect(briefs).toHaveLength(20)
    const keys = new Set(pillars.map((p) => p.key))
    for (const b of briefs) {
      expect(keys.has(b.pillar)).toBe(true)
      expect(slugify(b.slug.ro)).toBe(b.slug.ro)
      expect(slugify(b.slug.en)).toBe(b.slug.en)
      expect(b.title.ro).not.toMatch(/[şţŞŢ]/)
      expect(b.links.length).toBeGreaterThan(0)
      expect(b.sources.length).toBeGreaterThan(0)
    }
    expect(new Set(briefs.map((b) => b.slug.ro)).size).toBe(20)
  })

  it('cover every /ghiduri target of the keyword map', async () => {
    const { readFileSync } = await import('node:fs')
    const targets = readFileSync('docs/audit/keyword-map.csv', 'utf8')
      .split('\n')
      .map((l) => l.split(',')[10])
      .filter((u) => u?.startsWith('/ghiduri/'))
    const planned = briefs.map((b) => `/ghiduri/${b.pillar}/${b.slug.ro}`)
    for (const t of targets) expect(planned).toContain(t)
  })

  it('turn into staff fields without a summary or text', () => {
    const fields = briefFields(briefs[0])
    expect(fields.status).toBe('aprobat')
    expect(fields.links.split('\n')).toEqual(briefs[0].links)
    expect(fields).not.toHaveProperty('summary')
  })
})

describe('editorial digest', () => {
  it('lists refreshes and late briefs', () => {
    const body = digestBody(
      [{ id: 1, title: 'Umiditate', why: 'last updated 2025-01-01' }],
      [{ id: 2, title: 'Densitate', why: 'planned for 2026-12-01, status brief' }],
    )
    expect(body).toContain('- Umiditate (#1): last updated 2025-01-01')
    expect(body).toContain('Întârziate')
    expect(digestBody([], [])).not.toContain('De actualizat')
  })
})

describe('entry points', () => {
  it('add the guides menu after prices, once', () => {
    const items = [
      { link: { href: '/cereale' } },
      { link: { href: '/preturi' } },
      { link: { href: '/contact' } },
    ]
    const next = withGuidesMenu(items, 'ro')
    expect(next.map((i) => i.link?.href)).toEqual(['/cereale', '/preturi', '/ghiduri', '/contact'])
    expect(withGuidesMenu(next, 'ro')).toBe(next)
  })

  it('add the guides footer column once', () => {
    const cols = withGuidesFooter([{ title: 'A', links: [] }], 'en')
    expect(cols).toHaveLength(2)
    expect(withGuidesFooter(cols, 'en')).toBe(cols)
  })
})
