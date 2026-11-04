import Link from 'next/link'
import type { ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import { formatQuantity } from '@/lib/format'

import { ArrowRightIcon, LeafIcon } from '../icons/icons'
import { cx } from '../lib/cx'
import { Badge } from '../primitives/Badge'
import { Button } from '../primitives/Button'
import { Photo } from './Photo'

export type ProductCardProps = {
  href: string
  name: string
  pack?: string
  image?: string
  category: string
  /** Active ingredients, species or composition: the line under the name. */
  active?: string
  crops?: string
  dose?: string
  /** The lowest price, when packs differ. */
  price?: number | null
  fromPrice?: boolean
  /** Price per litre or kilogram, already formatted. */
  unitPrice?: string
  /** Marks a price Agrinvest has not confirmed. */
  priceNote?: ReactNode
  inStock: boolean
  locale: Locale
  labels: {
    crops: string
    dose: string
    inStock: string
    outOfStock: string
    details: string
    from: string
    askPrice: string
    payAtHarvest?: string
  }
  payAtHarvestHref?: string
  className?: string
}

/** Shop card: the agronomic facts a farmer checks first (crops, dose), then price and action. */
export function ProductCard(p: ProductCardProps) {
  const { labels, locale } = p
  return (
    <article
      className={cx(
        'group relative flex flex-col overflow-hidden rounded-lg bg-raised shadow-soft ring-1 ring-line transition duration-200 ease-move hover:shadow-raised hover:ring-line-strong',
        p.className,
      )}
    >
      <div className="relative aspect-4/3 border-b border-line bg-surface">
        {p.image ? (
          <Photo
            src={p.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 768px) 45vw, 90vw"
            className="object-contain p-8 mix-blend-multiply transition-transform duration-300 ease-move group-hover:scale-103"
          />
        ) : (
          <LeafIcon
            className="absolute inset-0 m-auto size-16 text-line-strong"
            aria-hidden="true"
          />
        )}
        <div className="absolute inset-x-4 top-4 flex justify-between gap-2">
          <Badge tone="neutral" className="bg-raised ring-1 ring-line">
            {p.category}
          </Badge>
          <Badge tone={p.inStock ? 'accent' : 'warning'} dot>
            {p.inStock ? labels.inStock : labels.outOfStock}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="grid gap-1">
          <h3 className="text-h4 font-semibold">
            <Link href={p.href} className="no-underline after:absolute after:inset-0">
              {p.name}
            </Link>{' '}
            {p.pack && <span className="text-small font-normal text-muted">{p.pack}</span>}
          </h3>
          {p.active && <p className="text-small text-muted">{p.active}</p>}
        </div>

        {(p.crops || p.dose) && (
          <dl className="divide-y divide-line border-y border-line text-small">
            {p.crops && (
              <div className="flex justify-between gap-4 py-2">
                <dt className="text-muted">{labels.crops}</dt>
                <dd className="text-right">{p.crops}</dd>
              </div>
            )}
            {p.dose && (
              <div className="flex justify-between gap-4 py-2">
                <dt className="text-muted">{labels.dose}</dt>
                <dd className="font-semibold tabular-nums">{p.dose}</dd>
              </div>
            )}
          </dl>
        )}

        <div className="mt-auto flex flex-wrap items-baseline gap-x-2">
          {p.price != null ? (
            <>
              {p.fromPrice && <span className="text-small text-muted">{labels.from}</span>}
              <span className="text-h3 font-semibold tabular-nums">
                {formatQuantity(p.price, 'lei', locale)}
              </span>
              {p.priceNote}
            </>
          ) : (
            <span className="font-semibold">{labels.askPrice}</span>
          )}
          {p.unitPrice && <span className="w-full text-caption text-muted">{p.unitPrice}</span>}
        </div>

        <div className="relative z-10 grid gap-3">
          <Button href={p.href} variant="secondary" icon={<ArrowRightIcon />} fullWidth>
            {labels.details}
          </Button>
          {p.payAtHarvestHref && labels.payAtHarvest && (
            <Link
              href={p.payAtHarvestHref}
              className="inline-flex items-center gap-1.5 text-small font-medium text-accent no-underline hover:underline"
            >
              <LeafIcon className="size-4" />
              {labels.payAtHarvest}
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
