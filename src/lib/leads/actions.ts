'use server'

import { headers } from 'next/headers'

import { isLocale, type Locale } from '@/i18n/config'
import { payloadClient } from '@/lib/content/payload'

import { CONSENT_VERSION, leadSchema, type LeadField, type LeadFormState } from './form'
import { notifyLead } from './notify'
import { allow } from './rate-limit'

const copy = {
  ro: {
    limit: 'Ai trimis deja mai multe cereri. Te rugăm să încerci din nou peste câteva minute.',
    failed: 'Cererea nu a putut fi trimisă. Te rugăm să ne suni sau să încerci din nou.',
  },
  en: {
    limit: 'You have already sent several requests. Please try again in a few minutes.',
    failed: 'We could not send your request. Please call us or try again.',
  },
}

const fieldNames: LeadField[] = [
  'name',
  'phone',
  'email',
  'company',
  'cui',
  'county',
  'base',
  'crop',
  'message',
  'consent',
]

/** Stores a lead from any site form and routes it to its owner (Leads collection hook). */
export async function submitLead(_prev: LeadFormState, form: FormData): Promise<LeadFormState> {
  const rawLocale = form.get('locale')
  const locale: Locale = typeof rawLocale === 'string' && isLocale(rawLocale) ? rawLocale : 'ro'
  const values = Object.fromEntries(
    fieldNames.map((f) => [f, String(form.get(f) ?? '')]),
  ) as Record<LeadField, string>

  // Honeypot: bots fill every field. Pretend it worked.
  if (form.get('website')) return { status: 'success' }

  const parsed = leadSchema(locale).safeParse({
    ...values,
    type: form.get('type'),
    consent: form.get('consent') ?? undefined,
    sourcePath: String(form.get('sourcePath') ?? ''),
    product: String(form.get('product') ?? ''),
  })
  if (!parsed.success) {
    const errors: LeadFormState['errors'] = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as LeadField
      if (fieldNames.includes(field) && !errors[field]) errors[field] = issue.message
    }
    return { status: 'error', errors, values }
  }

  // Only valid submissions count towards the limit; off outside production (dev, tests).
  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
  if (process.env.NODE_ENV === 'production' && !allow(ip)) {
    return { status: 'error', message: copy[locale].limit, values }
  }

  const { sourcePath, consent: _consent, ...data } = parsed.data
  const utm = (key: string) => String(form.get(key) ?? '').slice(0, 100) || undefined
  try {
    const payload = await payloadClient()
    const lead = await payload.create({
      collection: 'leads',
      depth: 1,
      data: {
        ...data,
        status: 'new',
        meta: {
          locale,
          sourcePath,
          consentVersion: CONSENT_VERSION,
          utmSource: utm('utm_source'),
          utmMedium: utm('utm_medium'),
          utmCampaign: utm('utm_campaign'),
        },
      },
    })
    await notifyLead(lead)
    const person = typeof lead.assignedTo === 'object' ? lead.assignedTo : null
    return {
      status: 'success',
      assignee: person ? { name: person.name, role: person.role } : undefined,
    }
  } catch (error) {
    console.error('submitLead failed', error)
    return { status: 'error', message: copy[locale].failed, values }
  }
}
