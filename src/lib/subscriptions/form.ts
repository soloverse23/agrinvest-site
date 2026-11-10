/** Subscription validation (server side). The client-safe state lives in `./state`. */
import { z } from 'zod'

import type { Locale } from '@/i18n/config'
import { normalizePhone } from '@/lib/leads/form'

import { alertRules, subscriptionTopics } from './topics'

const messages = {
  ro: {
    email: 'Scrie o adresă de e-mail validă.',
    phone: 'Scrie un număr de telefon valid, de exemplu 0741 201 056.',
    consent: 'Avem nevoie de acordul tău ca să îți trimitem mesaje.',
    crop: 'Alege cultura pentru alertă.',
    county: 'Alege județul pentru alertă.',
    threshold: 'Scrie pragul în lei pe tonă.',
  },
  en: {
    email: 'Please enter a valid email address.',
    phone: 'Please enter a valid phone number, e.g. +40 741 201 056.',
    consent: 'We need your consent to send you messages.',
    crop: 'Choose the crop for the alert.',
    county: 'Choose the county for the alert.',
    threshold: 'Enter the threshold in lei per tonne.',
  },
} satisfies Record<Locale, Record<string, string>>

const optionalId = z
  .string()
  .optional()
  .transform((v) => (v && /^\d+$/.test(v) ? Number(v) : undefined))

const blank = (v: unknown) => (v === '' || v === null ? undefined : v)

export function subscriptionSchema(locale: Locale) {
  const m = messages[locale]
  return z
    .object({
      channel: z.enum(['email', 'whatsapp']).default('email'),
      email: z.preprocess(blank, z.string().trim().toLowerCase().pipe(z.email(m.email)).optional()),
      phone: z.preprocess(blank, z.string().optional()),
      topic: z.enum(subscriptionTopics),
      crop: optionalId,
      rule: z.preprocess(blank, z.enum(alertRules).default('any')),
      threshold: z.preprocess(
        blank,
        z.coerce.number({ error: m.threshold }).positive(m.threshold).max(100_000).optional(),
      ),
      county: optionalId,
      // Checked with the other rules below, so every missing field is reported at once.
      consent: z.unknown(),
      sourcePath: z.string().max(300).optional(),
    })
    .transform((data, ctx) => {
      const phone = data.phone ? normalizePhone(data.phone) : null
      if (data.consent !== 'on')
        ctx.addIssue({ code: 'custom', path: ['consent'], message: m.consent })
      if (data.channel === 'email' && !data.email)
        ctx.addIssue({ code: 'custom', path: ['email'], message: m.email })
      if (data.channel === 'whatsapp' && !phone)
        ctx.addIssue({ code: 'custom', path: ['phone'], message: m.phone })
      if (data.topic === 'price-alert' && !data.crop)
        ctx.addIssue({ code: 'custom', path: ['crop'], message: m.crop })
      if (data.topic === 'price-alert' && data.rule !== 'any' && !data.threshold)
        ctx.addIssue({ code: 'custom', path: ['threshold'], message: m.threshold })
      if (data.topic === 'frost-alert' && !data.county)
        ctx.addIssue({ code: 'custom', path: ['county'], message: m.county })
      const { consent: _consent, ...rest } = data
      return { ...rest, phone: phone ?? undefined }
    })
}

export type SubscriptionInput = z.output<ReturnType<typeof subscriptionSchema>>

/** The topic row stored on the subscription; only the fields that topic uses. */
export function topicRow(input: SubscriptionInput) {
  switch (input.topic) {
    case 'price-alert':
      return {
        kind: input.topic,
        crop: input.crop,
        rule: input.rule,
        threshold: input.rule === 'any' ? undefined : input.threshold,
      }
    case 'frost-alert':
      return { kind: input.topic, county: input.county }
    default:
      return { kind: input.topic }
  }
}
