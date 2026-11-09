'use server'

import { headers } from 'next/headers'

import { isLocale, type Locale } from '@/i18n/config'
import { payloadClient } from '@/lib/content/payload'
import { allow } from '@/lib/leads/rate-limit'
import { newReference } from '@/lib/reference'

import { applicationSchema } from './application'
import {
  APPLICATION_CONSENT_VERSION,
  type ApplicationField,
  type ApplicationState,
} from './application-state'
import { applicationChoices } from './choices'
import { notifyApplication } from './notify'

const copy = {
  ro: {
    limit: 'Ai trimis deja mai multe cereri. Te rugăm să încerci din nou peste câteva minute.',
    failed: 'Cererea nu a putut fi trimisă. Te rugăm să ne suni sau să încerci din nou.',
  },
  en: {
    limit: 'You have already sent several requests. Please try again in a few minutes.',
    failed: 'We could not send your application. Please call us or try again.',
  },
}

const single: ApplicationField[] = [
  'borrower',
  'cui',
  'company',
  'name',
  'phone',
  'email',
  'county',
  'product',
  'amount',
  'termMonths',
  'area',
  'message',
  'consent',
  'creditBureau',
]
const lists: ApplicationField[] = ['crops', 'guarantees']

/**
 * Stores a credit application and routes it to the person who owns financing requests
 * (collection hook). The site runs no credit check and takes no decision: it only records
 * the request, for the IFN team to call back.
 */
export async function submitApplication(
  _prev: ApplicationState,
  form: FormData,
): Promise<ApplicationState> {
  const rawLocale = form.get('locale')
  const locale: Locale = typeof rawLocale === 'string' && isLocale(rawLocale) ? rawLocale : 'ro'
  const t = copy[locale]
  // Honeypot: bots fill every field. Pretend it worked.
  if (form.get('website')) return { status: 'success' }

  const raw: Record<string, string | string[] | undefined> = {}
  for (const f of single) {
    const v = form.get(f)
    raw[f] = v === null ? undefined : String(v)
  }
  for (const f of lists) raw[f] = form.getAll(f).map(String)
  const values = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : v]),
  ) as ApplicationState['values']

  const parsed = applicationSchema(locale, await applicationChoices(locale)).safeParse(raw)
  if (!parsed.success) {
    const errors: ApplicationState['errors'] = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as ApplicationField
      if (!errors[field]) errors[field] = issue.message
    }
    return { status: 'error', errors, values, attempt: Date.now() }
  }

  // Only valid submissions count towards the limit; off outside production (dev, tests).
  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
  if (process.env.NODE_ENV === 'production' && !allow(`apply:${ip}`))
    return { status: 'error', message: t.limit, values, attempt: Date.now() }

  const v = parsed.data
  const utm = (key: string) => String(form.get(key) ?? '').slice(0, 100) || undefined
  try {
    const payload = await payloadClient()
    const application = await payload.create({
      collection: 'finance-applications',
      depth: 1,
      data: {
        reference: newReference('CRD'),
        status: 'new',
        borrower: v.borrower,
        company: v.company,
        cui: v.cui,
        name: v.name,
        phone: v.phone,
        email: v.email,
        county: v.county,
        product: v.product,
        amount: v.amount,
        termMonths: v.termMonths,
        crops: v.crops,
        area: v.area,
        guarantees: v.guarantees,
        message: v.message,
        consents: {
          dataProcessing: true,
          creditBureau: v.creditBureau,
          version: APPLICATION_CONSENT_VERSION,
        },
        meta: {
          locale,
          sourcePath: String(form.get('sourcePath') ?? '').slice(0, 200) || undefined,
          utmSource: utm('utm_source'),
          utmCampaign: utm('utm_campaign'),
        },
      },
    })
    // The application is stored: a failure from here on must not tell the farmer it was lost.
    try {
      await notifyApplication(application)
    } catch (error) {
      console.error(`after application ${application.reference}`, error)
    }
    const person = typeof application.assignedTo === 'object' ? application.assignedTo : null
    return {
      status: 'success',
      reference: application.reference,
      assignee: person ? { name: person.name, role: person.role } : undefined,
    }
  } catch (error) {
    console.error('submitApplication failed', error)
    return { status: 'error', message: t.failed, values, attempt: Date.now() }
  }
}
