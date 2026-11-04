import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { applyEnrichment } from '../../scripts/products/apply'
import { viewOfDoc, type View } from '../../scripts/products/view'
import type { ProductFile } from '../../scripts/products/schema'

/**
 * The enrichment step against a real database, with throw-away products (`zz-enrich-*`): it
 * writes what the file says, leaves what staff changed, and can run any number of times.
 */
const slug = 'zz-enrich-test'
const silent = () => {}

const file = (over: Partial<ProductFile> = {}): ProductFile =>
  ({
    slug,
    primaryKeyword: { ro: 'erbicid test', en: 'test herbicide' },
    brand: 'zz-enrich-brand',
    category: 'erbicide',
    secondaryCategories: [],
    crops: ['maize'],
    targets: [],
    text: {
      ro: {
        summary: 'Rezumat de test.',
        description: 'Prima descriere.\n\nA doua descriere.',
        faq: [{ question: 'Întrebare?', answer: 'Răspuns.' }],
        seo: {
          title: 'Titlu de test pentru produs',
          description: 'Descriere de test pentru produs.',
        },
      },
      en: {
        summary: 'Test summary.',
        description: 'First description.',
        faq: [],
        seo: { title: 'Test title for a product', description: 'Test description for a product.' },
      },
    },
    protection: {
      activeIngredients: [{ name: 'zz-test-substanta', concentration: 100, unit: 'g/l' }],
      formulation: 'SC',
      registrationNumber: '1PC/01.01.2020',
      professionalUse: true,
      modeOfAction: { ro: 'Mod de acțiune', en: 'Mode of action' },
    },
    doses: [
      {
        cropText: { ro: 'Porumb', en: 'Maize' },
        crops: ['maize'],
        targets: [],
        doseText: { ro: '1 l/ha', en: '1 l/ha' },
        doseMin: 1,
        doseMax: 1,
        doseUnit: 'l/ha',
      },
    ],
    sources: {
      technical: [{ url: 'https://example.org/a', kind: 'register', retrieved: '2026-11-04' }],
      doses: [{ url: 'https://example.org/b', kind: 'label', retrieved: '2026-11-04' }],
    },
    gaps: ['Waiting period not found.'],
    conflicts: [],
    ...over,
  }) as ProductFile

