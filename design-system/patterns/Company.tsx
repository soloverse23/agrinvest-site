import Link from 'next/link'
import type { CSSProperties } from 'react'

import { ArrowRightIcon } from '../icons/icons'
import type { SectionIcon } from '../icons/keys'
import { cx } from '../lib/cx'
import { sectionIcons } from './Sections'

export type ChainStep = {
  id: string
  icon: SectionIcon
  label: string
  body: string
  href: string
  /** The page is about this step. */
  current?: boolean
  /** The page's own line for this step; replaces the body. */
  note?: string
}

/**
 * The season chain for a company page's title band: the six things Agrinvest does for a farmer,
 * in order, on a forest card. The page's steps are lit and every other step links to its page,
 * so the card both explains the flow and moves the visitor along it. A grain travels the track
 * and the lit steps breathe; both stop under reduced motion. Server-rendered, no script.
 */
export function SeasonChain({
  title,
  steps,
  here,
  hereLabel,
  again,
  className,
}: {
  title: string
  steps: ChainStep[]
  /** The page's own address: its step is not linked. */
  here: string
  hereLabel: string
  /** The closing line: the season loops. */
  again: string
  className?: string
}) {
  const focused = steps.some((s) => s.current)
  return (
    <section
      aria-labelledby="season-chain"
      className={cx(
        'relative overflow-hidden rounded-xl bg-forest p-6 text-on-forest shadow-raised md:p-7',
        className,
      )}
    >
      <h2 id="season-chain" className="text-small font-semibold text-on-forest-muted">
        {title}
      </h2>
      <ol className="relative mt-5 grid gap-3">
        {/* The track between the discs, and the grain that travels it. */}
        <span
          aria-hidden="true"
          className="absolute top-5 bottom-5 left-5 w-px -translate-x-1/2 bg-on-forest/20"
        >
          <span className="absolute left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 animate-travel rounded-full bg-lime shadow-[0_0_0_4px_var(--color-forest)] motion-reduce:hidden" />
        </span>
        {steps.map((step, i) => {
          const Icon = sectionIcons[step.icon]
          const isHere = step.href === here
          const dim = focused && !step.current
          return (
            <li
              key={step.id}
              className={cx(
                'relative grid animate-rise grid-cols-[2.5rem_1fr] items-start gap-3',
                dim && 'opacity-70',
              )}
              style={{ animationDelay: `${120 + i * 70}ms` } as CSSProperties}
            >
              <span
                className={cx(
                  'relative grid size-10 place-items-center rounded-full',
                  step.current
                    ? 'bg-lime text-forest'
                    : 'bg-forest-raised text-on-forest-muted ring-1 ring-on-forest/15',
                )}
              >
                {step.current && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 animate-halo rounded-full bg-lime motion-reduce:hidden"
                  />
                )}
                <Icon className="relative size-5" />
              </span>
              <div className="grid gap-0.5 pt-1">
                <p className="flex flex-wrap items-baseline gap-x-2 text-small font-semibold">
                  <span className="text-caption font-medium text-on-forest-muted tabular-nums">
                    {i + 1}
                  </span>
                  {isHere ? (
                    <span aria-current="page" className={step.current ? 'text-lime' : undefined}>
                      {step.label}
                    </span>
                  ) : (
                    <Link
                      href={step.href}
                      prefetch={false}
                      className={cx(
                        'no-underline decoration-lime underline-offset-4 hover:underline',
                        step.current ? 'text-lime' : 'text-on-forest',
                      )}
                    >
                      {step.label}
                    </Link>
                  )}
                  {isHere && (
                    <span className="rounded-full bg-lime/15 px-2 py-0.5 text-caption font-medium text-lime">
                      {hereLabel}
                    </span>
                  )}
                </p>
                {(step.note || step.current || !focused) && (
                  <p
                    className={cx(
                      'text-caption text-on-forest-muted',
                      !focused && 'hidden md:block',
                    )}
                  >
                    {step.note ?? step.body}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
      <p className="mt-5 flex items-center gap-2 border-t border-on-forest/15 pt-4 text-caption text-on-forest-muted">
        <svg
          viewBox="0 0 24 24"
          className="size-4 shrink-0 text-lime"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4.5h-4.5" />
        </svg>
        {again}
      </p>
    </section>
  )
}

/**
 * The end of a company page: the step it hands over to (a large link card) and the pages before
 * and after it in the section, so a visitor can walk the whole section in order.
 */
export function SeasonNext({
  next,
  pager,
  className,
}: {
  next?: {
    kicker: string
    number: number
    total: number
    label: string
    body: string
    href: string
    icon: SectionIcon
  } | null
  pager: {
    label: string
    prev?: { kicker: string; label: string; href: string } | null
    next?: { kicker: string; label: string; href: string } | null
  }
  className?: string
}) {
  const Icon = next ? sectionIcons[next.icon] : null
  return (
    <nav
      aria-label={pager.label}
      className={cx(
        'mx-auto grid w-full max-w-page gap-4 px-4 md:px-8',
        next && 'lg:grid-cols-[3fr_2fr]',
        className,
      )}
    >
      {next && Icon && (
        <Link
          href={next.href}
          prefetch={false}
          className="group relative grid gap-4 overflow-hidden rounded-xl bg-forest p-6 text-on-forest no-underline shadow-raised transition-transform duration-200 ease-move hover:-translate-y-0.5 md:grid-cols-[auto_1fr_auto] md:items-center md:p-8"
        >
          <span className="grid size-14 place-items-center rounded-full bg-lime text-forest">
            <Icon className="size-7" />
          </span>
          <span className="grid gap-1">
            <span className="text-caption font-medium text-on-forest-muted">
              {next.kicker} · {next.number}/{next.total}
            </span>
            <span className="text-h3 font-semibold">{next.label}</span>
            <span className="text-small text-on-forest-muted">{next.body}</span>
          </span>
          <span
            aria-hidden="true"
            className="grid size-11 place-items-center rounded-full bg-on-forest/10 text-lime transition-transform duration-200 ease-move group-hover:translate-x-1"
          >
            <ArrowRightIcon className="size-5" />
          </span>
        </Link>
      )}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
        {[pager.prev, pager.next].map((p, i) =>
          p ? (
            <Link
              key={p.href}
              href={p.href}
              prefetch={false}
              className={cx(
                'group grid gap-0.5 rounded-xl bg-raised p-5 no-underline ring-1 ring-line transition-shadow hover:ring-accent',
                i === 1 && 'text-right lg:text-left',
              )}
            >
              <span className="text-caption text-muted">
                {i === 0 ? '← ' : ''}
                {p.kicker}
                {i === 1 ? ' →' : ''}
              </span>
              <span className="font-semibold text-ink group-hover:text-accent">{p.label}</span>
            </Link>
          ) : (
            <span key={i} aria-hidden="true" className="hidden md:block" />
          ),
        )}
      </div>
    </nav>
  )
}
