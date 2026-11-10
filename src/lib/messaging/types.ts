export const messageChannels = ['email', 'whatsapp'] as const
export type MessageChannel = (typeof messageChannels)[number]

export const messageTemplates = [
  'price-alert',
  'frost-alert',
  'newsletter',
  'subscription-confirm',
  'editorial-digest',
] as const
export type MessageTemplate = (typeof messageTemplates)[number]

export type Message = {
  channel: MessageChannel
  to: string
  template: MessageTemplate
  subject: string
  body: string
  payload?: Record<string, unknown>
  subscription?: number
  /** Same key, same message: a second write is skipped (alerts re-evaluated after a rerun). */
  dedupeKey?: string
}

export type SendResult = { status: 'stubbed' | 'sent' | 'failed' | 'duplicate'; id?: number }
