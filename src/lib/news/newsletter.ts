import type { Locale } from '@/i18n/config'
import { formatDate, formatNumber } from '@/lib/format'

export type IssueInput = {
  week: Date
  locale: Locale
  /** Agrinvest's published prices only; an empty list says "price on request". */
  prices: { name: string; price: number; place: string }[]
  headlines: { title: string; url: string; source: string }[]
  /** The latest weekly market note (`Guides`, section `piata`); its page arrives in 5.2. */
  note?: { title: string; summary: string; slug: string }
}

export type IssueContent = {
  subject: string
  intro: string
  content: {
    note: IssueInput['note'] | null
    prices: IssueInput['prices']
    headlines: IssueInput['headlines']
  }
}

/** Monday 00:00 UTC of the week that contains `date`. */
export function weekStart(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
  return d
}

const copy = {
  ro: {
    subject: (d: string) => `Agrinvest: piața săptămânii ${d}`,
    intro: 'Prețurile Agrinvest, nota de piață și știrile agricole ale săptămânii.',
    noPrices: 'Prețurile Agrinvest se dau la cerere: sună-ne sau trimite o cerere.',
  },
  en: {
    subject: (d: string) => `Agrinvest: the market in the week of ${d}`,
    intro: "Agrinvest's prices, the market note and the week's farm news.",
    noPrices: "Agrinvest's prices are given on request: call us or send a request.",
  },
}

/** The weekly issue as staff will review it. Never adds a price that was not published. */
export function buildIssue(input: IssueInput): IssueContent {
  const c = copy[input.locale]
  const lines = input.prices.map(
    (p) => `${p.name}, ${p.place}: ${formatNumber(p.price, input.locale)} lei/t`,
  )
  return {
    subject: c.subject(formatDate(input.week, input.locale)),
    intro: [c.intro, lines.length ? lines.join('\n') : c.noPrices].join('\n\n'),
    content: { note: input.note ?? null, prices: input.prices, headlines: input.headlines },
  }
}

/** Plain-text body for the Outbox row. */
export function issueText(issue: { intro?: string | null; content?: unknown }): string {
  const content = (issue.content ?? {}) as Partial<IssueContent['content']>
  const parts = [issue.intro ?? '']
  if (content.note) parts.push(`${content.note.title}\n${content.note.summary}`)
  for (const h of content.headlines ?? []) parts.push(`${h.title} (${h.source})\n${h.url}`)
  return parts.filter(Boolean).join('\n\n')
}
