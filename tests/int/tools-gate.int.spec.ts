import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { netPriceSources } from '@/lib/prices/net-price-rules'

import { railRows } from '@/lib/prices/overview'

import {
  toolsMenu,
  withDieselWidget,
  withToolsFooter,
  withToolsMenu,
} from '../../scripts/tools/entry-points'
import { ruleFindings, seriesFindings } from '../../scripts/tools/gate'

describe('check:tools rules', () => {
  const now = new Date('2026-11-10')

  it('warns on a stale or missing series, and fails once the site is indexable', () => {
    const latest = {
      'eu-oil-bulletin': new Date('2026-11-02'),
      'eu-agrifood': new Date('2026-10-01'),
    }
    const soft = seriesFindings(latest, now, false)
    expect(soft.map((f) => f.message)).toEqual([
      'eu-agrifood: newest period 40 days old (limit 14)',
      'eu-fertiliser: no data',
    ])
    expect(soft.every((f) => f.level === 'warning')).toBe(true)
    expect(seriesFindings(latest, now, true).every((f) => f.level === 'error')).toBe(true)
  })

  it('fails on a rule source checked more than a year ago', () => {
    expect(ruleFindings(netPriceSources, now)).toEqual([])
    expect(ruleFindings([{ id: 'old', checked: '2025-01-01' }], now)).toHaveLength(1)
  })
})

describe('price entry points', () => {
  const nav = [
    { link: { label: 'Cereale', href: '/cereale' } },
    { link: { label: 'Magazin', href: '/magazin' } },
  ]

  it('adds the prices panel after the grain item, once', () => {
    const once = withToolsMenu(nav, 'ro')
    expect(once.map((i) => i.link?.href)).toEqual(['/cereale', '/preturi', '/magazin'])
    expect(withToolsMenu(once, 'ro')).toBe(once)
    expect((once[1].children as unknown[]).length).toBe(toolsMenu.ro.children.length)
  })

  it('adds the footer column once', () => {
    const cols = [
      { title: 'Pentru fermieri', links: [] },
      { title: 'Companie', links: [] },
    ]
    const once = withToolsFooter(cols, 'en')
    expect(once.map((c) => c.title)).toEqual(['Pentru fermieri', 'Prices and tools', 'Companie'])
    expect(withToolsFooter(once, 'en')).toBe(once)
  })
})

describe('news visibility (Payload)', () => {
  let payload: Payload
  const ids: number[] = []

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    for (const id of ids)
      await payload.delete({ collection: 'news-items', id }).catch(() => undefined)
  })

  it('shows new headlines to visitors and hides only what staff hide', async () => {
    for (const status of ['nou', 'ascuns'] as const) {
      const doc = await payload.create({
        collection: 'news-items',
        data: {
          title: `Test ${status}`,
          url: `https://agrointel.ro/test-${status}-${Date.now()}`,
          source: 'agrointel',
          publishedAt: '2001-01-01',
          status,
        },
      })
      ids.push(doc.id)
    }
    const visible = await payload.find({
      collection: 'news-items',
      where: { id: { in: ids } },
      overrideAccess: false,
    })
    expect(visible.docs.map((d) => d.status)).toEqual(['nou'])
  })
})

describe('logistics diesel widget', () => {
  it('goes after the fleet figures, once', () => {
    const layout = [
      { blockType: 'serviceGrid' },
      { blockType: 'figureTable' },
      { blockType: 'contactCards' },
    ]
    const once = withDieselWidget(layout)
    expect(once.map((b) => b.blockType)).toEqual([
      'serviceGrid',
      'figureTable',
      'toolWidget',
      'contactCards',
    ])
    expect(withDieselWidget(once)).toBe(once)
  })
})

describe('Agrinvest price rail', () => {
  const crops = [
    { id: 1, key: 'wheat', name: 'Grâu' },
    { id: 2, key: 'maize', name: 'Porumb' },
    { id: 3, key: 'soybean', name: 'Soia' },
  ]
  const row = (crop: number, price: number, validFrom: string, base: number | null = null) => ({
    crop,
    base: base ? { id: base, name: 'B', slug: 'b' } : null,
    price,
    basis: 'la-baza' as const,
    validFrom,
  })

  it('stays hidden with no published price', () => {
    expect(railRows(crops, [])).toBeNull()
  })

  it('takes each crop’s best price on its latest date and the change from the date before', () => {
    const rail = railRows(crops, [
      row(1, 950, '2026-11-02', 7),
      row(1, 970, '2026-11-02', 8),
      row(1, 940, '2026-10-26'),
      row(2, 800, '2026-11-01'),
    ])!
    expect(rail.rows).toEqual([
      { crop: 'wheat', name: 'Grâu', price: 970, change: 30 },
      { crop: 'maize', name: 'Porumb', price: 800, change: 0 },
    ])
    expect(rail.date.toISOString().slice(0, 10)).toBe('2026-11-02')
  })
})
