import { formatShortDate } from '@/lib/format'

import { WidgetFrame } from './WidgetFrame'
import type { WidgetBaseProps } from './types'

export type NewsListItem = {
  id: number | string
  title: string
  url: string
  source: string
  date: Date
}

export type NewsListProps = WidgetBaseProps & { items: NewsListItem[]; emptyText: string }

/** Three to five headlines, each with its source and date, linking to the original. */
export function NewsList({ items, emptyText, ...frame }: NewsListProps) {
  const { locale } = frame
  return (
    <WidgetFrame {...frame} emptyText={emptyText}>
      <ul className="grid divide-y divide-line">
        {items.map((n) => (
          <li key={n.id} className="grid gap-1 py-3 first:pt-0 last:pb-0">
            <a
              href={n.url}
              rel="noopener"
              className="text-small leading-snug font-semibold text-ink"
            >
              {n.title}
            </a>
            <span className="text-caption text-muted">
              {n.source} · {formatShortDate(n.date, locale)}
            </span>
          </li>
        ))}
      </ul>
    </WidgetFrame>
  )
}
