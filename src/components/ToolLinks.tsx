import Link from 'next/link'

import { SectionHeading } from '@ds/patterns/Sections'
import type { Locale } from '@/i18n/config'
import { pricesUi } from '@/i18n/prices'
import {
  dieselPath,
  fertiliserPricesPath,
  marketPath,
  netPricePath,
  newsPath,
  pricesPath,
} from '@/i18n/routes'
import { toolsUi } from '@/i18n/tools'

const toolLinks = (locale: Locale) => {
  const p = pricesUi[locale]
  const t = toolsUi[locale]
  return [
    { href: pricesPath(locale), label: p.hub.title },
    { href: netPricePath(locale), label: p.calc.title },
    { href: fertiliserPricesPath(locale), label: t.fert.title },
    { href: dieselPath(locale), label: t.diesel.title },
    { href: newsPath(locale), label: t.news.title },
    { href: marketPath(locale), label: p.market.title },
  ]
}

/** Links to the other tools, so every tool page reaches the rest of the cluster. */
export function ToolLinks({ locale, current }: { locale: Locale; current: string }) {
  return (
    <nav
      aria-label={pricesUi[locale].section}
      className="mx-auto mt-16 w-full max-w-page px-4 md:mt-24 md:px-8"
    >
      <SectionHeading
        kicker={pricesUi[locale].section}
        title={pricesUi[locale].hub.tools}
        className="mb-6"
      />
      <ul className="flex flex-wrap gap-3">
        {toolLinks(locale)
          .filter((l) => l.href !== current)
          .map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="inline-flex rounded-full bg-raised px-4 py-2 text-small font-semibold text-ink no-underline ring-1 ring-line hover:ring-accent"
              >
                {l.label}
              </Link>
            </li>
          ))}
      </ul>
    </nav>
  )
}
