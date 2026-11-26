'use client'

import { useNav } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { SectionIcon } from './PanelIcons'

type NavLink = { label: string; href: string }
export type NavGroupView = {
  key: string
  label: string
  department?: string
  folded?: boolean
  items: (NavLink & { slug: string; icon?: string })[]
}

/** Wide enough for the sidebar and an edit screen side by side. */
const OPEN_FROM = 1024

/**
 * The sidebar links. On a desktop screen the sidebar stays open: Payload closes it below 1440 px,
 * which hid the sections from most laptops. Phones keep the menu button.
 */
export function PanelNavLinks({
  home,
  guide,
  groups,
}: {
  home: NavLink
  guide: NavLink
  groups: NavGroupView[]
}) {
  const pathname = usePathname()
  const { hydrated, navOpen, setNavOpen } = useNav()
  // Payload may close the sidebar a few times while it measures the screen; for a short while
  // after loading the panel opens it again. Later, the menu button works as usual.
  const [mountedAt] = useState(() => Date.now())

  useEffect(() => {
    if (!hydrated || navOpen || window.innerWidth < OPEN_FROM) return
    if (Date.now() - mountedAt < 2500) setNavOpen(true)
  }, [hydrated, navOpen, setNavOpen, mountedAt])

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <div className="panel-nav">
      <ul className="panel-nav__top">
        <li>
          <Link
            className={`panel-nav__link${pathname === home.href ? ' is-active' : ''}`}
            href={home.href}
          >
            <SectionIcon name="home" />
            <span>{home.label}</span>
          </Link>
        </li>
        <li>
          <Link className="panel-nav__link" href={guide.href}>
            <SectionIcon name="help" />
            <span>{guide.label}</span>
          </Link>
        </li>
      </ul>
      {groups.map((group, index) => {
        const showDepartment =
          group.department && group.department !== groups[index - 1]?.department
        const list = (
          <ul>
            {group.items.map((item) => (
              <li key={item.slug}>
                <Link
                  className={`panel-nav__link${active(item.href) ? ' is-active' : ''}`}
                  href={item.href}
                  aria-current={active(item.href) ? 'page' : undefined}
                >
                  <SectionIcon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        )
        return (
          <div key={group.key} className="panel-nav__group">
            {showDepartment && <p className="panel-nav__dept">{group.department}</p>}
            {group.folded ? (
              <details open={group.items.some((i) => active(i.href))}>
                <summary className="panel-nav__label">{group.label}</summary>
                {list}
              </details>
            ) : (
              <>
                <p className="panel-nav__label">{group.label}</p>
                {list}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
