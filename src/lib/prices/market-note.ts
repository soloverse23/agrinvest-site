/**
 * The weekly market note's first draft, written from the week's series (pure, no I/O). Staff
 * edit and publish it in the admin (`Guides`, section `piata`); the job never publishes. The
 * draft states only what the data says: the latest weekly price, its change and the date.
 */
import type { Locale } from '@/i18n/config'
import { formatDate, formatNumber, formatSigned } from '@/lib/format'

import { seriesLabel, type SeriesLine } from './grain'

export type NoteCrop = {
  name: string
  /** The crop's lines (`cropLines`), main one first. */
  lines: SeriesLine[]
  /** Agrinvest's published range, if any. */
  agrinvest?: { min: number; max: number } | null
}

export type NoteDraft = {
  slug: string
  title: string
  summary: string
  markdown: string
}

const DAY = 86_400_000

function move(line: SeriesLine, weeksBack: number) {
  const pts = line.points
  const last = pts[pts.length - 1]
  if (!last) return null
  const target = last.date.getTime() - weeksBack * 7 * DAY
  const before = [...pts].reverse().find((p) => p.date.getTime() <= target + DAY)
  return before && before !== last ? last.value - before.value : null
}

const words = {
  ro: {
    slug: (d: string) => `nota-${d}`,
    title: (date: string) => `Nota de piață, săptămâna din ${date}`,
    summary: (n: number, date: string) =>
      n === 1
        ? `Prețul UE pentru România la o cultură, cu ultimele date din ${date}.`
        : `Prețurile UE pentru România la ${n} culturi, cu ultimele date din ${date}.`,
    intro:
      'Ciornă generată din prețurile săptămânale raportate de România Comisiei Europene. Verifică cifrele, adaugă ce înseamnă pentru fermier și publică.',
    line: (label: string, market: string, value: string, unit: string, date: string) =>
      `**${label}** (${market}): ${value} ${unit} în săptămâna din ${date}`,
    week: (v: string) => `${v} față de săptămâna dinainte`,
    month: (v: string) => `${v} în patru săptămâni`,
    flat: 'fără schimbare față de săptămâna dinainte',
    agrinvest: (min: string, max: string) =>
      min === max
        ? `Agrinvest cumpără cu ${min} lei/t.`
        : `Agrinvest cumpără cu ${min}–${max} lei/t, după bază.`,
    onRequest: 'Prețul Agrinvest: la cerere.',
    meaning: '## Ce înseamnă pentru fermier',
    todo: '(De scris de echipă.)',
    source: 'Sursa: Comisia Europeană, portalul de date agroalimentare (CC BY 4.0).',
  },
  en: {
    slug: (d: string) => `note-${d}`,
    title: (date: string) => `Market note, week of ${date}`,
    summary: (n: number, date: string) =>
      n === 1
        ? `The EU price for Romania for one crop, with the latest data from ${date}.`
        : `EU prices for Romania for ${n} crops, with the latest data from ${date}.`,
    intro:
      'Draft written from the weekly prices Romania reports to the European Commission. Check the figures, add what they mean for farmers and publish.',
    line: (label: string, market: string, value: string, unit: string, date: string) =>
      `**${label}** (${market}): ${value} ${unit} in the week of ${date}`,
    week: (v: string) => `${v} on the week before`,
    month: (v: string) => `${v} over four weeks`,
    flat: 'unchanged on the week before',
    agrinvest: (min: string, max: string) =>
      min === max
        ? `Agrinvest buys at ${min} lei/t.`
        : `Agrinvest buys at ${min}–${max} lei/t, by base.`,
    onRequest: 'Agrinvest’s price: on request.',
    meaning: '## What it means for farmers',
    todo: '(For the team to write.)',
    source: 'Source: European Commission, Agri-food data portal (CC BY 4.0).',
  },
}

/** The draft for one language, or null when no crop has data. */
export function marketNoteDraft(week: Date, crops: NoteCrop[], locale: Locale): NoteDraft | null {
  const w = words[locale]
  const withData = crops.filter((c) => c.lines.some((l) => l.points.length))
  if (!withData.length) return null
  const latest = new Date(
    Math.max(...withData.flatMap((c) => c.lines.map((l) => +l.points[l.points.length - 1].date))),
  )
  const n = (v: number) => formatNumber(v, locale)
  const sections = withData.map((c) => {
    const items = c.lines
      .filter((l) => l.points.length)
      .map((l) => {
        const last = l.points[l.points.length - 1]
        const unit = `${l.currency === 'EUR' ? '€' : l.currency}/${l.unit}`
        const wk = move(l, 1)
        const mo = move(l, 4)
        const parts = [
          wk === null ? null : wk === 0 ? w.flat : w.week(formatSigned(wk, locale)),
          mo === null ? null : w.month(formatSigned(mo, locale)),
        ].filter(Boolean)
        const head = w.line(
          seriesLabel(l.series),
          l.market,
          n(last.value),
          unit,
          formatDate(last.date, locale),
        )
        return `- ${head}${parts.length ? `, ${parts.join(', ')}` : ''}.`
      })
    const own = c.agrinvest ? w.agrinvest(n(c.agrinvest.min), n(c.agrinvest.max)) : w.onRequest
    return [`## ${c.name}`, items.join('\n'), own].join('\n\n')
  })
  const day = week.toISOString().slice(0, 10)
  return {
    slug: w.slug(day),
    title: w.title(formatDate(week, locale)),
    summary: w.summary(withData.length, formatDate(latest, locale)),
    markdown: [w.intro, ...sections, w.meaning, w.todo, w.source].join('\n\n'),
  }
}
