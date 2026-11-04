/** Checkout validation (server side). The client-safe state lives in `./state`. */
import { z } from 'zod'

import type { Locale } from '@/i18n/config'
import { normalizePhone } from '@/lib/leads/form'

import { paymentMethods } from './payment'

/** A Romanian tax ID (CUI), with or without "RO": checks the control digit. */
export function cleanCui(value: string): string | null {
  const digits = value.trim().toUpperCase().replace(/^RO/, '').replace(/\s/g, '')
  if (!/^\d{2,10}$/.test(digits)) return null
  const key = '753217532'
  const body = digits.slice(0, -1).padStart(9, '0')
  const sum = [...body].reduce((s, d, i) => s + Number(d) * Number(key[i]), 0)
  const control = ((sum * 10) % 11) % 10
  return control === Number(digits.at(-1)) ? digits : null
}

const messages = {
  ro: {
    name: 'Scrie-ne numele tău.',
    phone: 'Scrie un număr de telefon valid, de exemplu 0741 201 056.',
    email: 'Scrie o adresă de e-mail validă.',
    company: 'Scrie numele firmei.',
    cui: 'Scrie un CUI valid.',
    billingAddress: 'Scrie sediul firmei.',
    county: 'Alege județul.',
    address: 'Scrie adresa de livrare.',
    base: 'Alege baza de la care ridici comanda.',
    certificateNumber: 'Scrie numărul certificatului de utilizator profesionist.',
    certificateValidUntil: 'Scrie o dată de valabilitate care nu a trecut.',
    adult: 'Produsele de protecția plantelor nu se vând persoanelor sub 18 ani.',
    consent: 'Avem nevoie de acordul tău ca să te contactăm despre comandă.',
    terms: 'Trebuie să accepți termenii de vânzare.',
    long: 'Textul este prea lung.',
  },
  en: {
    name: 'Please enter your name.',
    phone: 'Please enter a valid phone number, e.g. +40 741 201 056.',
    email: 'Please enter a valid email address.',
    company: 'Please enter the company name.',
    cui: 'Please enter a valid tax ID.',
    billingAddress: 'Please enter the company’s registered address.',
    county: 'Please choose the county.',
    address: 'Please enter the delivery address.',
    base: 'Please choose the base you will collect from.',
    certificateNumber: 'Please enter your professional user certificate number.',
    certificateValidUntil: 'Please enter a validity date that has not passed.',
    adult: 'Plant protection products are not sold to anyone under 18.',
    consent: 'We need your consent to contact you about the order.',
    terms: 'You need to accept the terms of sale.',
    long: 'This is too long.',
  },
} satisfies Record<Locale, Record<string, string>>

const id = z
  .string()
  .optional()
  .transform((v) => (v && /^\d+$/.test(v) ? Number(v) : undefined))

/** What the cart asks of the buyer. */
export type CheckoutNeeds = { needsCertificate: boolean; hasProtection: boolean }

export function checkoutSchema(locale: Locale, needs: CheckoutNeeds, now = new Date()) {
  const m = messages[locale]
  const text = (max: number) =>
    z
      .string()
      .trim()
      .max(max, m.long)
      .optional()
      .transform((v) => v || undefined)
  const today = now.toISOString().slice(0, 10)
  return z
    .object({
      buyerType: z.enum(['person', 'company']),
      name: z.string().trim().min(2, m.name).max(120, m.long),
      phone: z.string().transform((v, ctx) => {
        const phone = normalizePhone(v)
        if (!phone) ctx.addIssue({ code: 'custom', message: m.phone })
        return phone ?? ''
      }),
      email: z.string().trim().toLowerCase().pipe(z.email(m.email)),
      company: text(160),
      cui: text(16),
      regCom: text(40),
      billingAddress: text(240),
      deliveryMethod: z.enum(['delivery', 'pickup']),
      county: id,
      address: text(240),
      base: id,
      certificateNumber: text(60),
      certificateValidUntil: text(10),
      payment: z.enum(paymentMethods),
      message: text(2000),
      adult: z.string().optional(),
      consent: z.string({ error: m.consent }),
      terms: z.string({ error: m.terms }),
    })
    .superRefine((v, ctx) => {
      const need = (path: keyof typeof m & string, ok: unknown) => {
        if (!ok) ctx.addIssue({ code: 'custom', path: [path], message: m[path] })
      }
      if (v.buyerType === 'company') {
        need('company', v.company)
        need('cui', v.cui && cleanCui(v.cui))
        need('billingAddress', v.billingAddress)
      }
      if (v.deliveryMethod === 'delivery') {
        need('county', v.county)
        need('address', v.address)
      } else need('base', v.base)
      if (needs.needsCertificate) {
        need('certificateNumber', v.certificateNumber)
        const date = v.certificateValidUntil ?? ''
        need('certificateValidUntil', /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= today)
      }
      if (needs.hasProtection) need('adult', v.adult)
    })
}
