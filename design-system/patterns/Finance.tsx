import Link from 'next/link'
import type { ReactNode } from 'react'

import { ArrowRightIcon, CoinsIcon } from '../icons/icons'
import { Button } from '../primitives/Button'

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

/**
 * A simulated repayment schedule: one row per instalment, then the totals. Numbers align right;
 * on narrow phones the table scrolls inside itself, never the page.
 */
export function RepaymentSchedule({
  caption,
  heads,
  rows,
  totals,
  phoneHidden = [],
}: {
  caption: string
  /** Harvest, principal, principal left, and interest when a rate was given. */
  heads: string[]
  /** Columns left out below 640 px, so the rest fits a phone without scrolling. */
  phoneHidden?: number[]
  rows: { key: string; cells: ReactNode[] }[]
  totals: { label: string; cells: ReactNode[] }
}) {
  const hide = (column: number) => (phoneHidden.includes(column) ? 'hidden sm:table-cell' : '')
  return (
    <div className="overflow-x-auto rounded-lg bg-raised shadow-soft ring-1 ring-line">
      <table className="w-full min-w-[20rem] text-left text-small">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-surface text-caption text-muted">
          <tr>
            {heads.map((h, i) => (
              <th
                key={h}
                scope="col"
                className={`px-4 py-3 font-medium md:px-5 ${i ? 'text-right' : ''} ${hide(i)}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.key}>
              {row.cells.map((cell, i) =>
                i === 0 ? (
                  <th key={i} scope="row" className="px-4 py-3 font-semibold text-ink md:px-5">
                    {cell}
                  </th>
                ) : (
                  <td
                    key={i}
                    className={`px-4 py-3 text-right text-muted tabular-nums md:px-5 ${hide(i)}`}
                  >
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-line bg-surface">
          <tr>
            <th scope="row" className="px-4 py-3 font-semibold text-ink md:px-5">
              {totals.label}
            </th>
            {totals.cells.map((cell, i) => (
              <td
                key={i}
                className={`px-4 py-3 text-right font-semibold text-ink tabular-nums md:px-5 ${hide(i + 1)}`}
              >
                {cell}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

/**
 * A one-line pointer to financing, for pages outside the section (a shop product). Brief and
 * contextual: a hint, never an offer.
 */
export function FinanceHint({
  text,
  link,
}: {
  text: ReactNode
  link: { href: string; label: string }
}) {
  return (
    <p className="flex items-start gap-3 rounded-md bg-surface px-4 py-3 text-small text-muted ring-1 ring-line">
      <CoinsIcon className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
      <span>
        {text}{' '}
        <Link href={link.href} className="font-medium text-accent underline underline-offset-2">
          {link.label}
        </Link>
      </span>
    </p>
  )
}

/**
 * The cart's financing callout: what the money could cover, when it would be repaid (the
 * farm year as three steps), where to read more. It never says the shopper qualifies.
 */
export function FinanceCallout({
  kicker,
  title,
  body,
  steps,
  primary,
  secondary,
  note,
}: {
  kicker: string
  title: string
  body: ReactNode
  /** The farm year: now, then the harvests the instalments follow. */
  steps: { when: string; label: string }[]
  primary: { href: string; label: string }
  secondary?: { href: string; label: string } | null
  note: string
}) {
  return (
    <aside className="grid gap-6 overflow-hidden rounded-xl bg-forest p-6 text-on-forest md:p-8">
      <div className="grid gap-3">
        <p className="flex items-center gap-3 text-small font-medium text-lime">
          <CoinsIcon className="size-5" aria-hidden="true" />
          {kicker}
        </p>
        <h2 className="text-h3 font-semibold text-balance">{title}</h2>
        <p className="text-on-forest-muted">{body}</p>
      </div>
      <ol className="grid grid-cols-3 gap-2 border-t border-on-forest/20 pt-5">
        {steps.map((step, i) => (
          <li key={step.when} className="grid content-start gap-2">
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`size-3 shrink-0 rounded-full ${i ? 'bg-lime' : 'border-2 border-lime'}`}
              />
              <span className="h-px flex-1 bg-on-forest/20" aria-hidden="true" />
            </span>
            <span className="text-small font-semibold">{step.when}</span>
            <span className="text-caption text-on-forest-muted">{step.label}</span>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-3">
        <Button href={primary.href} variant="lime" icon={<ArrowRightIcon />}>
          {primary.label}
        </Button>
        {secondary && (
          <Button href={secondary.href} variant="on-dark">
            {secondary.label}
          </Button>
        )}
      </div>
      <p className="text-caption text-on-forest-muted">{note}</p>
    </aside>
  )
}

/** Two or three financing links with a line each, for crop and base pages. */
export function FinanceLinks({
  kicker,
  title,
  items,
}: {
  kicker: string
  title: string
  items: { href: string; title: string; body: string }[]
}) {
  if (!items.length) return null
  return (
    <section className="mx-auto grid w-full max-w-page gap-6 px-4 md:px-8">
      <div className="grid gap-2">
        <p className="flex items-center gap-3 text-small font-medium text-accent">
          <span className="h-px w-10 bg-accent" aria-hidden="true" />
          {kicker}
        </p>
        <h2 className="text-h3 font-semibold text-balance">{title}</h2>
      </div>
      <ul className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group grid h-full gap-2 rounded-lg bg-raised p-5 shadow-soft ring-1 ring-line transition duration-150 ease-move hover:ring-accent md:p-6"
            >
              <span className="flex items-center justify-between gap-4 font-semibold text-ink">
                {item.title}
                <ArrowRightIcon
                  className="size-5 shrink-0 text-accent transition-transform duration-150 ease-move group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
              <span className="text-small text-muted">{item.body}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
