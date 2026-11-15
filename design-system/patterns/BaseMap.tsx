'use client'

import Link from 'next/link'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react'

import type { Locale } from '@/i18n/config'
import { formatNumber, formatQuantity } from '@/lib/format'

import { ArrowRightIcon } from '../icons/icons'
import { cx } from '../lib/cx'
import { COUNTIES, MAP_HEIGHT as H, MAP_SRC, MAP_WIDTH as W } from './map/counties'
import { project } from './map/projection'

export type MapBase = {
  id: string
  name: string
  href: string
  /** County code (ISO 3166-2 without "RO-"). */
  county: string | null
  capacity: number | null
  services: string[]
  /** Map units (`project()` of the base's coordinates). */
  x: number
  y: number
  lat: number
  lng: number
}

export type BaseMapProps = {
  locale: Locale
  bases: MapBase[]
  /** The base a page is about: the map opens zoomed on it, with the nearest bases listed. */
  current?: string | null
  /** Shown beside the legend, e.g. one "to confirm" marker for every capacity. */
  note?: ReactNode
  className?: string
}

const copy = {
  ro: {
    label: 'Harta bazelor Agrinvest',
    filter: 'Servicii',
    all: 'Toate',
    overview: (n: number, c: number) => `${n} baze în ${c} județe`,
    hint: 'Alege un județ sau un cerc de pe hartă.',
    back: 'Toate județele',
    open: 'Pagina bazei',
    here: 'Baza aceasta',
    nearest: 'Cele mai apropiate',
    unknown: 'capacitate în curs de confirmare',
    zoomIn: 'Apropie',
    zoomOut: 'Toată țara',
    legend: 'Capacitatea bazei',
    sea: 'Marea Neagră',
    river: 'Dunărea',
    capital: 'București',
    bases: (n: number) => (n === 1 ? '1 bază' : `${n} baze`),
    services: {
      reception: 'Recepție',
      weighing: 'Cântărire',
      cleaning: 'Precurățare',
      drying: 'Uscare',
      storage: 'Depozitare',
    } as Record<string, string>,
  },
  en: {
    label: 'Map of the Agrinvest bases',
    filter: 'Services',
    all: 'All',
    overview: (n: number, c: number) => `${n} bases in ${c} counties`,
    hint: 'Pick a county or a circle on the map.',
    back: 'All counties',
    open: 'Base page',
    here: 'This base',
    nearest: 'Nearest',
    unknown: 'capacity being confirmed',
    zoomIn: 'Zoom in',
    zoomOut: 'Whole country',
    legend: 'Base capacity',
    sea: 'Black Sea',
    river: 'Danube',
    capital: 'Bucharest',
    bases: (n: number) => (n === 1 ? '1 base' : `${n} bases`),
    services: {
      reception: 'Reception',
      weighing: 'Weighing',
      cleaning: 'Cleaning',
      drying: 'Drying',
      storage: 'Storage',
    } as Record<string, string>,
  },
}

const SERVICE_ORDER = ['drying', 'cleaning', 'storage', 'reception', 'weighing']
const ZOOM = 2
/** Circle radius on screen (px) for the largest and the smallest base; area follows capacity. */
const R_MAX = 18
const R_MIN = 5
/** Below this drawn width the map frames the bases instead of the whole country. */
const NARROW = 640

// Places for orientation only: the capital, the river and the sea.
const CAPITAL = project(26.1, 44.43)
const RIVER = project(24.4, 43.77)
const SEA = project(29.65, 43.85)
// 100 km at 46°N: one degree of latitude is 111.2 km.
const KM100 = (project(25, 45)[1] - project(25, 46)[1]) * (100 / 111.2)

/** Great-circle distance in km. */
function km(a: MapBase, b: MapBase) {
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLng = (b.lng - a.lng) * rad
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

/** A round value for the legend: 5.000, 10.000, 20.000, 25.000… */
function roundStep(v: number) {
  const p = 10 ** Math.floor(Math.log10(v))
  return [1, 2, 2.5, 5, 10]
    .map((m) => m * p)
    .reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a))
}

type Selection = { kind: 'county'; code: string } | { kind: 'base'; id: string } | null

