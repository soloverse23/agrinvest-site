'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import { formatQuantity } from '@/lib/format'

import { cx } from '../lib/cx'
import { COUNTIES, MAP_HEIGHT, MAP_SRC, MAP_WIDTH } from './map/counties'

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
  className?: string
}

const copy = {
  ro: { label: 'Harta bazelor Agrinvest' },
  en: { label: 'Map of the Agrinvest bases' },
}

/** Dot radius on screen (px), by capacity. */
const R_MIN = 3.5
const R_MAX = 8
/** How far the chosen county lifts (screen px). */
const LIFT = 4
/** County names: size on screen (px), and the steps (px) a name may move to clear the dots. */
const NAME_PX = 10
const NAME_STEPS = [0, 14, -14, 26, -26, 38]

/** The bases' extent with a margin, inside the country's outline. */
function frame(bases: MapBase[]) {
  if (!bases.length) return { x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT }
  const xs = bases.map((b) => b.x)
  const ys = bases.map((b) => b.y)
  const x0 = Math.max(0, Math.min(...xs) - 50)
  const x1 = Math.min(MAP_WIDTH, Math.max(...xs) + 50)
  const y0 = Math.max(0, Math.min(...ys) - 40)
  const y1 = Math.min(MAP_HEIGHT, Math.max(...ys) + 40)
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }
}

/**
 * The bases on the map: counties with bases tinted and named, every base a dot sized by
 * capacity. Hovering (or tapping) a county lifts it, makes its dots pulse and opens a small box
 * with its bases and their capacity; the box glides from county to county. The dots arrive
 * west to east the first time the map scrolls into view.
 */
export function BaseMap({ locale, bases, note, className }: BaseMapProps) {
  const t = copy[locale]
  const view = useMemo(() => frame(bases), [bases])
  const svg = useRef<SVGSVGElement>(null)
  // Screen px per map unit, so dots and names keep their size at any width.
  const [px, setPx] = useState(1.2)
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

  // Each named county's label: at its centre, or the nearest step up or down that clears the
  // dots and the names already placed (the least crowded step when none is clear), kept
  // inside the frame. Smaller on a narrow map.
  const namePx = px * view.w < 560 ? 8.5 : NAME_PX
  const placed: { x: number; y: number; half: number; tall: number }[] = []
  const names = COUNTIES.filter((c) => byCounty.has(c.code)).map((c) => {
    const half = u((c.name.length * namePx * 0.8) / 2 + 3)
    const tall = u(namePx / 2 + 3)
    const x = Math.min(view.x + view.w - half, Math.max(view.x + half, c.at[0]))
    const crowd = (dy: number) => {
      const y = c.at[1] + u(dy)
      const dots = bases.filter((b) => {
        const r = radius(b.capacity)
        return Math.abs(b.x - x) < half + r && Math.abs(b.y - y) < tall + r
      }).length
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

  const county = COUNTIES.find((c) => c.code === shown)
  const list = shown ? (byCounty.get(shown) ?? []) : []
  // The box sits above the county's centre, or below it near the top edge.
  const box = county && {
    left: Math.min(80, Math.max(20, ((county.at[0] - view.x) / view.w) * 100)),
    top: ((county.at[1] - view.y) / view.h) * 100,
  }
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
        {COUNTIES.map((c) => {
          const here = byCounty.get(c.code)
          return (
            <use
              key={c.code}
              href={`${MAP_SRC}#${c.code}`}
              vectorEffect="non-scaling-stroke"
              strokeWidth={here ? 0.9 : 0.6}
              role={here ? 'button' : undefined}
              tabIndex={here ? 0 : undefined}
              aria-label={
                here
                  ? `${c.name}: ${here.map((b) => `${b.name} ${capacity(b.capacity)}`).join(', ')}`
                  : undefined
              }
              aria-expanded={here ? active === c.code : undefined}
              onPointerEnter={(e) => here && e.pointerType === 'mouse' && setActive(c.code)}
              // A tap opens the county's box; a tap on another county closes it.
              onClick={() => setActive(here ? c.code : null)}
              onFocus={() => here && setActive(c.code)}
              onBlur={() => setActive(null)}
              className={cx(
                'transition-[fill] duration-300 outline-none',
                here
                  ? 'cursor-pointer fill-lime-soft stroke-line-strong hover:fill-accent-soft'
                  : 'fill-paper stroke-line',
              )}
            />
          )
        })}

        {/* The chosen county, lifted above the others with a soft shadow. */}
        {active && (
          <use
            key={active}
            href={`${MAP_SRC}#${active}`}
            vectorEffect="non-scaling-stroke"
            strokeWidth={1.75}
            style={lifted}
            className="pointer-events-none animate-county-lift fill-accent-soft stroke-accent"
          />
        )}

        {names.map((c) => {
          const on = c.code === active
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
      </svg>

      <div aria-live="polite">
        {county && box && list.length > 0 && (
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
            <p className="text-caption font-semibold tracking-wide text-accent uppercase">
              {county.name}
            </p>
            <ul className="mt-2 grid gap-1.5">
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
            {note && <div className="mt-2.5 text-caption">{note}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
