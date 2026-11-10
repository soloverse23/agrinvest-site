import Link from 'next/link'
import type { ReactNode } from 'react'

import { formatDate } from '@/lib/format'

import { ArrowRightIcon } from '../../icons/icons'
import { cx } from '../../lib/cx'
import { Badge } from '../../primitives/Badge'
import { widgetCopy, type WidgetBaseProps } from './types'

/**
 * The card every tool widget sits in: title, body, the source with its date, and a link to
 * the full tool. Stale data gets a plain warning badge; an empty widget shows `emptyText`
 * (or the default line) instead of the body.
 */
export function WidgetFrame({
  locale,
  title,
  state,
  source,
  link,
  className,
  emptyText,
  children,
}: WidgetBaseProps & { emptyText?: ReactNode; children?: ReactNode }) {
  const t = widgetCopy[locale]
  const headingId = `w-${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`
  return (
    <section
      aria-labelledby={headingId}
      className={cx(
        'flex flex-col gap-4 rounded-lg bg-raised p-5 shadow-soft ring-1 ring-line',
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <h3 id={headingId} className="text-body leading-tight font-semibold">
          {title}
        </h3>
        {state === 'stale' && (
          <Badge tone="warning" dot>
            {t.stale}
          </Badge>
        )}
      </header>

      <div className="grow">
        {state === 'empty' ? (
          <p className="text-small text-muted">{emptyText ?? t.empty}</p>
        ) : (
          children
        )}
      </div>

      {(source || link) && (
        <footer className="grid gap-2 border-t border-line pt-3 text-caption text-muted">
          {source && state !== 'empty' && (
            <p>
              {t.source}:{' '}
              {source.url ? (
                <a href={source.url} rel="noopener" className="underline-offset-2">
                  {source.name}
                </a>
              ) : (
                source.name
              )}
              {source.date && (
                <>
                  {' · '}
                  {t.asOf} {formatDate(source.date, locale)}
                </>
              )}
            </p>
          )}
          {link && (
            <Link
              href={link.href}
              className="inline-flex items-center gap-1.5 text-small font-semibold text-accent no-underline hover:underline"
            >
              {link.label}
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          )}
        </footer>
      )}
    </section>
  )
}
