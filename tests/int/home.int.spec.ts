import { describe, expect, it } from 'vitest'

import { capacitySteps } from '@ds/patterns/CountyMap'
import { pickProducts } from '@/components/HomeShop'
import { homeUi } from '@/i18n/home'
import { formatWhen } from '@/lib/format'
import { cropSeries } from '@/lib/prices/overview'
import type { MarketPoint } from '@/lib/prices/grain'
import type { ProductCardData } from '@/lib/shop/catalogue'

describe('home: price series for the live panel', () => {
  const crops = [
    { id: 1, key: 'wheat', name: 'Grâu', slug: 'grau' },
    { id: 2, key: 'maize', name: 'Porumb', slug: 'porumb' },
    { id: 3, key: 'barley', name: 'Orz', slug: 'orz' },
    { id: 4, key: 'soybean', name: 'Soia', slug: 'soia' },
  ]
  const buy = (crop: number, price: number, validFrom: string) => ({
    crop,
    base: null,
    price,
    basis: 'la-baza' as const,
    validFrom,
  })
  const market = (series: string, price: number, period: string): MarketPoint => ({
    source: 'eu-agrifood',
    series,
    market: 'Constanța',
    price,
    currency: 'EUR',
    unit: 't',
    period,
  })
  const now = new Date('2026-11-10')

  it('draws Agrinvest’s best price per day, falls back to the EU line, and skips the rest', () => {
    const series = cropSeries(
      crops,
      [
        buy(1, 950, '2026-11-02T08:00:00Z'),
        buy(1, 970, '2026-11-02T09:00:00Z'),
        buy(1, 940, '2026-10-26T08:00:00Z'),
        buy(2, 800, '2026-11-01T08:00:00Z'),
      ],
      [
        market('milling wheat', 210, '2026-10-20'),
        market('feed maize', 190, '2026-10-20'),
        market('feed maize', 195, '2026-10-27'),
      ],
      now,
    )
    expect(series.map((s) => [s.crop, s.source, s.unit])).toEqual([
      ['wheat', 'agrinvest', 'lei/t'],
      ['maize', 'market', '€/t'],
    ])
    expect(series[0].points.map((p) => p.value)).toEqual([940, 970])
    expect(series[1].points.map((p) => p.value)).toEqual([190, 195])
  })
})

describe('home: shop strip', () => {
  const product = (
    id: number,
    top: number,
    { image = true, price = 10, updatedAt = '2026-11-01' } = {},
  ): ProductCardData => ({
    id,
    slug: `p${id}`,
    name: `P${id}`,
    productType: 'other',
    commerceStatus: 'pilot',
    category: { id: top * 10, slug: `c${top}`, name: `C${top}`, parent: top },
    secondary: [],
    crops: [],
    ingredients: [],
    variants: [{ sku: `s${id}`, size: 1, unit: 'kg', price, stock: 'in-stock' }],
    image: image ? { url: `/p${id}.webp`, alt: '' } : null,
    updatedAt,
  })

  it('takes products with a photo and a price, in turn from each top category', () => {
    const picks = pickProducts([
      product(1, 1),
      product(2, 1),
      product(3, 1),
      product(4, 1),
      product(5, 2),
      product(6, 3),
      product(7, 2, { image: false }),
      product(8, 3, { price: null as unknown as number }),
    ])
    expect(picks.map((p) => p.id)).toEqual([1, 5, 6, 2, 3, 4])
  })
})

describe('home: county map scale', () => {
  it('splits the counties into thirds by capacity', () => {
    expect(
      capacitySteps([
        86_000, 31_000, 27_000, 20_000, 19_500, 18_000, 18_000, 13_500, 10_000, 7_000, 2_000,
      ]),
    ).toEqual([13_500, 20_000, 86_000])
  })

  it('uses each value as its own step when there are three or fewer, and ignores unknowns', () => {
    expect(capacitySteps([0, 5_000, 9_000])).toEqual([5_000, 9_000])
    expect(capacitySteps([0])).toEqual([])
  })
})

describe('home: copy and times', () => {
  it('writes Romanian product counts with "de" from 20 on', () => {
    const count = homeUi.ro.shop.products
    expect([1, 17, 20, 36, 101, 119, 120, 200].map(count)).toEqual([
      '1 produs',
      '17 produse',
      '20 de produse',
      '36 de produse',
      '101 produse',
      '119 produse',
      '120 de produse',
      '200 de produse',
    ])
  })

  it('shows Romanian time, and the date alone for day-only sources', () => {
    expect(formatWhen(new Date('2026-11-11T07:40:00Z'), 'ro')).toBe('11 nov., 09:40')
    expect(formatWhen(new Date('2026-11-10'), 'en')).toBe('10 Nov')
  })
})
