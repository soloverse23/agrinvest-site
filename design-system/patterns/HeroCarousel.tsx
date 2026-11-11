'use client'

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

import { cx } from '../lib/cx'
import { TALL } from '../lib/media'

export type CarouselSlide = {
  /** Short name on the slide's tab (the eyebrow). */
  label: string
  /** The poster, server-rendered (the first one is the page's LCP image). */
  poster: ReactNode
  /** Base path of the loops: `{clip}.webm|mp4`, `{clip}-tall.webm|mp4` (scripts/brand/clips.ts). */
  clip?: string | null
  /** The slide's text, server-rendered. */
  content: ReactNode
}

export type CarouselLabels = {
  carousel: string
  /** "{n} din {total}" */
  slide: string
  pause: string
  play: string
  tabs: string
}

const SWIPE = 48

const REDUCE = '(prefers-reduced-motion: reduce)'
const onReduceChange = (notify: () => void) => {
  const query = window.matchMedia(REDUCE)
  query.addEventListener('change', notify)
  return () => query.removeEventListener('change', notify)
}
const reducedMotion = () => window.matchMedia(REDUCE).matches

/**
 * The hero slider's client island: which slide shows, the timer, the loops and the controls.
 * Everything it shows is rendered on the server and passed in, so every slide's text and
 * links are in the HTML. Rotation runs in JavaScript, not on the bars' animation: the
 * reduced-motion rule in tokens.css shortens every animation to almost nothing.
 *
 * Loops start only after the page has loaded and gone idle, only for slides that have been
 * shown, and not under prefers-reduced-motion or Save-Data (posters only) unless the visitor
 * presses play. Rotation also starts paused under reduced motion.
 */
