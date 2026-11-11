import Link from 'next/link'

import type { Locale } from '@/i18n/config'
import { financeUi } from '@/i18n/finance'
import { financePath, financeRoutePath } from '@/i18n/routes'

type Current = 'credits' | 'simulator' | 'apply' | 'guides' | 'about' | 'faq'

/**
 * One row of links to the pages of the finance section, under the page title. It is the same
 * on every finance page, so a visitor always sees where else to go. Server component.
 */
export function FinanceNav({ locale, current }: { locale: Locale; current?: Current }) {
  const t = financeUi[locale].nav
  const items: { id: Current; label: string; href: string }[] = [
    { id: 'credits', label: t.credits, href: financePath(locale) },
    { id: 'simulator', label: t.simulator, href: financeRoutePath('simulator', locale) },
    { id: 'apply', label: t.apply, href: financeRoutePath('apply', locale) },
    { id: 'guides', label: t.guides, href: financeRoutePath('guides', locale) },
    { id: 'about', label: t.about, href: financeRoutePath('about', locale) },
    { id: 'faq', label: t.faq, href: financeRoutePath('faq', locale) },
  ]
  return (
    <nav aria-label={t.label} className="mx-auto mt-8 max-w-page px-4 md:px-8">
      <ul className="flex gap-2 overflow-x-auto pb-1">
        {items.map((i) => (
          <li key={i.id} className="shrink-0">
            <Link
              href={i.href}
              aria-current={i.id === current ? 'page' : undefined}
              className={
                i.id === current
                  ? 'inline-flex h-10 items-center rounded-full bg-accent px-4 text-small font-semibold text-on-accent no-underline'
                  : 'inline-flex h-10 items-center rounded-full bg-raised px-4 text-small font-medium text-ink no-underline ring-1 ring-line hover:ring-accent'
              }
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
