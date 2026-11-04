import Image from 'next/image'
import Link from 'next/link'

import type { Locale } from '@/i18n/config'
import { formatNumber, formatQuantity } from '@/lib/format'

import { CartIcon, LeafIcon } from '../icons/icons'
import { cx } from '../lib/cx'
import { Badge } from '../primitives/Badge'
import { Button } from '../primitives/Button'

export type ProductCardProps = {
  href: string
  name: string
  pack: string
  image: string
  category: string
  active: string
  crops: string
  dose: string
  price: number
  regularPrice?: number
  amount: number
  amountUnit: string
  inStock: boolean
  locale: Locale
  labels: {
    crops: string
    dose: string
    inStock: string
    outOfStock: string
    add: string
    quote: string
    vat: string
    payAtHarvest: string
  }
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
        <Image
          src={p.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 768px) 45vw, 90vw"
          className="object-contain p-8 mix-blend-multiply transition-transform duration-300 ease-move group-hover:scale-103"
        />
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
            <span className="text-small font-normal text-muted">{p.pack}</span>
          </h3>
          <p className="text-small text-muted">{p.active}</p>
        </div>

        <dl className="divide-y divide-line border-y border-line text-small">
          <div className="flex justify-between gap-4 py-2">
            <dt className="text-muted">{labels.crops}</dt>
            <dd className="text-right">{p.crops}</dd>
          </div>
          <div className="flex justify-between gap-4 py-2">
            <dt className="text-muted">{labels.dose}</dt>
            <dd className="font-semibold tabular-nums">{p.dose}</dd>
          </div>
        </dl>

        <div className="mt-auto flex flex-wrap items-baseline gap-x-2">
          <span className="text-h3 font-semibold tabular-nums">
            {formatQuantity(p.price, 'lei', locale)}
          </span>
          {p.regularPrice && (
            <s className="text-small text-subtle tabular-nums">
              {formatQuantity(p.regularPrice, 'lei', locale)}
            </s>
          )}
          <span className="w-full text-caption text-muted">
            {labels.vat} · {formatNumber(p.price / p.amount, locale)} lei/{p.amountUnit}
          </span>
        </div>

        <div className="relative z-10 grid gap-3">
          {p.inStock ? (
            <Button leadingIcon={<CartIcon />} fullWidth>
              {labels.add}
            </Button>
          ) : (
            <Button variant="secondary" fullWidth>
              {labels.quote}
            </Button>
          )}
          <Link
            href="/finantare/inputuri-plata-la-recolta"
            className="inline-flex items-center gap-1.5 text-small font-medium text-accent no-underline hover:underline"
          >
            <LeafIcon className="size-4" />
            {labels.payAtHarvest}
          </Link>
        </div>
      </div>
    </article>
  )
}
