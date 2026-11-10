import { SectionHeading } from '@ds/patterns/Sections'
import { DieselCard } from '@ds/patterns/widgets/DieselCard'
import { GrainPrices } from '@ds/patterns/widgets/GrainPrices'
import { NewsList } from '@ds/patterns/widgets/NewsList'
import { grainPricesProps } from '@/components/templates/PricePage'
import type { Locale } from '@/i18n/config'
import { dieselPath, newsPath } from '@/i18n/routes'
import { toolsUi } from '@/i18n/tools'
import { getDieselPrice, nationalDiesel } from '@/lib/diesel/load'
import { listHeadlines } from '@/lib/news/load'
import { marketSources } from '@/lib/sources'

/** The diesel widget's props; also used by the `toolWidget` block. */
export async function dieselCardProps(locale: Locale, title?: string) {
  const t = toolsUi[locale].today
  const [own, series] = await Promise.all([getDieselPrice(locale), nationalDiesel()])
  const last = series[series.length - 1]
  const source = marketSources['eu-oil-bulletin']
  return {
    locale,
    title: title ?? t.diesel,
    state: 'ready' as const,
    own: own ? { price: own.price, vat: toolsUi[locale].diesel.vat[own.vat] } : null,
    national: last ? { value: last.value, unit: `€/${last.unit}` } : null,
    labels: {
      agrinvest: t.agrinvest,
      national: t.national,
      onRequest: t.onRequest,
      empty: t.dieselEmpty,
    },
    source: last ? { name: source.name, url: source.url, date: last.date } : undefined,
    link: { href: `${dieselPath(locale)}#cerere`, label: t.dieselLink },
  }
}

/** The news widget's props; also used by the `toolWidget` block. */
export async function newsListProps(locale: Locale, title?: string, count = 4) {
  const t = toolsUi[locale].today
  const items = await listHeadlines(count)
  return {
    locale,
    title: title ?? t.news,
    state: (items.length ? 'ready' : 'empty') as 'ready' | 'empty',
    items: items.map((n) => ({
      id: n.id,
      title: n.title,
      url: n.url,
      source: n.source,
      date: new Date(n.publishedAt),
    })),
    emptyText: t.newsEmpty,
    link: { href: newsPath(locale), label: t.newsLink },
  }
}

/** Home "Today" row: grain prices, diesel and the latest headlines. Server-rendered, no script. */
export async function TodayStrip({ locale }: { locale: Locale }) {
  const t = toolsUi[locale].today
  const [{ props: grain }, diesel, news] = await Promise.all([
    grainPricesProps(locale),
    dieselCardProps(locale),
    newsListProps(locale),
  ])
  return (
    <section
      aria-labelledby="azi"
      className="mx-auto mt-12 w-full max-w-page px-4 md:mt-16 md:px-8"
    >
      <SectionHeading id="azi" kicker={t.kicker} title={t.title} className="mb-8" />
      <div className="grid gap-6 lg:grid-cols-3">
        <GrainPrices {...grain} />
        <DieselCard {...diesel} />
        <NewsList {...news} />
      </div>
    </section>
  )
}
