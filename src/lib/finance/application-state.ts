/**
 * Application state shared by the form (client) and the server action. No dependencies, so the
 * client bundle stays small; validation lives in `./application` (server only).
 */

/**
 * Bump when the consent texts change; stored on every application. `draft` until the lawyer
 * replaces the wording (decision 0007).
 */
export const APPLICATION_CONSENT_VERSION = 'finance-2026-11-draft'

export type ApplicationField =
  | 'borrower'
  | 'cui'
  | 'company'
  | 'name'
  | 'phone'
  | 'email'
  | 'county'
  | 'product'
  | 'amount'
  | 'termMonths'
  | 'crops'
  | 'area'
  | 'guarantees'
  | 'message'
  | 'consent'
  | 'creditBureau'

export type ApplicationState = {
  status: 'idle' | 'error' | 'success'
  errors?: Partial<Record<ApplicationField, string>>
  /** Form-level message (rate limit, server error). */
  message?: string
  /** Submitted values, so the form keeps them after an error without JavaScript. Lists are comma-joined. */
  values?: Partial<Record<ApplicationField, string>>
  /**
   * Changes on every failed attempt, so the form remounts with what was typed. React resets a
   * form after an action, and a reset does not restore a select's value.
   */
  attempt?: number
  reference?: string
  assignee?: { name: string; role?: string | null }
}

export const initialApplicationState: ApplicationState = { status: 'idle' }