describe('enrichment apply step', () => {
  let payload: Payload
  let dir: string
  let productId: number
  let baseline: Map<string, View>

  const run = (f: ProductFile) => {
    writeFileSync(join(dir, 'products', `${slug}.json`), JSON.stringify(f))
    return applyEnrichment(payload, silent, {
      products: join(dir, 'products'),
      hubs: join(dir, 'hubs'),
      targets: join(dir, 'targets.json'),
      baseline,
    })
  }
  const read = (locale: 'ro' | 'en') =>
    payload.findByID({ collection: 'products', id: productId, locale, depth: 0, draft: true })

  beforeAll(async () => {
    payload = await getPayload({ config })
    dir = mkdtempSync(join(tmpdir(), 'enrich-'))
    await import('node:fs').then((fs) => {
      fs.mkdirSync(join(dir, 'products'))
      fs.mkdirSync(join(dir, 'hubs'))
    })
    writeFileSync(
      join(dir, 'hubs', 'brands.json'),
      JSON.stringify([
        {
          slug: 'zz-enrich-brand',
          name: 'ZZ Enrich Brand',
          intro: { ro: 'Intro ro', en: 'Intro en' },
          seo: {
            ro: { title: 'Titlu producător de test', description: 'Descriere producător de test.' },
            en: { title: 'Test brand title here', description: 'Test brand description here.' },
          },
        },
      ]),
    )
    const category = await payload.find({
      collection: 'categories',
      where: { slug: { equals: 'erbicide' } },
      depth: 0,
      limit: 1,
    })
    const doc = await payload.create({
      collection: 'products',
      locale: 'ro',
      data: {
        name: 'ZZ Enrich test',
        slug,
        productType: 'protection',
        primaryCategory: category.docs[0].id,
        variants: [{ sku: 'ZZ-ENRICH-1', size: 1, unit: 'l', price: 10, stock: 'in-stock' }],
        _status: 'published',
      } as never,
      context: { skipChildren: true },
    })
    productId = doc.id
    // The importer gives every product its English name too.
    await payload.update({
      collection: 'products',
      id: doc.id,
      locale: 'en',
      data: { name: 'ZZ Enrich test' },
      context: { skipChildren: true },
    })
    // What staff left untouched looks like this: the product as created.
    const created = await payload.findByID({
      collection: 'products',
      id: doc.id,
      locale: 'all',
      depth: 0,
      draft: true,
    })
    const none = () => undefined
    baseline = new Map([
      [
        slug,
        viewOfDoc(created as never, {
          brand: none,
          category: (id) => (id === created.primaryCategory ? 'erbicide' : undefined),
          crop: none,
          target: none,
          ingredient: none,
        }),
      ],
    ])
  })

  afterAll(async () => {
    await payload.delete({ collection: 'products', id: productId, context: { skipChildren: true } })
    for (const [collection, key, value] of [
      ['brands', 'slug', 'zz-enrich-brand'],
      ['active-ingredients', 'slug', 'zz-test-substanta'],
    ] as const)
      await payload.delete({
        collection,
        where: { [key]: { equals: value } },
        context: { skipChildren: true },
      })
    rmSync(dir, { recursive: true, force: true })
  })

  it('writes every group of an untouched product, in both languages', async () => {
    const report = await run(file())
    const r = report.products.find((p) => p.slug === slug)!
    expect(r.written).toEqual(
      expect.arrayContaining(['identity', 'text.ro', 'text.en', 'technical', 'doses']),
    )
    const ro = await read('ro')
    const en = await read('en')
    expect(ro.summary).toBe('Rezumat de test.')
    expect(en.summary).toBe('Test summary.')
    expect(ro.protection?.registrationNumber).toBe('1PC/01.01.2020')
    expect(ro.protection?.modeOfAction).toBe('Mod de acțiune')
    expect(en.protection?.modeOfAction).toBe('Mode of action')
    // The dose row keeps both languages: one row, not two.
    expect(ro.protection?.doses).toHaveLength(1)
    expect(en.protection?.doses).toHaveLength(1)
    expect(ro.protection?.doses?.[0].cropText).toBe('Porumb')
    expect(en.protection?.doses?.[0].cropText).toBe('Maize')
    expect(ro.verification?.technical?.source).toBe('https://example.org/a')
    // Only Agrinvest confirms.
    expect(ro.verification?.technical?.status).toBe('to-confirm')
    expect(ro.verification?.doses?.status).toBe('to-confirm')
    // Packs and prices are never touched.
    expect(ro.variants?.[0]).toMatchObject({ sku: 'ZZ-ENRICH-1', price: 10 })
    expect(ro.commerceStatus).toBe('pilot')
  })

  it('does nothing the second time', async () => {
    const report = await run(file())
    const r = report.products.find((p) => p.slug === slug)!
    expect(r.written).toEqual([])
    expect(r.conflicts).toEqual([])
  })

  it('leaves a group that staff changed, and still updates the others', async () => {
    await payload.update({
      collection: 'products',
      id: productId,
      locale: 'ro',
      data: { summary: 'Rezumat scris de personal.' },
      context: { skipChildren: true },
    })
    const changed = file()
    changed.text.ro.summary = 'Rezumat nou din fișier.'
    changed.text.en.summary = 'New summary from the file.'
    changed.protection!.formulation = 'EC'
    const report = await run(changed)
    const r = report.products.find((p) => p.slug === slug)!
    expect(r.conflicts).toEqual(['text.ro'])
    expect(r.written).toEqual(expect.arrayContaining(['text.en', 'technical']))
    expect((await read('ro')).summary).toBe('Rezumat scris de personal.')
    expect((await read('en')).summary).toBe('New summary from the file.')
    expect((await read('ro')).protection?.formulation).toBe('EC')
    // The conflict stays reported, and stays unwritten, on every run.
    const again = await run(changed)
    expect(again.products.find((p) => p.slug === slug)!.conflicts).toEqual(['text.ro'])
    expect((await read('ro')).summary).toBe('Rezumat scris de personal.')
  })

  it('does not downgrade a status that Agrinvest confirmed', async () => {
    await payload.update({
      collection: 'products',
      id: productId,
      data: { verification: { doses: { status: 'confirmed' } } },
      context: { skipChildren: true },
    })
    const report = await run(file())
    expect(report.products.find((p) => p.slug === slug)!.conflicts).toContain('verification')
    expect((await read('ro')).verification?.doses?.status).toBe('confirmed')
  })

  it('skips a file whose product does not exist', async () => {
    const report = await applyEnrichment(payload, silent, {
      products: join(dir, 'products'),
      hubs: join(dir, 'hubs'),
      targets: join(dir, 'targets.json'),
    })
    expect(report.missing).toEqual([])
    writeFileSync(
      join(dir, 'products', 'zz-enrich-missing.json'),
      JSON.stringify({ ...file(), slug: 'zz-enrich-missing' }),
    )
    const second = await applyEnrichment(payload, silent, {
      products: join(dir, 'products'),
      hubs: join(dir, 'hubs'),
      targets: join(dir, 'targets.json'),
    })
    expect(second.missing).toEqual(['zz-enrich-missing'])
  })
})
