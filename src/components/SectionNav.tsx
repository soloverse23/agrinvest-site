import Link from 'next/link'

import type { Locale } from '@/i18n/config'
import { sectionFor } from '@/lib/sections'

/**
 * One row of links to the pages of the section the page belongs to (prices and selling,
 * company, news and guides), under the title. Finance has its own row (`FinanceNav`).
 * Server component; renders nothing for a page outside these sections.
 */
export function SectionNav({ locale, url }: { locale: Locale; url: string }) {
  const section = sectionFor(locale, url)
  if (!section) return null
  return (
    <nav aria-label={section.label} className="mx-auto mt-8 max-w-page px-4 md:px-8">
      <ul className="flex gap-2 overflow-x-auto pb-1">
        {section.items.map((i) => {
          const active = i.href === section.current
          return (
            <li key={i.href} className="shrink-0">
              <Link
                href={i.href}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'inline-flex h-10 items-center rounded-full bg-accent px-4 text-small font-semibold text-on-accent no-underline'
                    : 'inline-flex h-10 items-center rounded-full bg-raised px-4 text-small font-medium text-ink no-underline ring-1 ring-line hover:ring-accent'
                }
              >
                {i.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
