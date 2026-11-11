'use client'

import { useEffect } from 'react'

/**
 * Opens the collapsed section the address points to (`#cerere`), so a button elsewhere on the
 * page can send the visitor straight to the request form. Without JavaScript the section
 * still opens with a click on its button. Renders nothing.
 */
export function OpenOnHash() {
  useEffect(() => {
    const open = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      const el = id ? document.getElementById(id) : null
      const box = el?.tagName === 'DETAILS' ? (el as HTMLDetailsElement) : el?.closest('details')
      if (box && !box.open) {
        box.open = true
        box.scrollIntoView({ block: 'start' })
      }
    }
    open()
    window.addEventListener('hashchange', open)
    return () => window.removeEventListener('hashchange', open)
  }, [])
  return null
}
