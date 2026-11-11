import { describe, expect, it } from 'vitest'

import { cardAction, seasonalCategory, type ProductCardData } from '@/lib/shop/catalogue'

import { iconUpdates, placeholderPromo, seedIcons } from '../../scripts/shop-redesign/apply'
import { categoryPath } from '@/i18n/routes'
import { activePromo } from '@/lib/shop/catalogue'

const variant = (
  sku: string,
  price: number | null,
  stock: 'in-stock' | 'on-request' | 'out-of-stock' = 'in-stock',
) => ({ sku, size: 1, unit: 'l', price, stock })

const product = (over: Partial<ProductCardData> = {}): ProductCardData => ({
  id: 1,
  slug: 'p',
  name: 'P',
  productType: 'protection',
  commerceStatus: 'pilot',
  category: { id: 3, slug: 'erbicide', name: 'Erbicide', parent: 2 },
  secondary: [],
  crops: [],
  ingredients: [],
  variants: [variant('A', 99)],
  order: { saleStopped: false, ghs06: false, registered: true, validUntil: null },
  updatedAt: '2026-11-11T00:00:00Z',
  ...over,
})

describe('card actions (7c.1)', () => {
  it('offers quick add for one buyable pack', () => {
    expect(cardAction(product())).toEqual({ kind: 'add', sku: 'A' })
    expect(
      cardAction(product({ variants: [variant('A', 99), variant('B', 1380, 'on-request')] })),
    ).toEqual({ kind: 'add', sku: 'A' })
  })

  it('sends several buyable packs to the product page', () => {
    expect(cardAction(product({ variants: [variant('A', 99), variant('B', 1580)] }))).toEqual({
      kind: 'choose',
    })
  })

  it('offers the quick request when nothing can be bought online', () => {
    expect(cardAction(product({ variants: [variant('A', null)] }))).toEqual({
      kind: 'request',
      reason: 'no-price',
    })
    expect(cardAction(product({ variants: [variant('A', 99, 'on-request')] }))).toMatchObject({
      reason: 'on-request',
    })
    expect(cardAction(product({ variants: [variant('A', 99, 'out-of-stock')] }))).toMatchObject({
      reason: 'out-of-stock',
    })
  })

  it('applies the OUG 53/2025 checks before anything else', () => {
    const order = { saleStopped: false, ghs06: false, registered: true, validUntil: null }
    expect(cardAction(product({ order: { ...order, ghs06: true } }))).toEqual({
      kind: 'request',
      reason: 'ghs06',
    })
    expect(cardAction(product({ order: { ...order, registered: false } }))).toMatchObject({
      reason: 'registration-missing',
    })
    expect(
      cardAction(
        product({ order: { ...order, validUntil: '2020-01-01' } }),
        new Date('2026-11-11'),
      ),
    ).toMatchObject({ reason: 'registration-expired' })
    expect(cardAction(product({ order: { ...order, saleStopped: true } }))).toMatchObject({
      reason: 'sale-stopped',
    })
    // Seeds and fertilisers need no registration number.
    expect(
      cardAction(product({ productType: 'seed', order: { ...order, registered: false } })),
    ).toMatchObject({ kind: 'add' })
  })
})

describe('shop landing promo (7c.1)', () => {
  const seeds = { id: 1, slug: 'seminte', name: 'Semințe', parent: null }
  const herbicides = { id: 3, slug: 'erbicide', name: 'Erbicide', parent: 2 }
  const catalogue = [
    product({ id: 1, productType: 'seed', category: seeds }),
    product({ id: 2, productType: 'seed', category: seeds }),
    product({ id: 3, category: herbicides }),
    product({ id: 4, category: herbicides }),
    product({ id: 5, category: herbicides }),
    product({ id: 6, category: herbicides, variants: [variant('X', 1, 'out-of-stock')] }),
  ]

  it('defaults to the season’s category with the most in stock', () => {
    expect(seasonalCategory(catalogue, new Date('2026-10-01'))).toMatchObject({
      slug: 'seminte',
      inStock: 2,
    })
    expect(seasonalCategory(catalogue, new Date('2026-04-01'))).toMatchObject({
      slug: 'erbicide',
      inStock: 3,
    })
    // December wants fertiliser or seed: seeds win over the bigger herbicide range.
    expect(seasonalCategory(catalogue, new Date('2026-12-01'))?.slug).toBe('seminte')
    expect(seasonalCategory([], new Date())).toBeNull()
  })

  it('shows the staff promo until the end of its last day', () => {
    const promo = { title: 'Sămânță de toamnă', link: { href: '/magazin/seminte' } }
    expect(activePromo(promo)).toBe(promo)
    expect(activePromo({ ...promo, link: { href: '' } })).toBeNull()
    expect(activePromo({ ...promo, title: ' ' })).toBeNull()
    const endsAt = '2026-11-11T00:00:00.000Z'
    expect(activePromo({ ...promo, endsAt }, new Date('2026-11-11T18:00:00'))).not.toBeNull()
    expect(activePromo({ ...promo, endsAt }, new Date('2026-11-13T00:00:00'))).toBeNull()
  })
})

describe('apply:shop category icons (7c.1)', () => {
  it('maps every seeded category', () => {
    expect(seedIcons).toMatchObject({
      seminte: 'seed',
      'protectia-plantelor': 'protection',
      erbicide: 'herbicide',
      nutritie: 'fertiliser',
      'agricultura-bio': 'bio',
    })
  })

  it('fills only empty icons', () => {
    expect(
      iconUpdates([
        { id: 1, slug: 'seminte', icon: null },
        { id: 2, slug: 'erbicide', icon: 'other' },
        { id: 3, slug: 'necunoscut', icon: null },
      ]),
    ).toEqual([[1, 'seed']])
  })
})

describe('apply:shop placeholder promo (7c.1)', () => {
  it('is complete, links to a real category in each language and states no figures', () => {
    for (const locale of ['ro', 'en'] as const) {
      const promo = placeholderPromo[locale]
      expect(activePromo(promo)).toBeTruthy()
      expect(promo.link.href).toBe(
        categoryPath(locale === 'ro' ? 'ingrasaminte' : 'fertilisers', locale),
      )
      expect(JSON.stringify(promo)).not.toMatch(/\d/)
    }
  })
})
