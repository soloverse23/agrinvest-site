'use client'

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'

import type { Locale } from '@/i18n/config'
import { formatQuantity } from '@/lib/format'

import { cx } from '../lib/cx'
import { CONTEXT_SRC, COUNTIES, MAP_HEIGHT, MAP_SRC, MAP_WIDTH } from './map/counties'
import { CONTEXT, project } from './map/projection'

export type MapBase = {
  id: string
  /** `#baza-{slug}` in the address opens the base's county (old base URLs land here). */
  slug: string
  name: string
  /** County code (ISO 3166-2 without "RO-"). */
  county: string | null
  capacity: number | null
  services: string[]
  /** Map units (`project()` of the base's coordinates). */
  x: number
  y: number
}

export type BaseMapProps = {
  locale: Locale
  bases: MapBase[]
  /** Shown in the county box, e.g. one "to confirm" marker for every capacity. */
  note?: ReactNode
  /** The head office: its counties share a colour of their own and one box. */
  office?: MapOffice
  className?: string
}

export type MapOffice = {
  /** The counties shown as the office's region, e.g. București and Ilfov. */
  counties: string[]
  /** Map units (`project()` of the office's coordinates). */
  x: number
  y: number
  /** The address, e.g. the figures register's value with its marker. */
  address?: ReactNode
}

/** The office's region in `active`, next to county codes. */
const OFFICE = 'office'

const copy = {
  ro: {
    label: 'Harta bazelor Agrinvest',
    near: { HUN: 'Ungaria', UKR: 'Ucraina', MDA: 'Moldova', SRB: 'Serbia', BGR: 'Bulgaria' },
    sea: 'Marea Neagră',
    region: 'București – Ilfov',
    office: 'Sediul administrativ',
  },
  en: {
    label: 'Map of the Agrinvest bases',
    near: { HUN: 'Hungary', UKR: 'Ukraine', MDA: 'Moldova', SRB: 'Serbia', BGR: 'Bulgaria' },
    sea: 'Black Sea',
    region: 'Bucharest – Ilfov',
    office: 'Administrative office',
  },
}

/** Where the neighbours' and the sea's names sit (lng, lat): in open ground, off the border. */
const NEAR_AT = {
  HUN: [20.55, 47.25],
  UKR: [24.3, 48.5],
  MDA: [28.85, 47.25],
  SRB: [21.0, 44.55],
  BGR: [25.2, 43.3],
} as const
const SEA_AT = [30.0, 44.0] as const

/** The whole country with a margin of its neighbours; the outer part of it fades out. */
const VIEW = { x: -110, y: -85, w: MAP_WIDTH + 220, h: MAP_HEIGHT + 170 }
/** Below this width (screen px) the map shows no names: the county box carries them. */
const NAMES_MIN_PX = 560

/** Dot radius on screen (px), by capacity. */
const R_MIN = 3.5
const R_MAX = 8
/** How far the chosen county lifts (screen px). */
const LIFT = 4
/** County names: size on screen (px), and the steps (px) a name may move to clear the dots. */
const NAME_PX = 10
const NAME_STEPS = [0, 14, -14, 26, -26, 38]
/** The office marker: half the diamond's diagonal (screen px). */
const OFFICE_R = 6.5
/** Neighbouring countries' names (screen px). */
const NEAR_PX = 10
const CONTEXT_BOX = {
  x: CONTEXT.x0,
  y: CONTEXT.y0,
  width: CONTEXT.x1 - CONTEXT.x0,
  height: CONTEXT.y1 - CONTEXT.y0,
}

/**
 * The bases on the map: Romania among its neighbours and the Black Sea, the neighbours quiet
 * and fading towards the edges; counties with bases tinted and named, every base a dot sized by
 * capacity. Hovering (or tapping) a county lifts it, makes its dots pulse and opens a small box
 * with its bases and their capacity; the box glides from county to county. The dots arrive
 * west to east the first time the map scrolls into view.
 */
