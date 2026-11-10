import type { Locale } from '@/i18n/config'
import { formatDate, formatNumber, formatShortDate } from '@/lib/format'

import { cx } from '../lib/cx'

export type ChartTone = 'accent' | 'info' | 'muted'

export type ChartSeries = {
  label: string
  points: { date: Date; value: number }[]
  tone?: ChartTone
}

export type LineChartProps = {
  /** Visible caption; also names the chart for screen readers. */
  title: string
  /** Unit after each value, e.g. `lei/t`, `€/t`. */
  unit: string
  /** One to three series; the first is the main one. */
  series: ChartSeries[]
  locale: Locale
  labels: { table: string; date: string; empty: string }
  decimals?: number
  className?: string
}

const toneClass: Record<ChartTone, string> = {
  accent: 'text-accent',
  info: 'text-info',
  muted: 'text-muted',
}
const dashes = [undefined, '6 4', '2 3']

/** Rounded axis ticks (1, 2, 2.5 or 5 × 10ⁿ) that cover every value, 3 to 6 of them. */
export function chartScale(values: number[]): { min: number; max: number; ticks: number[] } {
  let [lo, hi] = [Math.min(...values), Math.max(...values)]
  if (lo === hi) [lo, hi] = [lo - Math.abs(lo || 1) * 0.05, hi + Math.abs(hi || 1) * 0.05]
  const raw = (hi - lo) / 4
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag
  const min = Math.floor(lo / step) * step
  const max = Math.ceil(hi / step) * step
  const ticks: number[] = []
  for (let t = min; t <= max + step / 2; t += step) ticks.push(Math.round(t / step) * step)
  return { min, max, ticks }
}

/**
 * A dated line chart drawn on the server: no chart library, no client code. Lines are an SVG
 * that stretches to the box; axis labels are HTML, so they keep the type scale at any width.
 * The same numbers sit in a table under "Show the data", for screen readers and for anyone
 * who wants exact values. With fewer than two points it shows only that table, or `empty`.
 */
export function LineChart({
  title,
  unit,
  series,
  locale,
  labels,
  decimals = 0,
  className,
}: LineChartProps) {
  const drawn = series.filter((s) => s.points.length > 0).slice(0, 3)
  const values = drawn.flatMap((s) => s.points.map((p) => p.value))
  const times = drawn.flatMap((s) => s.points.map((p) => p.date.getTime()))
  const canDraw = drawn.some((s) => s.points.length > 1)

  const dates = [...new Set(times)].sort((a, b) => a - b)
  const table = (
    <table className="w-full text-small tabular-nums">
      <caption className="sr-only">
        {title} ({unit})
      </caption>
      <thead>
        <tr className="text-left text-muted">
          <th scope="col" className="py-1 pr-4 font-medium">
            {labels.date}
          </th>
          {drawn.map((s) => (
            <th key={s.label} scope="col" className="py-1 pr-4 text-right font-medium">
              {s.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...dates].reverse().map((t) => (
          <tr key={t} className="border-t border-line">
            <th scope="row" className="py-1 pr-4 text-left font-normal">
              {formatDate(new Date(t), locale)}
            </th>
            {drawn.map((s) => {
              const p = s.points.find((q) => q.date.getTime() === t)
              return (
                <td key={s.label} className="py-1 pr-4 text-right">
                  {p ? formatNumber(p.value, locale, decimals) : '–'}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )

  if (!values.length)
    return (
      <figure className={cx('grid gap-2', className)}>
        <figcaption className="text-body font-semibold">{title}</figcaption>
        <p className="text-small text-muted">{labels.empty}</p>
      </figure>
    )

  const { min, max, ticks } = chartScale(values)
  const [t0, t1] = [Math.min(...times), Math.max(...times)]
  const x = (t: number) => (t1 === t0 ? 50 : ((t - t0) / (t1 - t0)) * 100)
  const y = (v: number) => 100 - ((v - min) / (max - min)) * 100
  const xTicks = [...new Set([t0, t0 + (t1 - t0) / 2, t1])]

  return (
    <figure className={cx('grid gap-3', className)}>
      <figcaption className="flex flex-wrap items-baseline gap-x-2">
        <span className="text-body font-semibold">{title}</span>
        <span className="text-small text-muted">{unit}</span>
      </figcaption>

      {canDraw && (
        <div aria-hidden="true" className="grid grid-cols-[auto_1fr] gap-x-2">
          <div className="relative w-12 text-right text-caption text-muted tabular-nums">
            {ticks.map((t) => (
              <span
                key={t}
                className="absolute right-0 -translate-y-1/2"
                style={{ top: `${y(t)}%` }}
              >
                {formatNumber(t, locale, decimals)}
              </span>
            ))}
          </div>
          <div className="relative h-48 md:h-60">
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
              {drawn.map((s, i) => (
                <path
                  key={s.label}
                  d={s.points
                    .map(
                      (p, j) =>
                        `${j ? 'L' : 'M'}${x(p.date.getTime()).toFixed(2)} ${y(p.value).toFixed(2)}`,
                    )
                    .join(' ')}
                  className={toneClass[s.tone ?? (i === 0 ? 'accent' : 'muted')]}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={i === 0 ? 2.5 : 2}
                  strokeDasharray={dashes[i]}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            {drawn.map((s, i) => {
              const last = s.points[s.points.length - 1]
              return (
                <span
                  key={s.label}
                  className={cx(
                    'absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current ring-2 ring-raised',
                    toneClass[s.tone ?? (i === 0 ? 'accent' : 'muted')],
                  )}
                  style={{ left: `${x(last.date.getTime())}%`, top: `${y(last.value)}%` }}
                />
              )
            })}
          </div>
          <div />
          <div className="relative mt-1 h-5 text-caption text-muted">
            {xTicks.map((t, i) => (
              <span
                key={t}
                className={cx(
                  'absolute top-0 whitespace-nowrap',
                  i === 0 ? 'left-0' : i === xTicks.length - 1 ? 'right-0' : '-translate-x-1/2',
                )}
                style={i > 0 && i < xTicks.length - 1 ? { left: `${x(t)}%` } : undefined}
              >
                {formatShortDate(new Date(t), locale)}
              </span>
            ))}
          </div>
        </div>
      )}

      {drawn.length > 1 && (
        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-small">
          {drawn.map((s, i) => (
            <li key={s.label} className="flex items-center gap-2">
              <svg
                viewBox="0 0 24 4"
                className={cx('h-1 w-6', toneClass[s.tone ?? (i === 0 ? 'accent' : 'muted')])}
                aria-hidden="true"
              >
                <line
                  x1={0}
                  x2={24}
                  y1={2}
                  y2={2}
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeDasharray={dashes[i]}
                />
              </svg>
              {s.label}
            </li>
          ))}
        </ul>
      )}

      {canDraw ? (
        <details className="text-small">
          <summary className="cursor-pointer text-muted">{labels.table}</summary>
          <div className="mt-2 max-h-72 overflow-auto">{table}</div>
        </details>
      ) : (
        table
      )}
    </figure>
  )
}
