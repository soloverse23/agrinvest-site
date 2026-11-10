import type { Payload } from 'payload'

import { sendMessage } from '@/lib/messaging/send'
import { weekStart } from '@/lib/news/newsletter'

/**
 * The weekly editorial digest (`editorialDigest` job, Mondays). It lists:
 * - guides due for a refresh: published more than a year ago without an update, past their
 *   `brief.refreshBy` date, or marked "needs a refresh" by an editor after a ranking drop;
 * - briefs past their planned date that are not published yet (the editorial calendar).
 * It goes to the Outbox like every message (decision 0008); `EDITORIAL_EMAIL` names the
 * editor, and nothing is sent until a provider exists.
 */
export const REFRESH_AFTER_DAYS = 365

type Row = { id: number; title: string; why: string }

export function digestBody(refresh: Row[], overdue: Row[]): string {
  const block = (title: string, rows: Row[]) =>
    rows.length ? [title, ...rows.map((r) => `- ${r.title} (#${r.id}): ${r.why}`), ''] : []
  return [
    ...block('De actualizat / Needs a refresh', refresh),
    ...block('Întârziate față de calendar / Behind the calendar', overdue),
    'Admin: /admin/collections/guides',
  ].join('\n')
}

export async function editorialDigest(payload: Payload, now = new Date()) {
  const day = (d: string | null | undefined) => (d ? d.slice(0, 10) : '')
  const yearAgo = new Date(now.getTime() - REFRESH_AFTER_DAYS * 86_400_000).toISOString()
  const today = now.toISOString()
  const common = {
    collection: 'guides' as const,
    depth: 0,
    pagination: false as const,
    locale: 'ro' as const,
  }

  const due = await payload.find({
    ...common,
    where: {
      and: [
        { section: { equals: 'ghid' } },
        { _status: { equals: 'published' } },
        {
          or: [
            { updatedAt: { less_than: yearAgo } },
            { 'brief.refreshBy': { less_than_equal: today } },
            { 'brief.status': { equals: 'de-actualizat' } },
          ],
        },
      ],
    },
  })
  const late = await payload.find({
    ...common,
    draft: true,
    where: {
      and: [
        { section: { equals: 'ghid' } },
        { 'brief.plannedFor': { less_than_equal: today } },
        { 'brief.status': { not_in: ['publicat', 'de-actualizat'] } },
      ],
    },
  })

  const refresh: Row[] = due.docs.map((d) => ({
    id: d.id,
    title: d.title,
    why:
      d.brief?.status === 'de-actualizat'
        ? 'marked by an editor'
        : d.brief?.refreshBy && d.brief.refreshBy <= today
          ? `refresh date ${day(d.brief.refreshBy)}`
          : `last updated ${day(d.updatedAt)}`,
  }))
  const overdue: Row[] = late.docs
    .filter((d) => d._status !== 'published')
    .map((d) => ({
      id: d.id,
      title: d.title,
      why: `planned for ${day(d.brief?.plannedFor)}, status ${d.brief?.status ?? 'idee'}`,
    }))
  if (!refresh.length && !overdue.length) return { refresh: 0, overdue: 0 }

  const week = weekStart(now).toISOString().slice(0, 10)
  const result = await sendMessage(payload, {
    channel: 'email',
    to: process.env.EDITORIAL_EMAIL || 'editorial (EDITORIAL_EMAIL not set)',
    template: 'editorial-digest',
    subject: `Ghiduri: ${refresh.length} de actualizat, ${overdue.length} întârziate (${week})`,
    body: digestBody(refresh, overdue),
    payload: { refresh, overdue },
    dedupeKey: `editorial-digest-${week}`,
  })
  return { refresh: refresh.length, overdue: overdue.length, status: result.status }
}
