import Link from 'next/link'
import type { ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import { direction, formatNumber, formatSigned } from '@/lib/format'

import { FuelIcon } from '../icons/server'
import { cx } from '../lib/cx'

/** One price on the strip: today's figure, its change and the last 30 days behind it. */
export type Quote = {
  key: string
  name: string
  href: string
  price: number
  /** The price's unit, e.g. `lei/t`: read aloud, and shown when `showUnit`. */
  unit: string
  /** Show the unit after the price (diesel among grain prices whose unit is in the title). */
  showUnit?: boolean
  /** Decimals for the price and change (diesel: 2). */
  decimals?: number
  /** Change since the previous published price; missing → no change shown. */
  change?: number
  /** The values behind the trend line, oldest first; fewer than two → no line. */
  points?: number[]
  /** Diesel: a fuel icon before the name. */
  fuel?: boolean
}

const tone = { up: 'text-lime', down: 'text-down-on-forest', flat: 'text-on-forest-muted' }
const spoken = {
  ro: { up: 'în creștere cu', down: 'în scădere cu', flat: 'neschimbat' },
  en: { up: 'up', down: 'down', flat: 'unchanged' },
}

/** Change as a share of the price before it, e.g. `15` on `1020` → `1.49`. */
const percentOf = (price: number, change: number) =>
  price - change ? Math.round((change / (price - change)) * 10000) / 100 : 0

/**
 * The trend line: the last 30 days with a soft fill, a dot on today and a dotted line at the
 * previous price, so the eye reads the day's move against it. Drawn on the server; no script.
 */
function Spark({
  points,
  className,
  baseline = true,
}: {
  points: number[]
  className?: string
  baseline?: boolean
}) {
  const [w, h, pad] = [60, 32, 3]
  const [min, max] = [Math.min(...points), Math.max(...points)]
  const span = max - min || 1
  const x = (i: number) => 1 + (i * (w - 2 - pad)) / (points.length - 1)
  const y = (v: number) => h - pad - ((v - min) * (h - pad * 2)) / span
  const line = points.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
  const last = points.length - 1
  const prev = y(points[last - 1]!)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className={cx('block shrink-0', className)}>
      {baseline && (
        <line
          x1="0"
          x2={w}
          y1={prev}
          y2={prev}
          className="stroke-on-forest-muted"
          strokeOpacity={0.5}
          strokeDasharray="1.5 3"
        />
      )}
      <path
        d={`${line.join(' ')} L${x(last)} ${h} L1 ${h} Z`}
        fill="currentColor"
        fillOpacity={0.16}
      />
      <path
        d={line.join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={x(last)} cy={y(points[last]!)} r={2.6} fill="currentColor" />
    </svg>
  )
}

/** What a screen reader hears for one price: name, price, and the move in both forms. */
function said(q: Quote, locale: Locale) {
  const price = `${q.name} ${formatNumber(q.price, locale, q.decimals ?? 0)} ${q.unit}`
  if (q.change === undefined) return price
  const dir = direction(q.change)
  if (dir === 'flat') return `${price}, ${spoken[locale].flat}`
  const abs = formatNumber(Math.abs(q.change), locale, q.decimals ?? 0)
  const pct = formatNumber(Math.abs(percentOf(q.price, q.change)), locale, 2)
  return `${price}, ${spoken[locale][dir]} ${abs} (${pct}%)`
}

function Change({ q, locale, pct }: { q: Quote; locale: Locale; pct: 'both' | 'only' }) {
  if (q.change === undefined) return null
  const dir = direction(q.change)
  const percent = `${formatSigned(percentOf(q.price, q.change), locale)}%`
  return (
    <span
      aria-hidden="true"
      className={cx('font-semibold whitespace-nowrap tabular-nums', tone[dir])}
    >
      {pct === 'both' && (
        <span className="mr-2">
          {(q.change > 0 ? '+' : q.change < 0 ? '−' : '±') +
            formatNumber(Math.abs(q.change), locale, q.decimals ?? 0)}
        </span>
      )}
      {percent}
    </span>
  )
}

function Name({ q, className }: { q: Quote; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'flex items-center gap-1.5 font-semibold whitespace-nowrap text-lime',
        className,
      )}
    >
      {q.fuel && <FuelIcon className="size-3.5 shrink-0" />}
      {q.name}
    </span>
  )
}

/**
 * Today's prices as a quote strip on forest: name, price, a 30-day line and the change in
 * units and percent. `hero` is the tall row under the home slider; `bar` is the one-line strip
 * above the header. When the prices don't fit, the row swipes sideways; nothing moves on its
 * own. `nav` goes after the row: the hero passes ‹ › buttons (QuoteNav). The bar has none, so
 * the pages under it load no script for it.
 */
export function QuoteStrip({
  id,
  locale,
  quotes,
  variant,
  nav,
  className,
}: {
  /** The scrolling track's element id (for the buttons). */
  id: string
  locale: Locale
  quotes: Quote[]
  variant: 'hero' | 'bar'
  nav?: ReactNode
  className?: string
}) {
  const hero = variant === 'hero'
  return (
    <div className={cx('flex min-w-0 items-center', hero ? 'gap-3' : 'gap-2', className)}>
      <ul
        id={id}
        data-scroll-x
        className={cx(
          'flex min-w-0 flex-1 snap-x overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          // The bar has no buttons: a soft fade at the right edge says there is more to swipe.
          hero
            ? 'gap-1'
            : 'h-10 [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)]',
        )}
      >
        {quotes.map((q) => {
          const dir = q.change === undefined ? 'flat' : direction(q.change)
          const spark = q.points && q.points.length > 1
          return (
            <li
              key={q.key}
              className={cx('shrink-0 snap-start', hero && 'min-w-44 flex-1 lg:min-w-40')}
            >
              <Link
                href={q.href}
                className={cx(
                  'text-on-forest no-underline transition-colors duration-150',
                  hero
                    ? 'grid grid-cols-[minmax(0,1fr)_3.75rem] items-center gap-x-2.5 gap-y-0.5 rounded-md px-3 py-2 hover:bg-on-forest/8'
                    : 'flex h-10 items-center gap-2 border-r border-on-forest/10 px-4 text-caption hover:bg-forest-raised',
                )}
              >
                <span className="sr-only">{said(q, locale)}</span>
                <Name q={q} className={cx(hero ? 'col-span-2 text-small' : '')} />
                <span
                  aria-hidden="true"
                  className={cx(
                    'font-semibold whitespace-nowrap tabular-nums',
                    hero && 'text-h4 leading-tight',
                  )}
                >
                  {formatNumber(q.price, locale, q.decimals ?? 0)}
                  {q.showUnit && (
                    <span className="ml-1 text-caption font-normal text-on-forest-muted">
                      {q.unit}
                    </span>
                  )}
                </span>
                {spark && (
                  <Spark
                    points={q.points!}
                    baseline={hero}
                    className={cx(tone[dir], hero ? 'row-span-2 h-9 w-15 self-center' : 'h-4 w-10')}
                  />
                )}
                {hero ? (
                  <span className="text-small">
                    <Change q={q} locale={locale} pct="both" />
                  </span>
                ) : (
                  <Change q={q} locale={locale} pct="only" />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
      {nav}
    </div>
  )
}
