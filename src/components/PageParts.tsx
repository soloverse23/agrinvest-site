import type { ReactNode } from 'react'

import { Accordion, Breadcrumbs, PageHeader, SectionHeading, Updated } from '@ds/patterns/Sections'
import { localePath, type Locale } from '@/i18n/config'
import { ui } from '@/i18n/ui'
import { getFigures } from '@/lib/content/globals'

import { FactText } from './FactText'
import { SectionNav } from './SectionNav'

/** Visible breadcrumb trail from home; matches the BreadcrumbList JSON-LD. */
export function Crumbs({
  locale,
  items,
}: {
  locale: Locale
  items: { name: string; url: string }[]
}) {
  return (
    <Breadcrumbs
      label={ui[locale].breadcrumb}
      items={[{ name: ui[locale].home, url: localePath('/', locale) }, ...items]}
    />
  )
}

/** Page title (the only H1), the answer summary and the last update date. */
export function PageTitle({
  locale,
  title,
  summary,
  updatedAt,
  crumbs,
  kicker,
  actions,
  aside,
}: {
  locale: Locale
  title: ReactNode
  summary?: ReactNode
  updatedAt?: string
  crumbs: { name: string; url: string }[]
  kicker?: string | null
  actions?: ReactNode
  aside?: ReactNode
}) {
  return (
    <>
      <PageHeader
        breadcrumbs={<Crumbs locale={locale} items={crumbs} />}
        kicker={kicker}
        title={title}
        summary={summary}
        actions={actions}
        aside={aside}
        updated={
          updatedAt && <Updated locale={locale} label={ui[locale].updated} date={updatedAt} />
        }
      />
      <SectionNav locale={locale} url={crumbs[crumbs.length - 1]?.url ?? ''} />
    </>
  )
}

/** The page's FAQ: question-style H3s in an accordion, answers with their register facts. */
export async function Faq({
  locale,
  items,
}: {
  locale: Locale
  items?: { id?: string | null; question: string; answer: string }[] | null
}) {
  if (!items?.length) return null
  const figures = await getFigures(locale)
  return (
    <section className="mx-auto mt-20 grid max-w-page gap-8 px-4 md:mt-28 md:px-8 lg:grid-cols-12">
      <SectionHeading
        id="intrebari"
        kicker={ui[locale].faqKicker}
        title={ui[locale].faq}
        className="lg:col-span-4 lg:self-start"
      />
      <div className="lg:col-span-8">
        <Accordion
          items={items.map((q) => ({
            id: q.id,
            question: q.question,
            answer: <FactText text={q.answer} figures={figures} locale={locale} />,
          }))}
        />
      </div>
    </section>
  )
}
