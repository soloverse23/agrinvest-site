import Link from 'next/link'

import type { Locale } from '@/i18n/config'
import { formatDate, formatNumber, formatShortDate } from '@/lib/format'

import { ArrowRightIcon } from '../icons/icons'
import { cx } from '../lib/cx'
import { Delta } from '../primitives/Delta'
import { chartScale } from './LineChart'

export type PriceChartProps = {
  /** What is plotted, e.g. "Grâu: prețul Agrinvest". Also the table's caption. */
  title: string
  unit: string
  /** Oldest first. */
  points: { date: Date; value: number }[]
  locale: Locale
  decimals?: number
  /** A link under the chart, e.g. to the crop's price page. */
  link?: { href: string; label: string }
  labels: { date: string; empty: string; vs: string; since: string }
  className?: string
}

/**
 * One price over time, laid out like a market quote: the latest value as the lead figure with
 * its change since the reading before, then an area chart (2px line, a 10% wash, hairline
 * grid, the end dot ringed in the surface colour). Hovering anywhere over the plot shows a
 * crosshair and the value at the nearest date, in CSS only: the page carries no chart script.
 * Screen readers get the numbers as a table.
 */
export function PriceChart({
  title,
  unit,
  points,
  locale,
  decimals = 0,
  link,
  labels,
  className,
}: PriceChartProps) {
  const last = points[points.length - 1]
  const before = points[points.length - 2]
  const fmt = (v: number) => formatNumber(v, locale, decimals)

  if (!last)
    return (
      <figure className={cx('grid gap-2', className)}>
        <figcaption className="text-small font-medium text-muted">{title}</figcaption>
        <p className="text-small text-muted">{labels.empty}</p>
      </figure>
    )

  const { min, max, ticks } = chartScale(points.map((p) => p.value))
  const [t0, t1] = [points[0].date.getTime(), last.date.getTime()]
  const x = (t: number) => (t1 === t0 ? 50 : ((t - t0) / (t1 - t0)) * 100)
  const y = (v: number) => 100 - ((v - min) / (max - min)) * 100
  const line = points
    .map((p, i) => `${i ? 'L' : 'M'}${x(p.date.getTime()).toFixed(2)} ${y(p.value).toFixed(2)}`)
    .join(' ')
  const area = `${line} L${x(t1).toFixed(2)} 100 L${x(t0).toFixed(2)} 100 Z`
  const middle = points[Math.floor((points.length - 1) / 2)]
  // Each date owns the strip of plot between its neighbours' midpoints: the hover target.
  const strips = points.map((p, i) => {
    const at = x(p.date.getTime())
    const from = i ? (x(points[i - 1].date.getTime()) + at) / 2 : 0
    const to = i < points.length - 1 ? (at + x(points[i + 1].date.getTime())) / 2 : 100
    return { p, at, from, to }
  })

  return (
    <figure className={cx('grid gap-5', className)}>
      <figcaption className="grid gap-1">
        <span className="text-small font-medium text-muted">{title}</span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-h1 font-semibold whitespace-nowrap">
            {fmt(last.value)}
            <span className="ml-1.5 text-h4 font-medium text-muted">{unit}</span>
          </span>
          {before && (
            <span className="flex items-center gap-2 text-small text-muted">
              <Delta value={last.value - before.value} locale={locale} />
              {labels.vs} {formatShortDate(before.date, locale)}
            </span>
          )}
        </span>
      </figcaption>

      {points.length > 1 && (
        <div aria-hidden="true" className="grid grid-cols-[1fr_auto] gap-x-3">
          <div className="relative h-52 md:h-64">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full overflow-visible"
            >
              {ticks.map((t) => (
                <line
                  key={t}
                  x1={0}
                  x2={100}
                  y1={y(t)}
                  y2={y(t)}
                  className="stroke-line"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <path d={area} className="fill-accent/10" />
              <path
                d={line}
                className="text-accent"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span
              className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-2 ring-raised"
              style={{ left: `${x(t1)}%`, top: `${y(last.value)}%` }}
            />
            {strips.map(({ p, at, from, to }) => (
              <div
                key={p.date.getTime()}
                className="group/pt absolute inset-y-0"
                style={{ left: `${from}%`, width: `${to - from}%` }}
              >
                <span
                  className="pointer-events-none absolute inset-y-0 hidden w-px bg-line-strong group-hover/pt:block"
                  style={{ left: `${((at - from) / (to - from || 1)) * 100}%` }}
                />
                <span
                  className="pointer-events-none absolute hidden size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-2 ring-raised group-hover/pt:block"
                  style={{
                    left: `${((at - from) / (to - from || 1)) * 100}%`,
                    top: `${y(p.value)}%`,
                  }}
                />
                <span
                  className={cx(
                    'pointer-events-none absolute -top-2 z-10 hidden -translate-y-full rounded-md bg-forest px-2.5 py-1.5 whitespace-nowrap text-on-forest shadow-floating group-hover/pt:grid',
                    at < 15 ? 'left-0' : at > 85 ? 'right-0' : 'left-1/2 -translate-x-1/2',
                  )}
                >
                  <span className="text-small font-semibold tabular-nums">
                    {fmt(p.value)} <span className="font-normal text-on-forest-muted">{unit}</span>
                  </span>
                  <span className="text-caption text-on-forest-muted">
                    {formatDate(p.date, locale)}
                  </span>
                </span>
              </div>
            ))}
          </div>
          <div className="relative w-12 text-caption text-muted tabular-nums">
            {ticks.map((t) => (
              <span
                key={t}
                className="absolute left-0 -translate-y-1/2"
                style={{ top: `${y(t)}%` }}
              >
                {fmt(t)}
              </span>
            ))}
          </div>
          <div className="relative mt-2 h-5 text-caption text-muted">
            <span className="absolute left-0">
              {labels.since} {formatShortDate(points[0].date, locale)}
            </span>
            {points.length > 4 && (
              <span
                className="absolute -translate-x-1/2"
                style={{ left: `${x(middle.date.getTime())}%` }}
              >
                {formatShortDate(middle.date, locale)}
              </span>
            )}
            <span className="absolute right-0">{formatShortDate(last.date, locale)}</span>
          </div>
        </div>
      )}

      {/* The numbers, for screen readers (the plot itself is hidden from them). */}
      <table className="sr-only">
        <caption>
          {title} ({unit})
        </caption>
        <thead>
          <tr>
            <th scope="col">{labels.date}</th>
            <th scope="col">{unit}</th>
          </tr>
        </thead>
        <tbody>
          {[...points].reverse().map((p) => (
            <tr key={p.date.getTime()}>
              <th scope="row">{formatDate(p.date, locale)}</th>
              <td>{fmt(p.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {link && (
        <Link
          href={link.href}
          className="group inline-flex w-fit items-center gap-1.5 text-small font-semibold text-accent no-underline hover:underline"
        >
          {link.label}
          <ArrowRightIcon className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
        </Link>
      )}
    </figure>
  )
}
