/** Lead validation (server side). The client-safe state lives in `./state`. */
import { z } from 'zod'

import type { Locale } from '@/i18n/config'

import { formLeadTypes } from './types'

export { CONSENT_VERSION, initialLeadState, type LeadField, type LeadFormState } from './state'

/**
 * Phone in Romanian (`0741 201 056`) or international form (`+40 741 201 056`, `0040…`).
 * Returns the digits with a leading `+` or `0`, or null when it is not a phone number.
 */
export function normalizePhone(value: string): string | null {
  const compact = value.replace(/[\s().-]/g, '')
  if (/^0\d{9}$/.test(compact)) return compact
  if (/^(\+|00)\d{8,15}$/.test(compact)) return compact.replace(/^00/, '+')
  return null
}

const messages = {
  ro: {
    name: 'Scrie-ne numele tău.',
    phone: 'Scrie un număr de telefon valid, de exemplu 0741 201 056.',
    email: 'Scrie o adresă de e-mail validă.',
    consent: 'Avem nevoie de acordul tău ca să te contactăm.',
    long: 'Textul este prea lung.',
    quantity: 'Scrie cantitatea în litri.',
    date: 'Alege o dată validă.',
  },
  en: {
    name: 'Please enter your name.',
    phone: 'Please enter a valid phone number, e.g. +40 741 201 056.',
    email: 'Please enter a valid email address.',
    consent: 'We need your consent to contact you.',
    long: 'This is too long.',
    quantity: 'Enter the quantity in litres.',
    date: 'Choose a valid date.',
  },
} satisfies Record<Locale, Record<string, string>>

const optionalId = z
  .string()
  .optional()
  .transform((v) => (v && /^\d+$/.test(v) ? Number(v) : undefined))

export function leadSchema(locale: Locale) {
  const m = messages[locale]
  const optionalText = (max: number) =>
    z
      .string()
      .trim()
      .max(max, m.long)
      .optional()
      .transform((v) => v || undefined)
  return z.object({
    type: z.enum(formLeadTypes),
    name: z.string().trim().min(2, m.name).max(120, m.long),
    phone: z.string().transform((v, ctx) => {
      const phone = normalizePhone(v)
      if (!phone) ctx.addIssue({ code: 'custom', message: m.phone })
      return phone ?? ''
    }),
    email: z.string().trim().toLowerCase().pipe(z.email(m.email)),
    company: optionalText(160),
    cui: optionalText(20),
    county: optionalId,
    base: optionalId,
    crop: optionalId,
    message: optionalText(4000),
    /** Diesel quotes (`motorina`): litres and the wanted delivery day. */
    quantity: z.preprocess(
      (v) => (v === '' ? undefined : v),
      z.coerce
        .number({ error: m.quantity })
        .positive(m.quantity)
        .max(1_000_000, m.quantity)
        .optional(),
    ),
    deliveryDate: z.preprocess(
      (v) => (v === '' ? undefined : v),
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, m.date)
        .refine((v) => !Number.isNaN(Date.parse(v)), m.date)
        .optional(),
    ),
    consent: z.literal('on', { error: m.consent }),
    sourcePath: z.string().max(300).optional(),
    product: z
      .string()
      .optional()
      .transform((v) =>
        (v ?? '')
          .split(',')
          .filter((id) => /^\d+$/.test(id))
          .slice(0, 50)
          .map(Number),
      ),
  })
}
