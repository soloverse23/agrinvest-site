'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import { formatNumber, formatQuantity } from '@/lib/format'

import { ArrowRightIcon } from '../icons/icons'
import { cx } from '../lib/cx'
import { COUNTIES, MAP_HEIGHT, MAP_SRC, MAP_WIDTH } from './map/counties'
import { project } from './map/projection'

export type MapBase = {
  name: string
  href: string
  /** Tonnes. Sizes the point. */
  capacity?: number | null
  /** County code (ISO 3166-2 without "RO-"), when known. */
  county?: string | null
  /** GPS position, when known. Without it the base sits at its county's centre. */
  geo?: { lat?: number | null; lng?: number | null } | null
}

export type BaseMapProps = {
  locale: Locale
  bases: MapBase[]
  /** Counties tinted and named as areas we work in (e.g. collection points, register C4). */
  counties?: string[]
  /** The base this page is about: its point and its link are highlighted. */
  current?: string
  /** Shown while no base has a known position. */
  pendingNote?: ReactNode
  /** Next to the base links, e.g. one shared "to confirm" marker for all capacities. */
  listNote?: ReactNode
  className?: string
}

const copy = {
  ro: {
    map: (c: number) =>
      `Harta județelor României; ${c} județe în care lucrăm. Alege un județ pentru detalii.`,
    area: 'Suprafață',
    working: 'Județ în care lucrăm',
    none: 'Nu avem încă o bază în acest județ.',
    capacity: 'Capacitate',
    bases: 'Bazele noastre',
    legendArea: 'Județe în care lucrăm',
    legendBase: 'Bază Agrinvest',
    close: 'Închide',
    hint: 'Treci cu mouse-ul sau atinge un județ.',
  },
  en: {
    map: (c: number) =>
      `Map of Romania's counties; ${c} counties we work in. Choose a county for details.`,
    area: 'Area',
    working: 'A county we work in',
    none: 'We do not have a base in this county yet.',
    capacity: 'Capacity',
    bases: 'Our bases',
    legendArea: 'Counties we work in',
    legendBase: 'Agrinvest base',
    close: 'Close',
    hint: 'Hover or tap a county.',
  },
}

/** Position on the map: GPS when known, otherwise the county centre, spread when shared. */
function placeBases(bases: MapBase[]) {
  const centres = new Map(COUNTIES.map((c) => [c.code, c.at]))
  const perCounty = new Map<string, number>()
  return bases.flatMap((base) => {
    if (base.geo?.lat != null && base.geo.lng != null) {
      return [{ base, at: project(base.geo.lng, base.geo.lat) }]
    }
    const centre = base.county ? centres.get(base.county) : undefined
    if (!centre || !base.county) return []
    const i = perCounty.get(base.county) ?? 0
    perCounty.set(base.county, i + 1)
    // Golden-angle spiral, so several bases in one county do not overlap.
    const [r, a] = [i ? 14 * Math.sqrt(i) : 0, i * 2.4]
    return [{ base, at: [centre[0] + r * Math.cos(a), centre[1] + r * Math.sin(a)] }]
  })
}

/**
 * Romania by county. The counties we work in are tinted and named; every county shows its
 * area and Agrinvest's bases there on hover, focus or tap (a tap pins the card, with links).
 * Outlines come from one cached SVG file (`npm run brand:map`, decision 0004); bases with a
 * known position are points sized by capacity. The base links under the map keep every base
 * page one click away, with or without JavaScript.
 */
