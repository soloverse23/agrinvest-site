import Link from 'next/link'

import { CategoryGlyph } from '../icons/categories'
import type { CategoryIcon } from '../icons/keys'
import { cx } from '../lib/cx'

export type RailCategory = {
  href: string
  label: string
  /** "24 produse" */
  count: string
  icon?: CategoryIcon | null
  /** Subcategories, listed under the tile on hover or focus from `lg`. */
  children?: { href: string; label: string }[]
}

/**
 * The shop's category rail (Phase 7c): an icon tile per top category with its count. Phones
 * get one scrolling row; from `lg` the tiles share the width and show their subcategories on
 * hover or keyboard focus. Server component; every link is in the HTML.
 */
export function CategoryRail({
  label,
  items,
  className,
}: {
  /** Accessible name of the navigation, e.g. "Categorii". */
  label: string
  items: RailCategory[]
  className?: string
}) {
  return (
    <nav aria-label={label} className={className}>
      <ul
        className={cx(
          '-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none]',
          'lg:mx-0 lg:grid lg:snap-none lg:overflow-visible lg:px-0 lg:pb-0',
          'lg:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]',
        )}
      >
        {items.map((c) => (
          <li key={c.href} className="group relative shrink-0 snap-start">
            <Link
              href={c.href}
              className="flex h-full w-36 flex-col items-start gap-3 rounded-lg bg-raised p-4 no-underline shadow-soft ring-1 ring-line transition duration-200 ease-move hover:shadow-raised hover:ring-line-strong lg:w-auto"
            >
              <span className="grid size-11 place-items-center rounded-md bg-accent-soft text-accent">
                <CategoryGlyph icon={c.icon} className="size-6" />
              </span>
              <span className="grid gap-0.5">
                <span className="text-small leading-snug font-semibold text-ink">{c.label}</span>
                <span className="text-caption text-muted tabular-nums">{c.count}</span>
              </span>
            </Link>
            {c.children?.length ? (
              <ul className="invisible absolute inset-x-0 top-full z-20 mt-2 hidden gap-1 rounded-lg bg-raised p-2 opacity-0 shadow-raised ring-1 ring-line transition duration-150 ease-move group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 lg:grid">
                {c.children.map((child) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      className="block rounded-md px-3 py-1.5 text-small text-ink no-underline hover:bg-surface"
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  )
}
