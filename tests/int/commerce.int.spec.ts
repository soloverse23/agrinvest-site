import { describe, expect, it, vi } from 'vitest'

import { fetchCompany } from '@/lib/commerce/anaf'
import { checkoutSchema, cleanCui } from '@/lib/commerce/checkout'
import { addItem, cleanQuantity, priceLines, type CartProduct } from '@/lib/commerce/pricing'
import { orderBlock } from '@/lib/shop/rules'

const now = new Date('2026-11-04')

const product = (over: Partial<CartProduct> = {}): CartProduct =>
  ({
    id: 1,
    slug: 'p',
    name: 'Produs',
    productType: 'protection',
    commerceStatus: 'pilot',
    protection: { registrationNumber: '1PC/01.01.2020', professionalUse: true },
    variants: [{ sku: 'A', size: 5, unit: 'l', price: 100.1, stock: 'in-stock' }],
    category: 'erbicide',
    ...over,
  }) as CartProduct

describe('what can be ordered', () => {
  it('stops withdrawn, unknown, GHS06 and stopped products', () => {
    expect(orderBlock(product(), now)).toBeNull()
    expect(
      orderBlock(
        product({ protection: { registrationNumber: '1', registrationValidUntil: '2025-01-31' } }),
        now,
      ),
    ).toBe('registration-expired')
    expect(orderBlock(product({ protection: {} }), now)).toBe('registration-missing')
    expect(orderBlock(product({ protection: { registrationNumber: '1', ghs06: true } }), now)).toBe(
      'ghs06',
    )
    expect(orderBlock(product({ saleBlock: 'Motiv' }), now)).toBe('sale-stopped')
  })

  it('does not ask seeds, fertilisers or adjuvants for a registration', () => {
    expect(orderBlock(product({ productType: 'seed', protection: {} }), now)).toBeNull()
    expect(orderBlock(product({ protection: {}, category: 'adjuvanti' }), now)).toBeNull()
    expect(orderBlock(product({ protection: {}, category: 'adjuvants' }), now)).toBeNull()
  })
})

describe('cart pricing', () => {
  it('takes prices only from the product, and rounds to bani', () => {
    const cart = priceLines([{ sku: 'A', quantity: 3 }], [product()], now)
    expect(cart.lines[0]).toMatchObject({ unitPrice: 100.1, lineTotal: 300.3, problem: null })
    expect(cart.total).toBe(300.3)
    expect(cart.canOrder).toBe(true)
  })

  it('ignores a price sent with the cart', () => {
    const tampered = [{ sku: 'A', quantity: 1, price: 1, unitPrice: 1 }]
    expect(priceLines(tampered, [product()], now).total).toBe(100.1)
  })

  it('asks for the certificate and the age only for protection products', () => {
    const seed = product({ productType: 'seed', protection: undefined })
    expect(priceLines([{ sku: 'A', quantity: 1 }], [seed], now)).toMatchObject({
      needsCertificate: false,
      hasProtection: false,
    })
    expect(priceLines([{ sku: 'A', quantity: 1 }], [product()], now)).toMatchObject({
      needsCertificate: true,
      hasProtection: true,
    })
  })

  it('refuses a cart with a line that cannot be ordered', () => {
    const gone = priceLines([{ sku: 'B', quantity: 1 }], [product()], now)
    expect(gone.lines[0].problem).toBe('gone')
    expect(gone.canOrder).toBe(false)
    const out = product({
      variants: [{ sku: 'A', size: 5, unit: 'l', price: 1, stock: 'out-of-stock' }],
    })
    expect(priceLines([{ sku: 'A', quantity: 1 }], [out], now).lines[0].problem).toBe(
      'out-of-stock',
    )
    expect(priceLines([], [], now).canOrder).toBe(false)
  })

  it('keeps quantities whole and within the limit', () => {
    expect(cleanQuantity('3')).toBe(3)
    for (const bad of ['0', '-1', '1.5', 'x', '1000']) expect(cleanQuantity(bad)).toBeNull()
    expect(addItem([{ sku: 'A', quantity: 998 }], 'A', 5)).toEqual([{ sku: 'A', quantity: 999 }])
    expect(addItem([], 'A', 2)).toEqual([{ sku: 'A', quantity: 2 }])
  })
})

describe('checkout rules', () => {
  const needs = { needsCertificate: true, hasProtection: true }
  const valid = {
    buyerType: 'person',
    name: 'Ion Popescu',
    phone: '0741 201 056',
    email: 'ion@example.ro',
    deliveryMethod: 'pickup',
    base: '1',
    certificateNumber: 'C-1',
    certificateValidUntil: '2027-01-01',
    payment: 'consultant',
    adult: 'on',
    consent: 'on',
    terms: 'on',
  }
  const errors = (data: object, n = needs) => {
    const r = checkoutSchema('ro', n, now).safeParse(data)
    return r.success ? [] : r.error.issues.map((i) => i.path[0])
  }

  it('accepts a complete order', () => expect(errors(valid)).toEqual([]))

  it('requires a valid certificate for professional-use lines', () => {
    expect(errors({ ...valid, certificateNumber: '' })).toContain('certificateNumber')
    expect(errors({ ...valid, certificateValidUntil: '2020-01-01' })).toContain(
      'certificateValidUntil',
    )
  })

  it('requires the age confirmation for plant protection products (OUG 53/2025)', () => {
    expect(errors({ ...valid, adult: undefined })).toContain('adult')
    expect(
      errors(
        { ...valid, adult: undefined, certificateNumber: '' },
        { needsCertificate: false, hasProtection: false },
      ),
    ).toEqual([])
  })

  it('asks a company for its details, and an address for delivery', () => {
    expect(errors({ ...valid, buyerType: 'company' })).toEqual(
      expect.arrayContaining(['company', 'cui', 'billingAddress']),
    )
    expect(errors({ ...valid, deliveryMethod: 'delivery', base: '' })).toEqual(
      expect.arrayContaining(['county', 'address']),
    )
  })

  it('needs both consents', () => {
    expect(errors({ ...valid, consent: undefined })).toContain('consent')
    expect(errors({ ...valid, terms: undefined })).toContain('terms')
  })

  it('checks the control digit of a tax ID', () => {
    expect(cleanCui('14399840')).toBe('14399840')
    expect(cleanCui('RO 14399840')).toBe('14399840')
    expect(cleanCui('14399841')).toBeNull()
    expect(cleanCui('abc')).toBeNull()
  })
})

describe('ANAF lookup', () => {
  const answer = (body: unknown, ok = true) =>
    vi.fn(async () => ({ ok, status: ok ? 200 : 500, json: async () => body })) as never

  it('reads the company', async () => {
    const fetcher = answer({
      found: [
        { date_generale: { denumire: 'FIRMA SRL', adresa: 'Buzău', nrRegCom: 'J10/1/2000' } },
      ],
    })
    await expect(fetchCompany('14399840', fetcher, now)).resolves.toEqual({
      name: 'FIRMA SRL',
      address: 'Buzău',
      regCom: 'J10/1/2000',
    })
  })

  it('returns nothing for an unknown tax ID', async () => {
    await expect(fetchCompany('1', answer({ found: [] }), now)).resolves.toBeNull()
  })

  it('throws when the service fails, so the failure is not cached', async () => {
    await expect(fetchCompany('1', answer({}, false), now)).rejects.toThrow('500')
  })
})
