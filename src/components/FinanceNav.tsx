import Link from 'next/link'

import { ConsultantButton } from '@ds/patterns/FinanceGuide'
import type { Locale } from '@/i18n/config'
import { financeGuideUi } from '@/i18n/finance-guide'
import { financePath, financeRoutePath } from '@/i18n/routes'

export type FinanceSection = 'credits' | 'questions' | 'simulator' | 'library'

/**
 * The finance section's own links (Phase 7g): four places, and the one action. The detailed
 * application is not a place here; it is what the consultant action falls back to.
 */
export function FinanceNav({
  locale,
  current,
  need,
  action = true,
}: {
  locale: Locale
  current?: FinanceSection
  /** The need the page is about, so the consultant drawer opens on it. */
  need?: string
  /** False on the application page, which is the request form itself (no drawer there). */
  action?: boolean
}) {
  const t = financeGuideUi[locale]
  const items: { id: FinanceSection; label: string; href: string }[] = [
    { id: 'credits', label: t.nav.credits, href: financePath(locale) },
    { id: 'questions', label: t.nav.questions, href: financeRoutePath('questions', locale) },
    { id: 'simulator', label: t.nav.simulator, href: financeRoutePath('simulator', locale) },
    { id: 'library', label: t.nav.library, href: financeRoutePath('guides', locale) },
  ]
  return (
    <nav aria-label={t.nav.label} className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-4 md:px-8">
        <ul className="-mx-1 flex overflow-x-auto [scrollbar-width:none]">
          {items.map((i) => (
            <li key={i.id} className="shrink-0">
              <Link
                href={i.href}
                aria-current={i.id === current ? 'page' : undefined}
                className="relative inline-flex h-14 items-center px-3 text-small font-semibold text-muted no-underline hover:text-ink aria-[current=page]:text-forest aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-3 aria-[current=page]:after:bottom-0 aria-[current=page]:after:h-0.5 aria-[current=page]:after:rounded-full aria-[current=page]:after:bg-accent"
              >
                {i.label}
              </Link>
            </li>
          ))}
        </ul>
        {/* Phones have the bottom action bar instead (`FinanceConsultant`). */}
        {action && (
          <div className="hidden shrink-0 md:block">
            <ConsultantButton href={financeRoutePath('apply', locale)} need={need} size="sm">
              {t.consultant}
            </ConsultantButton>
          </div>
        )}
      </div>
    </nav>
  )
}
