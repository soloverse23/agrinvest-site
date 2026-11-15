import type { Metadata } from 'next'
import Link from 'next/link'

import { ArticleCard } from '@ds/patterns/Articles'
import { SubscribeFormLazy } from '@ds/patterns/Lazy'
import { ImportantNow, NewsList } from '@ds/patterns/NewsStories'
import { SectionHeading } from '@ds/patterns/Sections'
import { JsonLd } from '@/components/JsonLd'
import { storyCard, storyLabels } from '@/components/NewsCards'
import { PageTitle } from '@/components/PageParts'
import { SiteShell } from '@/components/SiteShell'
import { ToolLinks } from '@/components/ToolLinks'
import type { Locale } from '@/i18n/config'
import { newsUi, topicLabels } from '@/i18n/news'
import { pricesUi } from '@/i18n/prices'
import { marketNotePath, marketPath, newsDayPath, newsPath } from '@/i18n/routes'
import { articlesUi } from '@/i18n/articles'
import { toolsUi } from '@/i18n/tools'
import { fixedUrl, ui } from '@/i18n/ui'
import { listArticles } from '@/lib/content/articles'
import { getSeoDefaults } from '@/lib/content/globals'
import { listMarketNotes } from '@/lib/content/market'
import type { Alternates } from '@/lib/content/pages'
import { formatDate, formatWhen } from '@/lib/format'
import type { NewsTopic } from '@/lib/news/lexicon'
import {
  editionsIndexable,
  getEdition,
  listEditions,
  listRankedStories,
  newsStatus,
} from '@/lib/news/load'
import { breadcrumbs, itemList, webPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'
import { subscribe } from '@/lib/subscriptions/actions'

/* ------------------------------------------------------------------ shared */

export const newsAlternates: Alternates = { ro: newsPath('ro'), en: newsPath('en') }

async function meta(
  locale: Locale,
  t: { title: string; seoTitle: string; description: string },
  alternates: Alternates,
  noindex: boolean,
): Promise<Metadata> {
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: t.title,
    seoTitle: t.seoTitle,
    siteName: seo.siteName,
    description: t.description,
    image: seo.ogImage,
    alternates,
    noindex,
  })
}

/* ------------------------------------------------------------------ /stiri */

export const newsMetadata = async (locale: Locale) => {
  const [stories, own] = await Promise.all([listRankedStories(1), listArticles(locale, 'stiri')])
  return meta(locale, toolsUi[locale].news, newsAlternates, !stories.length && !own.length)
}

const IMPORTANT = 5
const PER_TOPIC = 6

/**
 * `/stiri`: "Important acum" (the five highest-ranked stories of the last 48 hours, each with
 * its sources), Agrinvest's own news, then the rest of the 48 hours by topic beside the market
 * notes, the archive by day and the newsletter. Ranked every hour by the news job
 * (decision 0011); the order is computed, never edited.
 */
