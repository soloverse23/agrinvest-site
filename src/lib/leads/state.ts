/**
 * Lead form state shared by the form (client) and the server action. No dependencies, so
 * the client bundle stays small; validation lives in `./form` (server only).
 */

/** Bump when the consent wording changes; stored on every lead. */
export const CONSENT_VERSION = '2026-11-v1'

export type LeadField =
  | 'name'
  | 'phone'
  | 'email'
  | 'company'
  | 'cui'
  | 'county'
  | 'base'
  | 'crop'
  | 'message'
  | 'quantity'
  | 'deliveryDate'
  | 'consent'

export type LeadFormState = {
  status: 'idle' | 'error' | 'success'
  errors?: Partial<Record<LeadField, string>>
  /** Form-level message (rate limit, server error). */
  message?: string
  /** Who will reply, shown on success. */
  assignee?: { name: string; role?: string | null }
  /** Submitted values, so the form keeps them after an error without JavaScript. */
  values?: Partial<Record<LeadField, string>>
}

export const initialLeadState: LeadFormState = { status: 'idle' }

/** The one-field quick request (decision 0010). */
export type QuickRequestState = {
  status: 'idle' | 'error' | 'success'
  /** What the visitor typed, kept after an error so the field is not emptied. */
  value?: string
  error?: string
  /** Which contact was given; after an email the success state offers to add a phone. */
  contact?: 'phone' | 'email'
  /** Lets the same visitor add a phone to the lead just stored (signed, short-lived). */
  followUp?: { lead: number; token: string }
  /** True once the phone was added to an earlier quick request. */
  completed?: boolean
}

export const initialQuickState: QuickRequestState = { status: 'idle' }
