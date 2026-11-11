/** Quick request helpers (server only): contact detection and the follow-up token. */
import { createHmac, timingSafeEqual } from 'node:crypto'

import { z } from 'zod'

import { normalizePhone } from './form'

export type QuickContact = { phone: string } | { email: string }

/** A phone (normalised) or an email, from one free-text field. Null when it is neither. */
export function parseContact(value: string): QuickContact | null {
  const v = value.trim()
  if (!v || v.length > 160) return null
  if (v.includes('@')) {
    const email = z.email().safeParse(v.toLowerCase())
    return email.success ? { email: email.data } : null
  }
  const phone = normalizePhone(v)
  return phone ? { phone } : null
}

/** How long the visitor may add a phone to the request they just sent. */
export const FOLLOW_UP_MS = 60 * 60 * 1000

const secret = () => process.env.PAYLOAD_SECRET || 'dev-secret'

const sign = (lead: number, issued: number) =>
  createHmac('sha256', secret()).update(`quick:${lead}:${issued}`).digest('base64url')

/** `{issued}.{signature}`: proves the visitor holding it created this lead, recently. */
export function followUpToken(lead: number, now = Date.now()) {
  return `${now}.${sign(lead, now)}`
}

export function checkFollowUp(lead: number, token: string, now = Date.now()) {
  const [issuedText, signature] = token.split('.')
  const issued = Number(issuedText)
  if (!Number.isFinite(issued) || !signature || now - issued > FOLLOW_UP_MS || issued > now)
    return false
  const expected = Buffer.from(sign(lead, issued))
  const given = Buffer.from(signature)
  return expected.length === given.length && timingSafeEqual(expected, given)
}
