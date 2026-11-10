import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ArticleCard, NextSteps, PillarCard } from '@ds/patterns/Articles'
import { SectionHeading } from '@ds/patterns/Sections'
import { JsonLd } from '@/components/JsonLd'
import { PageTitle } from '@/components/PageParts'
import { SiteShell } from '@/components/SiteShell'
import type { Locale } from '@/i18n/config'
import { articlesUi } from '@/i18n/articles'
import { financeRoutePath, guidesHubPath, marketNotePath, pillarPath } from '@/i18n/routes'
import { ui } from '@/i18n/ui'
import { pillarBySlug, pillars, type Pillar } from '@/lib/articles/pillars'
import { listArticles } from '@/lib/content/articles'
import { listGuides } from '@/lib/content/finance'
import { getSeoDefaults } from '@/lib/content/globals'
import { listMarketNotes } from '@/lib/content/market'
import type { Alternates } from '@/lib/content/pages'
import { breadcrumbs, itemList, webPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'

/**
 * The knowledge hub (`/ghiduri`, `/en/guides`) and one pillar (`/ghiduri/{pillar}`). A pillar
 * exists only once it has a published guide in that language, so no empty page is ever served.
 */
const hubAlternates: Alternates = { ro: guidesHubPath('ro'), en: guidesHubPath('en') }

async function counts(locale: Locale) {
  const [guides, finance] = await Promise.all([listArticles(locale, 'ghid'), listGuides(locale)])
  const by = (p: Pillar) => guides.filter((g) => g.pillar === p.key)
  return { guides, finance, by }
}

export async function hubMetadata(locale: Locale): Promise<Metadata> {
  const t = articlesUi[locale].hub
  const [seo, { guides, finance }] = await Promise.all([getSeoDefaults(locale), counts(locale)])
  return buildMetadata({
    locale,
    title: t.title,
    seoTitle: t.seoTitle,
    siteName: seo.siteName,
    description: t.description,
    image: seo.ogImage,
    alternates: hubAlternates,
    noindex: !guides.length && !finance.length,
  })
}

export async function GuidesHubPage({ locale }: { locale: Locale }) {
  const t = articlesUi[locale].hub
  const url = guidesHubPath(locale)
  const { guides, finance, by } = await counts(locale)
  const live = pillars.filter((p) => by(p).length)
  const crumbs = [{ name: t.title, url }]
  const [lead, ...rest] = guides
  return (
    <SiteShell locale={locale} alternates={hubAlternates}>
      <JsonLd
        data={[
          webPage({ url, name: t.seoTitle, description: t.description, locale }),
          breadcrumbs(locale, ui[locale].home, crumbs),
          itemList([
            ...live.map((p) => ({ name: p.name[locale], url: pillarPath(p.slug[locale], locale) })),
            ...(finance.length
              ? [{ name: t.finance.title, url: financeRoutePath('guides', locale) }]
              : []),
          ]),
        ]}
      />
      <PageTitle locale={locale} title={t.title} summary={t.summary} crumbs={crumbs} />

      <section
        aria-labelledby="teme"
        className="mx-auto mt-12 grid max-w-page gap-8 px-4 md:mt-16 md:px-8"
      >
        <SectionHeading id="teme" title={t.pillars} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {live.map((p) => (
            <PillarCard
              key={p.key}
              href={pillarPath(p.slug[locale], locale)}
              title={p.name[locale]}
              intro={p.intro[locale]}
              count={t.count(by(p).length)}
            />
          ))}
          {finance.length > 0 && (
            <PillarCard
              href={financeRoutePath('guides', locale)}
              title={t.finance.title}
              intro={t.finance.intro}
              count={t.count(finance.length)}
            />
          )}
        </div>
      </section>

      <section
        aria-labelledby="noi"
        className="mx-auto mt-16 grid max-w-page gap-8 px-4 md:mt-24 md:px-8"
      >
        <SectionHeading id="noi" title={t.latest} />
        {lead ? (
          <>
            <ArticleCard
              variant="feature"
              locale={locale}
              href={lead.href}
              title={lead.title}
              summary={lead.summary}
              date={lead.date}
              image={lead.image}
              kicker={pillars.find((p) => p.key === lead.pillar)?.name[locale]}
            />
            {rest.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rest.slice(0, 9).map((a) => (
                  <ArticleCard
                    key={a.id}
                    locale={locale}
                    href={a.href}
                    title={a.title}
                    summary={a.summary}
                    date={a.date}
                    image={a.image}
                    kicker={pillars.find((p) => p.key === a.pillar)?.name[locale]}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-body text-muted">{t.empty}</p>
        )}
      </section>
    </SiteShell>
  )
}

/* ---------------------------------------------------------------- pillar */

async function loadPillar(slug: string, locale: Locale) {
  const pillar = pillarBySlug(slug, locale)
  if (!pillar) return null
  const guides = (await listArticles(locale, 'ghid')).filter((g) => g.pillar === pillar.key)
  return guides.length ? { pillar, guides } : null
}

const pillarAlternates = (p: Pillar): Alternates => ({
  ro: pillarPath(p.slug.ro, 'ro'),
  en: pillarPath(p.slug.en, 'en'),
})

/** Pillars live in a language only with a guide there; the pair is kept only if both do. */
async function pairOf(p: Pillar): Promise<Alternates> {
  const out: Alternates = {}
  for (const l of ['ro', 'en'] as const)
    if (await loadPillar(p.slug[l], l)) out[l] = pillarAlternates(p)[l]
  return out
}

export async function pillarParams(locale: Locale) {
  const guides = await listArticles(locale, 'ghid')
  return pillars
    .filter((p) => guides.some((g) => g.pillar === p.key))
    .map((p) => ({ pillar: p.slug[locale] }))
}

export async function pillarMetadata(slug: string, locale: Locale): Promise<Metadata> {
  const found = await loadPillar(slug, locale)
  if (!found) return {}
  const seo = await getSeoDefaults(locale)
  const t = articlesUi[locale].hub
  return buildMetadata({
    locale,
    title: `${t.kicker}: ${found.pillar.name[locale]}`,
    titleTemplate: seo.titleTemplate,
    siteName: seo.siteName,
    description: found.pillar.intro[locale],
    image: seo.ogImage,
    alternates: await pairOf(found.pillar),
  })
}

export async function PillarPage({ slug, locale }: { slug: string; locale: Locale }) {
  const found = await loadPillar(slug, locale)
  if (!found) notFound()
  const { pillar, guides } = found
  const t = articlesUi[locale]
  const url = pillarPath(pillar.slug[locale], locale)
  const crumbs = [
    { name: t.hub.title, url: guidesHubPath(locale) },
    { name: pillar.name[locale], url },
  ]
  const notes = pillar.key === 'vanzare' ? (await listMarketNotes(locale)).slice(0, 3) : []
  const title = `${t.hub.kicker}: ${pillar.name[locale]}`
  return (
    <SiteShell locale={locale} alternates={await pairOf(pillar)}>
      <JsonLd
        data={[
          webPage({ url, name: title, description: pillar.intro[locale], locale }),
          breadcrumbs(locale, ui[locale].home, crumbs),
          itemList(guides.map((g) => ({ name: g.title, url: g.href }))),
        ]}
      />
      <PageTitle
        locale={locale}
        title={title}
        summary={pillar.intro[locale]}
        crumbs={crumbs}
        kicker={t.pillar.kicker}
      />
      <div className="mx-auto mt-12 grid max-w-page gap-10 px-4 md:mt-16 md:px-8 lg:grid-cols-12">
        <div className="grid content-start gap-6 md:grid-cols-2 lg:col-span-8">
          {guides.map((g, i) => {
            const feature = i === 0 && guides.length > 2
            return (
              <div key={g.id} className={feature ? 'md:col-span-2' : undefined}>
                <ArticleCard
                  locale={locale}
                  href={g.href}
                  title={g.title}
                  summary={g.summary}
                  date={g.date}
                  image={g.image}
                  level={2}
                  variant={feature ? 'feature' : 'default'}
                />
              </div>
            )
          })}
        </div>
        <aside className="grid content-start gap-6 lg:col-span-4">
          <div className="grid gap-6 lg:sticky lg:top-24">
            <NextSteps title={t.pillar.next} links={pillar.links(locale)} />
            <NextSteps
              title={t.pillar.notes}
              links={notes.map((n) => ({ href: marketNotePath(n.slug, locale), label: n.title }))}
            />
            <NextSteps
              title={t.hub.title}
              links={[{ href: guidesHubPath(locale), label: t.pillar.all }]}
            />
          </div>
        </aside>
      </div>
    </SiteShell>
  )
}
