/**
 * Brings the figures register of a live site up to date with the seed, which itself follows
 * `docs/audit/figures-register.md`. The seed runs only on an empty database, so without this
 * a deploy would leave old values in place.
 *
 * Order matters, so a page never shows a raw key: add and update rows, correct the pages, and
 * only then retire old rows. A row confirmed in the admin is left alone: once somebody has
 * signed a value there, it outranks the file.
 */
import type { Payload } from 'payload'

import { figures as seeded } from '../seed/data'
import { registerConfirmation, registerStatuses } from '../seed/register'
import { applyCorrections, splitKeys } from './corrections'

const context = { skipChildren: true }

type Obj = Record<string, unknown>
type Row = Obj & { id?: string; key: string }
type Wanted = (typeof seeded)[number]

const readRows = async (payload: Payload, locale: 'ro' | 'en') =>
  ((await payload.findGlobal({ slug: 'figures', locale, depth: 0 })).rows ?? []) as unknown as Row[]

async function writeRows(
  payload: Payload,
  rows: Row[],
  english: (row: Row, i: number) => Obj,
): Promise<void> {
  const ro = await payload.updateGlobal({
    slug: 'figures',
    locale: 'ro',
    data: { rows } as never,
    context,
  })
  await payload.updateGlobal({
    slug: 'figures',
    locale: 'en',
    data: { rows: ((ro.rows ?? []) as unknown as Row[]).map(english) } as never,
    context,
  })
}

const fields = (f: Wanted, side: 'ro' | 'en') => ({
  label: f.label[side],
  value: f.value[side],
  unit: 'unit' in f ? f.unit?.[side] : undefined,
})

const same = (row: Row | undefined, want: Obj) =>
  Boolean(row) && Object.keys(want).every((k) => (row?.[k] ?? undefined) === want[k])

export async function applyFigures(
  payload: Payload,
  log: (s: string) => void = console.log,
  wanted: readonly Wanted[] = seeded,
) {
  const statusOf = registerStatuses()
  const confirmation = registerConfirmation()
  const ro = await readRows(payload, 'ro')
  const en = new Map((await readRows(payload, 'en')).map((r) => [r.id, r]))
  const byKey = new Map(ro.map((r) => [r.key, r]))

  const shared = (f: Wanted) => ({
    number: 'number' in f ? f.number : undefined,
    source: f.source,
    status: statusOf(f.key),
    ...confirmation(f.key),
  })
  /** Signed in the admin: confirmed on another date than the register states. */
  const signed = (row: Row, f: Wanted) =>
    Boolean(row.confirmedAt) &&
    String(row.confirmedAt).slice(0, 10) !== confirmation(f.key)?.confirmedAt
  const stale = wanted.filter((f) => {
    const row = byKey.get(f.key)
    if (!row) return true
    if (signed(row, f)) return false
    const { unit: _u, ...roWant } = fields(f, 'ro')
    const { unit: _v, ...enWant } = fields(f, 'en')
    return (
      !same(row, roWant) || !same(row, { status: statusOf(f.key) }) || !same(en.get(row.id), enWant)
    )
  })

  if (stale.length) {
    const wantedRow = new Map(stale.map((f) => [f.key, f]))
    const rows: Row[] = [
      ...ro.map((row) => {
        const f = wantedRow.get(row.key)
        return f ? { ...row, ...fields(f, 'ro'), ...shared(f) } : row
      }),
      ...stale
        .filter((f) => !byKey.has(f.key))
        .map((f) => ({ key: f.key, ...fields(f, 'ro'), ...shared(f) })),
    ]
    await writeRows(payload, rows, (row) => {
      const f = wantedRow.get(row.key)
      if (f) return { ...row, ...fields(f, 'en') }
      const old = en.get(row.id)
      return { ...row, label: old?.label, value: old?.value, unit: old?.unit }
    })
    log(`figures: ${stale.length} row(s) added or updated`)
  }

  await applyCorrections(payload, log)

  const retired = Object.keys(splitKeys).filter((k) => byKey.has(k))
  if (retired.length) {
    const rows = await readRows(payload, 'ro')
    const english = new Map((await readRows(payload, 'en')).map((r) => [r.id, r]))
    await writeRows(
      payload,
      rows.filter((r) => !retired.includes(r.key)),
      (row) => {
        const old = english.get(row.id)
        return { ...row, label: old?.label, value: old?.value, unit: old?.unit }
      },
    )
    log(`figures: retired ${retired.join(', ')}`)
  }
}
