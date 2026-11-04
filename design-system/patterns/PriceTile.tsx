import Link from 'next/link'

import type { Locale } from '@/i18n/config'
import { formatNumber } from '@/lib/format'

import type { CropKey } from '../fixtures/sample'
import { cx } from '../lib/cx'
import { Delta } from '../primitives/Delta'
import { CropBadge, Sparkline } from './parts'

export type PriceTileProps = {
  crop: CropKey
  name: string
  /** Where the price applies, e.g. the base name. */
  place: string
  price: number
  unit: string
  change: number
  trend: number[]
  trendLabel: string
  locale: Locale
  href?: string
  className?: string
}

/** One crop's buying price: icon, price, weekly change and a 7-week trend. */
export function PriceTile({
  crop,
  name,
  place,
  price,
  unit,
  change,
  trend,
  trendLabel,
  locale,
  href,
  className,
}: PriceTileProps) {
  const trendColour = change < 0 ? 'text-down' : change > 0 ? 'text-up' : 'text-flat'
  return (
    <article
      className={cx(
        'relative grid gap-4 rounded-lg bg-raised p-5 shadow-soft ring-1 ring-line transition duration-150 ease-move',
        href && 'hover:shadow-raised hover:ring-line-strong',
        className,
      )}
    >
      <header className="flex items-center gap-3">
        <CropBadge crop={crop} />
        <div className="min-w-0">
          <h3 className="text-body leading-tight font-semibold">
            {href ? (
              <Link
                href={href}
                className="no-underline after:absolute after:inset-0 after:rounded-lg"
              >
                {name}
              </Link>
            ) : (
              name
            )}
          </h3>
          <p className="text-caption text-muted">{place}</p>
        </div>
      </header>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <p className="flex items-baseline gap-1.5">
          <span className="text-figure font-semibold tabular-nums">
            {formatNumber(price, locale)}
          </span>
          <span className="text-small text-muted">{unit}</span>
        </p>
        <Delta value={change} locale={locale} size="sm" />
      </div>
      <Sparkline values={trend} label={`${name}: ${trendLabel}`} className={trendColour} />
    </article>
  )
}
