import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import { formatDate, formatNumber } from '@/lib/format'

import type { CropKey } from '../fixtures/sample'
import { ArrowRightIcon } from '../icons/icons'
import { cx } from '../lib/cx'
import { Button } from '../primitives/Button'
import { Delta } from '../primitives/Delta'

export type HeroProps = {
  locale: Locale
  /** The site header, drawn over the photo (use SiteHeader with tone="overlay"). */
  header?: ReactNode
  eyebrow: string
  title: string
  /** Part of the title set in lime. */
  accent?: string
  lead?: ReactNode
  primary?: { href: string; label: string } | null
  secondary?: { href: string; label: string } | null
  /** Without a photo the hero is a forest panel (e.g. while footage rights are open). */
  photo?: { src: string; alt: string } | null
  /** Heading level: h1 when the hero opens the page. */
  as?: 'h1' | 'h2'
  /** Entry points by need, on the rail along the bottom of the image (when there are no prices). */
  needs?: { href: string; label: string; hint?: ReactNode }[]
  /** Today's prices on the rail (Phase 5). Takes the rail's place when present. */
  prices?: {
    title: string
    place: string
    unit: string
    date: Date
    all: { href: string; label: string }
    rows: { crop: CropKey; name: string; price: number; change: number }[]
  }
}

/**
 * Cinematic home hero: full-bleed Agrinvest footage with a slow settle, the promise in one
 * large sentence, and a rail along the bottom of the image: today's prices once they exist,
 * otherwise the entry points by need.
 * Motion is off under prefers-reduced-motion (tokens.css).
 */
export function Hero({
  locale,
  header,
  eyebrow,
  title,
  accent,
  lead,
  primary,
  secondary,
  photo,
  needs,
  prices,
  as: Heading = 'h1',
}: HeroProps) {
  const [before, after] = accent && title.includes(accent) ? title.split(accent) : [title, '']
  return (
    <section className="relative isolate flex min-h-svh flex-col overflow-hidden bg-ink text-on-forest">
      {photo ? (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          priority
          sizes="100vw"
          quality={60}
          className="-z-20 animate-hero-settle object-cover object-center contrast-110 saturate-110"
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 -z-20 bg-forest" />
      )}
      {/* Scrims: top for the header, bottom and left for the text. Neutral, not green. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-ink/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-ink/95 via-ink/55 to-transparent" />
        <div className="absolute inset-y-0 left-0 hidden w-2/3 bg-linear-to-r from-ink/45 to-transparent lg:block" />
      </div>

      {header}

      <div className="mx-auto flex w-full max-w-page flex-1 flex-col justify-end px-4 pt-32 md:px-8">
        <div className="grid max-w-5xl gap-6 pb-10 md:pb-14">
          <p className="flex items-center gap-3 text-small font-medium text-lime">
            <span className="h-px w-10 bg-lime" aria-hidden="true" />
            {eyebrow}
          </p>
          <Heading className="text-hero font-semibold text-balance">
            {before}
            {accent && <span className="text-lime">{accent}</span>}
            {after}
          </Heading>
          {lead && <p className="max-w-2xl text-lead text-on-forest-muted">{lead}</p>}
          {(primary || secondary) && (
            <div className="flex flex-wrap gap-3 pt-2">
              {primary && (
                <Button href={primary.href} variant="lime" size="lg" icon={<ArrowRightIcon />}>
                  {primary.label}
                </Button>
              )}
              {secondary && (
                <Button href={secondary.href} variant="on-dark" size="lg">
                  {secondary.label}
                </Button>
              )}
            </div>
          )}
        </div>

        {prices ? (
          <aside
            aria-label={prices.title}
            className="grid gap-4 border-t border-on-forest/20 py-5 md:py-6 lg:grid-cols-12 lg:items-center"
          >
            <div className="grid gap-0.5 lg:col-span-3">
              <h2 className="text-small font-semibold">{prices.title}</h2>
              <p className="text-caption text-on-forest-muted">
                {prices.place} · {formatDate(prices.date, locale)} · {prices.unit}
              </p>
            </div>
            <ul className="grid grid-cols-3 gap-x-4 gap-y-3 md:grid-cols-5 lg:col-span-7">
              {prices.rows.map((row, i) => (
                <li key={row.crop} className={cx('grid gap-1', i > 2 && 'hidden md:grid')}>
                  <span className="truncate text-caption text-on-forest-muted">{row.name}</span>
                  <span className="flex flex-col items-start gap-1 md:flex-row md:flex-wrap md:items-center md:gap-x-2">
                    <span className="text-h4 font-semibold tabular-nums">
                      {formatNumber(row.price, locale)}
                    </span>
                    <Delta value={row.change} locale={locale} size="sm" />
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href={prices.all.href}
              className="inline-flex items-center gap-1.5 text-small font-semibold text-lime no-underline hover:underline lg:col-span-2 lg:justify-self-end"
            >
              {prices.all.label}
              <ArrowRightIcon className="size-4" />
            </Link>
          </aside>
        ) : needs?.length ? (
          <nav
            aria-label={eyebrow}
            className="grid border-t border-on-forest/20 sm:grid-cols-2 lg:grid-cols-4"
          >
            {needs.map((need) => (
              <Link
                key={need.href}
                href={need.href}
                className="group flex items-center justify-between gap-4 border-b border-on-forest/15 py-4 text-on-forest no-underline sm:odd:pr-6 lg:border-b-0 lg:px-6 lg:py-6 lg:first:pl-0 lg:not-first:border-l"
              >
                <span className="grid gap-0.5">
                  <span className="font-semibold">{need.label}</span>
                  {need.hint && (
                    <span className="text-caption text-on-forest-muted">{need.hint}</span>
                  )}
                </span>
                <ArrowRightIcon className="size-5 shrink-0 text-lime transition-transform duration-150 group-hover:translate-x-1" />
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </section>
  )
}