export function BaseMap({
  locale,
  bases,
  counties = [],
  current,
  pendingNote,
  listNote,
  className,
}: BaseMapProps) {
  const t = copy[locale]
  const tinted = new Set(counties)
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  // A pinned (tapped) county keeps its card until closed; otherwise the card follows hover.
  const active = COUNTIES.find((c) => c.code === (selected ?? hovered))
  const placed = placeBases(bases)
  const maxCapacity = Math.max(1, ...bases.map((b) => b.capacity ?? 0))
  const radius = (capacity?: number | null) => 6 + 12 * Math.sqrt((capacity ?? 0) / maxCapacity)
  const sorted = [...bases].sort((a, b) => (b.capacity ?? 0) - (a.capacity ?? 0))
  const toggle = (code: string) => setSelected((s) => (s === code ? null : code))

  return (
    <div className={cx('mx-auto grid w-full max-w-3xl gap-5', className)}>
      <div
        className="relative"
        onKeyDown={(e) => {
          if (e.key === 'Escape') setSelected(null)
        }}
      >
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          role="group"
          aria-label={t.map(tinted.size)}
          className="h-auto w-full"
        >
          {COUNTIES.map((c) => {
            const on = c.code === hovered || c.code === selected
            return (
              <use
                key={c.code}
                href={`${MAP_SRC}#${c.code}`}
                role="button"
                tabIndex={0}
                aria-label={c.name}
                aria-pressed={c.code === selected}
                onMouseEnter={() => setHovered(c.code)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(c.code)}
                onBlur={() => setHovered(null)}
                onClick={() => toggle(c.code)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggle(c.code)
                  }
                }}
                className={cx(
                  'cursor-pointer outline-none transition-colors duration-150',
                  on
                    ? 'fill-lime stroke-forest'
                    : tinted.has(c.code)
                      ? 'fill-accent-soft stroke-accent/50'
                      : 'fill-surface stroke-line-strong',
                )}
              />
            )
          })}
          {/* Names of the counties we work in; hidden on phones, where a tap shows them. */}
          <g aria-hidden="true" className="pointer-events-none hidden md:block">
            {COUNTIES.filter((c) => tinted.has(c.code)).map((c) => (
              <text
                key={c.code}
                x={c.at[0]}
                y={c.at[1] + 5}
                textAnchor="middle"
                className="fill-forest text-small font-semibold"
              >
                {c.name}
              </text>
            ))}
          </g>
          <g>
            {placed.map(({ base, at: [x, y] }) => {
              const here = base.href === current
              return (
                <a key={base.href} href={base.href} aria-label={base.name} className="group">
                  <circle
                    cx={x}
                    cy={y}
                    r={radius(base.capacity)}
                    className={cx(
                      'stroke-raised group-hover:fill-accent-hover',
                      here ? 'fill-forest' : 'fill-accent',
                    )}
                    strokeWidth={2.5}
                    vectorEffect="non-scaling-stroke"
                  />
                  {here && (
                    <circle
                      cx={x}
                      cy={y}
                      r={radius(base.capacity) + 7}
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

        {active && (
          <CountyCard
            locale={locale}
            county={active}
            working={tinted.has(active.code)}
            bases={bases.filter((b) => b.county === active.code)}
            pinned={selected === active.code}
            pendingNote={pendingNote}
            onClose={() => setSelected(null)}
          />
        )}
      </div>

      <div className="grid gap-3 border-t border-line pt-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-caption text-muted">
          <span className="flex items-center gap-2">
            <span
              className="size-3.5 rounded-xs bg-accent-soft ring-1 ring-accent/50 ring-inset"
              aria-hidden="true"
            />
            {t.legendArea}
          </span>
          {placed.length > 0 && (
            <span className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-accent" aria-hidden="true" />
              {t.legendBase}
            </span>
          )}
          <span className="hidden md:inline">{t.hint}</span>
          {placed.length === 0 && pendingNote && <span>{pendingNote}</span>}
        </div>
        <nav aria-label={t.bases} className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5">
          <span className="flex items-center gap-1 text-small font-semibold text-ink">
            {t.bases}
            {listNote}
          </span>
          {sorted.map((b) => (
            <Link
              key={b.href}
              href={b.href}
              prefetch={false}
              aria-current={b.href === current ? 'page' : undefined}
              className={cx(
                'text-small no-underline hover:underline',
                b.href === current ? 'font-semibold text-accent' : 'text-muted hover:text-ink',
              )}
            >
              {b.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

function CountyCard({
  locale,
  county,
  working,
  bases,
  pinned,
  pendingNote,
  onClose,
}: {
  locale: Locale
  county: (typeof COUNTIES)[number]
  working: boolean
  bases: MapBase[]
  pinned: boolean
  pendingNote?: ReactNode
  onClose: () => void
}) {
  const t = copy[locale]
  const [x, y] = [county.at[0] / MAP_WIDTH, county.at[1] / MAP_HEIGHT]
  const capacity = bases.reduce((sum, b) => sum + (b.capacity ?? 0), 0)
  // From 768 px the card floats above the county (below it near the top edge, kept inside
  // the map near the sides); on phones it sits under the map at full width. The card only
  // renders after a hover or tap, so reading the viewport here cannot mismatch the server.
  const floating = window.matchMedia('(min-width: 768px)').matches
  const align = x < 0.25 ? '0%' : x > 0.75 ? '-100%' : '-50%'
  return (
    <div
      role="status"
      className={cx(
        'z-10 grid gap-2 rounded-lg bg-raised p-4 text-small shadow-floating ring-1 ring-line',
        floating ? 'absolute w-64' : 'mt-3 w-full',
        !pinned && 'pointer-events-none',
      )}
      style={
        floating
          ? {
              left: `${x * 100}%`,
              top: `${y * 100}%`,
              transform: `translate(${align}, ${y < 0.4 ? '1.5rem' : 'calc(-100% - 1rem)'})`,
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-h4 font-semibold">{county.name}</p>
        {pinned && (
          <button
            type="button"
            onClick={onClose}
            className="-mt-1 -mr-1 rounded-sm px-1.5 text-muted hover:text-ink"
            aria-label={t.close}
          >
            ×
          </button>
        )}
      </div>
      <dl className="grid gap-1">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">{t.area}</dt>
          <dd className="font-semibold tabular-nums">{formatNumber(county.km2, locale)} km²</dd>
        </div>
        {capacity > 0 && (
          <div className="flex justify-between gap-3">
            <dt className="text-muted">{t.capacity}</dt>
            <dd className="font-semibold tabular-nums">{formatQuantity(capacity, 't', locale)}</dd>
          </div>
        )}
      </dl>
      {working && <p className="text-caption font-medium text-accent">{t.working}</p>}
      {bases.length > 0 ? (
        <ul className="grid gap-1 border-t border-line pt-2">
          {bases.map((b) => (
            <li key={b.href}>
              <Link
                href={b.href}
                className="flex items-center justify-between gap-2 font-semibold text-ink no-underline hover:text-accent"
              >
                {b.name}
                <ArrowRightIcon className="size-4 text-accent" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-caption text-muted">{working ? pendingNote : t.none}</p>
      )}
    </div>
  )
}
