import { describe, expect, it } from 'vitest'

import { product } from '@/lib/schema'
import {
  applyFilters,
  facetHref,
  facetOptions,
  readFilters,
  searchProducts,
  type ProductCardData,
} from '@/lib/shop/catalogue'

import {
  cropsIn,
  newSlugOf,
  parseDose,
  parseDoseTables,
  parseIngredients,
  planProducts,
  splitPack,
  toMarkdown,
} from '../../scripts/import/woo-plan'

describe('old shop text parsing', () => {
  it('splits the pack from the name', () => {
    expect(splitPack('ORIUS 2 WS 1.5 KG')).toEqual({ name: 'ORIUS 2 WS', size: 1.5, unit: 'kg' })
    expect(splitPack('Insecticid Faster Magnum- 500 ML')).toMatchObject({ size: 500, unit: 'ml' })
    expect(splitPack('Erbicid porumb ADENGO- 1 Litru')).toMatchObject({ size: 1, unit: 'l' })
    expect(splitPack('TOKAMA')).toEqual({ name: 'TOKAMA' })
  })

  it('reads doses only when the text is unambiguous', () => {
    expect(parseDose('3,5 – 4 l/ha')).toEqual({ doseMin: 3.5, doseMax: 4, doseUnit: 'l/ha' })
    expect(parseDose('0,15 l/ha')).toEqual({ doseMin: 0.15, doseMax: 0.15, doseUnit: 'l/ha' })
    expect(parseDose('0,3–1,0 L/ha sau 0,1–0,5% v/v')).toEqual({})
  })

  it('reads every way the pages state active ingredients', () => {
    expect(
      parseIngredients(['Substanta Activa : pendimetalin 250 g/l + dimetenamid-P 212.5 g/l']),
    ).toEqual([
      { name: 'pendimetalin', concentration: 250, unit: 'g/l' },
      { name: 'dimetenamid-p', concentration: 212.5, unit: 'g/l' },
    ])
    expect(parseIngredients(['Substanta activa: cipermetrin 50% (500 g/l)'])).toEqual([
      { name: 'cipermetrin', concentration: 500, unit: 'g/l' },
    ])
    expect(parseIngredients(['Substanta activa: 50 g/l quizalofop-p-etil'])[0].name).toBe(
      'quizalofop-p-etil',
    )
    // A bare label, then a complete statement further down: the complete one wins.
    expect(
      parseIngredients([
        'Substanțe active:',
        'Adengo 1 Litru',
        '• Substanta activa: isoxaflutol 225 g/L',
      ]),
    ).toEqual([{ name: 'isoxaflutol', concentration: 225, unit: 'g/l' }])
  })

  it('one spelling per substance', () => {
    const name = (text: string) => parseIngredients([text])[0].name
    expect(name('Substanta activa : 5% lambda cihalotrin')).toBe('lambda-cihalotrin')
    expect(name('substanta activa: contine 50 g/l lambda – cihalotrin')).toBe('lambda-cihalotrin')
  })

  it('keeps table columns in place across merged cells', () => {
    const rows = parseDoseTables(`<table>
      <tr><th>Cultură</th><th>Dăunători</th><th>Doza</th><th>Timp de pauză</th></tr>
      <tr><td rowspan="2">Măr</td><td>Viermele merelor</td><td>0,015%</td><td>7 zile</td></tr>
      <tr><td>Insecte minatoare</td><td>0,225 l/ha</td><td>7 zile</td></tr>
    </table>`)
    expect(rows).toHaveLength(2)
    expect(rows[1]).toMatchObject({
      cropText: 'Măr',
      crops: ['fruit-trees'],
      targetText: 'Insecte minatoare',
      doseText: '0,225 l/ha',
      waitingPeriod: 7,
    })
  })

  it('removes a dose table from the text together with its heading', () => {
    const md = toMarkdown('<p>Text</p><h3>Doze recomandate:</h3><table><tr><td>x</td></tr></table>')
    expect(md).toBe('Text')
  })

  it('does not take a word inside another for a crop', () => {
    expect(cropsIn('Tutun')).toEqual([])
    expect(cropsIn('Grâu, orz')).toEqual(['wheat', 'barley'])
    expect(cropsIn('marfă')).toEqual([])
  })
})

