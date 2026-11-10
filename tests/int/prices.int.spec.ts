import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { draftMarketNote } from '@/lib/jobs/tasks'
import {
  cropLines,
  freshness,
  lastChange,
  latestByBase,
  marketCrop,
  priceRange,
  type BuyPriceRow,
  type MarketPoint,
} from '@/lib/prices/grain'
import { marketNoteDraft } from '@/lib/prices/market-note'
import { keptFactor, netPrice, parseNetPrice, readNumber } from '@/lib/prices/net-price'
import { netPriceRules, netPriceSources } from '@/lib/prices/net-price-rules'
import { yearAgo } from '@/lib/prices/load'
import { upsertMarketPrices } from '@/lib/prices/store'
import { dataset } from '@/lib/schema'

const crops = ['wheat', 'maize', 'sunflower', 'rapeseed', 'barley']
const noLimits = () => undefined

describe('net price (scăzământ)', () => {
  it('matches FAO’s worked drying example', () => {
    // FAO: drying from 22% to 13% removes 103.5 kg of water per tonne.
    const removed = 1000 * (1 - keptFactor(22, 13))
    expect(removed).toBeCloseTo(103.45, 2)
  })

  it('deducts moisture, then impurities, only above the limits', () => {
    const r = netPrice({
      crop: 'wheat',
      quantity: 25,
      price: 1000,
      moisture: 16,
      impurities: 3,
      baseMoisture: 14,
      baseImpurities: 2,
    })
    // 25 × 84/86 = 24.419 t; × 97/98 = 24.170 t.
    expect(r.moisture.deducted).toBeCloseTo(0.581, 3)
    expect(r.impurities.deducted).toBeCloseTo(0.249, 3)
    expect(r.net.quantity).toBeCloseTo(24.17, 2)
    expect(r.net.value).toBeCloseTo(24169.77, 0)
    expect(r.gross.value).toBe(25000)

    const dry = netPrice({
      crop: 'wheat',
      quantity: 10,
      price: 900,
      moisture: 12,
      impurities: 1,
      baseMoisture: 14,
      baseImpurities: 2,
    })
    expect(dry.net.quantity).toBe(10)
    expect(dry.moisture.deducted).toBe(0)
  })

  it('flags a low hectolitre weight without changing the quantity', () => {
    const r = netPrice({
      crop: 'wheat',
      quantity: 10,
      price: 900,
      moisture: 14,
      impurities: 2,
      hectolitre: 72,
      baseMoisture: 14,
      baseImpurities: 2,
      minHectolitre: 75,
    })
    expect(r.lowHectolitre).toBe(true)
    expect(r.net.quantity).toBe(10)
  })

  it('reads Romanian and English number formats', () => {
    expect(readNumber('24,5')).toBe(24.5)
    expect(readNumber('1.250')).toBe(1250)
    expect(readNumber('1.250,5')).toBe(1250.5)
    expect(readNumber('1 250.5')).toBe(1250.5)
    expect(readNumber('14 %')).toBe(14)
    expect(Number.isNaN(readNumber('abc'))).toBe(true)
  })

  it('never assumes a limit: without published limits the base fields are required', () => {
    const params = {
      cultura: 'wheat',
      cantitate: '20',
      pret: '950',
      umiditate: '15',
      impuritati: '2',
    }
    const parsed = parseNetPrice(params, noLimits, crops)
    expect(parsed.input).toBeUndefined()
    expect(parsed.errors).toEqual({ umiditate_baza: true, impuritati_baza: true })

    const withLimits = parseNetPrice(
      params,
      (c) => (c === 'wheat' ? { moisture: 14, impurities: 2, hectolitre: 75 } : undefined),
      crops,
    )
    expect(withLimits.values.umiditate_baza).toBe('14')
    expect(withLimits.input).toMatchObject({
      baseMoisture: 14,
      baseImpurities: 2,
      minHectolitre: 75,
    })
  })

  it('reports bad fields and an unknown crop, and stays quiet before the form is sent', () => {
    expect(parseNetPrice({}, noLimits, crops)).toMatchObject({ submitted: false, errors: {} })
    const bad = parseNetPrice(
      { cultura: 'soia', cantitate: '-1', pret: 'x', umiditate: '70', impuritati: '1' },
      noLimits,
      crops,
    )
    expect(Object.keys(bad.errors).sort()).toEqual(
      ['cantitate', 'cultura', 'impuritati_baza', 'pret', 'umiditate', 'umiditate_baza'].sort(),
    )
  })

  it('cites a dated source for every rule', () => {
    for (const rule of netPriceRules) {
      expect(rule.sources.length).toBeGreaterThan(0)
      for (const id of rule.sources) {
        const source = netPriceSources.find((s) => s.id === id)
        expect(source, `${rule.id} → ${id}`).toBeDefined()
        expect(source!.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      }
    }
  })
})

const point = (series: string, market: string, period: string, price: number): MarketPoint => ({
  source: 'eu-agrifood',
  series,
  market,
  price,
  currency: 'EUR',
  unit: 't',
  period,
})

describe('grain prices (pure)', () => {
  const rows: BuyPriceRow[] = [
    {
      crop: 1,
      base: { id: 7, name: 'Vedea', slug: 'vedea' },
      price: 950,
      basis: 'la-baza',
      validFrom: '2026-11-02',
    },
    {
      crop: 1,
      base: { id: 7, name: 'Vedea', slug: 'vedea' },
      price: 940,
      basis: 'la-baza',
      validFrom: '2026-10-26',
    },
    { crop: 1, base: null, price: 930, basis: 'la-baza', validFrom: '2026-11-01' },
    { crop: 2, base: null, price: 800, basis: 'la-baza', validFrom: '2026-11-01' },
  ]

  it('keeps each base’s latest price and gives the range', () => {
    const latest = latestByBase(rows, 1)
    expect(latest.map((r) => r.price)).toEqual([950, 930])
    expect(priceRange(latest)).toMatchObject({ min: 930, max: 950, places: 2 })
    expect(priceRange([])).toBeNull()
  })

  it('groups a crop’s EU lines over 52 weeks and finds the latest change', () => {
    const now = new Date('2026-11-10')
    const points = [
      point('milling-wheat', 'Constanța / FOB', '2026-10-26', 200),
      point('milling-wheat', 'Constanța / FOB', '2026-11-02', 204.5),
      point('feed-wheat', 'Constanța / FOB', '2026-11-02', 190),
      point('feed-maize', 'Constanța / FOB', '2026-11-02', 180),
      point('milling-wheat', 'Constanța / FOB', '2025-01-01', 150),
      point('durum-wheat', 'RO', '2026-11-02', 300),
    ]
    const lines = cropLines(points, 'wheat', now)
    expect(lines.map((l) => l.series)).toEqual(['milling-wheat', 'feed-wheat'])
    expect(lines[0].points).toHaveLength(2)
    expect(lastChange(lines[0])).toMatchObject({ value: 204.5, change: 4.5 })
    expect(marketCrop({ source: 'eu-oil-bulletin', series: 'diesel' })).toBeNull()
  })

  it('marks a series stale after its cadence plus a week', () => {
    const now = new Date('2026-11-10')
    expect(freshness(new Date('2026-11-02'), 'eu-agrifood', now)).toBe('ready')
    expect(freshness(new Date('2026-10-20'), 'eu-agrifood', now)).toBe('stale')
    expect(freshness(undefined, 'eu-agrifood', now)).toBe('empty')
  })

  it('moves the market cache key once a week', () => {
    expect(yearAgo(new Date('2026-11-10'))).toBe(yearAgo(new Date('2026-11-15')))
    expect(yearAgo(new Date('2026-11-10'))).not.toBe(yearAgo(new Date('2026-11-17')))
  })
})

describe('market note draft (pure)', () => {
  const lines = cropLines(
    [
      point('milling-wheat', 'Constanța / FOB', '2026-10-12', 198),
      point('milling-wheat', 'Constanța / FOB', '2026-11-02', 200),
      point('milling-wheat', 'Constanța / FOB', '2026-11-09', 204),
    ],
    'wheat',
    new Date('2026-11-10'),
  )

  it('writes only what the data says, in both languages', () => {
    const week = new Date('2026-11-09')
    const ro = marketNoteDraft(week, [{ name: 'Grâu', lines, agrinvest: null }], 'ro')!
    expect(ro.slug).toBe('nota-2026-11-09')
    expect(ro.markdown).toContain('## Grâu')
    expect(ro.markdown).toContain('Milling wheat')
    expect(ro.markdown).toContain('+4 față de săptămâna dinainte')
    expect(ro.markdown).toContain('+6 în patru săptămâni')
    expect(ro.markdown).toContain('Prețul Agrinvest: la cerere.')
    const en = marketNoteDraft(
      week,
      [{ name: 'Wheat', lines, agrinvest: { min: 950, max: 980 } }],
      'en',
    )!
    expect(en.slug).toBe('note-2026-11-09')
    expect(en.markdown).toContain('Agrinvest buys at 950–980 lei/t, by base.')
  })

  it('writes nothing without data', () => {
    expect(marketNoteDraft(new Date(), [{ name: 'Grâu', lines: [] }], 'ro')).toBeNull()
  })
})

describe('Dataset JSON-LD', () => {
  it('names the period, the sources and one licence', () => {
    const d = dataset({
      url: '/preturi/grau',
      name: 'Prețuri grâu',
      description: 'x'.repeat(60),
      locale: 'ro',
      temporalCoverage: '2025-11-10/2026-11-09',
      variables: ['Preț Agrinvest'],
      sources: [
        { name: 'Agrinvest', url: '/preturi/grau' },
        {
          name: 'EU',
          url: 'https://agridata.ec.europa.eu',
          license: 'https://creativecommons.org/licenses/by/4.0/',
        },
      ],
    }) as unknown as Record<string, unknown>
    expect(d['@type']).toBe('Dataset')
    expect(d.license).toBe('https://creativecommons.org/licenses/by/4.0/')
    expect(d.temporalCoverage).toBe('2025-11-10/2026-11-09')
    expect(d.isBasedOn).toHaveLength(2)
  })
})

describe('market note job (Payload)', () => {
  let payload: Payload
  // A week far in the future, so the test never meets real data.
  const now = new Date('2099-03-12T10:00:00Z')

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    await payload.delete({ collection: 'market-prices', where: { series: { like: 'test-wheat' } } })
    await payload.delete({ collection: 'guides', where: { key: { like: 'piata-2099-' } } })
  })

  it('drafts the week’s note once, in both languages, and never publishes it', async () => {
    const empty = await draftMarketNote(payload, new Date('2098-01-07T10:00:00Z'))
    expect(empty).toMatchObject({ skipped: 'no data' })

    const base = {
      source: 'eu-agrifood' as const,
      market: 'Constanța / FOB',
      currency: 'EUR',
      unit: 't',
      fetchedAt: now,
    }
    await upsertMarketPrices(payload, [
      { ...base, series: 'milling-test-wheat', price: 210, period: new Date('2099-03-02') },
      { ...base, series: 'milling-test-wheat', price: 214, period: new Date('2099-03-09') },
    ])
    const first = await draftMarketNote(payload, now)
    expect(first).toEqual({ created: 'piata-2099-03-09' })
    expect(await draftMarketNote(payload, now)).toMatchObject({ skipped: 'exists' })

    const [ro] = (
      await payload.find({
        collection: 'guides',
        where: { key: { equals: 'piata-2099-03-09' } },
        draft: true,
        locale: 'ro',
        depth: 0,
      })
    ).docs
    expect(ro).toMatchObject({ section: 'piata', slug: 'nota-2099-03-09', _status: 'draft' })
    const en = await payload.findByID({
      collection: 'guides',
      id: ro.id,
      draft: true,
      locale: 'en',
    })
    expect(en.slug).toBe('note-2099-03-09')
    const visible = await payload.find({
      collection: 'guides',
      where: { key: { equals: 'piata-2099-03-09' } },
      overrideAccess: false,
    })
    expect(visible.docs).toHaveLength(0)
  })
})
