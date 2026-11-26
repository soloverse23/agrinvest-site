import Link from 'next/link'
import type { CSSProperties } from 'react'

import { ArrowRightIcon } from '../icons/icons'
import type { SectionIcon } from '../icons/keys'
import { cx } from '../lib/cx'
import { Photo } from './Photo'
import { SectionHeading, sectionIcons } from './Sections'

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

export type ServiceItem = ChainStep & {
  more: { label: string; href: string }[]
  photo: { src: string; alt: string }
}

/**
 * The whole package on one page: every service in the order of a season, numbered on its photo,
 * each with its own page and a few direct links. No card boxes, so the list reads as one offer
 * rather than a set of tiles. Server-rendered, no script.
 */
export function ServiceList({
  id = 'servicii',
  kicker,
  title,
  intro,
  services,
  className,
}: {
  id?: string
  kicker: string
  title: string
  intro: string
  services: ServiceItem[]
  className?: string
}) {
  return (
    <section
      aria-labelledby={id}
      className={cx('mx-auto grid w-full max-w-page gap-10 px-4 md:px-8', className)}
    >
      <SectionHeading id={id} kicker={kicker} title={title} lead={intro} />
      <ol className="grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <li key={s.id} className="grid content-start gap-2">
            {/* The heading is the link people hear and tab to; the photo repeats it. */}
            <Link
              href={s.href}
              prefetch={false}
              tabIndex={-1}
              aria-hidden="true"
              className="group relative mb-2 block aspect-video overflow-hidden md:aspect-3/2 rounded-lg bg-surface"
            >
              <Photo
                src={s.photo.src}
                alt={s.photo.alt}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-300 ease-move group-hover:scale-105 motion-reduce:transform-none"
              />
              <span className="absolute top-3 left-3 grid size-9 place-items-center rounded-full bg-lime text-small font-semibold text-forest tabular-nums">
                {i + 1}
              </span>
            </Link>
            <h3 className="text-h4 font-semibold">
              <Link
                href={s.href}
                prefetch={false}
                className="text-ink no-underline decoration-accent underline-offset-4 hover:underline"
              >
                {s.label}
              </Link>
            </h3>
            <p className="text-small text-muted">{s.body}</p>
            {s.more.length > 0 && (
              <ul className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-small">
                {s.more.map((m) => (
                  <li key={m.href}>
                    <Link
                      href={m.href}
                      prefetch={false}
                      className="inline-flex items-center gap-1 font-medium text-accent no-underline hover:underline"
                    >
                      {m.label}
                      <ArrowRightIcon className="size-3.5" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
