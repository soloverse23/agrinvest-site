'use server'

import { randomInt } from 'node:crypto'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { isLocale, type Locale } from '@/i18n/config'
import { cartPath } from '@/i18n/routes'
import { payloadClient } from '@/lib/content/payload'
import { CONSENT_VERSION } from '@/lib/leads/state'
import { allow } from '@/lib/leads/rate-limit'

import { lookupCached } from './anaf'
import { cartItems, clearCart, pricedCart, productsBySku, saveItems } from './cart'
import { checkoutSchema, cleanCui } from './checkout'
import { issueInvoice } from './invoice'
import { notifyOrder } from './notify'
import { startPayment } from './payment'
import { addItem, cleanQuantity, priceLines } from './pricing'
import { TERMS_VERSION, type CheckoutField, type CheckoutState, type CompanyLookup } from './state'

const localeOf = (form: FormData): Locale => {
  const value = form.get('locale')
  return typeof value === 'string' && isLocale(value) ? value : 'ro'
}

const clientIp = async () => {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
}

/** Adds a pack to the cart. Works without JavaScript: the form posts here, then the cart opens. */
export async function addToCart(form: FormData) {
  const locale = localeOf(form)
  const sku = String(form.get('sku') ?? '')
  const quantity = cleanQuantity(form.get('quantity')) ?? 1
  const products = await productsBySku([sku], locale)
  const { canOrder } = priceLines([{ sku, quantity }], products)
  // The button is not shown for a pack that cannot be ordered; a forged request ends here.
  if (canOrder) await saveItems(addItem(await cartItems(), sku, quantity))
  redirect(cartPath(locale))
}

/** Changes a line's quantity, or removes it. An invalid quantity changes nothing. */
export async function updateCartLine(form: FormData) {
  const locale = localeOf(form)
  const sku = String(form.get('sku') ?? '')
  const items = await cartItems()
  const quantity = cleanQuantity(form.get('quantity'))
  if (form.get('remove')) await saveItems(items.filter((i) => i.sku !== sku))
  else if (quantity) await saveItems(items.map((i) => (i.sku === sku ? { sku, quantity } : i)))
  redirect(cartPath(locale))
}

/** Company data for a tax ID. The buyer can always type it by hand instead. */
export async function lookupCompany(value: string): Promise<CompanyLookup> {
  const cui = cleanCui(value)
  if (!cui) return { status: 'invalid' }
  const ip = await clientIp()
  if (process.env.NODE_ENV === 'production' && !allow(`anaf:${ip}`))
    return { status: 'unavailable' }
  try {
    const company = await lookupCached(cui)
    return company ? { status: 'found', ...company } : { status: 'not-found' }
  } catch (error) {
    console.warn('ANAF lookup failed', error)
    return { status: 'unavailable' }
  }
}

const copy = {
  ro: {
    empty: 'Coșul este gol.',
    blocked: 'Un produs din coș nu mai poate fi comandat. Întoarce-te la coș și scoate-l.',
    limit: 'Ai trimis deja mai multe comenzi. Te rugăm să încerci din nou peste câteva minute.',
    failed: 'Comanda nu a putut fi trimisă. Te rugăm să ne suni sau să încerci din nou.',
  },
  en: {
    empty: 'Your cart is empty.',
    blocked: 'A product in your cart can no longer be ordered. Go back to the cart and remove it.',
    limit: 'You have already sent several orders. Please try again in a few minutes.',
    failed: 'We could not send your order. Please call us or try again.',
  },
}

const fields: CheckoutField[] = [
  'buyerType',
  'name',
  'phone',
  'email',
  'company',
  'cui',
  'regCom',
  'billingAddress',
  'deliveryMethod',
  'county',
  'address',
  'base',
  'certificateNumber',
  'certificateValidUntil',
  'payment',
  'message',
  'adult',
  'consent',
  'terms',
]

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/** Hard to guess, easy to read over the phone: `AGR-2611-7KQ2M`. */
const newReference = (now = new Date()) => {
  const stamp = now.toISOString().slice(2, 7).replace('-', '')
  const tail = Array.from({ length: 5 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')
  return `AGR-${stamp}-${tail}`
}

/**
 * Turns the cart into an order. Prices, names and what may be ordered are read again here,
 * so nothing from the browser decides them; only the buyer's details come from the form.
 */
export async function placeOrder(_prev: CheckoutState, form: FormData): Promise<CheckoutState> {
  const locale = localeOf(form)
  const t = copy[locale]
  if (form.get('website')) return { status: 'success' }
  const raw = Object.fromEntries(
    fields.map((f) => [f, form.get(f) === null ? undefined : String(form.get(f))]),
  )
  const values = raw as CheckoutState['values']

  const cart = await pricedCart(locale)
  if (!cart.lines.length) return { status: 'error', message: t.empty, values }
  if (!cart.canOrder) return { status: 'error', message: t.blocked, values }

  const parsed = checkoutSchema(locale, cart).safeParse(raw)
  if (!parsed.success) {
    const errors: CheckoutState['errors'] = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as CheckoutField
      if (fields.includes(field) && !errors[field]) errors[field] = issue.message
    }
    return { status: 'error', errors, values }
  }

  const ip = await clientIp()
  if (process.env.NODE_ENV === 'production' && !allow(`order:${ip}`))
    return { status: 'error', message: t.limit, values }

  const v = parsed.data
  const company = v.buyerType === 'company'
  const delivery = v.deliveryMethod === 'delivery'
  try {
    const payload = await payloadClient()
    const order = await payload.create({
      collection: 'orders',
      depth: 1,
      data: {
        reference: newReference(),
        status: 'new',
        lines: cart.lines.map((l) => ({
          sku: l.sku,
          product: l.productId,
          name: l.name ?? l.sku,
          pack: l.size ? `${l.size} ${l.unit}` : undefined,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          lineTotal: l.lineTotal,
          priceConfirmed: l.priceConfirmed,
        })),
        total: cart.total,
        buyer: {
          type: v.buyerType,
          name: v.name,
          phone: v.phone,
          email: v.email,
          company: company ? v.company : undefined,
          cui: company ? (cleanCui(v.cui ?? '') ?? undefined) : undefined,
          regCom: company ? v.regCom : undefined,
          billingAddress: company ? v.billingAddress : undefined,
        },
        delivery: {
          method: v.deliveryMethod,
          county: delivery ? v.county : undefined,
          address: delivery ? v.address : undefined,
          base: delivery ? undefined : v.base,
        },
        certificate: cart.needsCertificate
          ? { number: v.certificateNumber, validUntil: v.certificateValidUntil }
          : undefined,
        payment: v.payment,
        message: v.message,
        meta: {
          locale,
          consentVersion: CONSENT_VERSION,
          termsVersion: TERMS_VERSION,
          adultConfirmed: cart.hasProtection,
        },
      },
    })
    // The order is stored: a failure from here on must not tell the buyer it was lost.
    try {
      await startPayment(order)
      await issueInvoice(order)
      await notifyOrder(order)
      await clearCart()
    } catch (error) {
      console.error(`after order ${order.reference}`, error)
    }
    const person = typeof order.assignedTo === 'object' ? order.assignedTo : null
    return {
      status: 'success',
      reference: order.reference,
      assignee: person ? { name: person.name, role: person.role } : undefined,
    }
  } catch (error) {
    console.error('placeOrder failed', error)
    return { status: 'error', message: t.failed, values }
  }
}
