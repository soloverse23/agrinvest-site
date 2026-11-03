import Link from 'next/link'
import type { ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import { formatQuantity } from '@/lib/format'

import { ArrowRightIcon } from '../icons/icons'
import { cx } from '../lib/cx'
import { COUNTIES, MAP_HEIGHT, MAP_SRC, MAP_WIDTH } from './map/counties'
import { project } from './map/projection'

export type MapBase = {
  name: string
  href: string
  /** Tonnes. Sizes the point and the bar. */
  capacity?: number | null
  /** County code (ISO 3166-2 without "RO-"), when known. */
  county?: string | null
  countyName?: string | null
  /** GPS position, when known. Without it the base sits at its county's centre. */
  geo?: { lat?: number | null; lng?: number | null } | null
  /** Shown after the capacity, e.g. a "to confirm" marker. */
  note?: ReactNode
}

export type BaseMapProps = {
  locale: Locale
  bases: MapBase[]
  /** Counties tinted as areas we work in (e.g. collection points, figures register C4). */
  counties?: string[]
  /** The base this page is about: highlighted on the map and in the list. */
  current?: string
  /** Visible list beside the map (the accessible, text version of the map). */
  list?: boolean
  /** Shown when no base has a known position yet. */
  pendingNote?: ReactNode
  /** Above the list, e.g. one shared "to confirm" marker for all capacities. */
  listNote?: ReactNode
  className?: string
}

const copy = {
  ro: {
    map: (n: number, c: number) =>
      `Harta României cu ${c} județe în care lucrăm${n ? ` și ${n} baze Agrinvest` : ''}.`,
    area: 'Județe în care lucrăm',
    base: 'Bază Agrinvest (după capacitate)',
    capacity: 'Capacitate',
    county: 'Județ',
    listTitle: 'Baze, după capacitate',
  },
  en: {
    map: (n: number, c: number) =>
      `Map of Romania with the ${c} counties we work in${n ? ` and ${n} Agrinvest bases` : ''}.`,
    area: 'Counties we work in',
    base: 'Agrinvest base (by capacity)',
    capacity: 'Capacity',
    county: 'County',
    listTitle: 'Bases by capacity',
  },
}

const byCode = new Map(COUNTIES.map((c) => [c.code, c]))

/** Position on the map: GPS when known, otherwise the county centre, spread when shared. */
function placeBases(bases: MapBase[]) {
  const perCounty = new Map<string, number>()
  return bases.flatMap((base) => {
    if (base.geo?.lat != null && base.geo.lng != null) {
      return [{ base, at: project(base.geo.lng, base.geo.lat) }]
    }
    const county = base.county ? byCode.get(base.county) : undefined
    if (!county) return []
    const i = perCounty.get(county.code) ?? 0
    perCounty.set(county.code, i + 1)
    // Golden-angle spiral, so several bases in one county do not overlap.
    const [r, a] = [i ? 9 * Math.sqrt(i) : 0, i * 2.4]
    return [{ base, at: [county.at[0] + r * Math.cos(a), county.at[1] + r * Math.sin(a)] }]
  })
}

/**
 * Romania by county, server-rendered SVG: the counties we work in are tinted and every base
 * with a known position is a point sized by capacity. No JavaScript, no map tiles; the
 * outlines come from one cached SVG file (`npm run brand:map`).
 * The list beside it carries the same information as text.
 */
export function BaseMap({
  locale,
  bases,
  counties = [],
  current,
  list = true,
  pendingNote,
  listNote,
  className,
}: BaseMapProps) {
  const t = copy[locale]
  const tinted = new Set(counties)
  const placed = placeBases(bases)
  const maxCapacity = Math.max(1, ...bases.map((b) => b.capacity ?? 0))
  const radius = (capacity?: number | null) => 5 + 11 * Math.sqrt((capacity ?? 0) / maxCapacity)
  const sorted = [...bases].sort((a, b) => (b.capacity ?? 0) - (a.capacity ?? 0))

  return (
    <div className={cx('grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12', className)}>
      <figure
        className={cx('grid gap-4', list ? 'lg:sticky lg:top-8 lg:col-span-7' : 'lg:col-span-12')}
      >
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          role="img"
          aria-label={t.map(placed.length, tinted.size)}
          className="h-auto w-full"
        >
          {/* Outlines from one cached file; only the tinted counties are drawn again on top. */}
          <use href={`${MAP_SRC}#all`} className="fill-surface stroke-line-strong" />
          {[...tinted].map((code) => (
            <use
              key={code}
              href={`${MAP_SRC}#${code}`}
              className="fill-accent-soft stroke-accent/45"
            />
          ))}
          <g>
            {placed.map(({ base, at: [x, y] }) => {
              const active = base.href === current
              return (
                <a key={base.href} href={base.href} className="group outline-none">
                  <title>{base.name}</title>
                  <circle
                    cx={x}
                    cy={y}
                    r={radius(base.capacity)}
                    className={cx(
                      'stroke-raised transition-colors duration-150 group-hover:fill-accent-hover group-focus-visible:fill-ink',
                      active ? 'fill-forest' : 'fill-accent',
                    )}
                    strokeWidth={2}
                    vectorEffect="non-scaling-stroke"
                  />
                  {active && (
                    <circle
                      cx={x}
                      cy={y}
                      r={radius(base.capacity) + 6}
                      className="fill-none stroke-lime"
                      strokeWidth={3}
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                </a>
              )
            })}
          </g>
        </svg>
        <figcaption className="flex flex-wrap items-center gap-x-6 gap-y-2 text-caption text-muted">
          <span className="flex items-center gap-2">
            <span
              className="size-3.5 rounded-xs bg-accent-soft ring-1 ring-accent/45 ring-inset"
              aria-hidden="true"
            />
            {t.area}
          </span>
          {placed.length > 0 && (
            <span className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-accent" aria-hidden="true" />
              {t.base}
            </span>
          )}
          {placed.length === 0 && pendingNote && <span>{pendingNote}</span>}
        </figcaption>
      </figure>

      {list && (
        <div className="grid gap-3 lg:col-span-5">
          {(listNote || bases.length > 1) && (
            <p className="flex items-center justify-between text-caption text-muted">
              <span>{t.listTitle}</span>
              {listNote}
            </p>
          )}
          <ul className="grid divide-y divide-line border-y border-line">
            {sorted.map((base) => {
              const active = base.href === current
              return (
                <li key={base.href}>
                  <Link
                    href={base.href}
                    prefetch={false}
                    aria-current={active ? 'page' : undefined}
                    className={cx(
                      'group flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-2 py-2.5 no-underline md:py-3 transition-colors duration-150 hover:bg-surface',
                      active && 'bg-accent-soft',
                    )}
                  >
                    <span className="flex min-w-0 items-baseline gap-2">
                      <span className="truncate font-semibold text-ink">{base.name}</span>
                      {base.countyName && (
                        <span className="truncate text-caption text-muted">{base.countyName}</span>
                      )}
                    </span>
                    <span className="flex items-center gap-1 text-small text-muted tabular-nums">
                      {base.capacity != null && formatQuantity(base.capacity, 't', locale)}
                      {base.note}
                      <ArrowRightIcon className="size-4 text-accent transition-transform duration-150 group-hover:translate-x-0.5" />
                    </span>
                    {base.capacity != null && (
                      <span className="h-1 w-full overflow-hidden rounded-full bg-surface">
                        <span
                          className="block h-full origin-left rounded-full bg-accent/70"
                          style={{ transform: `scaleX(${base.capacity / maxCapacity})` }}
                        />
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
