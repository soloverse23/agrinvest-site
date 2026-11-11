'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

const REDUCE = '(prefers-reduced-motion: reduce)'
const onReduceChange = (cb: () => void) => {
  const query = window.matchMedia(REDUCE)
  query.addEventListener('change', cb)
  return () => query.removeEventListener('change', cb)
}
const reducedMotion = () => window.matchMedia(REDUCE).matches

/**
 * Moves the live panel to its next price tab every `interval` ms: it checks the next radio of
 * `group`, so the CSS-only tabs do the switching. Holds while the pointer or keyboard focus is
 * on the panel or the tab is hidden; stops for good once the visitor picks a tab. Starts
 * paused under reduced motion. The button pauses and resumes it (WCAG 2.2.2).
 */
export function LiveRotator({
  group,
  interval = 6000,
  labels,
}: {
  group: string
  interval?: number
  labels: { pause: string; play: string }
}) {
  const button = useRef<HTMLButtonElement>(null)
  const reduce = useSyncExternalStore(onReduceChange, reducedMotion, () => true)
  const [choice, setChoice] = useState<boolean | null>(null)
  const playing = choice ?? !reduce

  useEffect(() => {
    const panel = button.current?.closest('[data-live]')
    if (!panel || !playing) return
    let held = false
    const hold = () => (held = true)
    const release = () => (held = false)
    const leave = (e: Event) => {
      if (!panel.contains((e as FocusEvent).relatedTarget as Node | null)) held = false
    }
    // A visitor's own pick (a real change event) ends the rotation.
    const picked = (e: Event) => {
      if (e.isTrusted && (e.target as HTMLInputElement).name === group) setChoice(false)
    }
    panel.addEventListener('pointerenter', hold)
    panel.addEventListener('pointerleave', release)
    panel.addEventListener('focusin', hold)
    panel.addEventListener('focusout', leave)
    panel.addEventListener('change', picked)
    const timer = window.setInterval(() => {
      if (held || document.hidden) return
      const radios = [...panel.querySelectorAll<HTMLInputElement>(`input[name="${group}"]`)]
      if (radios.length < 2) return
      const at = radios.findIndex((r) => r.checked)
      const next = radios[(at + 1) % radios.length]
      next.checked = true
      // On phones the tabs scroll sideways: bring the new one into view, inside its row only.
      const tab = next.closest('label')
      const row = tab?.parentElement
      if (tab && row && row.scrollWidth > row.clientWidth)
        row.scrollTo({
          left:
            row.scrollLeft +
            tab.getBoundingClientRect().left -
            row.getBoundingClientRect().left -
            20,
          behavior: 'smooth',
        })
    }, interval)
    return () => {
      window.clearInterval(timer)
      panel.removeEventListener('pointerenter', hold)
      panel.removeEventListener('pointerleave', release)
      panel.removeEventListener('focusin', hold)
      panel.removeEventListener('focusout', leave)
      panel.removeEventListener('change', picked)
    }
  }, [group, interval, playing])

  return (
    <button
      ref={button}
      type="button"
      onClick={() => setChoice(!playing)}
      aria-label={playing ? labels.pause : labels.play}
      aria-pressed={!playing}
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted ring-1 ring-line transition-colors duration-150 ring-inset hover:text-ink hover:ring-line-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
        {playing ? (
          <>
            <rect x="6.5" y="5" width="4" height="14" rx="1" />
            <rect x="13.5" y="5" width="4" height="14" rx="1" />
          </>
        ) : (
          <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
        )}
      </svg>
    </button>
  )
}
