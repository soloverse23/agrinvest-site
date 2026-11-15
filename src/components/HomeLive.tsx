import { LivePanel, type FeedItem } from '@ds/patterns/LivePanel'
import { storyCards, storyLabels } from '@/components/NewsCards'
import type { Locale } from '@/i18n/config'
import { homeUi } from '@/i18n/home'
import { newsUi } from '@/i18n/news'
import { marketNotePath, newsPath } from '@/i18n/routes'
import { listArticles } from '@/lib/content/articles'
import { listMarketNotes } from '@/lib/content/market'
import { listSocialPosts } from '@/lib/content/social'
import { listRankedStories, newsStatus } from '@/lib/news/load'

/** Agrinvest's own updates shown under the news. */
const OWN = 3

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
 * Agrinvest's own latest updates (its news, guides, market note and LinkedIn posts), newest
 * first. No prices: the hero shows them. Press headlines come in as ranked stories.
 */
async function ownFeed(locale: Locale): Promise<FeedItem[]> {
  const [news, guides, notes, posts] = await Promise.all([
    listArticles(locale, 'stiri'),
    listArticles(locale, 'ghid'),
    listMarketNotes(locale),
    listSocialPosts(2),
  ])
  const items: FeedItem[] = [
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
  ]
  return items
    .filter((i) => i.title && !Number.isNaN(i.date.getTime()))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, OWN)
}

/** Home "Live from the field": the ranked news, then Agrinvest's own updates. */
export async function HomeLive({ locale }: { locale: Locale }) {
  const t = homeUi[locale].live
  const [ranked, status, feed] = await Promise.all([
    listRankedStories(5),
    newsStatus(),
    ownFeed(locale),
  ])
  return (
    <LivePanel
      locale={locale}
      title={t.title}
      updated={status.updated ? new Date(status.updated) : null}
      storySources={status.sources}
      stories={storyCards(ranked, locale)}
      feed={feed}
      links={{ news: { href: newsPath(locale), label: t.allNews } }}
      labels={{
        updated: newsUi[locale].updated,
        own: t.own,
        empty: t.feedEmpty,
        kinds: t.kinds,
        story: storyLabels(locale),
      }}
    />
  )
}
