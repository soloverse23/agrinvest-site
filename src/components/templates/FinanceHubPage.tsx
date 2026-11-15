import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { needIcons } from '@ds/icons/finance'
import {
  ChoicePills,
  ConsultantBand,
  ConsultantButton,
  LibraryCards,
  NeedFinder,
  NeedTiles,
  QuestionLinks,
  TrustFacts,
} from '@ds/patterns/FinanceGuide'
import { SectionHeading, Steps } from '@ds/patterns/Sections'
import { ArrowRightIcon } from '@ds/icons/icons'
import { SelectField, TextField } from '@ds/primitives/Field'
import { FactText } from '@/components/FactText'
import { FinanceConsultant } from '@/components/FinanceConsultant'
import { FinanceNav } from '@/components/FinanceNav'
import { JsonLd } from '@/components/JsonLd'
import { PageTitle } from '@/components/PageParts'
import { SiteShell } from '@/components/SiteShell'
import type { Locale } from '@/i18n/config'
import { financeGuideUi } from '@/i18n/finance-guide'
import {
  financePath,
  financeProductPath,
  financeRoutePath,
  guidePath,
  questionPath,
  sections,
} from '@/i18n/routes'
import { ui } from '@/i18n/ui'
import { listFinanceProducts, listGuides, listQuestions } from '@/lib/content/finance'
import { getFigures, getSeoDefaults, type Figures } from '@/lib/content/globals'
import { getPage } from '@/lib/content/pages'
import { byGuideJourney } from '@/lib/finance/groups'
import { needs, otherCredits } from '@/lib/finance/needs'
import { questionTopics } from '@/lib/finance/topics'
import { breadcrumbs, itemList, webPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'

/**
 * The finance hub (`/finantare`, `/en/financing`), Phase 7g: a short title band with four
 * register facts, the need tiles, a three-question finder, how it works, what farmers ask and
 * a door to the library. The CMS page keeps the title, summary and SEO; the sections are
 * code, so a need always leads to the same credit (`src/lib/finance/needs.ts`).
 */
const hubPath = (locale: Locale) => sections.finance[locale]

async function load(locale: Locale) {
  return getPage(hubPath(locale), locale)
}

export async function financeHubMetadata(locale: Locale): Promise<Metadata> {
  const found = await load(locale)
  if (!found) return {}
  const { page, alternates } = found
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: page.title,
    seoTitle: page.seo?.title,
    titleTemplate: seo.titleTemplate,
    siteName: seo.siteName,
    description: page.seo?.description || page.summary || seo.description,
    image: page.seo?.image ?? seo.ogImage,
    noindex: page.seo?.noindex,
    alternates,
  })
}

/** The register facts of the title band; a fact not yet confirmed is left out. */
function trustFacts(figures: Figures, locale: Locale) {
  const t = financeGuideUi[locale].facts
  const n = (key: string) => {
    const f = figures[key]
    return f?.status === 'confirmed' && typeof f.number === 'number' ? f.number : null
  }
  const rows: { value: string; label: string }[] = []
  const reply = n('F4.reply')
  if (reply) rows.push({ value: t.reply(reply), label: t.replyLabel })
  const term = n('F5.term')
  if (term) rows.push({ value: t.term(term), label: t.termLabel })
  const instalments = n('F5.instalments')
  if (instalments) rows.push({ value: t.instalments(instalments), label: t.instalmentsLabel })
  const clients = n('F6')
  if (clients) rows.push({ value: t.clients(clients), label: t.clientsLabel })
  return rows
}

