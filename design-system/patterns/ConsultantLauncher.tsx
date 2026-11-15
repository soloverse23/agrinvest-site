'use client'

import { lazy, Suspense, useEffect, useRef, useState } from 'react'

import type { ConsultantDialogProps } from './ConsultantDialog'

/** The drawer's code loads on the first click, not with the page (the 160 KB script budget). */
const Dialog = lazy(() =>
  import('./ConsultantDialog').then((m) => ({ default: m.ConsultantDialog })),
)

/**
 * Opens the consultant drawer from any `[data-consultant]` link (Phase 7g). Until the first
 * click only this listener is on the page; then the drawer loads, opens on the clicked need,
 * and handles later clicks itself. A page reached at `#consultant` opens it straight away.
 * Without JavaScript the links lead to the detailed application, which is a form too.
 */
export function ConsultantLauncher(props: Omit<ConsultantDialogProps, 'open'>) {
  const [need, setNeed] = useState<string | null | undefined>(undefined)
  const loaded = useRef(false)

  useEffect(() => {
    const open = (wanted: string | null) => {
      loaded.current = true
      setNeed(wanted)
    }
    const onClick = (e: MouseEvent) => {
      if (loaded.current || e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey) return
      const trigger = (e.target as Element | null)?.closest<HTMLElement>('[data-consultant]')
      if (!trigger) return
      e.preventDefault()
      e.stopPropagation()
      open(trigger.dataset.need || null)
    }
    window.addEventListener('click', onClick, true)
    const frame =
      window.location.hash === '#consultant' ? requestAnimationFrame(() => open(null)) : 0
    return () => {
      window.removeEventListener('click', onClick, true)
      cancelAnimationFrame(frame)
    }
  }, [])

  if (need === undefined) return null
  return (
    <Suspense fallback={null}>
      <Dialog {...props} defaultNeed={need ?? props.defaultNeed} open />
    </Suspense>
  )
}
