import Link from 'next/link'
import type { ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import { formatWhen } from '@/lib/format'

import type { CropKey } from '../fixtures/sample'
import {
  ArrowRightIcon,
  BarleyIcon,
  MaizeIcon,
  RapeseedIcon,
  SunflowerIcon,
  WheatIcon,
  type IconProps,
} from '../icons/icons'
import { FuelIcon } from '../icons/server'
import { cx } from '../lib/cx'
import { LiveRotatorLazy } from './Lazy'
import { NewsList, type StoryCardData, type StoryLabels } from './NewsStories'
import { PriceChart } from './PriceChart'

export type LiveKey = CropKey | 'diesel'

export type LiveChart = {
  key: LiveKey
  /** Tab label. */
  name: string
  /** The chart's caption, e.g. "Grâu: prețul Agrinvest". */
  title: string
  unit: string
  /** Oldest first. The tab shows the last value and its change. */
  points: { date: Date; value: number }[]
  decimals?: number
  /** The price's own page. */
  link?: { href: string; label: string }
}

export type FeedKind = 'news' | 'agrinvest' | 'guide' | 'note' | 'social' | 'price'

export type FeedItem = {
  id: string
  kind: FeedKind
  title: string
  href: string
  /** Opens another site (news feeds, LinkedIn). */
  external?: boolean
  /** Shown after the kind, e.g. the news source. */
  source?: string
  date: Date
  /** Price moves: the sign picks the arrow. */
  change?: number
}

export type LivePanelProps = {
  locale: Locale
  /** Prefix for the radio ids; one panel per page. */
  id?: string
  title: string
  /** Latest data timestamp. */
  updated?: Date | null
  charts: LiveChart[]
  /**
   * The ranked news stories (Phase 7e): the column's lead. When there are none, `feed` fills the
   * column alone, as before.
   */
  stories?: StoryCardData[]
  /** How many sources answered on the last news run. */
  storySources?: number
  /** Agrinvest's own updates (notes, guides, posts, price moves), under the stories. */
  feed: FeedItem[]
  links: { news: { href: string; label: string }; prices: { href: string; label: string } }
  labels: {
    updated: string
    crops: string
    rotate: { pause: string; play: string }
    feed: string
    feedEmpty: string
    /** "Important acum", "De la Agrinvest" and the story labels. */
    important?: string
    own?: string
    sourcesLine?: (n: number) => string
    story?: StoryLabels
    kinds: Record<FeedKind, string>
    chart: { date: string; empty: string; vs: string; since: string }
  }
  className?: string
}

/**
 * Tailwind needs literal class names, so each crop's "show my chart" rule is spelled out:
 * the panel shows when its radio (`#{id}-{crop}`) is checked. No script involved.
 */
const showWhen: Record<string, Record<LiveKey, string>> = {
  live: {
    wheat: 'group-has-[#live-wheat:checked]/live:block',
    maize: 'group-has-[#live-maize:checked]/live:block',
    sunflower: 'group-has-[#live-sunflower:checked]/live:block',
    rapeseed: 'group-has-[#live-rapeseed:checked]/live:block',
    barley: 'group-has-[#live-barley:checked]/live:block',
    diesel: 'group-has-[#live-diesel:checked]/live:block',
  },
}

/** One price as a tab: icon and name, then its latest value and change. A radio underneath. */
const tabIcons: Record<LiveKey, (props: IconProps) => ReactNode> = {
  wheat: WheatIcon,
  maize: MaizeIcon,
  sunflower: SunflowerIcon,
  rapeseed: RapeseedIcon,
  barley: BarleyIcon,
  diesel: FuelIcon,
}

function LiveTab({ c, id, first }: { c: LiveChart; id: string; first: boolean }) {
  const Icon = tabIcons[c.key]
  return (
    <label className="group/tab flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-surface px-3 py-2 text-small font-medium whitespace-nowrap text-ink ring-1 ring-line transition-colors duration-150 ring-inset hover:ring-line-strong has-checked:bg-forest has-checked:text-on-forest has-checked:ring-forest has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent">
      <input
        type="radio"
        name={`${id}-crop`}
        id={`${id}-${c.key}`}
        value={c.key}
        defaultChecked={first}
        className="sr-only"
      />
      <Icon className="size-4 shrink-0 text-accent group-has-checked/tab:text-lime" />
      {c.name}
    </label>
  )
}

/** Agrinvest's own updates: an icon per kind, the kind and time, then the title. */
function OwnFeed({
  feed,
  locale,
  labels,
}: {
  feed: FeedItem[]
  locale: Locale
  labels: LivePanelProps['labels']
}) {
  const title =
    'line-clamp-2 text-small leading-snug font-semibold text-ink no-underline hover:text-accent'
  return (
    <ol className="grid divide-y divide-line">
      {feed.map((item) => (
        <li key={item.id} className="grid gap-1 py-3 first:pt-0 last:pb-0">
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
            <span className="font-semibold text-ink">{labels.kinds[item.kind]}</span>
            {item.source && <> · {item.source}</>} ·{' '}
            <time dateTime={item.date.toISOString()}>{formatWhen(item.date, locale)}</time>
          </p>
        </li>
      ))}
    </ol>
  )
}

/**
 * "Live from the field": one panel with a chart per price (Agrinvest's per crop, and diesel).
 * The tabs are radio inputs named after each price, so switching needs no JavaScript; a
 * small island (`LiveRotator`) moves to the next tab every few seconds until the visitor
 * picks one, and holds while the pointer or focus is on the panel. Beside it, the news ranked
 * by the hourly job (Phase 7e): each headline with its source in bold and the time, then
 * Agrinvest's own latest updates in the same plain form. Server-rendered; every link is in the
 * HTML.
 */
export function LivePanel({
  locale,
  id = 'live',
  title,
  updated,
  charts,
  stories = [],
  storySources,
  feed,
  links,
  labels,
  className,
}: LivePanelProps) {
  const ranked = stories.length > 0 && labels.story
  const rules = showWhen[id] ?? showWhen.live
  const headingId = `${id}-title`
  return (
    <section
      aria-labelledby={headingId}
      className={cx('mx-auto w-full max-w-page px-4 md:px-8', className)}
    >
      <div
        data-live
        className="overflow-hidden rounded-xl bg-raised shadow-raised ring-1 ring-line"
      >
        <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line px-5 py-5 md:px-8 md:py-6">
          <h2 id={headingId} className="flex items-center gap-3 text-h2 font-semibold">
            <span className="relative flex size-3" aria-hidden="true">
              <span className="absolute inset-0 rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
              <span className="relative size-3 rounded-full bg-accent" />
            </span>
            {title}
          </h2>
          <div className="flex items-center gap-4">
            {updated && (
              <p className="text-small text-muted">
                {labels.updated}{' '}
                <time dateTime={updated.toISOString()} className="font-medium text-ink">
                  {formatWhen(updated, locale)}
                </time>
              </p>
            )}
            {charts.length > 1 && <LiveRotatorLazy group={`${id}-crop`} labels={labels.rotate} />}
          </div>
        </header>

        <div className="grid lg:grid-cols-12">
          <div className="group/live grid content-start gap-6 p-5 md:p-8 lg:col-span-7">
            {charts.length > 0 ? (
              <>
                <fieldset className="min-w-0">
                  <legend className="sr-only">{labels.crops}</legend>
                  <div
                    data-scroll-x
                    className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0"
                  >
                    {charts.map((c, i) => (
                      <LiveTab key={c.key} c={c} id={id} first={i === 0} />
                    ))}
                  </div>
                </fieldset>
                {charts.map((c) => (
                  <div key={c.key} data-crop={c.key} className={cx('hidden', rules[c.key])}>
                    <PriceChart
                      title={c.title}
                      unit={c.unit}
                      points={c.points}
                      decimals={c.decimals}
                      link={c.link}
                      locale={locale}
                      labels={labels.chart}
                    />
                  </div>
                ))}
              </>
            ) : (
              <p className="text-small text-muted">{labels.chart.empty}</p>
            )}
          </div>

          <div className="grid content-start gap-5 border-t border-line bg-surface p-5 md:p-8 lg:col-span-5 lg:border-t-0 lg:border-l">
            {ranked ? (
              <>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-h4 font-semibold">{labels.important}</h3>
                  {storySources && labels.sourcesLine ? (
                    <p className="text-caption text-muted">{labels.sourcesLine(storySources)}</p>
                  ) : null}
                </div>
                <NewsList
                  stories={stories}
                  locale={locale}
                  labels={labels.story!}
                  size="sm"
                  level={4}
                  excerptFirst
                />
                {feed.length > 0 && (
                  <div className="grid gap-3 border-t border-line pt-4">
                    <h3 className="text-caption font-semibold tracking-wide text-subtle uppercase">
                      {labels.own}
                    </h3>
                    <OwnFeed feed={feed.slice(0, 3)} locale={locale} labels={labels} />
                  </div>
                )}
              </>
            ) : (
              <>
                <h3 className="text-h4 font-semibold">{labels.feed}</h3>
                {feed.length > 0 ? (
                  <OwnFeed feed={feed} locale={locale} labels={labels} />
                ) : (
                  <p className="text-small text-muted">{labels.feedEmpty}</p>
                )}
              </>
            )}
            <div className="mt-auto flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-4">
              {[links.news, links.prices].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group inline-flex items-center gap-1.5 text-small font-semibold text-accent no-underline hover:underline"
                >
                  {l.label}
                  <ArrowRightIcon className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
