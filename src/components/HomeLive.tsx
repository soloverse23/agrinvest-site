import { LivePanel, type FeedItem, type LiveChart } from '@ds/patterns/LivePanel'
import type { Locale } from '@/i18n/config'
import { homeUi } from '@/i18n/home'
import { cropPricePath, dieselPath, marketNotePath, newsPath, pricesPath } from '@/i18n/routes'
import { toolsUi } from '@/i18n/tools'
import { listArticles } from '@/lib/content/articles'
import { listMarketNotes } from '@/lib/content/market'
import { listSocialPosts } from '@/lib/content/social'
import { nationalDiesel } from '@/lib/diesel/load'
import { formatSigned } from '@/lib/format'
import { listHeadlines } from '@/lib/news/load'
import { agrinvestRail, agrinvestSeries } from '@/lib/prices/overview'

const FEED = 6

/** A LinkedIn post's first line, cut at a word near 110 characters. */
function postHeadline(text: string) {
  const line =
    text
      .split('\n')
      .find((l) => l.trim())
      ?.trim() ?? ''
  if (line.length <= 110) return line
  return `${line.slice(0, line.lastIndexOf(' ', 110)).replace(/[,.;:–-]+$/, '')}…`
}

/**
 * The latest updates from every source, newest first. Each source is capped, so a busy news
 * feed cannot push out Agrinvest's own updates.
 */
async function homeFeed(locale: Locale, rail: Awaited<ReturnType<typeof agrinvestRail>>) {
  const t = homeUi[locale].live
  const [headlines, news, guides, notes, posts] = await Promise.all([
    listHeadlines(3),
    listArticles(locale, 'stiri'),
    listArticles(locale, 'ghid'),
    listMarketNotes(locale),
    listSocialPosts(2),
  ])
  const items: FeedItem[] = [
    ...headlines.map((h) => ({
      id: `news-${h.id}`,
      kind: 'news' as const,
      title: h.title,
      href: h.url,
      external: true,
      source: h.source,
      date: new Date(h.publishedAt),
    })),
    ...news.slice(0, 2).map((a) => ({
      id: `agrinvest-${a.id}`,
      kind: 'agrinvest' as const,
      title: a.title,
      href: a.href,
      date: new Date(a.date),
    })),
    ...guides.slice(0, 2).map((a) => ({
      id: `guide-${a.id}`,
      kind: 'guide' as const,
      title: a.title,
      href: a.href,
      date: new Date(a.date),
    })),
    ...notes.slice(0, 1).map((n) => ({
      id: `note-${n.id}`,
      kind: 'note' as const,
      title: n.title,
      href: marketNotePath(n.slug, locale),
      date: new Date(n.date),
    })),
    ...posts.map((p) => ({
      id: `social-${p.id}`,
      kind: 'social' as const,
      title: postHeadline(p.text),
      href: p.url,
      external: true,
      date: new Date(p.date),
    })),
    ...(rail?.rows ?? [])
      .filter((r) => r.change !== 0)
      .slice(0, 2)
      .map((r) => ({
        id: `price-${r.crop}`,
        kind: 'price' as const,
        title: t.move(r.name, formatSigned(r.change, locale)),
        href: cropPricePath(r.slug, locale),
        date: rail!.date,
        change: r.change,
      })),
  ]
  return items
    .filter((i) => i.title && !Number.isNaN(i.date.getTime()))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, FEED)
}

/** Home "Live from the field": Agrinvest's price chart per crop, today's prices and the feed. */
export async function HomeLive({ locale }: { locale: Locale }) {
  const t = homeUi[locale].live
  const [series, rail, diesel] = await Promise.all([
    agrinvestSeries(locale),
    agrinvestRail(locale),
    nationalDiesel(),
  ])
  const feed = await homeFeed(locale, rail)

  const charts: LiveChart[] = series.map((s) => ({
    key: s.crop,
    name: s.name,
    title: s.source === 'agrinvest' ? t.chart.agrinvest(s.name) : t.chart.market(s.name),
    unit: s.unit,
    points: s.points,
    link: { href: cropPricePath(s.slug, locale), label: t.chart.link(s.name) },
  }))
  const last = diesel[diesel.length - 1]
  if (diesel.length > 1 && last)
    charts.push({
      key: 'diesel',
      name: toolsUi[locale].today.diesel,
      title: t.chart.diesel,
      unit: `€/${last.unit}`,
      points: diesel.map((p) => ({ date: p.date, value: p.value })),
      link: { href: dieselPath(locale), label: t.chart.dieselLink },
    })

  const times = [
    rail?.date.getTime(),
    ...charts.map((c) => c.points[c.points.length - 1]?.date.getTime()),
    feed[0]?.date.getTime(),
  ].filter((n): n is number => typeof n === 'number' && !Number.isNaN(n))

  return (
    <LivePanel
      locale={locale}
      title={t.title}
      updated={times.length ? new Date(Math.max(...times)) : null}
      charts={charts}
      feed={feed}
      links={{
        news: { href: newsPath(locale), label: t.allNews },
        prices: { href: pricesPath(locale), label: t.allPrices },
      }}
      labels={{
        updated: t.updated,
        crops: t.crops,
        rotate: t.rotate,
        feed: t.feed,
        feedEmpty: t.feedEmpty,
        kinds: t.kinds,
        chart: t.chart,
      }}
    />
  )
}
