import type { ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import { formatWhen } from '@/lib/format'

import { cx } from '../lib/cx'

/**
 * Ranked news stories (Phase 7e, decision 0011). A story is one event told by one or more
 * publishers; its headline links to the first publisher and every publisher is listed as a
 * numbered source. Server components only: links, no script.
 */

/** Colour family of a topic chip. The page maps each news topic to one. */
export type StoryTone = 'price' | 'support' | 'weather' | 'disease' | 'trade' | 'neutral'

export type StorySource = {
  name: string
  title: string
  url: string
  /** Reuters links go through Google News; the label says so. */
  viaGoogle?: boolean
}

export type StoryCardData = {
  key: string
  rank: number
  title: string
  /** The first publisher's article. */
  href: string
  topic: { label: string; tone: StoryTone }
  /** Headline language: English stories carry `lang="en"` on Romanian pages. */
  lang: 'ro' | 'en'
  date: Date
  /** The excerpt the first publisher allows, with its name. */
  excerpt?: { text: string; source: string } | null
  sources: StorySource[]
  pinned?: boolean
}

export type StoryLabels = {
  sources: (n: number) => string
  references: string
  via: string
}

const toneClass: Record<StoryTone, string> = {
  price: 'bg-accent-soft text-accent-hover',
  support: 'bg-lime-soft text-forest',
  weather: 'bg-warning-soft text-warning',
  disease: 'bg-danger-soft text-danger',
  trade: 'bg-info-soft text-info',
  neutral: 'bg-flat-soft text-flat',
}

export function TopicChip({ label, tone }: { label: string; tone: StoryTone }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-semibold whitespace-nowrap',
        toneClass[tone],
      )}
    >
      {label}
    </span>
  )
}

function Rank({ n, size = 'md' }: { n: number; size?: 'md' | 'lg' }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'font-semibold text-subtle tabular-nums',
        size === 'lg' ? 'text-h3 leading-none' : 'text-body leading-none',
      )}
    >
      {n}
    </span>
  )
}

function Meta({
  story,
  locale,
  labels,
}: {
  story: StoryCardData
  locale: Locale
  labels: StoryLabels
}) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-muted">
      <TopicChip {...story.topic} />
      <time dateTime={story.date.toISOString()}>{formatWhen(story.date, locale)}</time>
      {story.sources.length > 1 && (
        <>
          <span aria-hidden="true">·</span>
          <span className="font-medium text-ink">{labels.sources(story.sources.length)}</span>
        </>
      )}
    </p>
  )
}

/** Source names as numbered links: "¹ Reuters ² Agrointel". */
function SourceLinks({ sources, labels }: { sources: StorySource[]; labels: StoryLabels }) {
  return (
    <p className="flex flex-wrap gap-x-3 gap-y-1 text-caption text-muted">
      <span className="sr-only">{labels.references}:</span>
      {sources.map((s, i) => (
        <a
          key={s.url}
          href={s.url}
          rel="noopener"
          title={s.title}
          className="no-underline hover:text-accent hover:underline"
        >
          <sup className="mr-0.5 font-semibold text-subtle">{i + 1}</sup>
          {s.name}
          {s.viaGoogle && <span className="sr-only"> ({labels.via})</span>}
        </a>
      ))}
    </p>
  )
}

