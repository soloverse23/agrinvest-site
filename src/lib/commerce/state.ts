/**
 * Checkout state shared by the form (client) and the server action. No dependencies, so the
 * client bundle stays small; validation lives in `./checkout` (server only).
 */

/** Bump when the terms of sale change; stored on every order. */
export const TERMS_VERSION = '2026-11-draft'

export const CART_COOKIE = 'agrinvest_cart'
/** Readable by the header's counter, so pages stay static. It holds a number and nothing else. */
export const CART_COUNT_COOKIE = 'agrinvest_cart_count'

export type CheckoutField =
  | 'buyerType'
  | 'name'
  | 'phone'
  | 'email'
  | 'company'
  | 'cui'
  | 'regCom'
  | 'billingAddress'
  | 'deliveryMethod'
  | 'county'
  | 'address'
  | 'base'
  | 'certificateNumber'
  | 'certificateValidUntil'
  | 'payment'
  | 'message'
  | 'adult'
  | 'consent'
  | 'terms'

export type CheckoutState = {
  status: 'idle' | 'error' | 'success'
  errors?: Partial<Record<CheckoutField, string>>
  /** Form-level message (empty cart, blocked line, rate limit, server error). */
  message?: string
  /** Submitted values, so the form keeps them after an error without JavaScript. */
  values?: Partial<Record<CheckoutField, string>>
  /**
   * Changes on every failed attempt, so the form remounts with what was typed. React resets a
   * form after an action, and a reset does not restore a select's value.
   */
  attempt?: number
  reference?: string
  assignee?: { name: string; role?: string | null }
}

export const initialCheckoutState: CheckoutState = { status: 'idle' }

export type CompanyLookup =
  | { status: 'found'; name: string; address: string; regCom: string }
  | { status: 'not-found' | 'invalid' | 'unavailable' }
