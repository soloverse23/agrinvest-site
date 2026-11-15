import type { ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import { formatWhen } from '@/lib/format'

import { cx } from '../lib/cx'

/**
 * Ranked news stories (Phase 7e, decision 0011), kept plain on purpose (owner, 2026-11-15):
 * the headline first, then one line with the source in bold, the time and "+2 surse". No
 * rank numbers, no topic tags (topics are section headings on `/stiri`), no card borders.
 * "+N surse" opens the other outlets' headlines in a `<details>`: no script.
 */

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
  /** Shown as a section heading by the page, never on the item. */
  topic: { label: string }
  /** Headline language: English stories carry `lang="en"` on Romanian pages. */
  lang: 'ro' | 'en'
  date: Date
  /** The excerpt the first publisher allows. */
  excerpt?: { text: string; source: string } | null
  /** The first is the publisher the headline links to. */
  sources: StorySource[]
  pinned?: boolean
}

export type StoryLabels = {
  /** "+2 surse" */
  more: (n: number) => string
  via: string
}

type Size = 'lg' | 'md' | 'sm'

const titleSize: Record<Size, string> = {
  lg: 'text-h3 font-semibold',
  md: 'text-body leading-snug font-semibold',
  sm: 'text-small leading-snug font-semibold',
}

function Heading({
  level,
  className,
  children,
}: {
  level: 2 | 3 | 4
  className: string
  children: ReactNode
}) {
  const Tag = `h${level}` as const
  return <Tag className={className}>{children}</Tag>
}

/** "Agrointel · acum 2 ore · +2 surse", the extra sources opening below. */
function SourceLine({
  story,
  locale,
  labels,
  size,
}: {
  story: StoryCardData
  locale: Locale
  labels: StoryLabels
  size: Size
}) {
  const [first, ...others] = story.sources
  const meta = (
    <>
      <span className="font-semibold text-ink">{first?.name}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={story.date.toISOString()}>{formatWhen(story.date, locale)}</time>
    </>
  )
  const text = cx('text-muted', size === 'sm' ? 'text-caption' : 'text-small')
  const row = 'flex flex-wrap items-baseline gap-x-2 gap-y-0.5'
  if (!others.length) return <p className={cx(row, text)}>{meta}</p>
  return (
    <details className={cx('group', text)}>
      <summary className={cx(row, 'cursor-pointer list-none [&::-webkit-details-marker]:hidden')}>
        {meta}
        <span aria-hidden="true">·</span>
        <span className="font-medium text-accent underline-offset-2 group-hover:underline">
          {labels.more(others.length)}
        </span>
      </summary>
      <ul className="mt-2 grid gap-1.5 border-l-2 border-line pl-3">
        {others.map((s) => (
          <li key={s.url}>
            <span className="font-semibold text-ink">{s.name}</span>
            {s.viaGoogle && <span> ({labels.via})</span>}:{' '}
            <a href={s.url} rel="noopener" className="text-accent hover:text-accent-hover">
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </details>
  )
}

/**
 * One story: the headline (linking to the first publisher), the excerpt when asked for, then
 * the source line. Sizes: `lg` the lead on `/stiri`, `md` lists, `sm` the home panel.
 */
export function NewsItem({
  story,
  locale,
  labels,
  size = 'md',
  level = 3,
  showExcerpt = false,
  className,
}: {
  story: StoryCardData
  locale: Locale
  labels: StoryLabels
  size?: Size
  level?: 2 | 3 | 4
  showExcerpt?: boolean
  className?: string
}) {
  return (
    <article className={cx('grid', size === 'lg' ? 'gap-3' : 'gap-1.5', className)}>
      <Heading level={level} className={titleSize[size]}>
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
        <p
          className={cx(
            'text-muted',
            size === 'lg' ? 'line-clamp-3 text-body' : 'line-clamp-2 text-small',
          )}
        >
          {story.excerpt.text}
        </p>
      )}
      <SourceLine story={story} locale={locale} labels={labels} size={size} />
    </article>
  )
}

/** A plain list of stories, one rule between them. */
export function NewsList({
  stories,
  locale,
  labels,
  size = 'md',
  level = 3,
  excerptFirst = false,
  className,
}: {
  stories: StoryCardData[]
  locale: Locale
  labels: StoryLabels
  size?: Size
  level?: 2 | 3 | 4
  /** Shows the first story's excerpt (the lead of a short list). */
  excerptFirst?: boolean
  className?: string
}) {
  return (
    <ol className={cx('grid divide-y divide-line', className)}>
      {stories.map((s, i) => (
        <li key={s.key} className="py-4 first:pt-0 last:pb-0">
          <NewsItem
            story={s}
            locale={locale}
            labels={labels}
            size={size}
            level={level}
            showExcerpt={excerptFirst && i === 0}
          />
        </li>
      ))}
    </ol>
  )
}

/**
 * "Important acum" on `/stiri`: the first story large with its excerpt, the next four as a
 * list beside it.
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
    <div className="grid gap-8 border-y border-line py-8 lg:grid-cols-12 lg:gap-12">
      <NewsItem
        story={lead}
        locale={locale}
        labels={labels}
        size="lg"
        showExcerpt
        className="content-start lg:col-span-7"
      />
      {rest.length > 0 && (
        <NewsList
          stories={rest}
          locale={locale}
          labels={labels}
          className="border-t border-line pt-6 lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12"
        />
      )}
    </div>
  )
}
