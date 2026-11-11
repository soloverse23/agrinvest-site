import Link from 'next/link'
import type { ReactNode } from 'react'

import { GhsPictogram, type GhsCode } from '../icons/ghs'
import { ArrowRightIcon, DocumentIcon, LeafIcon } from '../icons/icons'
import { CalculatorIcon, SearchIcon } from '../icons/server'
import { cx } from '../lib/cx'
import { Photo } from './Photo'

/**
 * The product page (Phase 7c.4), server side. Above the fold: the gallery and the buy box,
 * which stays on screen from `lg` while the visitor reads the sections beside it. Then an
 * anchored tab bar whose links jump to sections that are all in the HTML (nothing is hidden
 * behind a tab), and the sections themselves. The islands (buy form, calculator, zoom) are
 * passed in by the caller through `Lazy.tsx`.
 */

const summaryReset = 'cursor-pointer list-none [&::-webkit-details-marker]:hidden'
const card = 'rounded-lg bg-raised shadow-soft ring-1 ring-line'

/* ------------------------------------------------------------------------------------------ */

/**
 * Phones: gallery, buy box, sections. Tablets: gallery and buy box side by side, then the
 * sections. From `lg`: the gallery and the sections in 7 columns, the buy box in 5, sticky.
 */
export function ProductLayout({
  breadcrumbs,
  gallery,
  buy,
  children,
}: {
  breadcrumbs: ReactNode
  gallery: ReactNode
  buy: ReactNode
  /** The tab bar and the sections. */
  children: ReactNode
}) {
  return (
    <div className="mx-auto grid w-full max-w-page grid-cols-1 gap-x-8 gap-y-8 px-4 pt-6 md:grid-cols-2 md:px-8 md:pt-8 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-14">
      <div className="md:col-span-2 lg:col-span-12">{breadcrumbs}</div>
      <div className="min-w-0 lg:col-span-7">{gallery}</div>
      <div className="min-w-0 lg:col-span-5 lg:row-span-2">
        <div className="lg:sticky lg:top-6">{buy}</div>
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-14 md:col-span-2 md:gap-16 lg:col-span-7">
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------ */

export type MediaBadge = { label: string; tone: 'forest' | 'accent' | 'warning' | 'muted' }

const badgeTone: Record<MediaBadge['tone'], string> = {
  forest: 'bg-forest text-on-forest',
  accent: 'bg-raised/95 text-ink ring-1 ring-line',
  warning: 'bg-raised/95 text-ink ring-1 ring-line',
  muted: 'bg-raised/95 text-muted ring-1 ring-line',
}
const badgeDot: Record<MediaBadge['tone'], string | null> = {
  forest: null,
  accent: 'bg-accent',
  warning: 'bg-warning',
  muted: 'bg-line-strong',
}

/**
 * Photos in a row that snaps one at a time, thumbnails under it and the badges over it. A
 * photo opens its zoom view and a thumbnail scrolls to its slide: both are plain links (the
 * zoom view shows through `:target`), so the gallery needs no JavaScript. The back button or
 * "Închide" closes the zoom. The page works without any photo.
 */
export function ProductMedia({
  id,
  images,
  badges,
  labels,
  zoomOpen,
}: {
  /** Anchors of the slides and zoom views start with it. */
  id: string
  images: { url: string; alt: string }[]
  badges: MediaBadge[]
  labels: {
    photos: string
    zoom: string
    close: string
    prev: string
    next: string
    photo: (n: number, total: number) => string
  }
  /** Story hook: the zoom view of this photo shown. */
  zoomOpen?: number
}) {
  const many = images.length > 1
  return (
    <div id={id} className="grid gap-3">
      <div className="relative">
        {images.length ? (
          <ul
            data-scroll-x
            aria-label={labels.photos}
            className="flex snap-x snap-mandatory overflow-x-auto rounded-lg bg-surface ring-1 ring-line [scrollbar-width:none]"
          >
            {images.map((image, i) => (
              <li
                key={image.url}
                id={`${id}-${i + 1}`}
                className="relative aspect-square w-full shrink-0 snap-start"
              >
                <a
                  href={`#${id}-zoom-${i + 1}`}
                  aria-label={`${labels.zoom}: ${many ? labels.photo(i + 1, images.length) : image.alt}`}
                  className="group absolute inset-0 cursor-zoom-in"
                >
                  <Photo
                    src={image.url}
                    alt={image.alt}
                    fill
                    priority={i === 0}
                    sizes="(min-width: 1312px) 720px, (min-width: 1024px) 55vw, (min-width: 768px) 45vw, 92vw"
                    className="object-contain p-8 mix-blend-multiply md:p-12"
                  />
                  <span className="absolute right-3 bottom-3 grid size-11 place-items-center rounded-full bg-raised/95 text-ink shadow-soft ring-1 ring-line transition duration-150 ease-move group-hover:scale-105">
                    <SearchIcon className="size-5" aria-hidden="true" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="relative aspect-square rounded-lg bg-surface ring-1 ring-line">
            <LeafIcon
              className="absolute inset-0 m-auto size-24 text-line-strong"
              aria-hidden="true"
            />
          </div>
        )}
        {badges.length > 0 && (
          <ul className="pointer-events-none absolute top-3 left-3 flex flex-wrap gap-2 md:top-4 md:left-4">
            {badges.map((b) => (
              <li
                key={b.label}
                className={cx(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-medium',
                  badgeTone[b.tone],
                )}
              >
                {badgeDot[b.tone] && (
                  <span
                    className={cx('size-2 rounded-full', badgeDot[b.tone])}
                    aria-hidden="true"
                  />
                )}
                {b.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      {many && (
        <ul className="grid grid-cols-5 gap-2 md:gap-3">
          {images.map((image, i) => (
            <li key={image.url}>
              <a
                href={`#${id}-${i + 1}`}
                aria-label={labels.photo(i + 1, images.length)}
                className="relative block aspect-square overflow-hidden rounded-md bg-surface ring-1 ring-line hover:ring-ink"
              >
                <Photo
                  src={image.url}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-contain p-2 mix-blend-multiply"
                />
              </a>
            </li>
          ))}
        </ul>
      )}
      {images.map((image, i) => {
        const n = images.length
        const nav =
          'grid size-11 place-items-center rounded-full text-ink no-underline ring-1 ring-line-strong hover:bg-surface'
        return (
          <div
            key={image.url}
            id={`${id}-zoom-${i + 1}`}
            role="dialog"
            aria-label={image.alt}
            className={cx(
              'fixed inset-0 z-50 place-items-center bg-ink/80 p-0 target:grid md:p-8',
              zoomOpen === i ? 'grid' : 'hidden',
            )}
          >
            {/* The backdrop closes it: a link back to the slide. */}
            <a href={`#${id}-${i + 1}`} aria-label={labels.close} className="absolute inset-0" />
            <div className="relative grid size-full grid-rows-[1fr_auto] bg-raised md:size-[min(84vw,84vh)] md:rounded-lg">
              <div className="relative">
                <Photo
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="90vw"
                  className="object-contain p-6 mix-blend-multiply md:p-10"
                />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
                {n > 1 ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={`#${id}-zoom-${((i - 1 + n) % n) + 1}`}
                      aria-label={labels.prev}
                      className={nav}
                    >
                      <ArrowRightIcon className="size-5 rotate-180" aria-hidden="true" />
                    </a>
                    <span className="text-small text-muted tabular-nums">
                      {labels.photo(i + 1, n)}
                    </span>
                    <a
                      href={`#${id}-zoom-${((i + 1) % n) + 1}`}
                      aria-label={labels.next}
                      className={nav}
                    >
                      <ArrowRightIcon className="size-5" aria-hidden="true" />
                    </a>
                  </div>
                ) : (
                  <span />
                )}
                <a
                  href={`#${id}-${i + 1}`}
                  className="inline-flex h-11 items-center rounded-md px-4 text-small font-semibold text-ink no-underline ring-1 ring-line-strong hover:bg-surface"
                >
                  {labels.close}
                </a>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------------------------------ */

export type KeyFact = { label: string; href?: string; title?: string; strong?: boolean }

/** Key-fact chips: ingredients with concentration, formulation, resistance group, PHI, crops. */
export function KeyFacts({ items, label }: { items: KeyFact[]; label: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-1.5">
      {items.map((f) => {
        const cls = cx(
          'inline-flex min-h-8 items-center rounded-full px-3 text-small no-underline',
          f.strong ? 'bg-accent-soft font-medium text-forest' : 'bg-surface text-ink',
          f.href && 'hover:ring-1 hover:ring-accent',
        )
        return (
          <li key={f.label}>
            {f.href?.startsWith('#') ? (
              // An in-page jump: a plain link, so Next does not prefetch this page again.
              <a href={f.href} title={f.title} className={cls}>
                {f.label}
              </a>
            ) : f.href ? (
              <Link href={f.href} title={f.title} className={cls}>
                {f.label}
              </Link>
            ) : (
              <span title={f.title} className={cls}>
                {f.label}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/**
 * The buy box: brand, the page's H1, the summary in two lines, key facts, then the buy form
 * (or the order block notice), the quick request and the notes. `id="cerere"` sits on the
 * quick request, so old `#cerere` links land on it.
 */
export function BuyBox({
  brand,
  title,
  summary,
  facts,
  form,
  notice,
  calcLink,
  request,
  notes,
}: {
  brand?: { name: string; href: string }
  title: string
  summary?: string
  facts?: ReactNode
  /** The buy form island, or the read-only packs when the product is blocked. */
  form: ReactNode
  /** The order block notice (OUG 53/2025, sale stop, registration). */
  notice?: ReactNode
  calcLink?: { href: string; label: string }
  request: ReactNode
  /** Finance hint, price note, updated date. */
  notes?: ReactNode
}) {
  return (
    <div className={cx(card, 'grid gap-5 p-5 md:p-6')}>
      <header className="grid gap-2">
        {brand && (
          <Link
            href={brand.href}
            className="justify-self-start text-caption font-semibold tracking-wide text-subtle uppercase no-underline hover:text-accent"
          >
            {brand.name}
          </Link>
        )}
        <h1 className="text-h2 font-semibold text-balance">{title}</h1>
        {summary && <p className="line-clamp-2 text-body text-muted">{summary}</p>}
      </header>
      {facts}
      {notice}
      {form}
      {calcLink && (
        <a
          href={calcLink.href}
          className="inline-flex items-center gap-2 justify-self-start text-small font-semibold text-accent no-underline hover:underline"
        >
          <span
            className="grid size-7 place-items-center rounded-full bg-accent-soft"
            aria-hidden="true"
          >
            <CalculatorIcon className="size-4" />
          </span>
          {calcLink.label}
        </a>
      )}
      <div id="cerere" className="scroll-mt-24 border-t border-line pt-5">
        {request}
      </div>
      {notes && <div className="grid gap-3 text-caption text-muted">{notes}</div>}
    </div>
  )
}

/** The packs as information only, for a product that cannot be ordered online. */
export function PackSummary({
  label,
  packs,
}: {
  label: string
  packs: { key: string; pack: string; price: ReactNode; unitPrice?: string }[]
}) {
  return (
    <div className="grid gap-2">
      <p className="text-small font-semibold text-ink">{label}</p>
      <ul className="grid grid-cols-2 gap-2">
        {packs.map((p) => (
          <li key={p.key} className="grid gap-0.5 rounded-md bg-surface p-3">
            <span className="font-semibold text-ink tabular-nums">{p.pack}</span>
            <span className="text-body font-semibold text-ink tabular-nums">{p.price}</span>
            {p.unitPrice && (
              <span className="text-caption text-muted tabular-nums">{p.unitPrice}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------ */

/**
 * The anchored tab bar: links to the sections below, sticky at the top of the screen. It
 * scrolls sideways on phones. Every section stays in the HTML, so nothing hides from search.
 */
export function ProductTabs({
  label,
  items,
  current,
}: {
  label: string
  items: { id: string; label: string }[]
  /** Story hook for the highlighted tab. */
  current?: string
}) {
  return (
    <nav
      aria-label={label}
      className="sticky top-0 z-20 -mx-4 border-b border-line bg-paper/95 backdrop-blur md:mx-0"
    >
      <ul data-scroll-x className="flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] md:px-0">
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              aria-current={item.id === current ? 'location' : undefined}
              className="relative inline-flex h-12 items-center px-3 text-small font-semibold text-muted no-underline hover:text-ink aria-[current=location]:text-forest aria-[current=location]:after:absolute aria-[current=location]:after:inset-x-3 aria-[current=location]:after:bottom-0 aria-[current=location]:after:h-0.5 aria-[current=location]:after:rounded-full aria-[current=location]:after:bg-accent"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** A section the tab bar links to; the offset keeps its heading clear of the sticky bar. */
export function ProductSection({
  id,
  title,
  lead,
  children,
}: {
  id: string
  title: string
  lead?: ReactNode
  children: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="grid scroll-mt-16 gap-5">
      <header className="grid gap-1">
        <h2 id={`${id}-title`} className="text-h3 font-semibold">
          {title}
        </h2>
        {lead && <p className="text-small text-muted">{lead}</p>}
      </header>
      {children}
    </section>
  )
}

/* ------------------------------------------------------------------------------------------ */

export type DoseUse = {
  key: string
  crop: string
  timing?: string | null
  bbch?: string | null
  /** As printed on the label. */
  dose: string
  water?: string | null
  /** Days before harvest. */
  phi?: string | null
  maxTreatments?: string | null
  targets?: { label: string; href?: string }[]
  notes?: string | null
}

const VISIBLE_TARGETS = 6

/**
 * One card for each use on the label: crop, the dose in large type, timing with BBCH, water,
 * pre-harvest interval, treatments and the targets as a short chip list folded after six.
 */
export function DoseUseCards({
  uses,
  labels,
}: {
  uses: DoseUse[]
  labels: {
    dose: string
    timing: string
    water: string
    phi: string
    maxTreatments: string
    targets: string
    more: (n: number) => string
    notes: string
  }
}) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {uses.map((u) => {
        const targets = u.targets ?? []
        const shown = targets.slice(0, VISIBLE_TARGETS)
        const rest = targets.slice(VISIBLE_TARGETS)
        const chip = (t: { label: string; href?: string }) =>
          t.href ? (
            <Link
              href={t.href}
              className="inline-flex min-h-7 items-center rounded-full bg-surface px-2.5 text-caption text-ink no-underline hover:ring-1 hover:ring-accent"
            >
              {t.label}
            </Link>
          ) : (
            <span className="inline-flex min-h-7 items-center rounded-full bg-surface px-2.5 text-caption text-ink">
              {t.label}
            </span>
          )
        const facts = [
          [
            labels.timing,
            [u.timing, u.bbch && !u.timing?.includes(u.bbch) ? u.bbch : null]
              .filter(Boolean)
              .join(' · '),
          ],
          [labels.water, u.water],
          [labels.phi, u.phi],
          [labels.maxTreatments, u.maxTreatments],
        ].filter((f): f is [string, string] => Boolean(f[1]))
        return (
          <li key={u.key} className={cx(card, 'grid content-start gap-4 p-5')}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-h4 font-semibold">{u.crop}</h3>
              <p className="grid justify-items-end">
                <span className="sr-only">{labels.dose}: </span>
                <span
                  className={cx(
                    'font-semibold text-forest tabular-nums',
                    // Label wording without a number reads as text, not as a figure.
                    /\d/.test(u.dose) ? 'text-h3' : 'text-body',
                  )}
                >
                  {u.dose}
                </span>
              </p>
            </div>
            {facts.length > 0 && (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-small">
                {facts.map(([k, v]) => (
                  <div key={k} className="grid content-start gap-0.5">
                    <dt className="text-caption text-muted">{k}</dt>
                    <dd className="font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            {targets.length > 0 && (
              <div className="grid gap-2">
                <p className="text-caption text-muted">{labels.targets}</p>
                <ul className="flex flex-wrap gap-1.5">
                  {shown.map((t) => (
                    <li key={t.label}>{chip(t)}</li>
                  ))}
                  {rest.length > 0 && (
                    <li className="contents">
                      <details className="group contents">
                        <summary
                          className={cx(
                            summaryReset,
                            'inline-flex min-h-7 items-center rounded-full px-2.5 text-caption font-semibold text-accent ring-1 ring-accent/40 group-open:hidden',
                          )}
                        >
                          {labels.more(rest.length)}
                        </summary>
                        <ul className="flex flex-wrap gap-1.5">
                          {rest.map((t) => (
                            <li key={t.label}>{chip(t)}</li>
                          ))}
                        </ul>
                      </details>
                    </li>
                  )}
                </ul>
              </div>
            )}
            {u.notes && (
              <p className="border-t border-line pt-3 text-caption text-muted">
                <span className="font-semibold text-ink">{labels.notes}: </span>
                {u.notes}
              </p>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/* ------------------------------------------------------------------------------------------ */

/**
 * Technical data as a grouped definition list: label and value side by side from `md`,
 * stacked on phones. Groups and rows without a value are left out by the caller.
 */
export function SpecGroups({
  groups,
}: {
  groups: { title: string; rows: { label: string; value: ReactNode }[] }[]
}) {
  return (
    <div className="grid gap-4">
      {groups.map((g) => (
        <section key={g.title} className={cx(card, 'overflow-hidden')}>
          <h3 className="bg-surface px-5 py-2.5 text-caption font-semibold tracking-wide text-muted uppercase">
            {g.title}
          </h3>
          <dl className="divide-y divide-line text-small">
            {g.rows.map((row) => (
              <div
                key={row.label}
                className="grid gap-1 px-5 py-3 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-6"
              >
                <dt className="text-muted">{row.label}</dt>
                <dd className="font-medium text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}

/** The targets the product controls, grouped by kind, each linked to its hub when one exists. */
export function Spectrum({
  groups,
}: {
  groups: { kind: string; label: string; items: { label: string; href?: string }[] }[]
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {groups.map((g) => (
        <section key={g.kind} className={cx(card, 'grid content-start gap-3 p-5')}>
          <h3 className="flex items-baseline justify-between gap-3 text-body font-semibold">
            {g.label}
            <span className="text-caption font-normal text-muted tabular-nums">
              {g.items.length}
            </span>
          </h3>
          <ul className="flex flex-wrap gap-1.5">
            {g.items.map((t) => (
              <li key={t.label}>
                {t.href ? (
                  <Link
                    href={t.href}
                    className="inline-flex min-h-8 items-center rounded-full bg-surface px-3 text-small text-ink no-underline ring-accent hover:ring-1"
                  >
                    {t.label}
                  </Link>
                ) : (
                  <span className="inline-flex min-h-8 items-center rounded-full bg-surface px-3 text-small text-ink">
                    {t.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------------------------------ */

/**
 * The hazard label: signal word, GHS pictograms, H statements and the buffer zone. A product
 * without them keeps its safety text (`fallback`).
 */
export function SafetyPanel({
  signal,
  pictograms,
  hazards,
  buffer,
  fallback,
  labels,
}: {
  signal?: { label: string; level: 'warning' | 'danger' }
  pictograms?: { code: GhsCode; label: string }[]
  hazards?: string[]
  buffer?: string | null
  fallback?: string | null
  labels: { signal: string; pictograms: string; hazards: string; buffer: string; label: string }
}) {
  const structured = Boolean(signal || pictograms?.length || hazards?.length || buffer)
  if (!structured && !fallback) return null
  return (
    <div className={cx(card, 'grid gap-5 p-5 md:p-6')}>
      {structured ? (
        <>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            {signal && (
              <p className="grid gap-1">
                <span className="text-caption text-muted">{labels.signal}</span>
                <span
                  className={cx(
                    'justify-self-start rounded-md px-3 py-1 text-h4 font-bold tracking-wide uppercase',
                    signal.level === 'danger'
                      ? 'bg-danger text-on-accent'
                      : 'bg-warning-soft text-warning',
                  )}
                >
                  {signal.label}
                </span>
              </p>
            )}
            {pictograms && pictograms.length > 0 && (
              <div className="grid gap-1">
                <p className="text-caption text-muted">{labels.pictograms}</p>
                <ul className="flex flex-wrap gap-2">
                  {pictograms.map((p) => (
                    <li key={p.code} className="grid justify-items-center gap-1">
                      <GhsPictogram code={p.code} label={p.label} className="size-16" />
                      <span className="text-caption text-muted" aria-hidden="true">
                        {p.code}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {hazards && hazards.length > 0 && (
            <div className="grid gap-2">
              <p className="text-caption text-muted">{labels.hazards}</p>
              <ul className="grid gap-1.5 text-small text-ink">
                {hazards.map((h) => (
                  <li key={h} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-danger" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {buffer && (
            <p className="grid gap-0.5 rounded-md bg-surface px-4 py-3 text-small">
              <span className="text-caption text-muted">{labels.buffer}</span>
              <span className="font-medium text-ink">{buffer}</span>
            </p>
          )}
        </>
      ) : (
        <p className="text-small text-ink">{fallback}</p>
      )}
      <p className="text-caption font-semibold text-ink">{labels.label}</p>
    </div>
  )
}

/** Download tiles: the label, technical sheet and safety data sheet, with type and size. */
export function DocumentTiles({
  items,
}: {
  items: { href: string; title: string; meta: string }[]
}) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <li key={item.href}>
          <a
            href={item.href}
            className={cx(
              card,
              'flex h-full items-center gap-4 p-4 no-underline transition duration-150 ease-move hover:ring-accent',
            )}
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-md bg-danger-soft text-danger">
              <DocumentIcon className="size-6" aria-hidden="true" />
            </span>
            <span className="grid min-w-0">
              <span className="font-semibold text-ink">{item.title}</span>
              <span className="text-caption text-muted">{item.meta}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}

/**
 * Long text folded after about twelve lines, with "Citește tot". The text is not inside the
 * `<details>`, so all of it stays in the HTML and visible to search; the `<details>` only
 * switches the fold, through `:has()`, without JavaScript.
 */
export function FoldedText({
  children,
  labels,
}: {
  children: ReactNode
  labels: { more: string; less: string }
}) {
  return (
    <div className="group/fold grid gap-3">
      <div className="relative max-h-[12lh] overflow-hidden group-has-[details[open]]/fold:max-h-none">
        {children}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-paper group-has-[details[open]]/fold:hidden"
        />
      </div>
      <details className="group">
        <summary
          className={cx(
            summaryReset,
            'inline-flex text-small font-semibold text-accent hover:underline',
          )}
        >
          <span className="group-open:hidden">{labels.more}</span>
          <span className="hidden group-open:inline">{labels.less}</span>
        </summary>
      </details>
    </div>
  )
}

/** "Ai nevoie de ajutor la alegere?": a short band with the quick request. */
export function HelpBand({
  title,
  text,
  request,
}: {
  title: string
  text: string
  request: ReactNode
}) {
  return (
    <section className="mx-auto w-full max-w-page px-4 md:px-8">
      <div className="grid gap-6 rounded-lg bg-forest p-6 text-on-forest md:p-8 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="grid gap-2 lg:col-span-5">
          <h2 className="text-h3 font-semibold">{title}</h2>
          <p className="text-on-forest-muted">{text}</p>
        </div>
        <div className="rounded-md bg-raised p-4 text-ink lg:col-span-7">{request}</div>
      </div>
    </section>
  )
}

/** A product row under the page: "Din aceeași categorie", "Folosit des împreună". */
export function ProductShelf({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mx-auto grid w-full max-w-page gap-6 px-4 md:px-8">
      <h2 className="text-h3 font-semibold">{title}</h2>
      {children}
    </section>
  )
}
