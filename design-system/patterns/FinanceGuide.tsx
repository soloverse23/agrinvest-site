import Link from 'next/link'
import type { ReactNode } from 'react'

import { ArrowRightIcon, CheckIcon } from '../icons/icons'
import { cx } from '../lib/cx'
import { Button, type ButtonProps } from '../primitives/Button'
import { Photo } from './Photo'
import { Kicker } from './Sections'

/**
 * The finance section as a guide (Phase 7g): parts for the hub, the credit pages, the
 * question pages and the library. Server components; the only island is the consultant
 * drawer (`ConsultantDialog`), which every `ConsultantButton` opens.
 */

const card = 'rounded-lg bg-raised shadow-soft ring-1 ring-line'

/* ------------------------------------------------------------------------------------------ */

/**
 * "Vorbește cu un consultant". A link to the detailed application, so it works without
 * JavaScript; with it, the drawer opens on the page with the need already chosen.
 */
export function ConsultantButton({
  href,
  need,
  children,
  ...props
}: { href: string; need?: string; children: ReactNode } & Omit<
  Extract<ButtonProps, { href: string }>,
  'href' | 'children'
> & { className?: string }) {
  return (
    <Button href={href} data-consultant="" data-need={need} {...props}>
      {children}
    </Button>
  )
}

/* ------------------------------------------------------------------------------------------ */