export function HeroCarousel({
  slides,
  labels,
  interval = 7000,
  children,
  rail,
  still,
}: {
  slides: CarouselSlide[]
  labels: CarouselLabels
  interval?: number
  /** Drawn over the media, before the text: the header and the scrims. */
  children?: ReactNode
  /** The price rail, under the controls. */
  rail?: ReactNode
  /** Behave as under reduced motion: posters only, rotation paused (stories, previews). */
  still?: boolean
}) {
  const id = useId()
  const [index, setIndex] = useState(0)
  // The visitor's own choice wins; until then rotation follows their motion setting.
  const reduce = useSyncExternalStore(onReduceChange, reducedMotion, () => false) || !!still
  const [choice, setChoice] = useState<boolean | null>(null)
  const playing = choice ?? !reduce
  // Posters only under reduced motion or Save-Data, until the visitor presses play themselves.
  const quiet = reduce && choice !== true
  const [held, setHeld] = useState(false)
  const [inView, setInView] = useState(true)
  const [motion, setMotion] = useState(false)
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0]))
  const root = useRef<HTMLElement>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const touch = useRef<number | null>(null)
  const remaining = useRef(interval)
  const shown = useRef(index)
  const count = slides.length
  const running = playing && !held && inView && count > 1

  const go = useCallback(
    (to: number) => {
      const next = (to + count) % count
      setIndex(next)
      setSeen((s) => (s.has(next) ? s : new Set(s).add(next)))
    },
    [count],
  )

  // Motion preferences, then the loops once the page is loaded and idle.
  useEffect(() => {
    const saveData = (navigator as { connection?: { saveData?: boolean } }).connection?.saveData
    if (quiet || (saveData && choice !== true)) return
    let cancel = () => {}
    const idle = () => {
      if ('requestIdleCallback' in window) {
        const h = window.requestIdleCallback(() => setMotion(true), { timeout: 2000 })
        cancel = () => window.cancelIdleCallback(h)
      } else {
        const h = setTimeout(() => setMotion(true), 200)
        cancel = () => clearTimeout(h)
      }
    }
    if (document.readyState === 'complete') idle()
    else window.addEventListener('load', idle, { once: true })
    return () => {
      window.removeEventListener('load', idle)
      cancel()
    }
  }, [quiet, choice])

  // Nothing moves while the hero is off screen.
  useEffect(() => {
    const el = root.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // The timer keeps what was left of a slide's time across pauses.
  useEffect(() => {
    if (shown.current !== index) {
      shown.current = index
      remaining.current = interval
    }
    if (!running) return
    const start = performance.now()
    const t = setTimeout(() => go(index + 1), remaining.current)
    return () => {
      clearTimeout(t)
      remaining.current = Math.max(0, remaining.current - (performance.now() - start))
    }
  }, [index, running, interval, go])

  const onKey = (e: React.KeyboardEvent) => {
    const to =
      e.key === 'ArrowRight'
        ? index + 1
        : e.key === 'ArrowLeft'
          ? index - 1
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? count - 1
              : null
    if (to === null) return
    e.preventDefault()
    go(to)
    tabs.current[(to + count) % count]?.focus()
  }

  const n = (i: number) =>
    labels.slide.replace('{n}', String(i + 1)).replace('{total}', String(count))

  return (
    <section
      ref={root}
      aria-roledescription="carousel"
      aria-label={labels.carousel}
      className="relative isolate flex min-h-svh flex-col overflow-hidden bg-ink text-on-forest"
      onFocus={(e) => {
        if (e.target.matches(':focus-visible')) setHeld(true)
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHeld(false)
      }}
      onTouchStart={(e) => (touch.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        const start = touch.current
        touch.current = null
        const end = e.changedTouches[0]?.clientX
        if (start == null || end == null || Math.abs(end - start) < SWIPE) return
        go(index + (end < start ? 1 : -1))
      }}
    >
      <div aria-hidden="true" className="absolute inset-0 -z-20">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={cx(
              'absolute inset-0 transition-opacity duration-700',
              i === index ? 'opacity-100' : 'opacity-0',
            )}
          >
            {slide.poster}
            {motion && !quiet && slide.clip && seen.has(i) && (
              <Loop clip={slide.clip} play={i === index && playing && inView} />
            )}
          </div>
        ))}
      </div>

      {children}

      <div className="mx-auto flex w-full max-w-page flex-1 flex-col justify-end px-4 pt-32 md:px-8">
        {/* Hovering the text, the controls or the rail holds the slide; the footage does not,
            since on a desktop the pointer is nearly always over it. */}
        <div onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)}>
          {/* All slides share one grid cell, so the tallest sets the height and nothing shifts. */}
          <div
            className="grid pb-8 md:pb-10"
            aria-live={running ? 'off' : 'polite'}
            id={`${id}-slides`}
          >
            {slides.map((slide, i) => (
              <div
                key={i}
                id={`${id}-slide-${i}`}
                role="tabpanel"
                aria-roledescription="slide"
                aria-label={n(i)}
                inert={i !== index}
                className={cx(
                  'col-start-1 row-start-1 transition-opacity duration-500',
                  i === index ? 'opacity-100' : 'invisible opacity-0',
                )}
              >
                {slide.content}
              </div>
            ))}
          </div>

          {count > 1 && (
            <div className="flex items-center gap-4 pb-6 md:gap-6">
              <button
                type="button"
                onClick={() => setChoice(!playing)}
                aria-label={playing ? labels.pause : labels.play}
                className="grid size-9 shrink-0 place-items-center rounded-full ring-1 ring-on-forest/35 transition-colors duration-150 hover:bg-on-forest/10 focus-visible:outline-2 focus-visible:outline-lime"
              >
                <svg
                  viewBox="0 0 16 16"
                  className="size-3.5"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  {playing ? (
                    <path d="M4 2.5h2.5v11H4zM9.5 2.5H12v11H9.5z" />
                  ) : (
                    <path d="M4.5 2.5v11l9-5.5z" />
                  )}
                </svg>
              </button>
              <div
                role="tablist"
                aria-label={labels.tabs}
                onKeyDown={onKey}
                className="grid flex-1 gap-3 md:max-w-xl md:gap-5"
                style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
              >
                {slides.map((slide, i) => (
                  <button
                    key={i}
                    ref={(el) => {
                      tabs.current[i] = el
                    }}
                    type="button"
                    role="tab"
                    id={`${id}-tab-${i}`}
                    aria-selected={i === index}
                    aria-controls={`${id}-slide-${i}`}
                    tabIndex={i === index ? 0 : -1}
                    onClick={() => go(i)}
                    className="group grid gap-2 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
                  >
                    <span className="relative block h-0.5 overflow-hidden rounded-full bg-on-forest/25">
                      {i === index ? (
                        <span
                          key={index}
                          className="absolute inset-0 origin-left animate-hero-progress bg-lime"
                          style={{
                            animationDuration: `${interval}ms`,
                            animationPlayState: running ? 'running' : 'paused',
                          }}
                        />
                      ) : null}
                    </span>
                    <span
                      className={cx(
                        'truncate text-caption font-medium transition-colors duration-150',
                        i === index
                          ? 'text-on-forest'
                          : 'text-on-forest-muted group-hover:text-on-forest',
                      )}
                    >
                      <span className="mr-1.5 tabular-nums opacity-60">0{i + 1}</span>
                      {slide.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {rail}
        </div>
      </div>
    </section>
  )
}

/** One silent loop. It fades in over its poster once it really plays, so nothing flashes. */
function Loop({ clip, play }: { clip: string; play: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    v.muted = true
    if (play) v.play().catch(() => {})
    else v.pause()
  }, [play])
  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      disablePictureInPicture
      preload="auto"
      onPlaying={() => setOn(true)}
      className={cx(
        'absolute inset-0 size-full object-cover object-center transition-opacity duration-700',
        on ? 'opacity-100' : 'opacity-0',
      )}
    >
      <source src={`${clip}-tall.webm`} type="video/webm" media={TALL} />
      <source src={`${clip}-tall.mp4`} type="video/mp4" media={TALL} />
      <source src={`${clip}.webm`} type="video/webm" />
      <source src={`${clip}.mp4`} type="video/mp4" />
    </video>
  )
}
