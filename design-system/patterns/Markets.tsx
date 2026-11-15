import Link from 'next/link'

import type { Locale } from '@/i18n/config'
import { formatDate, formatFixed, formatSigned } from '@/lib/format'

import { ArrowRightIcon } from '../icons/icons'
import { cx } from '../lib/cx'
import { Delta } from '../primitives/Delta'

/**
 * Server-rendered parts of the market pages (Phase 7f): the headline figure, the static line the
 * TradingView chart replaces, the hub tile and the history tables. No client code.
 */

/** `[day in UTC ms, value]`, oldest first. */
export type MarketPoint = [number, number]

const pctText = (v: number, locale: Locale) => `${formatSigned(Math.round(v * 100) / 100, locale)}%`

/** A small trend line for a tile; colour follows the move over the shown period. */
export function Sparkline({ points, className }: { points: number[]; className?: string }) {
  if (points.length < 2) return null
  const [w, h, pad] = [120, 40, 3]
  const [min, max] = [Math.min(...points), Math.max(...points)]
  const span = max - min || 1
  const x = (i: number) => (i * w) / (points.length - 1)
  const y = (v: number) => h - pad - ((v - min) * (h - pad * 2)) / span
  const d = points.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const up = points[points.length - 1]! >= points[0]!
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cx('block', up ? 'text-up' : 'text-down', className)}
    >
      <path d={`${d} L${w} ${h} L0 ${h} Z`} fill="currentColor" fillOpacity={0.12} />
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * The chart's stand-in, drawn on the server: an area line over the default range with the
 * period's high and low and its first and last dates. Fills its box, like the chart.
 */
export function StaticLine({
  points,
  locale,
  decimals,
}: {
  points: MarketPoint[]
  locale: Locale
  decimals: number
}) {
  if (points.length < 2) return null
  const values = points.map((p) => p[1])
  const [min, max] = [Math.min(...values), Math.max(...values)]
  const span = max - min || 1
  const [t0, t1] = [points[0]![0], points[points.length - 1]![0]]
  const x = (t: number) => ((t - t0) / (t1 - t0 || 1)) * 1000
  const y = (v: number) => 380 - ((v - min) / span) * 340
  const d = points
    .map(([t, v], i) => `${i ? 'L' : 'M'}${x(t).toFixed(1)} ${y(v).toFixed(1)}`)
    .join(' ')
  return (
    <div className="relative h-full w-full text-accent">
      <svg
        viewBox="0 0 1000 400"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="size-full"
      >
        <line
          x1="0"
          x2="1000"
          y1="40"
          y2="40"
          className="stroke-line"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="0"
          x2="1000"
          y1="380"
          y2="380"
          className="stroke-line"
          vectorEffect="non-scaling-stroke"
        />
        <path d={`${d} L1000 400 L0 400 Z`} fill="currentColor" fillOpacity={0.1} />
        <path
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      </svg>
      <span className="absolute top-0 right-0 text-caption text-muted tabular-nums">
        {formatFixed(max, locale, decimals)}
      </span>
      <span className="absolute right-0 bottom-6 text-caption text-muted tabular-nums">
        {formatFixed(min, locale, decimals)}
      </span>
      <span className="absolute bottom-0 left-0 text-caption text-muted">
        {formatDate(new Date(t0), locale)}
      </span>
      <span className="absolute right-0 bottom-0 text-caption text-muted">
        {formatDate(new Date(t1), locale)}
      </span>
    </div>
  )
}

export type HeadlineProps = {
  locale: Locale
  name: string
  value: number
  decimals: number
  /** Shown after the value, e.g. `$/bbl`. */
  unit: string
  date: Date
  change: number | null
  changePct: number | null
  changeLabel: string
  /** The value in the farmer's unit, e.g. `≈ 10,87 lei/l`. */
  approx?: string
  stats: { label: string; value: string }[]
  benchmark: string
  labels: { updated: string }
}

