import type { Locale } from '@/i18n/config'
import { formatDate, formatNumber } from '@/lib/format'
import type { Message } from '@/lib/messaging/types'

import type { AlertRule } from './topics'

export type AlertSubscriber = {
  id: number
  channel: 'email' | 'whatsapp'
  email?: string | null
  phone?: string | null
  locale: Locale
  status: 'pending' | 'confirmed' | 'unsubscribed'
  topics: {
    kind: string
    crop?: number | null
    rule?: AlertRule | null
    threshold?: number | null
  }[]
}

/** Agrinvest's published price for one crop now and at the previous change. */
export type CropPriceChange = {
  crop: number
  name: Record<Locale, string>
  current: { price: number; date: Date }
  previous?: { price: number; date: Date }
}

/** Does this change trigger the rule? No previous price means no change to report. */
export function triggers(
  rule: AlertRule,
  threshold: number | null | undefined,
  change: CropPriceChange,
): boolean {
  const prev = change.previous?.price
  const cur = change.current.price
  if (prev === undefined) return false
  if (rule === 'any') return cur !== prev
  if (threshold == null) return false
  return rule === 'above'
    ? prev < threshold && cur >= threshold
    : prev > threshold && cur <= threshold
}

const text = {
  ro: (name: string, price: string, prev: string, date: string) => ({
    subject: `Prețul Agrinvest la ${name.toLowerCase()}: ${price} lei/t`,
    body: `Agrinvest cumpără ${name.toLowerCase()} cu ${price} lei/t de la ${date} (înainte: ${prev} lei/t).`,
  }),
  en: (name: string, price: string, prev: string, date: string) => ({
    subject: `Agrinvest's ${name.toLowerCase()} price: ${price} lei/t`,
    body: `Agrinvest buys ${name.toLowerCase()} at ${price} lei/t from ${date} (before: ${prev} lei/t).`,
  }),
}

/**
 * Messages for every subscriber whose price alert the change triggers. Until a provider
 * exists, pending subscribers are included too: the messages only reach the Outbox, which
 * then shows what each of them would receive.
 */
export function priceAlertMessages(
  subscribers: AlertSubscriber[],
  changes: CropPriceChange[],
  { includePending }: { includePending: boolean },
): Message[] {
  const messages: Message[] = []
  for (const sub of subscribers) {
    if (sub.status === 'unsubscribed' || (sub.status === 'pending' && !includePending)) continue
    const to = sub.channel === 'email' ? sub.email : sub.phone
    if (!to) continue
    for (const topic of sub.topics) {
      if (topic.kind !== 'price-alert' || !topic.crop) continue
      const change = changes.find((c) => c.crop === topic.crop)
      if (!change || !triggers(topic.rule ?? 'any', topic.threshold, change)) continue
      const l = sub.locale
      const { subject, body } = text[l](
        change.name[l],
        formatNumber(change.current.price, l),
        formatNumber(change.previous!.price, l),
        formatDate(change.current.date, l),
      )
      messages.push({
        channel: sub.channel,
        to,
        template: 'price-alert',
        subject,
        body,
        subscription: sub.id,
        payload: { crop: change.crop, price: change.current.price, rule: topic.rule },
        dedupeKey: `price-alert|${sub.id}|${change.crop}|${change.current.date.toISOString().slice(0, 10)}|${topic.rule ?? 'any'}|${topic.threshold ?? ''}`,
      })
    }
  }
  return messages
}

type PriceRow = { crop: number; price: number; validFrom: string }

/**
 * From published buy-price rows, each crop's headline price (the highest across bases) on
 * its latest date and on the date before.
 */
export function cropChanges(
  rows: PriceRow[],
  names: Map<number, Record<Locale, string>>,
): CropPriceChange[] {
  const byCrop = new Map<number, Map<string, number>>()
  for (const r of rows) {
    const day = r.validFrom.slice(0, 10)
    const dates = byCrop.get(r.crop) ?? new Map<string, number>()
    dates.set(day, Math.max(dates.get(day) ?? 0, r.price))
    byCrop.set(r.crop, dates)
  }
  const out: CropPriceChange[] = []
  for (const [crop, dates] of byCrop) {
    const name = names.get(crop)
    if (!name) continue
    const [latest, before] = [...dates.keys()].sort().reverse()
    out.push({
      crop,
      name,
      current: { price: dates.get(latest)!, date: new Date(latest) },
      previous: before ? { price: dates.get(before)!, date: new Date(before) } : undefined,
    })
  }
  return out
}
