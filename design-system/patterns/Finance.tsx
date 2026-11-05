import type { ReactNode } from 'react'

import { Callout } from './Sections'

/** Says what a finance page is, and is not. Shown until the page is approved. */
export function ReviewNote({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Callout tone="note" title={title}>
      {children}
    </Callout>
  )
}

/** The public sources of a page, each with the day it was read. */
export function SourceList({
  title,
  lead,
  retrieved,
  items,
}: {
  title: string
  lead?: string
  retrieved: string
  items: { title: string; url: string; date: string }[]
}) {
  if (!items.length) return null
  return (
    <section className="grid gap-3 border-t border-line pt-6">
      <h2 className="text-h4 font-semibold text-ink">{title}</h2>
      {lead && <p className="text-small text-muted">{lead}</p>}
      <ol className="grid gap-2 pl-5 text-small text-muted [list-style:decimal]">
        {items.map((s) => (
          <li key={s.url}>
            <a href={s.url} rel="noopener" className="text-accent underline underline-offset-2">
              {s.title}
            </a>
            <span className="text-subtle">
              {' '}
              ({retrieved} {s.date})
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

/** A worked example: the farm in a few sentences, then the numbers. */
export function WorkedExample({
  kicker,
  title,
  note,
  rows,
  children,
}: {
  kicker: string
  title: string
  note: string
  rows: { label: string; value: ReactNode }[]
  children: ReactNode
}) {
  return (
    <figure className="grid gap-5 rounded-lg bg-raised p-6 shadow-soft ring-1 ring-line md:p-8">
      <figcaption className="grid gap-2">
        <span className="text-caption font-medium text-accent">{kicker}</span>
        <span className="text-h4 font-semibold text-ink">{title}</span>
      </figcaption>
      <div>{children}</div>
      <dl className="grid divide-y divide-line border-y border-line">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-6 py-3">
            <dt className="text-small text-muted">{row.label}</dt>
            <dd className="text-right font-semibold text-ink tabular-nums">{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-caption text-subtle">{note}</p>
    </figure>
  )
}

/** Two labelled columns that stack on phones, so nothing scrolls sideways. */
function PairTable({
  caption,
  heads,
  rows,
}: {
  caption: string
  heads: string[]
  rows: { key: string; cells: ReactNode[] }[]
}) {
  return (
    <div className="overflow-hidden rounded-lg bg-raised shadow-soft ring-1 ring-line">
      <table className="w-full text-left text-small">
        <caption className="sr-only">{caption}</caption>
        <thead className="hidden bg-surface text-caption text-muted md:table-header-group">
          <tr>
            {heads.map((h) => (
              <th key={h} scope="col" className="px-5 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.key} className="grid gap-1 px-5 py-4 md:table-row md:p-0">
              {row.cells.map((cell, i) =>
                i === 0 ? (
                  <th key={i} scope="row" className="font-semibold text-ink md:px-5 md:py-4">
                    {cell}
                  </th>
                ) : (
                  <td key={i} className="text-muted md:px-5 md:py-4">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Which guarantees a product accepts, and what each one involves. */
export function GuaranteeTable({
  caption,
  heads,
  rows,
}: {
  caption: string
  heads: [string, string]
  rows: { kind: string; note: string }[]
}) {
  return (
    <PairTable
      caption={caption}
      heads={heads}
      rows={rows.map((r) => ({ key: r.kind, cells: [r.kind, r.note] }))}
    />
  )
}

/** When instalments fall in the farm year. */
export function RepaymentCalendar({
  caption,
  heads,
  rows,
}: {
  caption: string
  heads: [string, string, string]
  rows: { label: string; crops: string; when: string }[]
}) {
  return (
    <PairTable
      caption={caption}
      heads={heads}
      rows={rows.map((r) => ({ key: r.label, cells: [r.label, r.crops, r.when] }))}
    />
  )
}
