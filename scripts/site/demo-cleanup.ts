/**
 * Takes the demo seed's visible test content off a live site (owner, 2026-11-26): the
 * invented `@agrinvest.test` addresses and `+40 700 000 …` numbers of people stop being
 * public, and the three demo news go back to draft. Nothing is deleted. Only the demo seed's
 * own values and keys match, so real contacts and news stay. Safe to repeat.
 */
import type { Payload } from 'payload'

const context = { skipChildren: true, skipAlerts: true }

type Contact = { email?: string | null; phone?: string | null }

/** The publish switches to turn off for a person who still shows demo contact details. */
export function hiddenContact(person: Contact & Record<string, unknown>) {
  return {
    ...(person.publishEmail && person.email?.endsWith('@agrinvest.test')
      ? { publishEmail: false }
      : {}),
    ...(person.publishPhone && person.phone?.startsWith('+40 700 000 ')
      ? { publishPhone: false }
      : {}),
  }
}

export async function hideDemoContent(payload: Payload, log: (s: string) => void = console.log) {
  const people = await payload.find({ collection: 'people', pagination: false, depth: 0 })
  for (const person of people.docs) {
    const data = hiddenContact(person as never)
    if (!Object.keys(data).length) continue
    await payload.update({ collection: 'people', id: person.id, data, context })
    log(`demo cleanup: contact of ${person.name} is no longer public`)
  }
  const news = await payload.find({
    collection: 'guides',
    pagination: false,
    depth: 0,
    where: { key: { like: 'stiri-demo-' }, _status: { equals: 'published' } },
  })
  for (const doc of news.docs) {
    if (!doc.key?.startsWith('stiri-demo-')) continue
    await payload.update({
      collection: 'guides',
      id: doc.id,
      data: { _status: 'draft' },
      context,
    })
    log(`demo cleanup: ${doc.key} is a draft again`)
  }
}
