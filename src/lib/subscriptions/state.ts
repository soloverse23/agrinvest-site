/**
 * Subscription form state and consent wording, shared by the form (client) and the server
 * action. No dependencies, so the client bundle stays small.
 */
import type { Locale } from '@/i18n/config'

/** Bump when the wording below changes; stored on every subscription with the text itself. */
export const SUBSCRIPTION_CONSENT_VERSION = '2026-11-v1'

export const subscriptionConsent: Record<Locale, string> = {
  ro: 'Sunt de acord ca Agrinvest să îmi trimită alertele și buletinul alese mai sus, la adresa sau la numărul pe care l-am scris. Datele mele sunt folosite doar pentru aceste mesaje și mă pot dezabona oricând.',
  en: 'I agree that Agrinvest may send me the alerts and newsletter chosen above, at the address or number I entered. My details are used only for these messages, and I can unsubscribe at any time.',
}

export type SubscriptionField =
  'channel' | 'email' | 'phone' | 'topic' | 'crop' | 'rule' | 'threshold' | 'county' | 'consent'

export type SubscriptionFormState = {
  status: 'idle' | 'error' | 'success'
  errors?: Partial<Record<SubscriptionField, string>>
  message?: string
  values?: Partial<Record<SubscriptionField, string>>
}

export const initialSubscriptionState: SubscriptionFormState = { status: 'idle' }
