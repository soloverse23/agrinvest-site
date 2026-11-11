import Link from 'next/link'

import { ArrowRightIcon } from '@ds/icons/icons'
import { SectionHeading } from '@ds/patterns/Sections'
import type { Locale } from '@/i18n/config'
import { innerUi } from '@/i18n/inner'
import {
  dieselPath,
  fertiliserPricesPath,
  financeProductPath,
  financeRoutePath,
  marketPath,
  netPricePath,
  newsPath,
  pricesPath,
  guidesHubPath,
} from '@/i18n/routes'
import { fixedUrl } from '@/i18n/ui'

type Step = { href: string; label: string; body?: string }

/** Two or three next steps that make sense after the current page, not the whole cluster. */
function stepsFor(locale: Locale, current: string): Step[] {
  const t = innerUi[locale]
  const sell: Step = { href: fixedUrl('grain', locale), label: t.sell, body: t.sellBody }
  const prices: Step = { href: pricesPath(locale), label: t.prices }
  const calc: Step = { href: netPricePath(locale), label: t.calc, body: t.calcBody }
  const sim: Step = {
    href: financeRoutePath('simulator', locale),
    label: t.simulator,
    body: t.simulatorBody,
  }
  const stock: Step = {
    href: financeProductPath(locale === 'ro' ? 'finantare-stocuri' : 'stock-financing', locale),
    label: t.stock,
    body: t.stockBody,
  }
  const market: Step = { href: marketPath(locale), label: t.market }
  const news: Step = { href: newsPath(locale), label: t.news }
  const guides: Step = { href: guidesHubPath(locale), label: t.guides }
  const fert: Step = { href: fertiliserPricesPath(locale), label: t.fert }
  const diesel: Step = { href: dieselPath(locale), label: t.diesel }

  if (current === pricesPath(locale)) return [sell, calc, market]
  if (current === netPricePath(locale)) return [prices, sell, sim]
  if (current === fertiliserPricesPath(locale)) return [prices, diesel, sim]
  if (current === dieselPath(locale)) return [prices, fert, news]
  if (current === marketPath(locale)) return [prices, calc, news]
  if (current === newsPath(locale)) return [market, prices, guides]
  if (current.startsWith(`${pricesPath(locale)}/`)) return [sell, calc, stock]
  return [prices, calc, sim]
}

/** What to do next, for the end of a price or tool page. */
export function ToolLinks({ locale, current }: { locale: Locale; current: string }) {
  const t = innerUi[locale]
  const steps = stepsFor(locale, current).filter((s) => s.href !== current)
  return (
    <nav aria-label={t.next} className="mx-auto mt-16 w-full max-w-page px-4 md:mt-24 md:px-8">
      <SectionHeading kicker={t.nextKicker} title={t.next} className="mb-6" />
      <ul className="grid gap-3 md:grid-cols-3">
        {steps.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="flex h-full items-center justify-between gap-3 rounded-lg bg-raised p-5 text-ink no-underline ring-1 ring-line hover:ring-accent"
            >
              <span className="grid gap-1">
                <span className="font-semibold">{s.label}</span>
                {s.body && <span className="text-small text-muted">{s.body}</span>}
              </span>
              <span className="size-5 shrink-0 text-accent" aria-hidden="true">
                <ArrowRightIcon />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
