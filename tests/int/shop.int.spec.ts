import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { staffRequest } from '@/access'
import type { Product } from '@/payload-types'
import {
  hubMinProducts,
  isHubIndexable,
  liveBlockers,
  productGaps,
  unitPriceOf,
} from '@/lib/shop/rules'

describe('shop rules', () => {
  it('compares pack sizes per litre or kilogram', () => {
    expect(unitPriceOf({ price: 720, size: 10, unit: 'l' })).toBe(72)
    expect(unitPriceOf({ price: 30, size: 500, unit: 'ml' })).toBe(60)
    expect(unitPriceOf({ price: 45, size: 250, unit: 'g' })).toBe(180)
    expect(unitPriceOf({ price: 2800, size: 1, unit: 't' })).toBe(2.8)
    expect(unitPriceOf({ price: 900, size: 50000, unit: 'seeds' })).toBeNull()
    expect(unitPriceOf({ size: 10, unit: 'l' })).toBeNull()
  })

  it('asks each product type for its own data', () => {
    expect(productGaps({ productType: 'protection' })).toEqual(
      expect.arrayContaining(['technical', 'doses', 'variants', 'price-unconfirmed']),
    )
    const seed = productGaps({
      productType: 'seed',
      seed: { species: 'Grâu', variety: 'Zanzibar', sowingRate: '220 kg/ha' },
    })
    expect(seed).not.toContain('technical')
    expect(seed).not.toContain('doses')
  })

  it('keeps thin or unwritten hubs out of the index', () => {
    const hub = { indexable: true, intro: 'Text', productCount: hubMinProducts }
    expect(isHubIndexable(hub)).toBe(true)
    expect(isHubIndexable({ ...hub, productCount: hubMinProducts - 1 })).toBe(false)
    expect(isHubIndexable({ ...hub, intro: '  ' })).toBe(false)
    expect(isHubIndexable({ ...hub, indexable: false })).toBe(false)
    expect(isHubIndexable({ ...hub, noindex: true })).toBe(false)
  })

  it('blocks going live on an expired registration', () => {
    const confirmed = {
      productType: 'protection' as const,
      variants: [{ sku: 'A', size: 1, unit: 'l' as const, price: 10, stock: 'in-stock' as const }],
      verification: { price: { status: 'confirmed' } } as Product['verification'],
    }
    const now = new Date('2026-11-04')
    expect(liveBlockers(confirmed, now)).toEqual(['The registration number is missing.'])
    expect(
      liveBlockers(
        {
          ...confirmed,
          protection: { registrationNumber: '1', registrationValidUntil: '2025-01-01' },
        },
        now,
      ),
    ).toEqual(['The registration has expired.'])
    expect(liveBlockers({ ...confirmed, protection: { registrationNumber: '1' } }, now)).toEqual([])
  })
})

describe('database schema', () => {
  it('keeps identifiers within the Postgres limit', () => {
    // A longer name is cut by Postgres, so every schema push sees a difference and rebuilds it.
    const dir = 'src/migrations'
    const latest = readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .at(-1)!
    const { tables, enums } = JSON.parse(readFileSync(join(dir, latest), 'utf8'))
    const names = [
      ...Object.keys(enums),
      ...Object.entries<Record<string, object>>(tables).flatMap(([table, t]) => [
        table,
        ...Object.keys(t.foreignKeys),
        ...Object.keys(t.indexes),
        ...Object.keys(t.uniqueConstraints),
      ]),
    ]
    expect(names.filter((name) => name.length > 63)).toEqual([])
  })
})

describe('staff access', () => {
  it('trusts only accounts of the users collection', () => {
    expect(staffRequest({ user: { collection: 'users' } as never })).toBe(true)
    expect(staffRequest({ user: { collection: 'customers' } as never })).toBe(false)
    expect(staffRequest({ user: null })).toBe(false)
  })
})

