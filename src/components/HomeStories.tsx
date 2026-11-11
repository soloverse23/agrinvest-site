import { StoryCarousel } from '@ds/patterns/StoryCarousel'
import type { Locale } from '@/i18n/config'
import { homeUi } from '@/i18n/home'
import { guidesHubPath } from '@/i18n/routes'
import { pillarByKey } from '@/lib/articles/pillars'
import { listArticles, type ArticleCardData } from '@/lib/content/articles'

const COUNT = 8

/**
 * Home "Ghiduri și noutăți" (under the shop): the newest guides and Agrinvest news, mixed by
 * date. Pieces with a cover go first, so the row opens on photos.
 */
export async function HomeStories({ locale }: { locale: Locale }) {
  const t = homeUi[locale].stories
  const [guides, news] = await Promise.all([
    listArticles(locale, 'ghid'),
    listArticles(locale, 'stiri'),
  ])
  const byDate = (a: ArticleCardData, b: ArticleCardData) => b.date.localeCompare(a.date)
  const all = [...guides, ...news].sort(byDate)
  const picked = [...all.filter((a) => a.image), ...all.filter((a) => !a.image)].slice(0, COUNT)
  if (!picked.length) return null

  return (
    <StoryCarousel
      locale={locale}
      kicker={t.kicker}
      title={t.title}
      all={{ href: guidesHubPath(locale), label: t.all }}
      labels={{ read: t.read, prev: t.prev, next: t.next }}
      stories={picked.map((a) => ({
        href: a.href,
        title: a.title,
        summary: a.summary,
        kicker: a.section === 'stiri' ? t.news : (pillarByKey(a.pillar)?.name[locale] ?? t.kicker),
        date: a.date,
        image: a.image,
      }))}
    />
  )
}