export function BaseMap({ locale, bases, note, office, className }: BaseMapProps) {
  const t = copy[locale]
  const view = VIEW
  const uid = useId().replace(/:/g, '')
  const svg = useRef<SVGSVGElement>(null)
  // Screen px per map unit, so dots and names keep their size at any width.
  const [px, setPx] = useState(0.7)
  // null: not measured yet (no animation, so the dots show without JavaScript).
  const [seen, setSeen] = useState<boolean | null>(null)
  useEffect(() => {
    const el = svg.current
    if (!el) return
    const measure = () => el.clientWidth && setPx(el.clientWidth / view.w)
    measure()
    const resize = new ResizeObserver(measure)
    resize.observe(el)
    const visible = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSeen(true)
          visible.disconnect()
        } else setSeen((s) => s ?? false)
      },
      { threshold: 0.35 },
    )
    visible.observe(el)
    return () => {
      resize.disconnect()
      visible.disconnect()
    }
  }, [view.w])
  const u = (screen: number) => screen / px

  const byCounty = useMemo(() => {
    const m = new Map<string, MapBase[]>()
    for (const b of bases) if (b.county) m.set(b.county, [...(m.get(b.county) ?? []), b])
    for (const list of m.values()) list.sort((a, b) => (b.capacity ?? 0) - (a.capacity ?? 0))
    return m
  }, [bases])
  const max = Math.max(1, ...bases.map((b) => b.capacity ?? 0))
  const radius = (c: number | null) => u(c ? Math.max(R_MIN, R_MAX * Math.sqrt(c / max)) : R_MIN)
  const xs = bases.map((b) => b.x)
  const west = Math.min(...xs)
  const span = Math.max(1, Math.max(...xs) - west)
  const officeCounties = office?.counties ?? []
  /** A county's key in `active`: the office's counties share one. */
  const regionOf = (code: string) => (officeCounties.includes(code) ? OFFICE : code)
  const regionCounties = (key: string | null) =>
    key === OFFICE ? officeCounties : key ? [key] : []
  // Where the office's name and box sit: the first of its counties (București).
  const officeAt = COUNTIES.find((c) => c.code === officeCounties[0])?.at
  // Everything a name must clear: the dots and the office marker.
  const marks = [
    ...bases.map((b) => ({ x: b.x, y: b.y, r: radius(b.capacity) })),
    ...(office ? [{ x: office.x, y: office.y, r: u(OFFICE_R) }] : []),
  ]

  // Each named county's label: at its centre, or the nearest step up or down that clears the
  // dots and the names already placed (the least crowded step when none is clear), kept
  // inside the frame. Smaller on a narrow map.
  const namePx = NAME_PX
  const named = px * view.w >= NAMES_MIN_PX
  const placed: { x: number; y: number; half: number; tall: number }[] = []
  // The office's region carries no name: its colour and diamond mark it, its box names it.
  const labelled = COUNTIES.filter(
    (c) => byCounty.has(c.code) && !officeCounties.includes(c.code),
  ).map((c) => ({ code: c.code, name: c.name, at: c.at, region: c.code }))
  const names = (named ? labelled : []).map((c) => {
    const half = u((c.name.length * namePx * 0.8) / 2 + 3)
    const tall = u(namePx / 2 + 3)
    const x = Math.min(view.x + view.w - half, Math.max(view.x + half, c.at[0]))
    const crowd = (dy: number) => {
      const y = c.at[1] + u(dy)
      const dots = marks.filter(
        (m) => Math.abs(m.x - x) < half + m.r && Math.abs(m.y - y) < tall + m.r,
      ).length
      const words = placed.filter(
        (n) => Math.abs(n.x - x) < n.half + half && Math.abs(n.y - y) < n.tall + tall,
      ).length
      return dots + words * 2
    }
    const step = NAME_STEPS.reduce((best, dy) => (crowd(dy) < crowd(best) ? dy : best))
    const y = c.at[1] + u(step)
    placed.push({ x, y, half, tall })
    return { ...c, x, y }
  })

  const [active, setActive] = useState<string | null>(null)
  // The last county shown, so the box can fade out where it was.
  const [shown, setShown] = useState<string | null>(null)
  if (active && active !== shown) setShown(active)
  useEffect(() => {
    const fromHash = () => {
      const slug = decodeURIComponent(window.location.hash.replace(/^#baza-/, ''))
      const hit = bases.find((b) => b.slug === slug)
      if (hit?.county) setActive(hit.county)
    }
    fromHash()
    window.addEventListener('hashchange', fromHash)
    return () => window.removeEventListener('hashchange', fromHash)
  }, [bases])

  const county =
    shown === OFFICE
      ? officeAt && { name: t.region, at: officeAt }
      : COUNTIES.find((c) => c.code === shown)
  const list = regionCounties(shown).flatMap((code) => byCounty.get(code) ?? [])
  // The box sits above the county's centre, or below it near the top edge.
  const box = county && {
    left: Math.min(80, Math.max(20, ((county.at[0] - view.x) / view.w) * 100)),
    top: ((county.at[1] - view.y) / view.h) * 100,
  }
  const isOffice = shown === OFFICE
  const capacity = (c: number | null) => (c ? formatQuantity(c, 't', locale) : '—')
  const lifted = {
    transform: `translateY(${-u(LIFT)}px)`,
    filter: `drop-shadow(0 ${u(6)}px ${u(8)}px color-mix(in srgb, var(--color-forest) 22%, transparent))`,
  } satisfies CSSProperties

  return (
    <div className={cx('relative mx-auto w-full max-w-4xl', className)}>
      <svg
        ref={svg}
        viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
        role="group"
        aria-label={t.label}
        className="block h-auto w-full select-none"
        onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)}
      >
        <defs>
          {(['x', 'y'] as const).map((axis) => (
            <linearGradient
              key={axis}
              id={`${uid}-fade-${axis}`}
              gradientUnits="userSpaceOnUse"
              x1={axis === 'x' ? view.x : 0}
              x2={axis === 'x' ? view.x + view.w : 0}
              y1={axis === 'y' ? view.y : 0}
              y2={axis === 'y' ? view.y + view.h : 0}
            >
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.08" stopColor="#fff" />
              <stop offset="0.92" stopColor="#fff" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          ))}
          {(['x', 'y'] as const).map((axis) => (
            <mask key={axis} id={`${uid}-mask-${axis}`} maskUnits="userSpaceOnUse" {...CONTEXT_BOX}>
              <rect {...CONTEXT_BOX} fill={`url(#${uid}-fade-${axis})`} />
            </mask>
          ))}
        </defs>

        {/* The neighbourhood: sea, neighbouring countries, then Romania's border as a halo
            under the counties (so its line shows just outside them). */}
        <g mask={`url(#${uid}-mask-x)`} className="pointer-events-none">
          <g mask={`url(#${uid}-mask-y)`}>
            <rect
              {...CONTEXT_BOX}
              className="fill-[color-mix(in_srgb,var(--color-info-soft)_75%,var(--color-paper))]"
            />
            <use
              href={`${CONTEXT_SRC}#near`}
              strokeWidth={1}
              className="fill-surface stroke-raised"
            />
          </g>
        </g>
        <use
          href={`${CONTEXT_SRC}#RO`}
          strokeWidth={3}
          className="pointer-events-none fill-raised stroke-[color-mix(in_srgb,var(--color-forest)_40%,transparent)]"
        />

        {named && (
          <g
            aria-hidden="true"
            className="pointer-events-none font-normal uppercase"
            fontSize={u(NEAR_PX)}
            letterSpacing={u(3)}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {(Object.keys(NEAR_AT) as (keyof typeof NEAR_AT)[]).map((k) => {
              const [x, y] = project(NEAR_AT[k][0], NEAR_AT[k][1])
              return (
                <text key={k} x={x} y={y} className="fill-subtle/70">
                  {t.near[k]}
                </text>
              )
            })}
            <text
              x={project(SEA_AT[0], SEA_AT[1])[0]}
              y={project(SEA_AT[0], SEA_AT[1])[1]}
              letterSpacing={u(1.5)}
              className="fill-info/70 normal-case italic"
            >
              {t.sea}
            </text>
          </g>
        )}

        {/* Counties; the office's region (București inside Ilfov) last, so it draws whole. */}
        {[...COUNTIES]
          .sort((a, b) => +officeCounties.includes(a.code) - +officeCounties.includes(b.code))
          .map((c) => {
            const here = byCounty.get(c.code)
            const key = regionOf(c.code)
            const head = key === OFFICE
            const live = Boolean(here || head)
            return (
              <use
                key={c.code}
                href={`${MAP_SRC}#${c.code}`}
                vectorEffect="non-scaling-stroke"
                strokeWidth={live ? 0.9 : 0.6}
                role={live ? 'button' : undefined}
                tabIndex={live ? 0 : undefined}
                aria-label={
                  head
                    ? `${c.name}: ${t.office}`
                    : here
                      ? `${c.name}: ${here.map((b) => `${b.name} ${capacity(b.capacity)}`).join(', ')}`
                      : undefined
                }
                aria-expanded={live ? active === key : undefined}
                onPointerEnter={(e) => live && e.pointerType === 'mouse' && setActive(key)}
                // A tap opens the county's box; a tap on another county closes it.
                onClick={() => setActive(live ? key : null)}
                onFocus={() => live && setActive(key)}
                onBlur={() => setActive(null)}
                className={cx(
                  'transition-[fill] duration-300 outline-none',
                  head
                    ? 'cursor-pointer fill-forest-raised stroke-forest hover:fill-forest'
                    : here
                      ? 'cursor-pointer fill-lime-soft stroke-line-strong hover:fill-accent-soft'
                      : 'fill-raised stroke-line',
                )}
              />
            )
          })}

        {/* The chosen county (or the office's region), lifted with a soft shadow. */}
        {regionCounties(active).map((code) => (
          <use
            key={`${active}-${code}`}
            href={`${MAP_SRC}#${code}`}
            vectorEffect="non-scaling-stroke"
            strokeWidth={1.75}
            style={lifted}
            className={cx(
              'pointer-events-none animate-county-lift',
              active === OFFICE ? 'fill-forest stroke-forest' : 'fill-accent-soft stroke-accent',
            )}
          />
        ))}

        {names.map((c) => {
          const on = c.region === active
          return (
            <text
              key={c.code}
              x={c.x}
              y={c.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={u(namePx)}
              letterSpacing={u(1.4)}
              strokeWidth={u(3)}
              strokeLinejoin="round"
              style={on ? { transform: lifted.transform } : undefined}
              className={cx(
                'pointer-events-none stroke-paper font-medium uppercase transition-[fill,transform] duration-300 [paint-order:stroke]',
                on ? 'fill-accent' : 'fill-subtle',
              )}
            >
              {c.name}
            </text>
          )
        })}

        {bases.map((b) => {
          const on = b.county === active
          const r = radius(b.capacity)
          return (
            <g
              key={b.id}
              id={`baza-${b.slug}`}
              className="pointer-events-none transition-transform duration-300"
              style={on ? { transform: lifted.transform } : undefined}
            >
              <g
                className={cx(
                  'origin-center [transform-box:fill-box]',
                  seen === false && 'opacity-0',
                  seen && 'animate-pin-drop',
                )}
                style={
                  seen ? { animationDelay: `${150 + ((b.x - west) / span) * 700}ms` } : undefined
                }
              >
                {on && (
                  <circle
                    cx={b.x}
                    cy={b.y}
                    r={r}
                    className="origin-center animate-halo fill-accent [transform-box:fill-box]"
                  />
                )}
                <circle cx={b.x} cy={b.y} r={r * 2} className="fill-accent/10" />
                <circle
                  cx={b.x}
                  cy={b.y}
                  r={r}
                  strokeWidth={u(1.5)}
                  className={cx(
                    'stroke-raised transition-colors duration-300',
                    on ? 'fill-forest' : 'fill-accent',
                  )}
                />
              </g>
            </g>
          )
        })}
        {/* The office: a forest diamond, set apart from the round bases. */}
        {office && (
          <g
            className="pointer-events-none transition-transform duration-300"
            style={active === OFFICE ? { transform: lifted.transform } : undefined}
          >
            <g
              className={cx(
                'origin-center [transform-box:fill-box]',
                seen === false && 'opacity-0',
                seen && 'animate-pin-drop',
              )}
              style={seen ? { animationDelay: '100ms' } : undefined}
            >
              <circle cx={office.x} cy={office.y} r={u(OFFICE_R * 2)} className="fill-lime/25" />
              <rect
                x={office.x - u(OFFICE_R / Math.SQRT2)}
                y={office.y - u(OFFICE_R / Math.SQRT2)}
                width={u(OFFICE_R * Math.SQRT2)}
                height={u(OFFICE_R * Math.SQRT2)}
                rx={u(1)}
                strokeWidth={u(1.5)}
                transform={`rotate(45 ${office.x} ${office.y})`}
                className="fill-lime stroke-forest"
              />
            </g>
          </g>
        )}
      </svg>

      <div aria-live="polite">
        {county && box && (list.length > 0 || isOffice) && (
          <div
            className={cx(
              'pointer-events-none absolute z-10 w-56 -translate-x-1/2 rounded-lg bg-raised p-3.5 text-small shadow-raised ring-1 ring-line',
              'transition-[left,top,opacity,scale,translate] duration-300 ease-move',
              box.top < 35 ? 'mt-5' : '-mt-5 -translate-y-full',
              active ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
            )}
            style={{ left: `${box.left}%`, top: `${box.top}%` }}
            aria-hidden={!active}
          >
            <p
              className={cx(
                'text-caption font-semibold tracking-wide uppercase',
                isOffice ? 'text-forest' : 'text-accent',
              )}
            >
              {county.name}
            </p>
            {isOffice && (
              <div className="mt-2 flex gap-2">
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-2 shrink-0 rotate-45 rounded-[1px] bg-forest ring-2 ring-lime"
                />
                <div>
                  <p className="font-medium text-ink">{t.office}</p>
                  {office?.address && (
                    <p className="mt-0.5 text-caption text-muted">{office.address}</p>
                  )}
                </div>
              </div>
            )}
            <ul className={cx('grid gap-1.5', list.length > 0 && 'mt-2')}>
              {list.map((b) => (
                <li key={b.id} className="flex items-center gap-2">
                  <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-accent" />
                  <span className="grow font-medium text-ink">{b.name}</span>
                  <span className="text-caption text-muted tabular-nums">
                    {capacity(b.capacity)}
                  </span>
                </li>
              ))}
            </ul>
            {note && list.length > 0 && <div className="mt-2.5 text-caption">{note}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