describe('shop model', () => {
  let payload: Payload
  const created: {
    collection: 'products' | 'categories' | 'brands' | 'active-ingredients'
    id: number
  }[] = []
  let category: number
  const sku = (s: string) => `TEST-${s}`

  const variant = (s: string, price = 100) => ({
    sku: sku(s),
    size: 10,
    unit: 'l' as const,
    price,
    stock: 'in-stock' as const,
  })

  const product = async (slug: string, data: Record<string, unknown> = {}) => {
    const doc = await payload.create({
      collection: 'products',
      locale: 'ro',
      data: {
        name: `Test ${slug}`,
        slug: `test-${slug}`,
        productType: 'protection',
        primaryCategory: category,
        _status: 'published',
        ...data,
      } as never,
    })
    created.push({ collection: 'products', id: doc.id })
    return doc
  }

  const history = async (id: number) =>
    (
      await payload.find({
        collection: 'price-history',
        where: { product: { equals: id } },
        sort: 'date',
        pagination: false,
      })
    ).docs

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const { docs } = await payload.find({
      collection: 'categories',
      where: { slug: { equals: 'erbicide' } },
      locale: 'ro',
      limit: 1,
    })
    category = docs[0].id
  })

  afterAll(async () => {
    await payload.db.deleteMany({
      collection: 'price-history',
      where: { sku: { like: 'TEST-' } },
    })
    for (const { collection, id } of created.reverse()) await payload.delete({ collection, id })
  })

  it('keeps shop-only crops apart from the grain crops', async () => {
    const count = async (isGrain: boolean) =>
      (await payload.count({ collection: 'crops', where: { isGrain: { equals: isGrain } } }))
        .totalDocs
    expect(await count(true)).toBe(5)
    expect(await count(false)).toBeGreaterThan(0)
  })

  it('has the category tree with hub slugs reserved', async () => {
    const { docs } = await payload.find({
      collection: 'categories',
      where: { slug: { equals: 'erbicide' } },
      locale: 'en',
      depth: 1,
      joins: false,
    })
    expect(docs).toHaveLength(0)
    const en = await payload.findByID({
      collection: 'categories',
      id: category,
      locale: 'en',
      depth: 1,
    })
    expect(en.slug).toBe('herbicides')
    expect(typeof en.parent === 'object' && en.parent?.slug).toBe('crop-protection')
    await expect(
      payload.create({
        collection: 'categories',
        locale: 'ro',
        data: { name: 'Cultura', slug: 'cultura', role: 'category' },
      }),
    ).rejects.toThrow()
  })

  it('refuses a group or theme as primary category', async () => {
    const { docs } = await payload.find({
      collection: 'categories',
      where: { role: { equals: 'theme' } },
      limit: 1,
    })
    await expect(product('theme', { primaryCategory: docs[0].id })).rejects.toThrow()
  })

  it('calculates the unit price and keeps SKUs unique across products', async () => {
    const doc = await product('sku', { variants: [variant('A', 720)] })
    expect(doc.variants?.[0].unitPrice).toBe(72)
    const skuError = { data: { errors: [{ message: expect.stringContaining('SKU') }] } }
    await expect(product('sku2', { variants: [variant('A')] })).rejects.toMatchObject(skuError)
    await expect(product('sku3', { variants: [variant('B'), variant('B')] })).rejects.toMatchObject(
      skuError,
    )
    // Saving a product again does not clash with its own SKU.
    await expect(
      payload.update({ collection: 'products', id: doc.id, data: { variants: doc.variants } }),
    ).resolves.toBeTruthy()
  })

  it('records published prices only when they change', async () => {
    const doc = await product('history', { variants: [variant('H', 100)] })
    expect((await history(doc.id)).map((r) => r.price)).toEqual([100])

    await payload.update({
      collection: 'products',
      id: doc.id,
      locale: 'en',
      data: { name: 'Test EN' },
    })
    expect(await history(doc.id)).toHaveLength(1)

    const rows = doc.variants!.map((v) => ({ ...v, price: 120 }))
    await payload.update({
      collection: 'products',
      id: doc.id,
      draft: true,
      data: { variants: rows, _status: 'draft' },
    })
    expect(await history(doc.id)).toHaveLength(1)

    await payload.update({
      collection: 'products',
      id: doc.id,
      data: { variants: rows, _status: 'published' },
    })
    expect((await history(doc.id)).map((r) => r.price)).toEqual([100, 120])
  })

  it('moves to live only when the rules allow it, also on a partial update', async () => {
    const doc = await product('live', { variants: [variant('L')] })
    const live = () =>
      payload.update({ collection: 'products', id: doc.id, data: { commerceStatus: 'live' } })
    await expect(live()).rejects.toThrow()
    await payload.update({
      collection: 'products',
      id: doc.id,
      data: {
        verification: { price: { status: 'confirmed' } },
        protection: { registrationNumber: 'TEST/1' },
      },
    })
    expect((await live()).commerceStatus).toBe('live')
  })

  it('shows the public a pilot product, but no drafts and no internal fields', async () => {
    const pilot = await product('public', { sourceNotes: 'internal' })
    const draft = await product('draft', { _status: 'draft' })
    const seen = await payload.find({
      collection: 'products',
      where: { id: { in: [pilot.id, draft.id] } },
      overrideAccess: false,
    })
    expect(seen.docs.map((d) => d.id)).toEqual([pilot.id])
    expect(seen.docs[0].commerceStatus).toBe('pilot')
    expect(seen.docs[0].sourceNotes).toBeUndefined()
    expect(seen.docs[0].gaps).toBeUndefined()

    const staff = await payload.findByID({
      collection: 'products',
      id: pilot.id,
      overrideAccess: false,
      user: { id: 1, collection: 'users', email: 'staff@test.ro' } as never,
    })
    expect(staff.sourceNotes).toBe('internal')
    expect(staff.gaps).toContain('price-unconfirmed')
  })

  it('lists products on their category, brand and ingredient', async () => {
    const brand = await payload.create({
      collection: 'brands',
      data: { name: 'Test Brand', slug: 'test-brand', _status: 'published' },
    })
    created.push({ collection: 'brands', id: brand.id })
    const ingredient = await payload.create({
      collection: 'active-ingredients',
      locale: 'ro',
      data: { name: 'Test ingredient', slug: 'test-ingredient', _status: 'published' },
    })
    created.push({ collection: 'active-ingredients', id: ingredient.id })
    const doc = await product('joins', {
      brand: brand.id,
      protection: {
        activeIngredients: [{ ingredient: ingredient.id, concentration: 250, unit: 'g/l' }],
      },
    })

    const ids = (join?: { docs?: unknown[] } | null) =>
      (join?.docs ?? []).map((d) => (typeof d === 'object' ? (d as { id: number }).id : d))
    const b = await payload.findByID({ collection: 'brands', id: brand.id, depth: 0 })
    expect(ids(b.products)).toEqual([doc.id])
    const i = await payload.findByID({
      collection: 'active-ingredients',
      id: ingredient.id,
      depth: 0,
    })
    expect(ids(i.products)).toEqual([doc.id])
    const c = await payload.findByID({ collection: 'categories', id: category, depth: 0 })
    expect(ids(c.products)).toContain(doc.id)
  })

  it('keeps product documents private until reuse is allowed', async () => {
    const read = (await import('@/collections/Documents')).Documents.access!.read!
    expect(await read({ req: { user: null } } as never)).toEqual({
      rights: { not_equals: 'pending' },
    })
    expect(await read({ req: { user: { collection: 'users' } } } as never)).toBe(true)
  })
})
