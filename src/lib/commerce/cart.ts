import { randomUUID } from 'node:crypto'

import { cookies } from 'next/headers'

import type { Locale } from '@/i18n/config'
import { payloadClient } from '@/lib/content/payload'
import type { Category, Product } from '@/payload-types'

import { priceLines, type CartItem, type CartProduct } from './pricing'
import { CART_COOKIE, CART_COUNT_COOKIE } from './state'

/** The anonymous cart: a token in a cookie, and SKUs with quantities in the database. */

const MONTH = 60 * 60 * 24 * 30

const stored = (doc: { items?: { sku: string; quantity: number }[] | null }): CartItem[] =>
  (doc.items ?? []).map(({ sku, quantity }) => ({ sku, quantity }))

async function findCart(token: string) {
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'carts',
    where: { token: { equals: token } },
    depth: 0,
    limit: 1,
  })
  return docs[0] ?? null
}

export async function cartItems(): Promise<CartItem[]> {
  const token = (await cookies()).get(CART_COOKIE)?.value
  if (!token) return []
  const cart = await findCart(token)
  return cart ? stored(cart) : []
}

/** Only in a server action: cookies can be written there. */
export async function saveItems(items: CartItem[]) {
  const jar = await cookies()
  const payload = await payloadClient()
  const token = jar.get(CART_COOKIE)?.value
  const cart = token ? await findCart(token) : null
  const secure = process.env.NODE_ENV === 'production'
  const base = { sameSite: 'lax', secure, path: '/', maxAge: MONTH } as const
  if (cart) await payload.update({ collection: 'carts', id: cart.id, data: { items } })
  else {
    const fresh = randomUUID()
    await payload.create({ collection: 'carts', data: { token: fresh, items } })
    jar.set(CART_COOKIE, fresh, { ...base, httpOnly: true })
  }
  const count = items.reduce((sum, i) => sum + i.quantity, 0)
  jar.set(CART_COUNT_COOKIE, String(count), base)
}

/** Only in a server action. */
export async function clearCart() {
  const jar = await cookies()
  const token = jar.get(CART_COOKIE)?.value
  if (token) {
    const payload = await payloadClient()
    await payload.delete({ collection: 'carts', where: { token: { equals: token } } })
  }
  jar.delete(CART_COOKIE)
  jar.delete(CART_COUNT_COOKIE)
}

/** Published products holding these SKUs, in one language. Drafts never reach a cart. */
export async function productsBySku(skus: string[], locale: Locale): Promise<CartProduct[]> {
  if (!skus.length) return []
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'products',
    where: { 'variants.sku': { in: skus } },
    locale,
    fallbackLocale: false,
    overrideAccess: false,
    depth: 1,
    pagination: false,
    populate: { categories: { slug: true } },
  })
  return docs.map((doc: Product) => {
    const category = doc.primaryCategory as Category | number | null | undefined
    return { ...doc, category: typeof category === 'object' ? category?.slug : null }
  })
}

export async function pricedCart(locale: Locale) {
  const items = await cartItems()
  return priceLines(
    items,
    await productsBySku(
      items.map((i) => i.sku),
      locale,
    ),
  )
}
