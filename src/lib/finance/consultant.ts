'use server'

import { isLocale, type Locale } from '@/i18n/config'
import { submitLead } from '@/lib/leads/actions'
import type { LeadFormState } from '@/lib/leads/state'

import { needById } from './needs'

/**
 * "Vorbește cu un consultant" (Phase 7g): a `finantare` lead with name, phone and email, like
 * every lead (the leads rule). What the farmer needs, the credit page it came from and an
 * optional note become the lead's message, so the consultant calls knowing the subject.
 */
export async function submitConsultant(
  prev: LeadFormState,
  form: FormData,
): Promise<LeadFormState> {
  const rawLocale = form.get('locale')
  const locale: Locale = typeof rawLocale === 'string' && isLocale(rawLocale) ? rawLocale : 'ro'
  const need = needById(form.get('need'))
  const credit = String(form.get('credit') ?? '').slice(0, 80)
  const note = String(form.get('note') ?? '').trim()
  const lines = [
    `${locale === 'ro' ? 'Nevoie' : 'Need'}: ${need ? need.label[locale] : locale === 'ro' ? 'nu știe încă' : 'not sure yet'}`,
    ...(credit ? [`${locale === 'ro' ? 'Pagina' : 'Page'}: ${credit}`] : []),
    ...(note ? ['', note] : []),
  ]
  const lead = new FormData()
  for (const key of ['locale', 'name', 'phone', 'email', 'consent', 'sourcePath', 'website'])
    lead.set(key, String(form.get(key) ?? ''))
  if (!form.get('consent')) lead.delete('consent')
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign'])
    lead.set(key, String(form.get(key) ?? ''))
  lead.set('type', 'finantare')
  lead.set('message', lines.join('\n').slice(0, 4000))
  const state = await submitLead(prev, lead)
  // Keep what the farmer typed in the note after an error (the lead form only knows `message`).
  return state.status === 'error' ? { ...state, values: { ...state.values, message: note } } : state
}