/** The big number at the top of a market page, with its move and the year's range. */
export function MarketHeadline({
  locale,
  name,
  value,
  decimals,
  unit,
  date,
  change,
  changePct,
  changeLabel,
  approx,
  stats,
  benchmark,
  labels,
}: HeadlineProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-1">
        <p className="text-small font-semibold text-muted">{name}</p>
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-figure font-semibold text-ink tabular-nums">
            {formatFixed(value, locale, decimals)}
          </span>
          <span className="text-body text-muted">{unit}</span>
          {change !== null && changePct !== null && (
            <span className="flex items-center gap-2 text-small text-muted">
              <Delta value={Math.round(changePct * 100) / 100} unit="%" locale={locale} />
              {changeLabel}
            </span>
          )}
        </p>
        {approx && <p className="text-body font-semibold text-ink tabular-nums">{approx}</p>}
        <p className="text-caption text-muted">
          {labels.updated} {formatDate(date, locale)} · {benchmark}
        </p>
      </div>
      {stats.length > 0 && (
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-line ring-1 ring-line md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="grid gap-0.5 bg-raised px-4 py-3">
              <dt className="text-caption text-muted">{s.label}</dt>
              <dd className="font-semibold text-ink tabular-nums">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

export type TileProps = {
  locale: Locale
  name: string
  href?: string
  value: number
  decimals: number
  unit: string
  date: Date
  changePct: number | null
  approx?: string
  spark: number[]
  open: string
}

/** One market on the hub: name, value, move, a one-year line and a link to its page. */
export function MarketTile({
  locale,
  name,
  href,
  value,
  decimals,
  unit,
  date,
  changePct,
  approx,
  spark,
  open,
}: TileProps) {
  const body = (
    <>
      <span className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <span className="font-semibold text-ink">{name}</span>
        {changePct !== null && (
          <Delta value={Math.round(changePct * 100) / 100} unit="%" locale={locale} size="sm" />
        )}
      </span>
      <span className="flex flex-wrap items-baseline gap-x-1.5">
        <span className="text-h3 font-semibold text-ink tabular-nums">
          {formatFixed(value, locale, decimals)}
        </span>
        <span className="text-caption text-muted">{unit}</span>
      </span>
      {approx && <span className="text-small text-muted tabular-nums">{approx}</span>}
      <Sparkline points={spark} className="h-10 w-full" />
      <span className="flex items-center justify-between gap-2 text-caption text-muted">
        {formatDate(date, locale)}
        {href && (
          <span className="inline-flex items-center gap-1 font-semibold text-accent">
            {open}
            <ArrowRightIcon className="size-3.5" />
          </span>
        )}
      </span>
    </>
  )
  const frame =
    'grid h-full content-start gap-2 rounded-lg bg-raised p-4 shadow-soft ring-1 ring-line'
  return href ? (
    <Link
      href={href}
      className={cx(frame, 'no-underline transition-shadow duration-150 hover:ring-accent')}
    >
      {body}
    </Link>
  ) : (
    <div className={frame}>{body}</div>
  )
}

/** A history table: one row per period, one column per series. */
export function HistoryTable({
  caption,
  head,
  rows,
  locale,
  decimals,
}: {
  caption: string
  head: string[]
  rows: { label: string; values: (number | null)[] }[]
  locale: Locale
  decimals: number
}) {
  return (
    <div className="overflow-x-auto rounded-lg bg-raised shadow-soft ring-1 ring-line">
      <table className="w-full border-collapse text-left text-small">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="bg-surface text-muted">
            {head.map((h, i) => (
              <th
                key={h}
                scope="col"
                className={cx(
                  'px-3 py-2.5 font-medium whitespace-nowrap first:pl-4 last:pr-4',
                  i > 0 && 'text-right',
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-line">
              <th scope="row" className="py-2 pr-3 pl-4 font-medium whitespace-nowrap">
                {r.label}
              </th>
              {r.values.map((v, i) => (
                <td key={i} className="px-3 py-2 text-right tabular-nums last:pr-4">
                  {v === null ? '–' : formatFixed(v, locale, decimals)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { pctText }
