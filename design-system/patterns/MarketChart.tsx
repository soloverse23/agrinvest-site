'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

import type { Locale } from '@/i18n/config'

import { cx } from '../lib/cx'

export type ChartRange = '1M' | '3M' | '6M' | '1Y' | '5Y' | 'MAX'
export type MarketChartTone = 'accent' | 'info' | 'warning' | 'muted'

export type MarketChartProps = {
  locale: Locale
  /** One to four series, fetched from `/api/markets/{key}`; the first is drawn as an area. */
  series: { key: string; label: string; tone: MarketChartTone }[]
  decimals: number
  /** Unit after each value in the legend, e.g. `$/bbl`. */
  unit: string
  ranges: ChartRange[]
  defaultRange: ChartRange
  labels: {
    ranges: Record<ChartRange, string>
    rangeLabel: string
    loading: string
    hint: string
  }
  /** The server's static line, shown until the chart is ready (same box, so nothing moves). */
  children: ReactNode
  className?: string
}

const DAY = 86_400
const rangeDays: Record<ChartRange, number | null> = {
  '1M': 31,
  '3M': 92,
  '6M': 183,
  '1Y': 366,
  '5Y': 5 * 366,
  MAX: null,
}
const toneVar: Record<MarketChartTone, string> = {
  accent: '--color-accent',
  info: '--color-info',
  warning: '--color-warning',
  muted: '--color-subtle',
}

type Api = typeof import('lightweight-charts')
type Chart = ReturnType<Api['createChart']>
type Point = [number, number]
type Legend = { time: number; values: (number | null)[] } | null

const css = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#14231b'

