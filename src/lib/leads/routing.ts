import type { PayloadRequest } from 'payload'

import type { LeadType } from './types'

/** The person who owns a type of request (Lead routing global), with `general` as the fallback. */
export async function routedPerson(req: PayloadRequest, type: LeadType) {
  const routing = await req.payload.findGlobal({ slug: 'lead-routing', depth: 0, req })
  const route =
    routing.routes?.find((r) => r.type === type) ??
    routing.routes?.find((r) => r.type === 'general')
  const person = route?.primary ?? route?.fallback
  if (!person) return undefined
  return typeof person === 'object' ? person.id : person
}
