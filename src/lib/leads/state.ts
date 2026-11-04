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