/** `#12784a` + alpha → `rgba(…)`; other colour forms are returned as they are. */
function alpha(color: string, a: number) {
  const m = /^#([0-9a-f]{6})$/i.exec(color)
  if (!m) return color
  const n = parseInt(m[1], 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

/**
 * A TradingView chart (Lightweight Charts, Apache-2.0) for one market page. The library and
 * the data load only after the visitor first scrolls, touches, moves the pointer or presses a
 * key, and only once the chart is near the screen: until then the server's static line shows,
 * so the page's first load carries no chart code and search engines read the server HTML.
 * The TradingView logo stays on, as the library's licence asks.
 */
export function MarketChart({
  locale,
  series,
  decimals,
  unit,
  ranges,
  defaultRange,
  labels,
  children,
  className,
}: MarketChartProps) {
  const box = useRef<HTMLDivElement>(null)
  const holder = useRef<HTMLDivElement>(null)
  const chart = useRef<Chart | null>(null)
  const data = useRef<Point[][]>([])
  const [range, setRange] = useState<ChartRange>(defaultRange)
  const [phase, setPhase] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [legend, setLegend] = useState<Legend>(null)
  /** The last point of every series: the legend when the pointer is off the chart. */
  const [latest, setLatest] = useState<Legend>(null)
  const started = useRef(false)

  const format = useCallback(
    (v: number) =>
      new Intl.NumberFormat(locale === 'ro' ? 'ro-RO' : 'en-GB', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(v),
    [locale, decimals],
  )

  const showRange = useCallback((r: ChartRange) => {
    const c = chart.current
    const main = data.current[0]
    if (!c || !main?.length) return
    const last = main[main.length - 1]![0] / 1000
    const days = rangeDays[r]
    if (days === null) c.timeScale().fitContent()
    else c.timeScale().setVisibleRange({ from: (last - days * DAY) as never, to: last as never })
  }, [])

  const start = useCallback(async () => {
    if (started.current) return
    started.current = true
    setPhase('loading')
    try {
      const [api, ...loaded] = await Promise.all([
        import('lightweight-charts'),
        ...series.map((s) =>
          fetch(`/api/markets/${s.key}`).then((r) => {
            if (!r.ok) throw new Error(String(r.status))
            return r.json() as Promise<{ points: Point[] }>
          }),
        ),
      ])
      if (!holder.current) return
      data.current = loaded.map((l) => l.points)
      const ink = css('--color-muted')
      const grid = css('--color-line')
      const c = api.createChart(holder.current, {
        autoSize: true,
        layout: {
          background: { type: api.ColorType.Solid, color: 'transparent' },
          textColor: ink,
          fontFamily: getComputedStyle(document.body).fontFamily,
          fontSize: 12,
          attributionLogo: true,
        },
        grid: { vertLines: { visible: false }, horzLines: { color: grid } },
        rightPriceScale: { borderVisible: false },
        timeScale: { borderVisible: false, fixLeftEdge: true, fixRightEdge: true },
        crosshair: { mode: api.CrosshairMode.Magnet },
        localization: { locale: locale === 'ro' ? 'ro-RO' : 'en-GB', priceFormatter: format },
        handleScale: { axisPressedMouseMove: false },
      })
      const handles = series.map((s, i) => {
        const color = css(toneVar[s.tone])
        const options = {
          lineWidth: (i === 0 ? 2 : 1.5) as 2,
          priceFormat: { type: 'price' as const, precision: decimals, minMove: 10 ** -decimals },
          lastValueVisible: i === 0,
          priceLineVisible: i === 0,
        }
        const handle =
          i === 0
            ? c.addSeries(api.AreaSeries, {
                ...options,
                lineColor: color,
                topColor: alpha(color, 0.22),
                bottomColor: alpha(color, 0.01),
              })
            : c.addSeries(api.LineSeries, {
                ...options,
                color,
                lineStyle: i === 1 ? api.LineStyle.Solid : api.LineStyle.Dashed,
              })
        handle.setData(data.current[i]!.map(([d, v]) => ({ time: (d / 1000) as never, value: v })))
        return handle
      })
      c.subscribeCrosshairMove((param) => {
        if (!param.time) return setLegend(null)
        setLegend({
          time: Number(param.time),
          values: handles.map((h) => {
            const p = param.seriesData.get(h) as { value?: number } | undefined
            return p?.value ?? null
          }),
        })
      })
      chart.current = c
      setLatest({
        time: (data.current[0]?.at(-1)?.[0] ?? 0) / 1000,
        values: data.current.map((d) => d.at(-1)?.[1] ?? null),
      })
      setPhase('ready')
    } catch {
      started.current = false
      setPhase('error')
    }
  }, [series, decimals, format, locale])

  // Load after the first interaction, once the chart is within a screen of the viewport.
  useEffect(() => {
    const el = box.current
    if (!el) return
    let interacted = false
    let visible = false
    const go = () => interacted && visible && void start()
    const onInteract = () => {
      interacted = true
      go()
    }
    const events = ['pointerdown', 'pointermove', 'touchstart', 'keydown', 'scroll', 'wheel']
    for (const e of events) window.addEventListener(e, onInteract, { once: true, passive: true })
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = !!entry?.isIntersecting
        go()
      },
      { rootMargin: '100% 0px' },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      for (const e of events) window.removeEventListener(e, onInteract)
    }
  }, [start])

  useEffect(() => {
    if (phase === 'ready') showRange(range)
  }, [phase, range, showRange])

  useEffect(() => () => chart.current?.remove(), [])

  const shown = legend ?? latest

  return (
    <div className={cx('grid gap-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label={labels.rangeLabel}
          className="inline-flex rounded-md bg-surface p-1 ring-1 ring-line"
        >
          {ranges.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={range === r}
              onClick={() => {
                setRange(r)
                void start()
              }}
              className={cx(
                'min-h-9 min-w-10 rounded px-2.5 text-small font-semibold tabular-nums transition-colors duration-150',
                range === r ? 'bg-raised text-ink shadow-soft' : 'text-muted hover:text-ink',
              )}
            >
              {labels.ranges[r]}
            </button>
          ))}
        </div>
        <p aria-hidden="true" className="min-h-5 text-caption text-muted tabular-nums">
          {shown ? (
            <>
              {new Date(shown.time * 1000).toLocaleDateString(locale === 'ro' ? 'ro-RO' : 'en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                timeZone: 'UTC',
              })}
              {series.map((s, i) =>
                shown.values[i] == null ? null : (
                  <span key={s.key} className="ml-3 whitespace-nowrap">
                    <span
                      className="mr-1 inline-block size-2 rounded-full align-middle"
                      style={{ background: `var(${toneVar[s.tone]})` }}
                    />
                    {series.length > 1 && `${s.label} `}
                    <strong className="font-semibold text-ink">
                      {format(shown.values[i]!)}
                    </strong>{' '}
                    {unit}
                  </span>
                ),
              )}
            </>
          ) : phase === 'loading' ? (
            labels.loading
          ) : (
            labels.hint
          )}
        </p>
      </div>
      <div ref={box} className="relative h-72 md:h-96">
        <div
          ref={holder}
          aria-hidden="true"
          className={cx('absolute inset-0', phase !== 'ready' && 'invisible')}
        />
        <div className={cx('absolute inset-0', phase === 'ready' && 'invisible')}>{children}</div>
      </div>
    </div>
  )
}
