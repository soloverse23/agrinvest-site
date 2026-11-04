import { orderBlock, type OrderBlock } from '@/lib/shop/rules'
import type { Product } from '@/payload-types'

/**
 * Turns the SKUs and quantities of a cart into priced lines. Prices come only from the
 * products passed in, so nothing a visitor sends can change them. Plain functions, so the
 * rules can be tested without a database.
 */
export type CartItem = { sku: string; quantity: number }

export type LineProblem = OrderBlock | 'out-of-stock' | 'no-price' | 'gone'

export type CartProduct = Pick<
  Product,
  | 'id'
  | 'slug'
  | 'name'
  | 'productType'
  | 'commerceStatus'
  | 'protection'
  | 'saleBlock'
  | 'variants'
> & { category?: string | null }

export type CartLine = {
  sku: string
  quantity: number
  productId?: number
  slug?: string
  category?: string | null
  name?: string
  size?: number
  unit?: string
  unitPrice: number | null
  lineTotal: number | null
  priceConfirmed: boolean
  /** Asks for the buyer's certificate at checkout. */
  professionalUse: boolean
  isProtection: boolean
  problem: LineProblem | null
}

export const MAX_QUANTITY = 999

/** A whole number of packs within the limit, or null. */
export function cleanQuantity(value: unknown): number | null {
  const n = Number(value)
  return Number.isInteger(n) && n >= 1 && n <= MAX_QUANTITY ? n : null
}

const round = (n: number) => Math.round(n * 100) / 100

export function priceLines(items: CartItem[], products: CartProduct[], now = new Date()) {
  const lines = items.map((item): CartLine => {
    const product = products.find((p) => p.variants?.some((v) => v.sku === item.sku))
    const variant = product?.variants?.find((v) => v.sku === item.sku)
    if (!product || !variant)
      return {
        ...item,
        unitPrice: null,
        lineTotal: null,
        priceConfirmed: false,
        professionalUse: false,
        isProtection: false,
        problem: 'gone',
      }
    const unitPrice = variant.price ?? null
    const block = orderBlock(product, now)
    return {
      ...item,
      productId: product.id,
      slug: product.slug,
      category: product.category,
      name: product.name,
      size: variant.size,
      unit: variant.unit,
      unitPrice,
      lineTotal: unitPrice === null ? null : round(unitPrice * item.quantity),
      priceConfirmed: product.commerceStatus === 'live',
      isProtection: product.productType === 'protection',
      professionalUse:
        product.productType === 'protection' && product.protection?.professionalUse !== false,
      problem:
        block ??
        (variant.stock === 'out-of-stock'
          ? 'out-of-stock'
          : unitPrice === null
            ? 'no-price'
            : null),
    }
  })
  return {
    lines,
    total: round(lines.reduce((sum, l) => sum + (l.lineTotal ?? 0), 0)),
    canOrder: lines.length > 0 && lines.every((l) => !l.problem),
    needsCertificate: lines.some((l) => l.professionalUse),
    hasProtection: lines.some((l) => l.isProtection),
  }
}

export type PricedCart = ReturnType<typeof priceLines>

/** Adds to a line, or starts one, keeping quantities within the limit. */
export function addItem(items: CartItem[], sku: string, quantity: number): CartItem[] {
  const found = items.find((i) => i.sku === sku)
  if (!found) return [...items, { sku, quantity }]
  return items.map((i) =>
    i.sku === sku ? { sku, quantity: Math.min(i.quantity + quantity, MAX_QUANTITY) } : i,
  )
}
