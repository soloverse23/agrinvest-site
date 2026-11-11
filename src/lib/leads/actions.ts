'use server'

import { headers } from 'next/headers'

import { isLocale, type Locale } from '@/i18n/config'
import { payloadClient } from '@/lib/content/payload'

import { CONSENT_VERSION, leadSchema, type LeadField, type LeadFormState } from './form'
import { notifyLead } from './notify'
import { checkFollowUp, followUpToken, parseContact } from './quick'
import { allow } from './rate-limit'
import type { QuickRequestState } from './state'

const copy = {
  ro: {
    limit: 'Ai trimis deja mai multe cereri. Te rugăm să încerci din nou peste câteva minute.',
    failed: 'Cererea nu a putut fi trimisă. Te rugăm să ne suni sau să încerci din nou.',
    contact: 'Scrie un telefon (de exemplu 0741 201 056) sau o adresă de e-mail.',
    phone: 'Scrie un număr de telefon valid, de exemplu 0741 201 056.',
  },
  en: {
    limit: 'You have already sent several requests. Please try again in a few minutes.',
    failed: 'We could not send your request. Please call us or try again.',
    contact: 'Enter a phone number (e.g. +40 741 201 056) or an email address.',
    phone: 'Please enter a valid phone number, e.g. +40 741 201 056.',
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
  'quantity',
  'deliveryDate',
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

const ipOf = async () => {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
}

const idList = (value: FormDataEntryValue | null) =>
  String(value ?? '')
    .split(',')
    .filter((id) => /^\d+$/.test(id))
    .slice(0, 50)
    .map(Number)

/** A positive number below a sane ceiling, or undefined. */
const positive = (value: FormDataEntryValue | null, max: number) => {
  const n = Number(String(value ?? '').replace(',', '.'))
  return Number.isFinite(n) && n > 0 && n <= max ? n : undefined
}

/**
 * The one-field quick request (decision 0010): a phone or an email, nothing else required.
 * The product, pack, quantity and hectares come from the page it was sent from. A second
 * submission with the signed follow-up adds a phone to the same lead instead of a new one.
 */
export async function submitQuickRequest(
  _prev: QuickRequestState,
  form: FormData,
): Promise<QuickRequestState> {
  const rawLocale = form.get('locale')
  const locale: Locale = typeof rawLocale === 'string' && isLocale(rawLocale) ? rawLocale : 'ro'
  const t = copy[locale]
  const value = String(form.get('contact') ?? '').slice(0, 160)
  if (form.get('website')) return { status: 'success', contact: 'phone' }

  const contact = parseContact(value)
  const lead = Number(form.get('lead'))
  const token = String(form.get('token') ?? '')
  const followUp = Number.isInteger(lead) && lead > 0 && token ? { lead, token } : undefined
  if (!contact || (followUp && !('phone' in contact)))
    return { status: 'error', value, error: followUp ? t.phone : t.contact, followUp }

  if (process.env.NODE_ENV === 'production' && !allow(await ipOf()))
    return { status: 'error', value, error: t.limit, followUp }

  try {
    const payload = await payloadClient()
    if (followUp) {
      // Only the visitor who just sent the request may add to it, and only a missing phone.
      if (!checkFollowUp(followUp.lead, followUp.token))
        return { status: 'error', value, error: t.failed }
      const existing = await payload.findByID({ collection: 'leads', id: followUp.lead, depth: 0 })
      if (existing.type !== 'quick' || existing.phone)
        return { status: 'success', contact: 'phone', completed: true }
      await payload.update({ collection: 'leads', id: followUp.lead, data: contact })
      return { status: 'success', contact: 'phone', completed: true }
    }

    const quantity = positive(form.get('quantity'), 999)
    const hectares = positive(form.get('hectares'), 100_000)
    const created = await payload.create({
      collection: 'leads',
      depth: 1,
      data: {
        type: 'quick',
        status: 'new',
        ...contact,
        product: idList(form.get('product')),
        variant: String(form.get('variant') ?? '').slice(0, 60) || undefined,
        quantity: quantity ? Math.round(quantity) : undefined,
        hectares,
        meta: {
          locale,
          sourcePath: String(form.get('sourcePath') ?? '').slice(0, 300),
          // No consent box: the legal basis is the visitor's own request (decision 0010).
          consentVersion: `${CONSENT_VERSION}:request`,
        },
      },
    })
    await notifyLead(created)
    const kind = 'phone' in contact ? 'phone' : 'email'
    return {
      status: 'success',
      contact: kind,
      followUp:
        kind === 'email' ? { lead: created.id, token: followUpToken(created.id) } : undefined,
    }
  } catch (error) {
    console.error('submitQuickRequest failed', error)
    return { status: 'error', value, error: t.failed }
  }
}
