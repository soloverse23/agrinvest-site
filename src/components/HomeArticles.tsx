import { ArticleCard } from '@ds/patterns/Articles'
import { SectionHeading } from '@ds/patterns/Sections'
import type { Locale } from '@/i18n/config'
import { articlesUi } from '@/i18n/articles'
import { guidesHubPath } from '@/i18n/routes'
import { pillarByKey } from '@/lib/articles/pillars'
import { listArticles } from '@/lib/content/articles'

/**
 * The home page's guides slot (Phase 5 left it for Phase 6): the latest Agrinvest news piece
 * as the lead, then the newest farmer guides. Renders nothing until something is published.
 */
export async function HomeArticles({ locale }: { locale: Locale }) {
  const t = articlesUi[locale]
  const [news, guides] = await Promise.all([
    listArticles(locale, 'stiri'),
    listArticles(locale, 'ghid'),
  ])
  const lead = news[0] ?? guides[0]
  if (!lead) return null
  const rest = guides.filter((g) => g.id !== lead.id).slice(0, 3)
  const kicker = (a: typeof lead) =>
    a.section === 'stiri' ? t.news.kicker : pillarByKey(a.pillar)?.name[locale]
  return (
    <section
      aria-labelledby="ghiduri"
      className="mx-auto mt-16 grid w-full max-w-page gap-8 px-4 md:mt-24 md:px-8"
    >
      <SectionHeading
        id="ghiduri"
        kicker={t.home.kicker}
        title={t.home.title}
        action={{ href: guidesHubPath(locale), label: t.home.all }}
      />
      <ArticleCard
        variant="feature"
        locale={locale}
        href={lead.href}
        title={lead.title}
        summary={lead.summary}
        date={lead.date}
        image={lead.image}
        kicker={kicker(lead)}
      />
      {rest.length > 0 && (
        <div className="grid gap-6 md:grid-cols-3">
          {rest.map((a) => (
            <ArticleCard
              key={a.id}
              locale={locale}
              href={a.href}
              title={a.title}
              summary={a.summary}
              date={a.date}
              image={a.image}
              kicker={kicker(a)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