export async function NewsPage({ locale }: { locale: Locale }) {
  const t = toolsUi[locale].news
  const n = newsUi[locale]
  const a = articlesUi[locale].news
  const p = pricesUi[locale]
  const url = newsPath(locale)
  const [stories, status, editions, notes, own] = await Promise.all([
    listRankedStories(60),
    newsStatus(),
    listEditions(30),
    listMarketNotes(locale),
    listArticles(locale, 'stiri'),
  ])
  const labels = storyLabels(locale)
  const cards = stories.map((s) => storyCard(s, s.rank, locale))
  const top = cards.slice(0, IMPORTANT)
  const rest = stories.slice(IMPORTANT)
  // Topics in the order of their best story.
  const byTopic = new Map<NewsTopic, typeof rest>()
  for (const s of rest) byTopic.set(s.topic, [...(byTopic.get(s.topic) ?? []), s])
  // Generic farming goes last: the specific topics are what a farmer scans for.
  const topicGroups = [...byTopic].sort(([a], [b]) => Number(a === 'ferma') - Number(b === 'ferma'))
  const crumbs = [{ name: t.title, url }]
  const today = editions[0]?.date

  return (
    <SiteShell locale={locale} alternates={newsAlternates}>
      <JsonLd
        data={[
          webPage({ url, name: t.seoTitle, description: t.description, locale }),
          breadcrumbs(locale, ui[locale].home, crumbs),
          ...(cards.length || own.length
            ? [
                itemList([
                  ...own.map((o) => ({ name: o.title, url: o.href })),
                  ...top.map((c) => ({ name: c.title, url: c.href })),
                ]),
              ]
            : []),
        ]}
      />
      <PageTitle locale={locale} title={t.title} summary={t.summary} crumbs={crumbs} />

      <section
        aria-labelledby="important"
        className="mx-auto mt-10 grid max-w-page gap-6 px-4 md:mt-14 md:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <SectionHeading id="important" title={n.important} />
          {status.updated && (
            <p className="flex items-center gap-2 text-small text-muted">
              <span className="relative flex size-2.5" aria-hidden="true">
                <span className="absolute inset-0 rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
                <span className="relative size-2.5 rounded-full bg-accent" />
              </span>
              {n.updated(formatWhen(new Date(status.updated), locale), status.sources)}
            </p>
          )}
        </div>
        {top.length ? (
          <ImportantNow stories={top} locale={locale} labels={labels} />
        ) : (
          <p className="text-body text-muted">{n.empty}</p>
        )}
      </section>

      <div className="mx-auto mt-16 grid max-w-page gap-12 px-4 md:mt-20 md:px-8 lg:grid-cols-12">
        <section aria-labelledby="rest" className="grid content-start gap-10 lg:col-span-8">
          <h2 id="rest" className="text-h3 font-semibold">
            {n.rest}
          </h2>
          {byTopic.size ? (
            topicGroups.map(([topic, list]) => (
              <section key={topic} aria-labelledby={`t-${topic}`} className="grid gap-3">
                <h3
                  id={`t-${topic}`}
                  className="text-caption font-semibold tracking-wide text-subtle uppercase"
                >
                  {topicLabels[topic][locale]}
                </h3>
                <NewsList
                  stories={list.slice(0, PER_TOPIC).map((x) => storyCard(x, x.rank, locale))}
                  locale={locale}
                  labels={labels}
                  level={4}
                  className="border-t border-line pt-4"
                />
              </section>
            ))
          ) : (
            <p className="text-body text-muted">{n.empty}</p>
          )}
          <p className="text-caption text-subtle">{n.disclaimer}</p>
        </section>

        <aside className="grid content-start gap-8 lg:col-span-4">
          <section
            aria-labelledby="archive"
            className="grid gap-3 rounded-xl bg-surface p-6 ring-1 ring-line"
          >
            <h2 id="archive" className="text-h4 font-semibold">
              {n.archive}
            </h2>
            {editions.length ? (
              <ul className="flex flex-wrap gap-2">
                {editions.map((e) => (
                  <li key={e.date}>
                    <Link
                      href={newsDayPath(e.date, locale)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-raised px-3 py-1.5 text-small font-medium text-ink no-underline ring-1 ring-line hover:ring-line-strong"
                    >
                      {formatDate(new Date(`${e.date}T12:00:00Z`), locale)}
                      <span className="text-caption text-muted tabular-nums">{e.count}</span>
                      {e.date === today && <span className="sr-only">({n.important})</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-small text-muted">{n.archiveNone}</p>
            )}
          </section>
          <section
            aria-labelledby="note"
            className="grid gap-3 rounded-xl bg-surface p-6 ring-1 ring-line"
          >
            <h2 id="note" className="text-h4 font-semibold">
              {t.own}
            </h2>
            {notes.length ? (
              <ul className="grid gap-2">
                {notes.slice(0, 5).map((m) => (
                  <li key={m.id}>
                    <Link
                      href={marketNotePath(m.slug, locale)}
                      className="text-small font-semibold text-ink hover:text-accent"
                    >
                      {m.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-small text-muted">{p.market.empty}</p>
            )}
            <Link href={marketPath(locale)} className="text-small font-semibold text-accent">
              {p.hub.allNotes}
            </Link>
          </section>
          <div
            id="buletin"
            className="scroll-mt-24 rounded-xl bg-raised p-6 shadow-soft ring-1 ring-line"
          >
            <SubscribeFormLazy
              locale={locale}
              action={subscribe}
              topic="newsletter"
              heading={t.newsletterTitle}
              body={t.newsletterBody}
              sourcePath={url}
              privacyHref={fixedUrl('privacy', locale)}
              labels={{ ...p.alert, submit: t.newsletterSubmit }}
            />
          </div>
        </aside>
      </div>
      {own.length > 0 && (
        <section
          aria-labelledby="agrinvest"
          className="mx-auto mt-16 grid max-w-page gap-8 px-4 md:mt-20 md:px-8"
        >
          <SectionHeading id="agrinvest" title={a.latest} />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {own.slice(0, 6).map((o) => (
              <ArticleCard
                key={o.id}
                locale={locale}
                href={o.href}
                title={o.title}
                summary={o.summary}
                date={o.date}
                image={o.image}
              />
            ))}
          </div>
        </section>
      )}
      <ToolLinks locale={locale} current={url} />
    </SiteShell>
  )
}

/* ------------------------------------------------------------------ /stiri/zi/{date} */

const dayLabel = (date: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === 'ro' ? 'ro-RO' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`))

const dayAlternates = (date: string): Alternates => ({
  ro: newsDayPath(date, 'ro'),
  en: newsDayPath(date, 'en'),
})

export async function newsDayMetadata(locale: Locale, date: string): Promise<Metadata> {
  const [edition, indexable] = await Promise.all([getEdition(date), editionsIndexable()])
  const n = newsUi[locale]
  const title = n.edition(dayLabel(date, locale))
  return meta(
    locale,
    { title, seoTitle: `${title} · Agrinvest`, description: n.editionSummary },
    dayAlternates(date),
    !edition || !indexable,
  )
}

/**
 * One day's news in ranked order, each story with all its sources. Built hour by hour by the
 * news job and frozen after midnight. `noindex, follow` unless `News settings → Index daily
 * editions` is on (decision 0011).
 */
export async function NewsDayPage({ locale, date }: { locale: Locale; date: string }) {
  const [edition, days] = await Promise.all([getEdition(date), listEditions(90)])
  const n = newsUi[locale]
  const t = toolsUi[locale].news
  const url = newsDayPath(date, locale)
  const title = n.edition(dayLabel(date, locale))
  const crumbs = [
    { name: t.title, url: newsPath(locale) },
    { name: dayLabel(date, locale), url },
  ]
  const i = days.findIndex((d) => d.date === date)
  const newer = i > 0 ? days[i - 1] : undefined
  const older = i >= 0 ? days[i + 1] : undefined
  const labels = storyLabels(locale)
  const entries = edition?.entries ?? []

  return (
    <SiteShell locale={locale} alternates={dayAlternates(date)}>
      <JsonLd
        data={[
          webPage({ url, name: title, description: n.editionSummary, locale }),
          breadcrumbs(locale, ui[locale].home, crumbs),
        ]}
      />
      <PageTitle locale={locale} title={title} summary={n.editionSummary} crumbs={crumbs} />
      <div className="mx-auto mt-10 grid max-w-3xl gap-8 px-4 md:mt-14 md:px-8">
        {entries.length ? (
          <NewsList
            stories={entries.map((e, k) => storyCard(e, k + 1, locale))}
            locale={locale}
            labels={labels}
            level={2}
            className="border-y border-line py-6"
          />
        ) : (
          <p className="text-body text-muted">{n.editionEmpty}</p>
        )}
        <p className="text-caption text-subtle">{n.disclaimer}</p>
        <nav
          aria-label={n.archive}
          className="flex flex-wrap justify-between gap-4 border-t border-line pt-6 text-small font-semibold"
        >
          {older ? (
            <Link href={newsDayPath(older.date, locale)} className="text-accent">
              ← {n.previous}: {dayLabel(older.date, locale)}
            </Link>
          ) : (
            <span />
          )}
          {newer && (
            <Link href={newsDayPath(newer.date, locale)} className="text-accent">
              {n.next}: {dayLabel(newer.date, locale)} →
            </Link>
          )}
        </nav>
        <Link href={newsPath(locale)} className="text-small font-semibold text-accent">
          {n.allNews}
        </Link>
      </div>
      <ToolLinks locale={locale} current={newsPath(locale)} />
    </SiteShell>
  )
}
