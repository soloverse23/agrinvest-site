import type { PayloadRequest } from 'payload'

import type { LeadType } from './types'

/**
 * The person who owns a type of request (Lead routing global), with `general` as the fallback.
 * A quick request comes from the shop, so without its own route it goes to the inputs owner.
 */
export async function routedPerson(req: PayloadRequest, type: LeadType) {
  const routing = await req.payload.findGlobal({ slug: 'lead-routing', depth: 0, req })
  const find = (t: LeadType) => routing.routes?.find((r) => r.type === t)
  const route = find(type) ?? (type === 'quick' ? find('inputuri') : undefined) ?? find('general')
  const person = route?.primary ?? route?.fallback
  if (!person) return undefined
  return typeof person === 'object' ? person.id : person
}
