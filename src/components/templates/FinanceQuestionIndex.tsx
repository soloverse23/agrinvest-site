import type { Metadata } from 'next'
import Link from 'next/link'

import { ArrowRightIcon } from '@ds/icons/icons'
import { ConsultantButton } from '@ds/patterns/FinanceGuide'
import { QuestionSearch } from '@ds/patterns/QuestionSearch'
import { FinanceConsultant } from '@/components/FinanceConsultant'
import { FinanceNav } from '@/components/FinanceNav'
import { JsonLd } from '@/components/JsonLd'
import { PageTitle } from '@/components/PageParts'
import { SiteShell } from '@/components/SiteShell'
import type { Locale } from '@/i18n/config'
import { financeUi } from '@/i18n/finance'
import { financeGuideUi } from '@/i18n/finance-guide'
import { financePath, financeRoutePath, questionPath } from '@/i18n/routes'
import { ui } from '@/i18n/ui'
import { listQuestions } from '@/lib/content/finance'
import { getSeoDefaults } from '@/lib/content/globals'
import { questionTopicLabels, questionTopics } from '@/lib/finance/topics'
import { breadcrumbs, itemList, webPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'

/** All finance questions by topic: `/finantare/intrebari`, `/en/financing/questions`. */
const alternates = {
  ro: financeRoutePath('questions', 'ro'),
  en: financeRoutePath('questions', 'en'),
}

export async function questionIndexMetadata(locale: Locale): Promise<Metadata> {
  const t = financeGuideUi[locale].questions
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: t.title,
    seoTitle: t.seoTitle,
    titleTemplate: seo.titleTemplate,
    siteName: seo.siteName,
    description: t.summary,
    image: seo.ogImage,
    alternates,
  })
}

export async function FinanceQuestionIndex({ locale }: { locale: Locale }) {
  const g = financeGuideUi[locale]
  const t = g.questions
  const questions = await listQuestions(locale)
  const url = financeRoutePath('questions', locale)
  const crumbs = [
    { name: financeUi[locale].section, url: financePath(locale) },
    { name: g.nav.questions, url },
  ]
  const groups = questionTopics
    .map((topic) => ({ topic, items: questions.filter((q) => q.topic === topic) }))
    .filter((group) => group.items.length)

  return (
    <SiteShell locale={locale} alternates={alternates}>
      <JsonLd
        data={[
          webPage({ url, name: t.seoTitle, description: t.summary, locale }),
          breadcrumbs(locale, ui[locale].home, crumbs),
          itemList(questions.map((q) => ({ name: q.title, url: questionPath(q.slug, locale) }))),
        ]}
      />
      <PageTitle
        locale={locale}
        title={t.title}
        summary={t.summary}
        crumbs={crumbs}
        aside={
          <div className="rounded-lg bg-raised p-5 shadow-soft ring-1 ring-line">
            <QuestionSearch label={t.search} placeholder={t.searchPlaceholder} empty={t.empty} />
            <p className="text-caption text-muted">{t.count(questions.length)}</p>
          </div>
        }
      />
      <FinanceNav locale={locale} current="questions" />
      <div className="mx-auto mt-10 grid max-w-page gap-10 px-4 md:mt-14 md:px-8 lg:grid-cols-12 lg:gap-14">
        <nav aria-label={g.nav.questions} className="min-w-0 lg:col-span-3">
          <ul className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:sticky lg:top-6 lg:grid lg:gap-1 lg:overflow-visible">
            {groups.map(({ topic, items }) => (
              <li key={topic} className="shrink-0">
                <a
                  href={`#${topic}`}
                  className="flex h-10 items-center justify-between gap-3 rounded-full bg-raised px-4 text-small font-medium text-ink no-underline ring-1 ring-line hover:ring-accent lg:rounded-md lg:bg-transparent lg:px-3 lg:ring-0 lg:hover:bg-surface"
                >
                  {questionTopicLabels[topic][locale]}
                  <span className="text-caption text-subtle tabular-nums">{items.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="grid min-w-0 content-start gap-12 lg:col-span-9">
          {groups.map(({ topic, items }) => (
            <section key={topic} data-topic={topic} aria-labelledby={topic} className="grid gap-3">
              <h2 id={topic} className="scroll-mt-6 text-h3 font-semibold">
                {questionTopicLabels[topic][locale]}
              </h2>
              <ul className="grid divide-y divide-line border-y border-line">
                {items.map((q) => (
                  <li key={q.id} data-question={q.title}>
                    <Link
                      href={questionPath(q.slug, locale)}
                      className="group flex items-center justify-between gap-4 py-3.5 font-medium text-ink no-underline hover:text-accent"
                    >
                      <span>{q.title}</span>
                      <ArrowRightIcon
                        className="size-4 shrink-0 text-subtle transition duration-150 ease-move group-hover:translate-x-0.5 group-hover:text-accent"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <div className="grid gap-4 rounded-xl bg-surface p-6 ring-1 ring-line md:flex md:items-center md:justify-between md:p-8">
            <div className="grid gap-1">
              <p className="text-h4 font-semibold">{t.missing}</p>
              <p className="text-small text-muted">{t.missingBody}</p>
            </div>
            <ConsultantButton href={financeRoutePath('apply', locale)} icon={<ArrowRightIcon />}>
              {g.consultant}
            </ConsultantButton>
          </div>
        </div>
      </div>
      <FinanceConsultant locale={locale} sourcePath={url} />
    </SiteShell>
  )
}
