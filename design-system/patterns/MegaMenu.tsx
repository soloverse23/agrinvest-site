'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { ArrowRightIcon, ChevronDownIcon, PhoneIcon } from '../icons/icons'
import { cx } from '../lib/cx'
import { linkBase, linkState } from './nav-styles'
import type { NavItem, SiteHeaderProps } from './SiteHeader'

/** Delay before switching from one open panel to another, and before closing (ms). */
const SWITCH = 120
const CLOSE = 200

/**
 * Desktop navigation with mega menu panels. Hover intent: the first panel opens at once;
 * passing over a neighbour on the way to a panel does not switch it (the switch waits
 * SWITCH ms), and leaving closes after CLOSE ms unless the pointer reaches the panel.
 * Keyboard: focus opens an item's panel, Escape closes it. Without JavaScript the top-level
 * links still lead to each section page, which lists its sub-pages.
 */
export function MegaMenu({
  nav,
  current,
  overlay,
  phone,
  labels,
}: {
  nav: NavItem[]
  current?: string
  overlay?: boolean
  phone?: string
  labels: SiteHeaderProps['labels']
}) {
  const [open, setOpen] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const schedule = (next: string | null, delay: number) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpen(next), delay)
  }
  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <nav
      aria-label={labels.main}
      className="hidden self-stretch lg:block"
      onPointerLeave={() => schedule(null, CLOSE)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(null)
      }}
    >
      <ul className="flex h-full items-stretch gap-1">
        {nav.map((item) => {
          const hasPanel = !!item.children?.length
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
                <MenuPanel
                  item={item}
                  open={isOpen}
                  phone={phone}
                  labels={labels}
                  onEnter={() => clearTimeout(timer.current)}
                  onNavigate={() => setOpen(null)}
                />
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** The panel: sub-pages on the left; the section's one-line answer and a phone on the right. */
function MenuPanel({
  item,
  open,
  phone,
  labels,
  onEnter,
  onNavigate,
}: {
  item: NavItem
  open: boolean
  phone?: string
  labels: SiteHeaderProps['labels']
  onEnter: () => void
  onNavigate: () => void
}) {
  return (
    <div
      onPointerEnter={onEnter}
      className={cx(
        'absolute inset-x-4 top-full z-30 transition duration-150 ease-enter md:inset-x-8',
        open
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none invisible -translate-y-1 opacity-0',
      )}
    >
      <div className="grid grid-cols-12 gap-8 rounded-xl bg-raised p-8 text-ink shadow-floating ring-1 ring-line">
        <ul className="col-span-8 grid grid-cols-2 content-start gap-1">
          {item.children?.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={onNavigate}
                className="grid gap-0.5 rounded-lg px-4 py-3 no-underline transition-colors duration-150 hover:bg-surface"
              >
                <span className="font-semibold text-ink">{child.label}</span>
                {child.description && (
                  <span className="text-small text-muted">{child.description}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
        <div className="col-span-4 grid content-start gap-4 rounded-lg bg-surface p-6">
          {item.blurb && <p className="text-small text-muted">{item.blurb}</p>}
          <Link
            href={item.href}
            onClick={onNavigate}
            className="inline-flex items-center gap-1.5 text-small font-semibold text-accent no-underline hover:underline"
          >
            {labels.all ?? item.label}
            <ArrowRightIcon className="size-4" />
          </Link>
          {phone && (
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-2 text-small font-semibold text-ink no-underline hover:text-accent"
            >
              <PhoneIcon className="size-4 text-accent" />
              <span>
                {labels.call && <span className="font-normal text-muted">{labels.call} </span>}
                <span className="tabular-nums">{phone}</span>
              </span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
