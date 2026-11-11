import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { Thing, WithContext } from 'schema-dts'

import { ArrowRightIcon } from '@ds/icons/icons'
import { FuelIcon } from '@ds/icons/server'
import { sectionIcons } from '@ds/patterns/Sections'
import { JsonLd } from '@/components/JsonLd'
import { PageTitle } from '@/components/PageParts'
import { SiteShell } from '@/components/SiteShell'
import type { Locale } from '@/i18n/config'
import {
  dieselPath,
  fertiliserPricesPath,
  financeRoutePath,
  netPricePath,
  pricesPath,
  toolsHubPath,
} from '@/i18n/routes'
import { toolsUi } from '@/i18n/tools'
import { ui } from '@/i18n/ui'
import { getSeoDefaults } from '@/lib/content/globals'
import type { Alternates } from '@/lib/content/pages'
import { breadcrumbs, itemList, webPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'

/**
 * The tools hub (Phase 7b): `/unelte`, `/en/tools`. One card per tool, each a link, so the
 * hub and the tools reach each other. The words are in `toolsUi.hub`.
 */
export const toolsHubAlternates: Alternates = { ro: toolsHubPath('ro'), en: toolsHubPath('en') }

export async function toolsHubMetadata(locale: Locale): Promise<Metadata> {
  const t = toolsUi[locale].hub
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: t.title,
    seoTitle: t.seoTitle,
    siteName: seo.siteName,
    description: t.description,
    image: seo.ogImage,
    alternates: toolsHubAlternates,
  })
}

function tools(locale: Locale): { key: string; href: string; icon: ReactNode }[] {
  const icon = (name: keyof typeof sectionIcons) => {
    const Icon = sectionIcons[name]
    return <Icon className="size-6" />
  }
  return [
    { key: 'prices', href: pricesPath(locale), icon: icon('wheat') },
    { key: 'net', href: netPricePath(locale), icon: icon('scale') },
    { key: 'fert', href: fertiliserPricesPath(locale), icon: icon('leaf') },
    { key: 'diesel', href: dieselPath(locale), icon: <FuelIcon className="size-6" /> },
    { key: 'simulator', href: financeRoutePath('simulator', locale), icon: icon('coins') },
    { key: 'apply', href: financeRoutePath('apply', locale), icon: icon('document') },
  ]
}

export async function ToolsHubPage({ locale }: { locale: Locale }) {
  const t = toolsUi[locale].hub
  const url = toolsHubPath(locale)
  const crumbs = [{ name: t.title, url }]
  const cards = tools(locale).map((c) => ({
    ...c,
    ...t.cards[c.key as keyof typeof t.cards],
  }))
  const page: WithContext<Thing> = {
    ...webPage({ url, name: t.seoTitle, description: t.description, locale }),
    '@type': 'CollectionPage',
  } as WithContext<Thing>
  return (
    <SiteShell locale={locale} alternates={toolsHubAlternates}>
      <JsonLd
        data={[
          page,
          breadcrumbs(locale, ui[locale].home, crumbs),
          itemList(cards.map((c) => ({ name: c.title, url: c.href }))),
        ]}
      />
      <PageTitle locale={locale} title={t.title} summary={t.summary} crumbs={crumbs} />
      <section
        aria-labelledby="unelte"
        className="mx-auto mt-12 grid max-w-page gap-6 px-4 md:mt-16 md:px-8"
      >
        <h2 id="unelte" className="sr-only">
          {t.list}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <li key={c.key}>
              <Link
                href={c.href}
                className="group grid h-full content-start gap-3 rounded-xl bg-raised p-6 text-ink no-underline shadow-soft ring-1 ring-line transition-shadow duration-150 hover:shadow-floating hover:ring-accent"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                  {c.icon}
                </span>
                <span className="text-h4 font-semibold">{c.title}</span>
                <span className="text-small text-muted">{c.text}</span>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-small font-semibold text-accent">
                  <ArrowRightIcon className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </SiteShell>
  )
}
