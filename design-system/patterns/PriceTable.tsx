import type { Locale } from '@/i18n/config'
import { formatDate, formatNumber } from '@/lib/format'

import type { CropKey } from '../fixtures/sample'
import { cx } from '../lib/cx'
import { Delta } from '../primitives/Delta'
import { CropBadge } from './parts'

export type PriceRow = { crop: CropKey; name: string; prices: number[]; change: number }

export type PriceTableProps = {
  title: string
  unit: string
  places: readonly string[]
  rows: PriceRow[]
  updated: Date
  labels: { crop: string; change: string; updated: string; note?: string }
  locale: Locale
  className?: string
}

/**
 * Buying prices per crop and place. A table from 768 px; below that, one card per crop,
 * so nothing scrolls sideways on a phone.
 */
export function PriceTable({
  title,
  unit,
  places,
  rows,
  updated,
  labels,
  locale,
  className,
}: PriceTableProps) {
  const updatedText = `${labels.updated} ${formatDate(updated, locale)}`
  return (
    <section className={cx('grid gap-5', className)} aria-label={title}>
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h3 className="text-h3 font-semibold">{title}</h3>
          <p className="text-small text-muted">{unit}</p>
        </div>
        <p className="text-small text-muted">{updatedText}</p>
      </header>

      {/* Phone: one card per crop */}
      <ul className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <li key={row.crop} className="rounded-lg bg-raised p-4 shadow-soft ring-1 ring-line">
            <div className="mb-3 flex items-center gap-3">
              <CropBadge crop={row.crop} size="sm" />
              <span className="font-semibold">{row.name}</span>
              <Delta value={row.change} locale={locale} size="sm" className="ml-auto" />
            </div>
            <dl className="grid grid-cols-3 gap-2">
              {places.map((place, i) => (
                <div key={place} className="rounded-sm bg-surface px-3 py-2">
                  <dt className="truncate text-caption text-muted">{place}</dt>
                  <dd className="font-semibold tabular-nums">
                    {formatNumber(row.prices[i], locale)}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      {/* Tablet and up: a table */}
      <div className="hidden overflow-hidden rounded-lg bg-raised shadow-soft ring-1 ring-line md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            {title}, {unit}. {updatedText}
          </caption>
          <thead>
            <tr className="bg-surface text-small text-muted">
              <th scope="col" className="py-3 pr-4 pl-6 font-medium">
                {labels.crop}
              </th>
              {places.map((place) => (
                <th key={place} scope="col" className="px-4 py-3 text-right font-medium">
                  {place}
                </th>
              ))}
              <th scope="col" className="py-3 pr-6 pl-4 text-right font-medium">
                {labels.change}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.crop}
                className="border-t border-line transition-colors duration-150 hover:bg-paper"
              >
                <th scope="row" className="py-4 pr-4 pl-6 font-semibold">
                  <span className="flex items-center gap-3">
                    <CropBadge crop={row.crop} size="sm" />
                    {row.name}
                  </span>
                </th>
                {row.prices.map((price, i) => (
                  <td
                    key={places[i]}
                    className={cx(
                      'px-4 py-4 text-right tabular-nums',
                      i === 0 ? 'text-lead font-semibold' : 'text-body',
                    )}
                  >
                    {formatNumber(price, locale)}
                  </td>
                ))}
                <td className="py-4 pr-6 pl-4 text-right">
                  <Delta value={row.change} locale={locale} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {labels.note && <p className="text-caption text-muted">{labels.note}</p>}
    </section>
  )
}