/**
 * Romania by county, drawn like a printed map: pale counties, the ones with Agrinvest bases
 * tinted, every base a circle sized by its capacity, and the capital, the Danube, the sea and a
 * 100 km bar for orientation. Choosing a county or a circle (hover, tap or keyboard) fills the
 * list beside the map; a service filter fades the bases without it. On a base page the map opens
 * zoomed on that base and lists the nearest ones. Circles settle in once.
 */
export function BaseMap({ locale, bases, current, note, className }: BaseMapProps) {
  const t = copy[locale]
  const here = bases.find((b) => b.id === current) ?? null
  const [selection, setSelection] = useState<Selection>(here ? { kind: 'base', id: here.id } : null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [service, setService] = useState<string | null>(null)
  const [zoomed, setZoomed] = useState(!!here)
  // Screen pixels per map unit, so circles and labels keep their size at any width.
  const svg = useRef<SVGSVGElement>(null)
  const [px, setPx] = useState(0.62)
  useEffect(() => {
    const el = svg.current
    if (!el) return
    const measure = () => el.clientWidth && setPx(el.clientWidth / W)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const u = (screen: number) => screen / px

  const byCounty = useMemo(() => {
    const m = new Map<string, MapBase[]>()
    for (const b of bases) if (b.county) m.set(b.county, [...(m.get(b.county) ?? []), b])
    for (const list of m.values()) list.sort((a, b) => (b.capacity ?? 0) - (a.capacity ?? 0))
    return m
  }, [bases])
  const max = Math.max(1, ...bases.map((b) => b.capacity ?? 0))
  /** Radius in screen px. */
  const radiusPx = (capacity: number | null) =>
    capacity ? Math.max(R_MIN, R_MAX * Math.sqrt(capacity / max)) : R_MIN
  const radius = (capacity: number | null) => u(radiusPx(capacity))
  const legend = [...new Set([roundStep(max / 4), roundStep(max)])]
  const services = SERVICE_ORDER.filter((s) => bases.some((b) => b.services.includes(s)))
  const matches = (b: MapBase) => !service || b.services.includes(service)
  const countyName = (code: string | null) => COUNTIES.find((c) => c.code === code)?.name ?? ''

  // The view: zoomed on the page's base, framed on the bases on a narrow screen, or the whole
  // country. It keeps its point in the middle without showing past the country's edges.
  const xs = bases.map((b) => b.x)
  const ys = bases.map((b) => b.y)
  const narrow = W * px < NARROW && bases.length > 1
  const view =
    zoomed && here
      ? { x: here.x, y: here.y, k: ZOOM }
      : narrow
        ? {
            x: (Math.min(...xs) + Math.max(...xs)) / 2,
            y: (Math.min(...ys) + Math.max(...ys)) / 2,
            k: Math.min(
              ZOOM,
              W / (Math.max(...xs) - Math.min(...xs) + 160),
              H / (Math.max(...ys) - Math.min(...ys) + 160),
            ),
          }
        : null
  const k = view ? Math.max(1, view.k) : 1
  const tx = view ? Math.min(0, Math.max(W - W * k, W / 2 - view.x * k)) : 0
  const ty = view ? Math.min(0, Math.max(H - H * k, H / 2 - view.y * k)) : 0
  const move = { transition: 'transform 0.9s var(--ease-enter)' } as CSSProperties
  const at = (x: number, y: number) => [x * k + tx, y * k + ty] as const

  const selectedBase = selection?.kind === 'base' ? bases.find((b) => b.id === selection.id) : null
  const selectedCounty =
    selection?.kind === 'county' ? selection.code : (selectedBase?.county ?? null)
  const choose = (s: Selection) => setSelection(s)
  const onKey = (s: Selection) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      choose(s)
    }
  }
  const label = (hovered ? bases.find((b) => b.id === hovered) : null) ?? selectedBase
  // Big circles under small ones, so every circle can be reached.
  const drawn = [...bases].sort((a, b) => (b.capacity ?? 0) - (a.capacity ?? 0))
  const [capX, capY] = at(...CAPITAL)

  const summary = `${t.label}: ${[...byCounty]
    .map(([code, list]) => `${countyName(code)} (${list.map((b) => b.name).join(', ')})`)
    .join('; ')}.`
  const place = 'pointer-events-none fill-subtle italic'

  return (
    <div
      className={cx(
        'grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-10',
        className,
      )}
    >
      <figure className="grid gap-3">
        {services.length > 1 && (
          <div
            role="group"
            aria-label={t.filter}
            className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line pb-3 text-small"
          >
            <span className="text-caption font-semibold tracking-wide text-subtle uppercase">
              {t.filter}
            </span>
            {[null, ...services].map((s) => (
              <button
                key={s ?? 'all'}
                type="button"
                aria-pressed={service === s}
                onClick={() => setService(s)}
                className={cx(
                  'py-1 underline-offset-[6px] transition-colors',
                  service === s
                    ? 'font-semibold text-ink underline decoration-accent decoration-2'
                    : 'text-muted hover:text-ink',
                )}
              >
                {s ? t.services[s] : t.all}
              </button>
            ))}
          </div>
        )}
        <div className="relative overflow-hidden">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="group"
            ref={svg}
            aria-label={summary}
            className="block h-auto w-full touch-manipulation select-none"
            onPointerLeave={() => setHovered(null)}
          >
            <g style={{ ...move, transform: `translate(${tx}px, ${ty}px) scale(${k})` }}>
              {COUNTIES.map((c) => {
                const list = byCounty.get(c.code)
                const active = selectedCounty === c.code
                return (
                  <use
                    key={c.code}
                    href={`${MAP_SRC}#${c.code}`}
                    vectorEffect="non-scaling-stroke"
                    strokeWidth={active ? 1.75 : 0.75}
                    onClick={list ? () => choose({ kind: 'county', code: c.code }) : undefined}
                    onPointerEnter={
                      list
                        ? (e) =>
                            e.pointerType === 'mouse' && choose({ kind: 'county', code: c.code })
                        : undefined
                    }
                    className={cx(
                      'transition-[fill,stroke] duration-300',
                      active
                        ? 'fill-accent-soft stroke-accent'
                        : list
                          ? 'cursor-pointer fill-lime-soft stroke-line-strong hover:fill-accent-soft'
                          : 'fill-paper stroke-line-strong',
                    )}
                  />
                )
              })}
            </g>
            <text
              x={at(...SEA)[0]}
              y={at(...SEA)[1]}
              textAnchor="end"
              fontSize={u(12)}
              className={place}
            >
              {t.sea}
            </text>
            <text
              x={at(...RIVER)[0]}
              y={at(...RIVER)[1]}
              textAnchor="middle"
              fontSize={u(11)}
              letterSpacing={u(2)}
              className={place}
            >
              {t.river}
            </text>
            <g
              style={{ ...move, transform: `translate(${capX}px, ${capY}px)` }}
              className="pointer-events-none"
            >
              <rect
                x={u(-3)}
                y={u(-3)}
                width={u(6)}
                height={u(6)}
                className="fill-ink"
                transform="rotate(45)"
              />
              <text x={u(7)} y={u(-6)} fontSize={u(11)} className="fill-muted">
                {t.capital}
              </text>
            </g>

            {drawn.map((b, i) => {
              const isHere = b.id === here?.id
              const isSelected = selectedBase?.id === b.id
              const on = matches(b)
              const r = radius(b.capacity)
              const [x, y] = at(b.x, b.y)
              return (
                <g key={b.id} style={{ ...move, transform: `translate(${x}px, ${y}px)` }}>
                  <g
                    role="button"
                    tabIndex={on ? 0 : -1}
                    aria-label={`${b.name}${b.county ? `, ${countyName(b.county)}` : ''}`}
                    aria-pressed={isSelected}
                    onClick={() => choose({ kind: 'base', id: b.id })}
                    onKeyDown={onKey({ kind: 'base', id: b.id })}
                    onPointerEnter={() => setHovered(b.id)}
                    onPointerLeave={() => setHovered(null)}
                    onFocus={() => setHovered(b.id)}
                    onBlur={() => setHovered(null)}
                    className={cx(
                      'group/pin origin-center animate-pin-drop cursor-pointer transition-opacity duration-300 outline-none [transform-box:fill-box]',
                      !on && 'pointer-events-none opacity-20',
                    )}
                    style={{ animationDelay: `${200 + i * 40}ms` }}
                  >
                    {isHere && (
                      <circle
                        r={r}
                        className="origin-center animate-halo fill-accent [transform-box:fill-box] motion-reduce:hidden"
                      />
                    )}
                    <circle r={Math.max(r, u(14))} className="fill-transparent" />
                    <circle
                      r={r}
                      strokeWidth={u(isSelected ? 2 : 1)}
                      className={cx(
                        'transition-colors duration-200 group-focus-visible/pin:stroke-ink',
                        isSelected || isHere
                          ? 'fill-accent/45 stroke-forest'
                          : 'fill-accent/15 stroke-accent group-hover/pin:fill-accent/30',
                      )}
                    />
                    <circle r={u(1.75)} className={isHere ? 'fill-forest' : 'fill-accent'} />
                  </g>
                </g>
              )
            })}

            {label && (
              <text
                x={at(label.x, label.y)[0]}
                y={at(label.x, label.y)[1] - radius(label.capacity) - u(6)}
                textAnchor="middle"
                fontSize={u(13)}
                strokeWidth={u(3.5)}
                strokeLinejoin="round"
                className="pointer-events-none fill-ink font-semibold [paint-order:stroke] stroke-paper"
              >
                {label.name}
              </text>
            )}

            {/* Scale bar: it follows the zoom. */}
            <g transform={`translate(${u(4)} ${u(14)})`} className="pointer-events-none">
              <path
                d={`M0 ${u(-4)}V0H${KM100 * k}V${u(-4)}`}
                fill="none"
                strokeWidth={u(1)}
                className="stroke-muted"
              />
              <text x={KM100 * k + u(5)} y={u(1)} fontSize={u(10)} className="fill-muted">
                100 km
              </text>
            </g>
          </svg>
          {here && (
            <button
              type="button"
              onClick={() => setZoomed((z) => !z)}
              className="absolute top-2 right-2 rounded-sm bg-paper/90 px-2 py-1 text-caption font-medium text-accent underline-offset-4 hover:underline"
            >
              {zoomed ? `− ${t.zoomOut}` : `+ ${t.zoomIn}`}
            </button>
          )}
        </div>
        <figcaption className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-3 text-caption text-muted">
          <span className="font-semibold text-ink">{t.legend}</span>
          {legend.map((v) => {
            const r = radiusPx(v)
            return (
              <span key={v} className="flex items-center gap-2">
                <svg width={r * 2 + 2} height={r * 2 + 2} aria-hidden="true">
                  <circle
                    cx={r + 1}
                    cy={r + 1}
                    r={r}
                    strokeWidth={1}
                    className="fill-accent/15 stroke-accent"
                  />
                </svg>
                {formatQuantity(v, 't', locale)}
              </span>
            )
          })}
          {note}
        </figcaption>
      </figure>

      <aside
        aria-live="polite"
        className="border-t border-line pt-5 lg:sticky lg:top-24 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8"
      >
        <div
          key={selectedBase ? `b${selectedBase.id}` : selectedCounty ? `c${selectedCounty}` : 'all'}
          className="grid animate-rise gap-1"
        >
          {selectedBase ? (
            <BaseDetails
              base={selectedBase}
              isHere={selectedBase.id === here?.id}
              nearest={bases
                .filter((b) => b.id !== selectedBase.id && matches(b))
                .map((b) => ({ b, d: km(selectedBase, b) }))
                .sort((a, b) => a.d - b.d)
                .slice(0, 3)}
              county={countyName(selectedBase.county)}
              onBack={() =>
                choose(selectedBase.county ? { kind: 'county', code: selectedBase.county } : null)
              }
              onPick={(id) => choose({ kind: 'base', id })}
              locale={locale}
            />
          ) : selectedCounty ? (
            <>
              <BackButton onClick={() => choose(null)}>{t.back}</BackButton>
              <h3 className="text-h4 font-semibold">{countyName(selectedCounty)}</h3>
              <p className="text-small text-muted">
                {t.bases(byCounty.get(selectedCounty)?.length ?? 0)}
              </p>
              <BaseRows
                rows={(byCounty.get(selectedCounty) ?? []).map((b) => ({
                  id: b.id,
                  name: b.name,
                  meta: b.capacity ? formatQuantity(b.capacity, 't', locale) : '—',
                  dim: !matches(b),
                }))}
                onPick={(id) => choose({ kind: 'base', id })}
              />
            </>
          ) : (
            <>
              <h3 className="text-h4 font-semibold">{t.overview(bases.length, byCounty.size)}</h3>
              <p className="text-small text-muted">{t.hint}</p>
              <ul className="mt-3 grid divide-y divide-line border-y border-line">
                {[...byCounty]
                  .sort(
                    (a, b) =>
                      b[1].length - a[1].length ||
                      countyName(a[0]).localeCompare(countyName(b[0]), locale),
                  )
                  .map(([code, list]) => (
                    <li key={code}>
                      <button
                        type="button"
                        onClick={() => choose({ kind: 'county', code })}
                        className={cx(
                          'group flex w-full items-baseline justify-between gap-3 py-2 text-left text-small',
                          !list.some(matches) && 'opacity-40',
                        )}
                      >
                        <span className="text-ink group-hover:text-accent group-hover:underline">
                          {countyName(code)}
                        </span>
                        <span className="text-caption text-subtle tabular-nums">{list.length}</span>
                      </button>
                    </li>
                  ))}
              </ul>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}

function BackButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-2 justify-self-start text-caption font-medium text-accent hover:underline"
    >
      ← {children}
    </button>
  )
}

function BaseRows({
  rows,
  onPick,
}: {
  rows: { id: string; name: string; meta: string; dim?: boolean }[]
  onPick: (id: string) => void
}) {
  return (
    <ul className="mt-3 grid divide-y divide-line border-y border-line">
      {rows.map((r) => (
        <li key={r.id}>
          <button
            type="button"
            onClick={() => onPick(r.id)}
            className={cx(
              'group flex w-full items-baseline justify-between gap-3 py-2 text-left text-small',
              r.dim && 'opacity-40',
            )}
          >
            <span className="font-medium text-ink group-hover:text-accent group-hover:underline">
              {r.name}
            </span>
            <span className="text-caption text-subtle tabular-nums">{r.meta}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

function BaseDetails({
  base,
  isHere,
  nearest,
  county,
  onBack,
  onPick,
  locale,
}: {
  base: MapBase
  isHere: boolean
  nearest: { b: MapBase; d: number }[]
  county: string
  onBack: () => void
  onPick: (id: string) => void
  locale: Locale
}) {
  const t = copy[locale]
  return (
    <>
      <BackButton onClick={onBack}>{county || t.back}</BackButton>
      {isHere && (
        <p className="text-caption font-semibold tracking-wide text-accent uppercase">{t.here}</p>
      )}
      <h3 className="text-h4 font-semibold">{base.name}</h3>
      <p className="text-small text-muted">
        {county}
        {county && ' · '}
        {base.capacity ? formatQuantity(base.capacity, 't', locale) : t.unknown}
      </p>
      {base.services.length > 0 && (
        <p className="mt-2 text-small text-ink">
          {SERVICE_ORDER.filter((s) => base.services.includes(s))
            .map((s) => t.services[s] ?? s)
            .join(' · ')}
        </p>
      )}
      {!isHere && (
        <Link
          href={base.href}
          prefetch={false}
          className="group mt-3 inline-flex items-center gap-1.5 justify-self-start text-small font-semibold text-accent no-underline hover:underline"
        >
          {t.open}
          <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
      {nearest.length > 0 && (
        <div className="mt-5">
          <p className="text-caption font-semibold tracking-wide text-subtle uppercase">
            {t.nearest}
          </p>
          <BaseRows
            rows={nearest.map(({ b, d }) => ({
              id: b.id,
              name: b.name,
              meta: `${formatNumber(Math.round(d), locale)} km`,
            }))}
            onPick={onPick}
          />
        </div>
      )}
    </>
  )
}
