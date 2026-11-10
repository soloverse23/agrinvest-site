import Link from 'next/link'

import { formatNumber } from '@/lib/format'

import type { CropKey } from '../../fixtures/sample'
import { Delta } from '../../primitives/Delta'
import { CropBadge } from '../parts'
import { WidgetFrame } from './WidgetFrame'
import type { WidgetBaseProps } from './types'

export type GrainPriceItem = {
  crop: CropKey
  name: string
  href: string
  /** Agrinvest's published range in lei/t; null means "price on request". */
  agrinvest: { min: number; max: number } | null
  /** Latest EU weekly price for Romania, if the series has one. */
  market: { value: number; unit: string; change: number } | null
}

export type GrainPricesProps = WidgetBaseProps & {
  items: GrainPriceItem[]
  labels: { agrinvest: string; market: string; onRequest: string; empty: string }
}

/**
 * Grain prices in a card: per crop, Agrinvest's published price (or "on request") and the
 * latest EU price for Romania with its weekly change. No script.
 */
export function GrainPrices({ items, labels, ...frame }: GrainPricesProps) {
  const { locale } = frame
  const lei = (v: number) => formatNumber(v, locale, 0)
  return (
    <WidgetFrame {...frame} emptyText={labels.empty}>
      <ul className="grid divide-y divide-line">
        {items.map((item) => (
          <li key={item.crop} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <CropBadge crop={item.crop} size="sm" />
            <div className="grid min-w-0 grow gap-0.5">
              <Link href={item.href} className="font-semibold text-ink">
                {item.name}
              </Link>
              {item.market && (
                <span className="flex flex-wrap items-center gap-x-2 text-caption text-muted">
                  {labels.market}:{' '}
                  <span className="tabular-nums">
                    {formatNumber(item.market.value, locale, 0)} {item.market.unit}
                  </span>
                  <Delta value={item.market.change} locale={locale} size="sm" />
                </span>
              )}
            </div>
            <div className="grid shrink-0 text-right">
              <span className="text-caption text-muted">{labels.agrinvest}</span>
              {item.agrinvest ? (
                <span className="font-semibold text-ink tabular-nums">
                  {item.agrinvest.min === item.agrinvest.max
                    ? lei(item.agrinvest.min)
                    : `${lei(item.agrinvest.min)}–${lei(item.agrinvest.max)}`}{' '}
                  <span className="text-caption font-normal text-muted">lei/t</span>
                </span>
              ) : (
                <span className="text-small font-medium text-muted">{labels.onRequest}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </WidgetFrame>
  )
}
