'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'

import { CartIcon } from '../icons/icons'
import { cx } from '../lib/cx'

const readCount = () =>
  Number(document.cookie.match(/(?:^|; )agrinvest_cart_count=(\d+)/)?.[1] ?? 0)

/** A quick add on the page announces itself, so the count changes without a reload. */
const subscribe = (change: () => void) => {
  window.addEventListener('agrinvest:cart', change)
  return () => window.removeEventListener('agrinvest:cart', change)
}

/**
 * The cart in the header. The count comes from a small cookie, so pages stay static and no
 * request is made; without JavaScript it is a plain link.
 */
export function CartLink({
  href,
  label,
  overlay,
}: {
  href: string
  label: string
  overlay?: boolean
}) {
  const count = useSyncExternalStore(subscribe, readCount, () => 0)
  return (
    <Link
      href={href}
      aria-label={count ? `${label} (${count})` : label}
      className={cx(
        'relative inline-flex size-11 items-center justify-center rounded-md no-underline',
        overlay ? 'text-on-forest hover:bg-on-forest/10' : 'text-ink hover:bg-surface',
      )}
    >
      <CartIcon className="size-6" aria-hidden="true" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-0.5 right-0.5 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-caption font-semibold text-on-accent tabular-nums"
        >
          {count}
        </span>
      )}
    </Link>
  )
}