/** Every source with its own headline: the references of a lead story or an edition entry. */
function SourceList({ sources, labels }: { sources: StorySource[]; labels: StoryLabels }) {
  return (
    <div className="grid gap-2 border-t border-line pt-4">
      <p className="text-caption font-semibold tracking-wide text-subtle uppercase">
        {labels.references}
      </p>
      <ol className="grid gap-2">
        {sources.map((s, i) => (
          <li key={s.url} className="grid grid-cols-[1.25rem_1fr] gap-1 text-small">
            <span className="font-semibold text-subtle tabular-nums">{i + 1}</span>
            <span>
              <a
                href={s.url}
                rel="noopener"
                className="font-medium text-accent hover:text-accent-hover"
              >
                {s.title}
              </a>
              <span className="text-muted">
                {' '}
                · {s.name}
                {s.viaGoogle && <> ({labels.via})</>}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

const Heading = ({
  level,
  className,
  children,
}: {
  level: 2 | 3 | 4
  className: string
  children: ReactNode
}) => {
  const Tag = `h${level}` as const
  return <Tag className={className}>{children}</Tag>
}

/** The first story: rank, topic, time and sources, the headline, the allowed excerpt, then every source. */
export function StoryLead({
  story,
  locale,
  labels,
  level = 3,
  className,
}: {
  story: StoryCardData
  locale: Locale
  labels: StoryLabels
  level?: 2 | 3 | 4
  className?: string
}) {
  return (
    <article
      className={cx(
        'flex flex-col gap-4 rounded-xl bg-raised p-5 shadow-soft ring-1 ring-line md:p-7',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Rank n={story.rank} size="lg" />
        <Meta story={story} locale={locale} labels={labels} />
      </div>
      <Heading level={level} className="text-h3 font-semibold">
        <a
          href={story.href}
          rel="noopener"
          lang={story.lang !== locale ? story.lang : undefined}
          className="text-ink no-underline hover:text-accent"
        >
          {story.title}
        </a>
      </Heading>
      {story.excerpt?.text && (
        <p className="line-clamp-4 text-body text-muted">
          <span className="font-medium text-ink">{story.excerpt.source}:</span> „
          {story.excerpt.text}”
        </p>
      )}
      <div className="mt-auto">
        <SourceList sources={story.sources} labels={labels} />
      </div>
    </article>
  )
}

/**
 * One story in a list: rank, topic and time, the headline, the sources. `references` swaps the
 * source names for the full list with each publisher's headline (daily editions).
 */
export function StoryRow({
  story,
  locale,
  labels,
  level = 3,
  references = false,
  showRank = true,
  showExcerpt = false,
  className,
}: {
  story: StoryCardData
  locale: Locale
  labels: StoryLabels
  level?: 2 | 3 | 4
  references?: boolean
  showRank?: boolean
  /** The first publisher's allowed excerpt, two lines (the lead of a compact list). */
  showExcerpt?: boolean
  className?: string
}) {
  return (
    <article className={cx('grid gap-2', className)}>
      <div className="flex items-center gap-2.5">
        {showRank && <Rank n={story.rank} />}
        <Meta story={story} locale={locale} labels={labels} />
      </div>
      <Heading level={level} className="text-body leading-snug font-semibold">
        <a
          href={story.href}
          rel="noopener"
          lang={story.lang !== locale ? story.lang : undefined}
          className="text-ink no-underline hover:text-accent"
        >
          {story.title}
        </a>
      </Heading>
      {showExcerpt && story.excerpt?.text && (
        <p className="line-clamp-2 text-small text-muted">{story.excerpt.text}</p>
      )}
      {references ? (
        <SourceList sources={story.sources} labels={labels} />
      ) : (
        <SourceLinks sources={story.sources} labels={labels} />
      )}
    </article>
  )
}

/**
 * "Important acum": the lead story beside the next four. The heading and the status line
 * ("Updated … from N sources") come from the page.
 */
export function ImportantNow({
  stories,
  locale,
  labels,
}: {
  stories: StoryCardData[]
  locale: Locale
  labels: StoryLabels
}) {
  const [lead, ...rest] = stories
  if (!lead) return null
  return (
    <div className="grid items-start gap-5 lg:grid-cols-12">
      <StoryLead story={lead} locale={locale} labels={labels} className="lg:col-span-7" />
      {rest.length > 0 && (
        <ol className="grid content-start gap-3 lg:col-span-5">
          {rest.map((s) => (
            <li key={s.key} className="rounded-xl bg-raised p-4 ring-1 ring-line md:p-5">
              <StoryRow story={s} locale={locale} labels={labels} />
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