export async function FinanceHubPage({ locale }: { locale: Locale }) {
  const found = await load(locale)
  if (!found) notFound()
  const { page, alternates } = found
  const t = financeGuideUi[locale]
  const [figures, products, questions, guides] = await Promise.all([
    getFigures(locale),
    listFinanceProducts(locale),
    listQuestions(locale),
    listGuides(locale),
  ])
  const url = financePath(locale)
  const crumbs = [{ name: page.title, url }]
  const credit = (key: string) => {
    const p = products.find((x) => x.key === key)
    return p ? { href: financeProductPath(p.slug, locale, p.parentSlug), title: p.title } : null
  }
  const tiles = needs.flatMap((n) => {
    const main = credit(n.product)
    if (!main) return []
    const Icon = needIcons[n.icon]
    const also = n.also ? credit(n.also) : null
    return [
      {
        id: n.id,
        icon: <Icon />,
        label: n.label[locale],
        line: n.line[locale],
        href: main.href,
        also: also ? { href: also.href, label: also.title } : undefined,
      },
    ]
  })
  const more = otherCredits.flatMap((k) => credit(k) ?? [])
  const popular = questions
    .filter((q) => q.popular)
    .sort((a, b) => questionTopics.indexOf(a.topic) - questionTopics.indexOf(b.topic))
    .slice(0, 6)
  const library = byGuideJourney(guides).slice(0, 4)
  const f = t.hub.finder
  const apply = financeRoutePath('apply', locale)

  return (
    <SiteShell locale={locale} alternates={alternates}>
      <JsonLd
        data={[
          webPage({
            url,
            name: page.seo?.title || page.title,
            description: page.summary ?? undefined,
            locale,
            dateModified: page.updatedAt,
          }),
          breadcrumbs(locale, ui[locale].home, crumbs),
          itemList(
            products.map((p) => ({
              name: p.title,
              url: financeProductPath(p.slug, locale, p.parentSlug),
            })),
          ),
        ]}
      />
      <PageTitle
        locale={locale}
        title={page.title}
        summary={page.summary}
        crumbs={crumbs}
        actions={
          <>
            <ConsultantButton href={apply} icon={<ArrowRightIcon />}>
              {t.consultant}
            </ConsultantButton>
            <a
              href="#nevoi"
              className="inline-flex h-12 items-center px-2 font-semibold text-accent no-underline hover:underline"
            >
              {t.hub.needsTitle}
            </a>
          </>
        }
        aside={<TrustFacts items={trustFacts(figures, locale)} />}
      />
      <FinanceNav locale={locale} current="credits" />

      <div className="mx-auto mt-14 grid max-w-page gap-20 px-4 md:mt-20 md:gap-28 md:px-8">
        <section className="grid gap-8" aria-labelledby="nevoi">
          <SectionHeading
            id="nevoi"
            kicker={t.hub.needsKicker}
            title={t.hub.needsTitle}
            lead={t.hub.needsLead}
          />
          <NeedTiles tiles={tiles} />
          {more.length > 0 && (
            <p className="text-small text-muted">
              {t.hub.more}{' '}
              {more.map((m, i) => (
                <span key={m.href}>
                  {i > 0 && ' · '}
                  <Link
                    href={m.href}
                    className="font-semibold text-accent underline-offset-2 hover:underline"
                  >
                    {m.title}
                  </Link>
                </span>
              ))}
            </p>
          )}
        </section>

        <NeedFinder
          action={financeRoutePath('simulator', locale)}
          kicker={f.kicker}
          title={f.title}
          lead={f.lead}
          submit={f.submit}
          note={f.note}
        >
          <SelectField
            name="nevoie"
            label={f.need}
            defaultValue=""
            options={[
              { value: '', label: f.needChoose },
              ...needs.map((n) => ({ value: n.id, label: n.label[locale] })),
            ]}
          />
          <TextField name="suma" label={f.amount} inputMode="numeric" suffix="lei" />
          <ChoicePills
            name="culturi"
            legend={f.sell}
            defaultValue="wheat,maize"
            options={(Object.keys(f.sellOptions) as (keyof typeof f.sellOptions)[]).map((k) => ({
              value: k,
              label: f.sellOptions[k],
            }))}
          />
        </NeedFinder>

        <section className="grid gap-10">
          <SectionHeading kicker={t.hub.how.kicker} title={t.hub.how.title} />
          <Steps items={t.hub.how.steps.map((s) => ({ title: s.title, body: s.body }))} />
        </section>

        {popular.length > 0 && (
          <section className="grid gap-8">
            <SectionHeading
              kicker={t.hub.questionsKicker}
              title={t.hub.questionsTitle}
              action={{ href: financeRoutePath('questions', locale), label: t.hub.questionsAll }}
            />
            <QuestionLinks
              variant="cards"
              items={popular.map((q) => ({
                href: questionPath(q.slug, locale),
                title: q.title,
                answer: <FactText text={q.answer} figures={figures} locale={locale} />,
              }))}
            />
          </section>
        )}

        {library.length > 0 && (
          <section className="grid gap-8">
            <SectionHeading
              kicker={t.hub.libraryKicker}
              title={t.hub.libraryTitle}
              lead={t.hub.libraryLead}
              action={{ href: financeRoutePath('guides', locale), label: t.hub.libraryAll }}
            />
            <LibraryCards
              items={library.map((g) => ({
                href: guidePath(g.slug, locale),
                title: g.title,
                summary: g.summary,
              }))}
            />
          </section>
        )}

        <ConsultantBand
          kicker={t.credit.kicker}
          title={t.hub.bandTitle}
          body={t.hub.bandBody}
          action={
            <ConsultantButton href={apply} variant="lime" icon={<ArrowRightIcon />}>
              {t.consultant}
            </ConsultantButton>
          }
          secondary={{ href: financeRoutePath('simulator', locale), label: t.nav.simulator }}
        />
      </div>
      <FinanceConsultant locale={locale} sourcePath={url} />
    </SiteShell>
  )
}
