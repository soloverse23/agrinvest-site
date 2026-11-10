import type { Payload } from 'payload'

import { canSend, sendMessage } from '@/lib/messaging/send'
import type { Newsletter } from '@/payload-types'

import { issueText } from './newsletter'

/**
 * Puts an approved issue in the Outbox, one message per newsletter subscriber in the issue's
 * language. With no provider yet, pending subscribers are included so staff see the whole
 * list; nothing is sent either way until a provider exists.
 */
export async function queueNewsletter(payload: Payload, issue: Newsletter) {
  const includePending = !canSend('email')
  const subs = await payload.find({
    collection: 'subscriptions',
    where: {
      and: [
        { locale: { equals: issue.locale } },
        { 'topics.kind': { equals: 'newsletter' } },
        {
          status: includePending ? { in: ['pending', 'confirmed'] } : { equals: 'confirmed' },
        },
      ],
    },
    pagination: false,
    depth: 0,
  })
  const body = issueText(issue) || issue.subject
  let queued = 0
  for (const sub of subs.docs) {
    const to = sub.channel === 'email' ? sub.email : sub.phone
    if (!to) continue
    const result = await sendMessage(payload, {
      channel: sub.channel,
      to,
      template: 'newsletter',
      subject: issue.subject,
      body,
      subscription: sub.id,
      payload: { newsletter: issue.id },
      dedupeKey: `newsletter|${issue.key}|${sub.id}`,
    })
    if (result.status !== 'duplicate') queued++
  }
  return { queued }
}