/** The hub's title-band picture: a photo, with up to four short facts attached under it. */
export function HeroPhoto({
  src,
  alt,
  facts,
}: {
  src: string
  alt: string
  /** The figure, then what it means. */
  facts: { value: ReactNode; label: string }[]
}) {
  return (
    <div className="grid gap-px overflow-hidden rounded-xl bg-line shadow-soft ring-1 ring-line">
      <div className="relative aspect-3/2 bg-surface">
        <Photo src={src} alt={alt} fill priority className="object-cover" />
      </div>
      {facts.length > 0 && (
        <dl className="grid grid-cols-2 gap-px md:grid-cols-4">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="flex flex-col-reverse justify-end gap-1 bg-raised px-4 py-3.5"
            >
              <dt className="text-caption text-muted">{fact.label}</dt>
              <dd className="text-h4 font-semibold text-forest tabular-nums">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------------------------------ */

export type NeedTile = {
  id: string
  /** A 3:2 photo of the need. Decorative: the label says what it is. */
  photo: string
  label: string
  line: string
  href: string
  also?: { href: string; label: string }
}

/**
 * "De ce ai nevoie?": one photo tile per need, each leading to one credit. The whole tile is
 * a link. On phones the photo sits beside the text, so the eight needs stay a short list.
 */
export function NeedTiles({ tiles }: { tiles: NeedTile[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
      {tiles.map((tile) => (
        <li
          key={tile.id}
          className={cx(
            card,
            'group relative grid grid-cols-[7rem_1fr] overflow-hidden transition duration-150 ease-move hover:-translate-y-0.5 hover:shadow-raised hover:ring-accent/50 md:grid-cols-1 md:content-start',
          )}
        >
          <div className="relative min-h-28 overflow-hidden bg-surface md:aspect-3/2 md:min-h-0">
            <Photo
              src={tile.photo}
              alt=""
              fill
              className="object-cover transition duration-150 ease-move group-hover:scale-105"
            />
          </div>
          <div className="grid content-start gap-1.5 p-4 md:gap-2 md:p-5">
            <h3 className="text-h4 font-semibold text-balance">
              <Link
                href={tile.href}
                className="text-ink no-underline after:absolute after:inset-0 after:rounded-lg group-hover:text-accent"
              >
                {tile.label}
              </Link>
            </h3>
            <p className="text-small text-muted">{tile.line}</p>
            {tile.also && (
              <Link
                href={tile.also.href}
                className="relative z-10 justify-self-start text-caption font-semibold text-accent underline-offset-2 hover:underline"
              >
                {tile.also.label}
              </Link>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------------------------------------ */

/**
 * The credit box: the shop's buy box for a credit. Its title is the page's H1, then a few
 * spec rows, the consultant action, the simulator and one line on how terms are set.
 */
export function CreditBox({
  kicker,
  title,
  summary,
  specs,
  primary,
  secondary,
  note,
}: {
  kicker: string
  title: string
  summary?: ReactNode
  specs: { label: string; value: ReactNode }[]
  primary: ReactNode
  secondary?: { href: string; label: string }
  note?: ReactNode
}) {
  return (
    <div className={cx(card, 'grid gap-6 p-5 md:p-7')}>
      <header className="grid gap-3">
        <p className="text-caption font-semibold tracking-wide text-accent uppercase">{kicker}</p>
        <h1 className="text-h2 font-semibold text-balance">{title}</h1>
        {summary && <div className="text-body text-muted">{summary}</div>}
      </header>
      <dl className="grid divide-y divide-line border-y border-line">
        {specs.map((s) => (
          <div key={s.label} className="grid grid-cols-[8.5rem_1fr] gap-3 py-3 text-small">
            <dt className="text-muted">{s.label}</dt>
            <dd className="font-medium text-ink">{s.value}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-3">
        {primary}
        {secondary && (
          <Button href={secondary.href} variant="secondary" fullWidth>
            {secondary.label}
          </Button>
        )}
      </div>
      {note && <p className="text-caption text-muted">{note}</p>}
    </div>
  )
}

/** "Se potrivește dacă…" and "Nu se potrivește dacă…", side by side. */
export function FitPair({
  fits,
  notFor,
}: {
  fits: { title: string; body: ReactNode }
  notFor: { title: string; body: ReactNode }
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="grid content-start gap-3 rounded-lg bg-accent-soft p-5">
        <p className="flex items-center gap-2 font-semibold text-forest">
          <span
            className="grid size-6 place-items-center rounded-full bg-accent text-on-accent"
            aria-hidden="true"
          >
            <CheckIcon className="size-3.5" />
          </span>
          {fits.title}
        </p>
        <div className="text-small text-ink">{fits.body}</div>
      </div>
      <div className="grid content-start gap-3 rounded-lg bg-surface p-5 ring-1 ring-line">
        <p className="flex items-center gap-2 font-semibold text-ink">
          <span
            className="grid size-6 place-items-center rounded-full bg-raised text-muted ring-1 ring-line-strong"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M7 12h10" />
            </svg>
          </span>
          {notFor.title}
        </p>
        <div className="text-small text-muted">{notFor.body}</div>
      </div>
    </div>
  )
}

/** Sub-credits of a parent credit ("Alege ce finanțezi"), as small product cards. */
export function CreditCards({
  items,
}: {
  items: { href: string; title: string; line?: string; icon?: ReactNode }[]
}) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <li
          key={item.href}
          className={cx(
            card,
            'group relative flex items-start gap-4 p-4 transition duration-150 ease-move hover:ring-accent/50',
          )}
        >
          {item.icon && (
            <span
              className="grid size-10 shrink-0 place-items-center rounded-md bg-accent-soft text-accent *:size-5"
              aria-hidden="true"
            >
              {item.icon}
            </span>
          )}
          <span className="grid gap-1">
            <Link
              href={item.href}
              className="font-semibold text-ink no-underline after:absolute after:inset-0 after:rounded-lg group-hover:text-accent"
            >
              {item.title}
            </Link>
            {item.line && <span className="line-clamp-2 text-small text-muted">{item.line}</span>}
          </span>
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------------------------------------ */

/** Question links: a question, and on `cards` its short answer under it. */
export function QuestionLinks({
  items,
  variant = 'list',
}: {
  items: { href: string; title: string; answer?: ReactNode }[]
  variant?: 'list' | 'cards'
}) {
  if (variant === 'cards')
    return (
      <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.map((q) => (
          <li
            key={q.href}
            className={cx(
              card,
              'group relative grid content-start gap-2 p-5 transition duration-150 ease-move hover:ring-accent/50',
            )}
          >
            <Link
              href={q.href}
              className="font-semibold text-balance text-ink no-underline after:absolute after:inset-0 after:rounded-lg group-hover:text-accent"
            >
              {q.title}
            </Link>
            {q.answer && <p className="line-clamp-3 text-small text-muted">{q.answer}</p>}
          </li>
        ))}
      </ul>
    )
  return (
    <ul className="grid divide-y divide-line border-y border-line">
      {items.map((q) => (
        <li key={q.href}>
          <Link
            href={q.href}
            className="group flex items-center justify-between gap-4 py-3.5 font-medium text-ink no-underline hover:text-accent"
          >
            <span>{q.title}</span>
            <ArrowRightIcon
              className="size-4 shrink-0 text-subtle transition duration-150 ease-move group-hover:translate-x-0.5 group-hover:text-accent"
              aria-hidden="true"
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** The short answer of a question page: the part an assistant would quote. */
export function ShortAnswer({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section
      aria-label={label}
      className="grid gap-3 rounded-xl border-l-4 border-accent bg-raised p-6 shadow-soft ring-1 ring-line md:p-8"
    >
      <p className="text-caption font-semibold tracking-wide text-accent uppercase">{label}</p>
      <div className="text-lead text-ink">{children}</div>
    </section>
  )
}

/** "Ce decide la tine": what changes the answer from one farm to another. */
export function FactorList({
  title,
  lead,
  items,
}: {
  title: string
  lead?: string
  items: ReactNode[]
}) {
  return (
    <section className="grid gap-4">
      <header className="grid gap-1">
        <h2 className="text-h3 font-semibold">{title}</h2>
        {lead && <p className="text-small text-muted">{lead}</p>}
      </header>
      <ul className="grid gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 rounded-md bg-surface px-4 py-3">
            <span
              className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-raised text-caption font-semibold text-accent ring-1 ring-line tabular-nums"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <span className="text-body text-ink">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ------------------------------------------------------------------------------------------ */

/** The one closing action of a finance page: the consultant, and one quieter link. */
export function ConsultantBand({
  kicker,
  title,
  body,
  action,
  secondary,
}: {
  kicker: string
  title: string
  body: string
  action: ReactNode
  secondary?: { href: string; label: string }
}) {
  return (
    <section className="grid gap-8 rounded-xl bg-forest px-6 py-10 text-on-forest md:px-12 md:py-14 lg:grid-cols-12 lg:items-center">
      <div className="grid gap-4 lg:col-span-8">
        <Kicker tone="forest">{kicker}</Kicker>
        <h2 className="text-h2 font-semibold text-balance">{title}</h2>
        <p className="max-w-2xl text-lead text-on-forest-muted">{body}</p>
      </div>
      <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
        {action}
        {secondary && (
          <Button href={secondary.href} variant="on-dark">
            {secondary.label}
          </Button>
        )}
      </div>
    </section>
  )
}

/** The phone action bar: the consultant always one tap away. Hidden from `md`. */
export function ActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur md:hidden">
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------------------------------ */

/** A library entry: an icon, a title and a line. */
export function LibraryCards({
  items,
}: {
  items: { href: string; title: string; summary?: string; tag?: string }[]
}) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <li
          key={item.href}
          className={cx(
            card,
            'group relative grid content-start gap-2 p-5 transition duration-150 ease-move hover:ring-accent/50',
          )}
        >
          {item.tag && (
            <p className="text-caption font-semibold tracking-wide text-subtle uppercase">
              {item.tag}
            </p>
          )}
          <Link
            href={item.href}
            className="text-h4 font-semibold text-balance text-ink no-underline after:absolute after:inset-0 after:rounded-lg group-hover:text-accent"
          >
            {item.title}
          </Link>
          {item.summary && <p className="line-clamp-3 text-small text-muted">{item.summary}</p>}
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------------------------------------ */

/**
 * The credit page, built like the shop's product page: the credit box (with the H1) first on
 * phones, sticky on the right from `lg`; the lead and the tabbed sections on the left.
 */
export function CreditLayout({
  breadcrumbs,
  lead,
  box,
  children,
}: {
  breadcrumbs: ReactNode
  lead: ReactNode
  box: ReactNode
  /** The tab bar and the sections. */
  children: ReactNode
}) {
  return (
    <div className="mx-auto grid w-full max-w-page grid-cols-1 gap-x-8 gap-y-10 px-4 pt-6 md:px-8 md:pt-8 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-14">
      <div className="lg:col-span-12">{breadcrumbs}</div>
      <div className="min-w-0 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-2">
        <div className="lg:sticky lg:top-(--site-header-offset)">{box}</div>
      </div>
      <div className="grid min-w-0 content-start gap-8 lg:col-span-7 lg:row-start-2">{lead}</div>
      <div className="grid min-w-0 grid-cols-1 gap-14 md:gap-16 lg:col-span-7 lg:row-start-3">
        {children}
      </div>
    </div>
  )
}

/**
 * Long text kept closed: a native disclosure, so every word stays in the HTML (and in search)
 * while the page reads short.
 */
export function MoreDetails({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="group rounded-lg ring-1 ring-line open:bg-raised open:shadow-soft">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-5 py-4 font-semibold text-ink marker:hidden hover:bg-surface [&::-webkit-details-marker]:hidden">
        {summary}
        <svg
          viewBox="0 0 24 24"
          className="size-5 shrink-0 text-muted transition-transform duration-150 ease-move group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="grid gap-10 px-5 pt-2 pb-6">{children}</div>
    </details>
  )
}
