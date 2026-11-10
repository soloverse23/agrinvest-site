import { formatNumber } from '@/lib/format'

import { WidgetFrame } from './WidgetFrame'
import type { WidgetBaseProps } from './types'

export type DieselCardProps = WidgetBaseProps & {
  /** Agrinvest's published price in lei/l; null means "on request". */
  own: { price: number; vat: string } | null
  /** Romania's latest weekly average (Oil Bulletin), € per 1,000 l. */
  national: { value: number; unit: string } | null
  labels: { agrinvest: string; national: string; onRequest: string; empty: string }
}

/** Diesel in a card: Agrinvest's price or "on request", and the national weekly average. */
export function DieselCard({ own, national, labels, ...frame }: DieselCardProps) {
  const { locale } = frame
  return (
    <WidgetFrame {...frame} emptyText={labels.empty}>
      <dl className="grid gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <dt className="text-small text-muted">{labels.agrinvest}</dt>
          <dd className="text-right">
            {own ? (
              <span className="font-semibold text-ink tabular-nums">
                {formatNumber(own.price, locale)}{' '}
                <span className="text-caption font-normal text-muted">lei/l, {own.vat}</span>
              </span>
            ) : (
              <span className="text-small font-medium text-muted">{labels.onRequest}</span>
            )}
          </dd>
        </div>
        {national && (
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <dt className="text-small text-muted">{labels.national}</dt>
            <dd className="text-right font-semibold whitespace-nowrap text-ink tabular-nums">
              {formatNumber(national.value, locale, 0)}{' '}
              <span className="text-caption font-normal text-muted">{national.unit}</span>
            </dd>
          </div>
        )}
      </dl>
    </WidgetFrame>
  )
}
