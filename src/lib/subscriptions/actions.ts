'use server'

import { headers } from 'next/headers'

import { isLocale, type Locale } from '@/i18n/config'
import { payloadClient } from '@/lib/content/payload'
import { allow } from '@/lib/leads/rate-limit'

import { subscriptionSchema } from './form'
import type { SubscriptionField, SubscriptionFormState } from './state'
import { storeSubscription } from './store'

const copy = {
  ro: {
    limit: 'Ai trimis deja mai multe cereri. Te rugăm să încerci din nou peste câteva minute.',
    failed: 'Abonarea nu a putut fi salvată. Te rugăm să încerci din nou.',
  },
  en: {
    limit: 'You have already sent several requests. Please try again in a few minutes.',
    failed: 'We could not save your subscription. Please try again.',
  },
}

const fieldNames: SubscriptionField[] = [
  'channel',
  'email',
  'phone',
  'topic',
  'crop',
  'rule',
  'threshold',
  'county',
  'consent',
]

/** Stores an alert or newsletter sign-up with the consent text the visitor saw. */
export async function subscribe(
  _prev: SubscriptionFormState,
  form: FormData,
): Promise<SubscriptionFormState> {
  const rawLocale = form.get('locale')
  const locale: Locale = typeof rawLocale === 'string' && isLocale(rawLocale) ? rawLocale : 'ro'
  const values = Object.fromEntries(
    fieldNames.map((f) => [f, String(form.get(f) ?? '')]),
  ) as Record<SubscriptionField, string>

  // Honeypot, as on the lead forms.
  if (form.get('website')) return { status: 'success' }

  const parsed = subscriptionSchema(locale).safeParse({
    ...values,
    channel: values.channel || undefined,
    consent: form.get('consent') ?? undefined,
    sourcePath: String(form.get('sourcePath') ?? ''),
  })
  if (!parsed.success) {
    const errors: SubscriptionFormState['errors'] = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as SubscriptionField
      if (fieldNames.includes(field) && !errors[field]) errors[field] = issue.message
    }
    return { status: 'error', errors, values }
  }

  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
  if (process.env.NODE_ENV === 'production' && !allow(`subscribe:${ip}`)) {
    return { status: 'error', message: copy[locale].limit, values }
  }

  try {
    await storeSubscription(await payloadClient(), parsed.data, locale)
    return { status: 'success' }
  } catch (error) {
    console.error('subscribe failed', error)
    return { status: 'error', message: copy[locale].failed, values }
  }
}