describe('import plan', () => {
  const plan = planProducts()

  it('turns 77 records into 72 products, with no record lost', () => {
    expect(plan).toHaveLength(72)
    expect(plan.reduce((n, p) => n + p.legacy.length, 0)).toBe(77)
  })

  it('merges pack families into variants', () => {
    const amino = plan.find((p) => p.slug === 'amino')
    expect(amino?.variants.map((v) => [v.size, v.unit, v.price])).toEqual([
      [1, 'l', 99],
      [20, 'l', 1580],
    ])
    expect(amino?.legacy.map((l) => l.slug)).toEqual(['amino', 'amino-20l'])
  })

  it('retires the pesticide category and never uses a theme as primary', () => {
    for (const p of plan) expect(['pesticide', 'agricultura-bio']).not.toContain(p.category)
  })

  it('does not publish a summary that belongs to another product', () => {
    expect(plan.find((p) => p.slug === 'listego')?.summary).toBeUndefined()
    expect(plan.find((p) => p.slug === 'uree')?.summary).toBeUndefined()
    expect(plan.find((p) => p.slug === 'samanta-de-orz-zanzibar-c1')?.summary).toBeUndefined()
  })

  it('states no active substance on adjuvants', () => {
    expect(plan.find((p) => p.slug === 'jolpolt')?.ingredients).toEqual([])
  })

  it('holds back the duplicate and sends its old URL to the published twin', () => {
    const held = plan.filter((p) => p.status === 'draft')
    expect(held).toHaveLength(1)
    expect(newSlugOf(plan, 'samanta-grau-avenue-c1-1kg')?.slug).toBe('samanta-de-grau-avenue-c1')
    expect(newSlugOf(plan, 'amino-20l')?.slug).toBe('amino')
  })

  it('uses unique SKUs', () => {
    const skus = plan.flatMap((p) => p.variants.map((v) => v.sku))
    expect(new Set(skus).size).toBe(skus.length)
  })
})

const card = (over: Partial<ProductCardData>): ProductCardData => ({
  id: 1,
  slug: 'a',
  name: 'Produs',
  productType: 'protection',
  commerceStatus: 'pilot',
  category: { id: 1, slug: 'erbicide', name: 'Erbicide' },
  secondary: [],
  crops: [],
  ingredients: [],
  variants: [{ sku: 'A', size: 1, unit: 'l', price: 10, stock: 'in-stock' }],
  updatedAt: '',
  ...over,
})

describe('catalogue', () => {
  const wheat = { id: 1, slug: 'grau', name: 'Grâu' }
  const maize = { id: 2, slug: 'porumb', name: 'Porumb' }
  const brand = { id: 1, slug: 'bayer', name: 'Bayer' }
  const products = [
    card({ id: 1, crops: [wheat], brand }),
    card({ id: 2, crops: [wheat, maize] }),
    card({
      id: 3,
      crops: [maize],
      variants: [{ sku: 'C', size: 1, unit: 'l', stock: 'out-of-stock' }],
    }),
  ]

  it('reads filters per language and ignores anything else', () => {
    expect(readFilters({ cultura: 'grau', x: '1' }, 'ro')).toEqual({ crop: 'grau' })
    expect(readFilters({ crop: 'wheat', cultura: 'grau' }, 'en')).toEqual({ crop: 'wheat' })
  })

  it('counts each option within the other active filters', () => {
    const options = facetOptions(products, 'crop', { brand: 'bayer' })
    expect(options).toEqual([{ value: 'grau', label: 'Grâu', count: 1 }])
    expect(applyFilters(products, { crop: 'porumb', stock: '1' }).map((p) => p.id)).toEqual([2])
  })

  it('turns a filter off when it is already on', () => {
    expect(facetHref('/m', {}, 'crop', 'grau', 'ro')).toBe('/m?cultura=grau')
    expect(facetHref('/m', { crop: 'grau' }, 'crop', 'grau', 'ro')).toBe('/m')
  })

  it('searches without diacritics', () => {
    expect(searchProducts(products, 'grau').map((p) => p.id)).toEqual([1, 2])
    expect(searchProducts(products, '   ')).toEqual([])
  })
})

describe('product JSON-LD', () => {
  const input = {
    url: '/magazin/x/y',
    name: 'Y',
    description: 'D',
    image: [],
    category: 'X',
    variants: [
      { sku: 'A', price: 10, stock: 'in-stock' as const },
      { sku: 'B', price: 30, stock: 'in-stock' as const },
    ],
  }

  it('states no offer on a pilot product', () => {
    expect(product({ ...input, confirmed: false }).offers).toBeUndefined()
  })

  it('states one offer, or a range across packs, once confirmed', () => {
    expect(product({ ...input, confirmed: true }).offers).toMatchObject({
      '@type': 'AggregateOffer',
      lowPrice: 10,
      highPrice: 30,
      offerCount: 2,
    })
    expect(
      product({ ...input, variants: input.variants.slice(0, 1), confirmed: true }).offers,
    ).toMatchObject({ '@type': 'Offer', price: 10, priceCurrency: 'RON' })
  })
})
