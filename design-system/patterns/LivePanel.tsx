import Link from 'next/link'
import type { ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import { formatWhen } from '@/lib/format'

import { ArrowRightIcon } from '../icons/icons'
import { cx } from '../lib/cx'
import { NewsItem, type StoryCardData, type StoryLabels } from './NewsStories'

export type FeedKind = 'news' | 'agrinvest' | 'guide' | 'note' | 'social' | 'price'

export type FeedItem = {
  id: string
  kind: FeedKind
  title: string
  href: string
  /** Opens another site (LinkedIn). */
  external?: boolean
  /** Shown after the kind. */
  source?: string
  date: Date
  /** Price moves: kept for the data; the panel shows them as text. */
  change?: number
}

export type LivePanelProps = {
  locale: Locale
  title: string
  /** When the news last refreshed. */
  updated?: Date | null
  /** How many sources answered on the last news run. */
  storySources?: number
  /** The ranked news (Phase 7e), the panel's main row. */
  stories: StoryCardData[]
  /** Agrinvest's own updates (its news, guides, market note, posts), the second row. */
  feed: FeedItem[]
  links: { news: { href: string; label: string } }
  labels: {
    updated: (when: string, sources: number) => string
    own: string
    empty: string
    kinds: Record<FeedKind, string>
    story: StoryLabels
  }
  className?: string
}

/**
 * A row of cards: on phones it scrolls sideways with snapping (each card about four fifths of
 * the screen, so the next one peeks in); from `lg` it is a plain grid. `relative` keeps every
 * absolutely positioned child inside the scroller, so the page never scrolls sideways.
 */
function CardRow({ children, cols, label }: { children: ReactNode; cols: 3 | 5; label: string }) {
  return (
    <ul
      aria-label={label}
      data-scroll-x
      className={cx(
        'relative -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-1 md:scroll-px-8 [scrollbar-width:none] md:-mx-8 md:px-8 lg:mx-0 lg:grid lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden',
        cols === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-3',
      )}
    >
      {children}
    </ul>
  )
}

const card = 'w-[80%] shrink-0 snap-start md:w-[45%] lg:w-auto'

/** One of Agrinvest's own updates: the title, then "Nota de piață · 10 nov.". */
function OwnCard({
  item,
  locale,
  kinds,
}: {
  item: FeedItem
  locale: Locale
  kinds: Record<FeedKind, string>
}) {
  const title =
    'line-clamp-2 text-small leading-snug font-semibold text-ink no-underline hover:text-accent'
  return (
    <div className="grid h-full content-start gap-1 rounded-lg bg-surface px-4 py-3">
      {item.external ? (
        <a href={item.href} rel="noopener" className={title}>
          {item.title}
        </a>
      ) : (
        <Link href={item.href} className={title}>
          {item.title}
        </Link>
      )}
      <p className="text-caption text-muted">
        <span className="font-semibold text-ink">{kinds[item.kind]}</span> ·{' '}
        <time dateTime={item.date.toISOString()}>{formatWhen(item.date, locale)}</time>
      </p>
    </div>
  )
}

/**
 * "Live from the field": the news ranked by the hourly job (Phase 7e) as one row of cards,
 * the first with its excerpt, then Agrinvest's own latest updates as a lighter row. Prices
 * are not here: the hero shows them (owner, 2026-11-15). Phones swipe each row sideways, so
 * the panel stays short; desktop shows each row as a grid. Server-rendered, no script.
 */
export function LivePanel({
  locale,
  title,
  updated,
  storySources = 0,
  stories,
  feed,
  links,
  labels,
  className,
}: LivePanelProps) {
  const headingId = 'live-title'
  return (
    <section
      aria-labelledby={headingId}
      className={cx('mx-auto w-full max-w-page px-4 md:px-8', className)}
    >
      <div
        data-live
        className="grid gap-5 overflow-hidden rounded-xl bg-raised p-5 shadow-raised ring-1 ring-line md:gap-6 md:p-8"
      >
        <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <div className="grid gap-1">
            <h2 id={headingId} className="flex items-center gap-3 text-h3 font-semibold">
              <span className="relative flex size-2.5" aria-hidden="true">
                <span className="absolute inset-0 rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
                <span className="relative size-2.5 rounded-full bg-accent" />
              </span>
              {title}
            </h2>
            {updated && (
              <p className="text-caption text-muted">
                {labels.updated(formatWhen(updated, locale), storySources)}
              </p>
            )}
          </div>
          <Link
            href={links.news.href}
            className="group inline-flex items-center gap-1.5 text-small font-semibold text-accent no-underline hover:underline"
          >
            {links.news.label}
            <ArrowRightIcon className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
        </header>

        {stories.length > 0 ? (
          <CardRow cols={5} label={title}>
            {stories.map((s, i) => (
              <li key={s.key} className={card}>
                <div className="h-full rounded-lg p-3 ring-1 ring-line">
                  <NewsItem
                    story={s}
                    locale={locale}
                    labels={labels.story}
                    size="sm"
                    level={3}
                    showExcerpt={i === 0}
                    fill
                    media="top"
                  />
                </div>
              </li>
            ))}
          </CardRow>
        ) : (
          feed.length === 0 && <p className="text-small text-muted">{labels.empty}</p>
        )}

        {feed.length > 0 && (
          <div className="grid gap-3">
            <h3 className="text-caption font-semibold tracking-wide text-subtle uppercase">
              {labels.own}
            </h3>
            <CardRow cols={3} label={labels.own}>
              {feed.slice(0, 3).map((item) => (
                <li key={item.id} className={card}>
                  <OwnCard item={item} locale={locale} kinds={labels.kinds} />
                </li>
              ))}
            </CardRow>
          </div>
        )}
      </div>
    </section>
  )
}
