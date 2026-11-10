import type { Payload } from 'payload'

import type { Message, SendResult } from './types'

/**
 * A provider sends one message and throws on failure. None is configured yet: the owner has
 * not chosen an email or WhatsApp service (decision 0008), so every message is stubbed.
 */
type Provider = (message: Message) => Promise<void>

function provider(_channel: Message['channel']): Provider | null {
  return null
}

/**
 * The only way the site sends anything. Every message is written to the Outbox first; with
 * no provider it stays there as `stubbed`, so staff can see what would have gone out.
 */
export async function sendMessage(payload: Payload, message: Message): Promise<SendResult> {
  if (message.dedupeKey) {
    const existing = await payload.find({
      collection: 'outbox',
      where: { dedupeKey: { equals: message.dedupeKey } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs[0]) return { status: 'duplicate', id: existing.docs[0].id }
  }

  const send = provider(message.channel)
  let status: 'stubbed' | 'sent' | 'failed' = 'stubbed'
  let error: string | undefined
  if (send) {
    try {
      await send(message)
      status = 'sent'
    } catch (e) {
      status = 'failed'
      error = e instanceof Error ? e.message.slice(0, 300) : 'Unknown error'
    }
  }

  const row = await payload.create({
    collection: 'outbox',
    depth: 0,
    data: {
      channel: message.channel,
      to: message.to,
      template: message.template,
      subject: message.subject,
      body: message.body,
      payload: message.payload,
      subscription: message.subscription,
      dedupeKey: message.dedupeKey,
      status,
      error,
    },
  })
  return { status, id: row.id }
}

/** True once a provider exists; until then subscriptions stay pending. */
export const canSend = (channel: Message['channel']): boolean => provider(channel) !== null
