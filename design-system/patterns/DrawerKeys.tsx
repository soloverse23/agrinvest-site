'use client'

import { useEffect } from 'react'

/**
 * Keyboard for the phone filter drawer (FilterDrawer, a `<details>` that works without it):
 * Escape closes it and returns focus to its button; Tab stays inside while it is open.
 */
export function DrawerKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const drawer = document.querySelector<HTMLDetailsElement>('[data-filter-drawer][open]')
      if (!drawer) return
      const summary = drawer.querySelector('summary')
      if (e.key === 'Escape') {
        drawer.open = false
        summary?.focus()
        return
      }
      if (e.key !== 'Tab') return
      const items = [
        ...drawer.querySelectorAll<HTMLElement>('[role="region"] a, [role="region"] summary'),
        summary,
      ].filter((el): el is HTMLElement => Boolean(el?.offsetParent))
      const first = items[0]
      const last = items.at(-1)
      if (!first || !last) return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
  return null
}
