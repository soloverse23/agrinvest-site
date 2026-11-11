'use client'

import { useEffect, useState } from 'react'

import { ArrowRightIcon } from '../icons/icons'
import { cx } from '../lib/cx'

/**
 * Previous / next buttons for a horizontal scroll-snap track (`StoryCarousel`). The track works
 * without them (swipe, trackpad, keyboard); they only page it on wide screens, one view at a
 * time, and grey out at either end.
 */
export function CarouselNav({
  track,
  labels,
  className,
  tone = 'paper',
  hideIdle = false,
}: {
  /** The track's element id. */
  track: string
  labels: { prev: string; next: string }
  className?: string
  /** `forest`: outlined buttons for dark strips (QuoteStrip). */
  tone?: 'paper' | 'forest'
  /** Hide the buttons while the whole track fits (and until it has been measured). */
  hideIdle?: boolean
}) {
  const [ends, setEnds] = useState({ start: true, end: hideIdle })

  useEffect(() => {
    const el = document.getElementById(track)
    if (!el) return
    const update = () =>
      setEnds({
        start: el.scrollLeft <= 4,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
      })
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [track])

  const page = (dir: 1 | -1) => {
    const el = document.getElementById(track)
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: reduce ? 'auto' : 'smooth' })
  }

  const button = cx(
    'grid place-items-center rounded-full ring-1 transition-colors duration-150 ring-inset disabled:pointer-events-none disabled:opacity-40',
    'size-11',
    tone === 'forest'
      ? 'text-on-forest ring-on-forest/25 hover:bg-on-forest/10 hover:ring-on-forest/50'
      : 'bg-raised text-ink ring-line hover:bg-accent hover:text-on-accent hover:ring-accent',
  )
  const icon = 'size-5'
  if (hideIdle && ends.start && ends.end) return null
  return (
    <div className={cx('flex gap-2', className)}>
      <button
        type="button"
        aria-controls={track}
        aria-label={labels.prev}
        disabled={ends.start}
        onClick={() => page(-1)}
        className={button}
      >
        <ArrowRightIcon aria-hidden className={cx(icon, 'rotate-180')} />
      </button>
      <button
        type="button"
        aria-controls={track}
        aria-label={labels.next}
        disabled={ends.end}
        onClick={() => page(1)}
        className={button}
      >
        <ArrowRightIcon aria-hidden className={icon} />
      </button>
    </div>
  )
}
