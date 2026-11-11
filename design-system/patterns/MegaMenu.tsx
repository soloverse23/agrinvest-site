'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { ChevronDownIcon } from '../icons/icons'
import { cx } from '../lib/cx'
import { linkBase, linkState } from './nav-styles'

/** Delay before switching from one open panel to another, and before closing (ms). */
const SWITCH = 120
const CLOSE = 200

export type MegaItem = {
  href: string
  label: string
  /** The panel's content, rendered on the server (see `MenuPanels`); none → a plain link. */
  panel?: ReactNode
}

/**
 * Desktop navigation with mega menu panels. Hover intent: the first panel opens at once;
 * passing over a neighbour on the way to a panel does not switch it (the switch waits
 * SWITCH ms), and leaving closes after CLOSE ms unless the pointer reaches the panel.
 * Keyboard: focus opens an item's panel, Escape closes it. Without JavaScript the top-level
 * links still lead to each section page, which lists its sub-pages.
 *
 * Only the opening and closing live here: the panels arrive as server-rendered nodes, so
 * their links are in the HTML and none of their code ships to the browser.
 */
export function MegaMenu({
  items,
  current,
  overlay,
  label,
  initialOpen,
}: {
  items: MegaItem[]
  current?: string
  overlay?: boolean
  label: string
  /** Opens a panel on first render (stories and screenshots). */
  initialOpen?: string
}) {
  const [open, setOpen] = useState<string | null>(initialOpen ?? null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const schedule = (next: string | null, delay: number) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpen(next), delay)
  }
  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <nav
      aria-label={label}
      className="hidden self-stretch lg:block"
      onPointerLeave={() => schedule(null, CLOSE)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(null)
      }}
    >
      <ul className="flex h-full items-stretch gap-1">
        {items.map((item) => {
          const hasPanel = !!item.panel
          const isOpen = open === item.href
          return (
            <li
              key={item.href}
              className="flex items-center"
              onPointerEnter={() => {
                if (!hasPanel) schedule(null, open ? SWITCH : 0)
                else if (open === null || open === item.href) {
                  clearTimeout(timer.current)
                  setOpen(item.href)
                } else schedule(item.href, SWITCH)
              }}
              onFocus={() => {
                clearTimeout(timer.current)
                setOpen(hasPanel ? item.href : null)
              }}
            >
              <Link
                href={item.href}
                aria-current={item.href === current ? 'page' : undefined}
                aria-expanded={hasPanel ? isOpen : undefined}
                onClick={() => setOpen(null)}
                className={cx(linkBase, linkState(item.href === current, overlay), 'gap-1')}
              >
                {item.label}
                {hasPanel && (
                  <ChevronDownIcon
                    className={cx(
                      'size-4 opacity-60 transition-transform duration-150',
                      isOpen && 'rotate-180',
                    )}
                  />
                )}
              </Link>
              {hasPanel && (
                <div
                  onPointerEnter={() => clearTimeout(timer.current)}
                  // A click on any link in the panel closes it (links are server-rendered).
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('a')) setOpen(null)
                  }}
                  className={cx(
                    'absolute inset-x-4 top-full z-30 transition duration-150 ease-enter md:inset-x-8',
                    isOpen
                      ? 'translate-y-0 opacity-100'
                      : 'pointer-events-none invisible -translate-y-1 opacity-0',
                  )}
                >
                  {item.panel}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
