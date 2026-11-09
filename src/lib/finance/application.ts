/** Credit application validation (server side). The client-safe state lives in `./application-state`. */
import { z } from 'zod'

import type { Locale } from '@/i18n/config'
import { cleanCui } from '@/lib/commerce/checkout'
import { normalizePhone } from '@/lib/leads/form'

import { harvestCrops, type HarvestCrop } from './calendar'
import { borrowerKinds, guaranteeKinds } from './options'
import { AMOUNT_MAX, AMOUNT_MIN, type RawParams } from './simulator'

const messages = {
  ro: {
    borrower: 'Alege forma de organizare.',
    cui: 'Scrie un CUI valid.',
    company: 'Scrie denumirea fermei sau a firmei, așa cum apare la Registrul Comerțului.',
    name: 'Scrie-ne numele tău.',
    phone: 'Scrie un număr de telefon valid, de exemplu 0741 201 056.',
    email: 'Scrie o adresă de e-mail validă.',
    county: 'Alege județul.',
    product: 'Alege din listă.',
    amount: 'Scrie suma în lei, de exemplu 250000.',
    termMonths: 'Scrie durata în luni, de exemplu 12.',
    crops: 'Alege din listă.',
    area: 'Scrie suprafața în hectare, de exemplu 120.',
    guarantees: 'Alege din listă.',
    consent: 'Avem nevoie de acordul tău ca să analizăm cererea și să te contactăm.',
    long: 'Textul este prea lung.',
  },
  en: {
    borrower: 'Please choose the legal form.',
    cui: 'Please enter a valid tax ID.',
    company: 'Please enter the farm or company name, as in the trade register.',
    name: 'Please enter your name.',
    phone: 'Please enter a valid phone number, e.g. +40 741 201 056.',
    email: 'Please enter a valid email address.',
    county: 'Please choose the county.',
    product: 'Please choose from the list.',
    amount: 'Please enter the amount in lei, e.g. 250000.',
    termMonths: 'Please enter the term in months, e.g. 12.',
    crops: 'Please choose from the list.',
    area: 'Please enter the area in hectares, e.g. 120.',
    guarantees: 'Please choose from the list.',
    consent: 'We need your consent to review the application and contact you.',
    long: 'This is too long.',
  },
} satisfies Record<Locale, Record<string, string>>

/** What the form may choose from, read from the published collections by the caller. */
export type ApplicationChoices = {
  products: number[]
  counties: number[]
  crops: Partial<Record<HarvestCrop, number>>
  maxMonths: number
}

const digits = (text: string) => text.replace(/[\s.]/g, '')

export function applicationSchema(locale: Locale, choices: ApplicationChoices) {
  const m = messages[locale]
  const text = (max: number) =>
    z
      .string()
      .trim()
      .max(max, m.long)
      .optional()
      .transform((v) => v || undefined)
  /** An optional whole number between bounds; empty means not given. */
  const count = (min: number, max: number, message: string) =>
    z
      .string()
      .optional()
      .transform((v, ctx) => {
        const raw = digits(v ?? '')
        if (!raw) return undefined
        const n = /^\d{1,12}$/.test(raw) ? Number(raw) : NaN
        if (!(n >= min && n <= max)) {
          ctx.addIssue({ code: 'custom', message })
          return z.NEVER
        }
        return n
      })
  const listOf = <T>(allowed: readonly T[], message: string) =>
    z.array(z.string()).transform((list, ctx) => {
      const unique = [...new Set(list)]
      if (unique.some((v) => !allowed.includes(v as T))) {
        ctx.addIssue({ code: 'custom', message })
        return z.NEVER
      }
      return unique as T[]
    })
  const id = (allowed: number[], message: string, required: boolean) =>
    z
      .string()
      .optional()
      .transform((v, ctx) => {
        if (!v) {
          if (required) ctx.addIssue({ code: 'custom', message })
          return undefined
        }
        const n = Number(v)
        if (!allowed.includes(n)) {
          ctx.addIssue({ code: 'custom', message })
          return z.NEVER
        }
        return n
      })

  return z.object({
    borrower: z.enum(borrowerKinds, { error: m.borrower }),
    cui: z.string().transform((v, ctx) => {
      const cui = cleanCui(v)
      if (!cui) ctx.addIssue({ code: 'custom', message: m.cui })
      return cui ?? ''
    }),
    company: z.string().trim().min(2, m.company).max(160, m.long),
    name: z.string().trim().min(2, m.name).max(120, m.long),
    phone: z.string().transform((v, ctx) => {
      const phone = normalizePhone(v)
      if (!phone) ctx.addIssue({ code: 'custom', message: m.phone })
      return phone ?? ''
    }),
    email: z.string().trim().toLowerCase().pipe(z.email(m.email)),
    county: id(choices.counties, m.county, true),
    product: id(choices.products, m.product, false),
    amount: count(AMOUNT_MIN, AMOUNT_MAX, m.amount).refine((v) => v !== undefined, m.amount),
    termMonths: count(1, choices.maxMonths, m.termMonths),
    crops: listOf(
      harvestCrops.filter((c) => choices.crops[c] !== undefined),
      m.crops,
    ).transform((list) => list.map((c) => choices.crops[c] as number)),
    area: count(1, 1_000_000, m.area),
    guarantees: listOf(guaranteeKinds, m.guarantees),
    message: text(2000),
    consent: z.string({ error: m.consent }),
    creditBureau: z
      .string()
      .optional()
      .transform((v) => Boolean(v)),
  })
}

/** Prefill from a product page or the simulator: `?produs=`, `suma`, `luni`, `culturi`. */
export function applicationPrefill(
  params: RawParams,
  productIdBySlug: (slug: string) => number | undefined,
) {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? ''
  const whole = (v: string) => (/^\d{1,12}$/.test(digits(v)) ? digits(v) : undefined)
  const product = productIdBySlug(one(params.produs))
  const crops = (Array.isArray(params.culturi) ? params.culturi : [params.culturi ?? ''])
    .flatMap((v) => v.split(','))
    .filter((c) => (harvestCrops as string[]).includes(c))
  return {
    product: product === undefined ? undefined : String(product),
    amount: whole(one(params.suma)),
    termMonths: whole(one(params.luni)),
    crops: crops.length ? [...new Set(crops)].join(',') : undefined,
  }
}

export const hasParams = (params: RawParams) => Object.values(params).some((v) => v !== undefined)
