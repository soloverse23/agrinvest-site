import { randomBytes } from 'crypto'
import type { Payload, Where } from 'payload'

import type { Locale } from '@/i18n/config'

import { topicRow, type SubscriptionInput } from './form'
import { SUBSCRIPTION_CONSENT_VERSION, subscriptionConsent } from './state'

type TopicRow = ReturnType<typeof topicRow>

const sameTopic = (a: TopicRow, b: Record<string, unknown>) => {
  const id = (v: unknown) =>
    v && typeof v === 'object' && 'id' in v ? (v as { id: number }).id : (v ?? undefined)
  return (
    a.kind === b.kind &&
    id((a as { crop?: number }).crop) === id(b.crop) &&
    id((a as { county?: number }).county) === id(b.county) &&
    ((a as { rule?: string }).rule ?? null) === (b.rule ?? null) &&
    ((a as { threshold?: number }).threshold ?? null) === (b.threshold ?? null)
  )
}

/**
 * Stores a sign-up. One row per contact: a second sign-up from the same address adds its
 * topic to the existing row and records the newer consent. Unsubscribed rows are reopened
 * as pending, because the visitor has just agreed again.
 */
export async function storeSubscription(
  payload: Payload,
  input: SubscriptionInput,
  locale: Locale,
  now = new Date(),
) {
  const contact: Where =
    input.channel === 'email'
      ? { email: { equals: input.email } }
      : { phone: { equals: input.phone } }
  const consent = {
    version: SUBSCRIPTION_CONSENT_VERSION,
    at: now.toISOString(),
    text: subscriptionConsent[locale],
    sourcePath: input.sourcePath,
  }
  const topic = topicRow(input)

  const existing = await payload.find({
    collection: 'subscriptions',
    where: { and: [contact, { channel: { equals: input.channel } }] },
    limit: 1,
    depth: 0,
  })
  const row = existing.docs[0]
  if (row) {
    const topics = (row.topics ?? []).map(({ id: _id, ...t }) => t)
    const hasTopic = topics.some((t) => sameTopic(topic, t))
    return payload.update({
      collection: 'subscriptions',
      id: row.id,
      depth: 0,
      data: {
        locale,
        consent,
        status: row.status === 'unsubscribed' ? 'pending' : row.status,
        topics: hasTopic ? topics : [...topics, topic],
      },
    })
  }

  return payload.create({
    collection: 'subscriptions',
    depth: 0,
    data: {
      channel: input.channel,
      email: input.channel === 'email' ? input.email : undefined,
      phone: input.channel === 'whatsapp' ? input.phone : undefined,
      locale,
      topics: [topic],
      status: 'pending',
      consent,
      token: randomBytes(24).toString('base64url'),
    },
  })
}
