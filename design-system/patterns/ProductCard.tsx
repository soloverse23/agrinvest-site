import Link from 'next/link'
import type { ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import { formatQuantity } from '@/lib/format'

import { ArrowRightIcon, LeafIcon } from '../icons/icons'
import { cx } from '../lib/cx'
import { Button } from '../primitives/Button'
import { Photo } from './Photo'

export type CardStock = 'in-stock' | 'on-request' | 'out-of-stock'

export type ProductCardProps = {
  href: string
  name: string
  brand?: string
  /** Pack sizes, e.g. `1 l · 5 l`. */
  pack?: string
  image?: string
  /** Active ingredients, main nutrients or the variety: the line under the name. */
  line?: string
  /** Up to two key facts, e.g. the formulation and the crops. */
  chips?: string[]
  /** The lowest price, when packs differ. */
  price?: number | null
  fromPrice?: boolean
  /** Price per litre or kilogram, already formatted. */
  unitPrice?: string
  /** Marks a price Agrinvest has not confirmed. */
  priceNote?: ReactNode
  stock: CardStock
  /**
   * What the card offers, rendered by the caller: `QuickAdd` for one buyable pack,
   * `ChoosePack` for several, a compact `QuickRequest` when it cannot be bought online.
   */
  action: ReactNode
  locale: Locale
  labels: { inStock: string; onRequest: string; outOfStock: string; from: string; askPrice: string }
  /** Financing link under the action (pay at harvest). */
  extra?: ReactNode
  className?: string
}

const stockTone: Record<CardStock, string> = {
  'in-stock': 'bg-accent',
  'on-request': 'bg-warning',
  'out-of-stock': 'bg-line-strong',
}

/**
 * Shop card v2 (Phase 7c): a square packshot, brand, name and the line a farmer checks first,
 * two key chips, the price with its unit price, stock and one action. The whole card links
 * to the product; the action sits above that link.
 */
export function ProductCard(p: ProductCardProps) {
  const { labels, locale } = p
  const stockLabel = {
    'in-stock': labels.inStock,
    'on-request': labels.onRequest,
    'out-of-stock': labels.outOfStock,
  }[p.stock]
  return (
    <article
      className={cx(
        'group relative flex flex-col overflow-hidden rounded-lg bg-raised shadow-soft ring-1 ring-line transition duration-200 ease-move hover:shadow-raised hover:ring-line-strong',
        p.className,
      )}
    >
      <div className="relative aspect-square bg-surface">
        {p.image ? (
          <Photo
            src={p.image}
            alt=""
            fill
            sizes="(min-width: 1280px) 300px, (min-width: 1024px) 23vw, (min-width: 640px) 45vw, 50vw"
            className="object-contain p-6 mix-blend-multiply transition-transform duration-300 ease-move group-hover:scale-103 md:p-8"
          />
        ) : (
          <LeafIcon
            className="absolute inset-0 m-auto size-14 text-line-strong"
            aria-hidden="true"
          />
        )}
        <span className="absolute top-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-raised/90 px-2 py-0.5 text-caption text-ink ring-1 ring-line md:top-3 md:left-3">
          <span className={cx('size-2 rounded-full', stockTone[p.stock])} aria-hidden="true" />
          {stockLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3 md:p-4">
        <div className="grid gap-0.5">
          {p.brand && (
            <p className="text-caption font-medium tracking-wide text-subtle uppercase">
              {p.brand}
            </p>
          )}
          <h3 className="text-body leading-snug font-semibold md:text-h4">
            <Link href={p.href} className="no-underline after:absolute after:inset-0">
              {p.name}
            </Link>
          </h3>
          {p.line && <p className="line-clamp-2 text-caption text-muted md:text-small">{p.line}</p>}
        </div>

        {(p.chips?.length || p.pack) && (
          <ul className="flex flex-wrap gap-1.5">
            {p.chips?.slice(0, 2).map((chip, i) => (
              <li
                key={chip}
                className={cx(
                  'max-w-full truncate rounded-full bg-surface px-2.5 py-0.5 text-caption text-muted',
                  // Phones have room for one key fact.
                  i > 0 && 'hidden md:block',
                )}
              >
                {chip}
              </li>
            ))}
            {p.pack && (
              <li className="rounded-full px-1 py-0.5 text-caption text-subtle tabular-nums">
                {p.pack}
              </li>
            )}
          </ul>
        )}

        <div className="mt-auto grid gap-1">
          <div className="flex flex-wrap items-baseline gap-x-1.5">
            {p.price != null ? (
              <>
                {p.fromPrice && <span className="text-caption text-muted">{labels.from}</span>}
                <span className="text-h4 font-semibold tabular-nums md:text-h3">
                  {formatQuantity(p.price, 'lei', locale)}
                </span>
                {p.priceNote}
              </>
            ) : (
              <span className="text-small font-semibold">{labels.askPrice}</span>
            )}
          </div>
          {p.unitPrice && (
            <span className="text-caption text-muted tabular-nums">{p.unitPrice}</span>
          )}
        </div>

        <div className="relative z-10 grid gap-2">
          {p.action}
          {p.extra}
        </div>
      </div>
    </article>
  )
}

/** The action for a product with several packs: its page, where the pack is chosen. */
export function ChoosePack({ href, label }: { href: string; label: string }) {
  return (
    <Button
      href={href}
      size="sm"
      variant="secondary"
      fullWidth
      className="px-3! leading-tight whitespace-normal!"
    >
      {label}
      <ArrowRightIcon
        className="ml-1.5 hidden size-5 align-[-0.3em] md:inline"
        aria-hidden="true"
      />
    </Button>
  )
}

/** The pay-at-harvest link under a card's action. */
export function PayAtHarvestLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-caption font-medium text-accent no-underline hover:underline"
    >
      <LeafIcon className="size-4" />
      {label}
    </Link>
  )
}
