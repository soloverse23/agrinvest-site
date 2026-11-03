import Link from 'next/link'
import type { ReactNode } from 'react'

import { localePath, type Locale } from '@/i18n/config'
import { ui } from '@/i18n/ui'
import { formatDate } from '@/lib/format'

/** Visible breadcrumb trail; the last item is the current page. Matches the BreadcrumbList. */
export function Breadcrumbs({
  locale,
  items,
}: {
  locale: Locale
  items: { name: string; url: string }[]
}) {
  if (!items.length) return null
  const trail = [{ name: ui[locale].home, url: localePath('/', locale) }, ...items]
  return (
    <nav aria-label={ui[locale].breadcrumb} className="text-small text-muted">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {trail.map((item, i) => (
          <li key={item.url} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {i === trail.length - 1 ? (
              <span aria-current="page" className="text-ink">
                {item.name}
              </span>
            ) : (
              <Link href={item.url}>{item.name}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** Page title (the only H1), the answer summary and the last update date. */
export function PageHeader({
  locale,
  title,
  summary,
  updatedAt,
  crumbs,
  children,
}: {
  locale: Locale
  title: ReactNode
  summary?: string | null
  updatedAt?: string
  crumbs: { name: string; url: string }[]
  children?: ReactNode
}) {
  return (
    <header className="mx-auto grid max-w-page gap-5 px-4 pt-10 pb-12 md:px-8 md:pt-14">
      <Breadcrumbs locale={locale} items={crumbs} />
      <h1 className="max-w-4xl text-h1 font-semibold text-balance">{title}</h1>
      {summary && <p className="max-w-3xl text-lead text-muted">{summary}</p>}
      {children}
      {updatedAt && <Updated locale={locale} date={updatedAt} />}
    </header>
  )
}

export function Updated({ locale, date }: { locale: Locale; date: string }) {
  return (
    <p className="text-caption text-subtle">
      {ui[locale].updated}{' '}
      <time dateTime={date.slice(0, 10)}>{formatDate(new Date(date), locale)}</time>
    </p>
  )
}

/** FAQ as native disclosure widgets (the Accordion pattern replaces this in 2.2). */
export function Faq({
  locale,
  items,
}: {
  locale: Locale
  items?: { id?: string | null; question: string; answer: string }[] | null
}) {
  if (!items?.length) return null
  return (
    <section className="mx-auto mt-16 grid max-w-text gap-4 px-4 md:mt-24">
      <h2 className="text-h2 font-semibold">{ui[locale].faq}</h2>
      <div className="divide-y divide-line border-y border-line">
        {items.map((q) => (
          <details key={q.id ?? q.question} className="group py-4">
            <summary className="cursor-pointer text-h4 font-semibold">{q.question}</summary>
            <p className="mt-3 text-muted">{q.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
