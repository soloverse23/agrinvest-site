import type { ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import { formatQuantity } from '@/lib/format'

import { cx } from '../lib/cx'
import { COUNTIES, MAP_HEIGHT, MAP_SRC, MAP_WIDTH } from './map/counties'

export type CountyCapacity = {
  /** County code (ISO 3166-2 without "RO-"). */
  code: string
  /** Total storage capacity of Agrinvest's bases there, in tonnes (0 when not known yet). */
  capacity: number
}

export type CountyMapProps = {
  locale: Locale
  counties: CountyCapacity[]
  /** A county to outline, e.g. the one of the base a page is about. */
  current?: string | null
  /** Shown beside the scale, e.g. one "to confirm" marker for every capacity. */
  note?: ReactNode
  className?: string
}

const copy = {
  ro: {
    map: 'Capacitatea de depozitare Agrinvest pe județe',
    scale: 'Capacitate pe județ',
    unknown: 'capacitate în curs de confirmare',
    upTo: 'până la',
    over: 'peste',
  },
  en: {
    map: 'Agrinvest storage capacity by county',
    scale: 'Capacity per county',
    unknown: 'capacity being confirmed',
    upTo: 'up to',
    over: 'over',
  },
}

const steps = ['fill-lime', 'fill-accent', 'fill-forest'] as const
const swatches = ['bg-lime', 'bg-accent', 'bg-forest'] as const

/**
 * Splits the counties into at most three steps by capacity (thirds of the sorted totals), so
 * the shading reads at a glance whatever the numbers are. Returns the upper bound of each step.
 */
export function capacitySteps(values: number[]): number[] {
  const sorted = [...new Set(values.filter((v) => v > 0))].sort((a, b) => a - b)
  if (sorted.length <= 3) return sorted
  const at = (share: number) => sorted[Math.ceil(sorted.length * share) - 1]
  return [...new Set([at(1 / 3), at(2 / 3), sorted[sorted.length - 1]])]
}

/**
 * Romania by county, the counties with Agrinvest bases shaded light to dark by total storage
 * capacity, with a small three-step scale. Drawn on the server from the cached outlines
 * (`public/maps/romania-counties.svg`): no pins, no labels, no script. Hovering a county shows
 * its name and capacity (SVG `<title>`); the full summary is the image's text alternative.
 */
export function CountyMap({ locale, counties, current, note, className }: CountyMapProps) {
  const t = copy[locale]
  const byCode = new Map(counties.map((c) => [c.code, c.capacity]))
  const bounds = capacitySteps(counties.map((c) => c.capacity))
  // A county with a base but no known capacity still shows, in the lightest step.
  const stepOf = (capacity: number) =>
    Math.max(
      0,
      bounds.findIndex((b) => capacity <= b),
    ) + (bounds.length < 3 && bounds.length > 0 ? 3 - bounds.length : 0)
  const named = COUNTIES.filter((c) => byCode.has(c.code))
  const summary = `${t.map}: ${named
    .map((c) => {
      const capacity = byCode.get(c.code) ?? 0
      return `${c.name} ${capacity ? formatQuantity(capacity, 't', locale) : `(${t.unknown})`}`
    })
    .join(', ')}.`
  const here = current ? COUNTIES.find((c) => c.code === current) : undefined

  const scale = bounds.map((upper, i) => {
    const lower = bounds[i - 1]
    const label =
      i === 0
        ? `${t.upTo} ${formatQuantity(upper, 't', locale)}`
        : i === bounds.length - 1 && bounds.length > 2
          ? `${t.over} ${formatQuantity(lower ?? 0, 't', locale)}`
          : `${formatQuantity(lower ?? 0, 't', locale)} – ${formatQuantity(upper, 't', locale)}`
    return { label, step: stepOf(upper) }
  })

  return (
    <figure className={cx('mx-auto grid w-full max-w-3xl gap-4', className)}>
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        role="img"
        aria-label={summary}
        className="h-auto w-full"
      >
        {COUNTIES.map((c) => {
          const capacity = byCode.get(c.code)
          const shaded = capacity !== undefined
          return (
            <g key={c.code}>
              <title>
                {shaded
                  ? `${c.name}: ${capacity ? formatQuantity(capacity, 't', locale) : t.unknown}`
                  : c.name}
              </title>
              <use
                href={`${MAP_SRC}#${c.code}`}
                className={cx(
                  shaded
                    ? cx(steps[stepOf(capacity)], 'stroke-raised')
                    : 'fill-surface stroke-line-strong',
                )}
              />
            </g>
          )
        })}
        {here && (
          <use
            href={`${MAP_SRC}#${here.code}`}
            className="pointer-events-none fill-none stroke-lime"
            strokeWidth={4}
          />
        )}
      </svg>
      {scale.length > 0 && (
        <figcaption className="flex flex-wrap items-center gap-x-5 gap-y-2 text-caption text-muted">
          <span className="font-semibold text-ink">{t.scale}</span>
          {scale.map((s) => (
            <span key={s.label} className="flex items-center gap-2">
              <span
                className={cx('size-3.5 rounded-xs ring-1 ring-line ring-inset', swatches[s.step])}
                aria-hidden="true"
              />
              {s.label}
            </span>
          ))}
          {note}
        </figcaption>
      )}
    </figure>
  )
}
