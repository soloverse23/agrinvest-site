import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ArticleCard, AuthorCard } from '@ds/patterns/Articles'
import { SectionHeading } from '@ds/patterns/Sections'
import { JsonLd } from '@/components/JsonLd'
import { PageTitle } from '@/components/PageParts'
import { SiteShell } from '@/components/SiteShell'
import type { Locale } from '@/i18n/config'
import { articlesUi } from '@/i18n/articles'
import { authorPath, guidePath, guidesHubPath, marketNotePath } from '@/i18n/routes'
import { ui } from '@/i18n/ui'
import {
  authorAlternates,
  getAuthor,
  hrefOf,
  imageOf,
  listAuthors,
  listByPerson,
} from '@/lib/content/articles'
import { getSeoDefaults } from '@/lib/content/globals'
import { breadcrumbs, person, webPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'

/** An expert author: `/autori/{slug}`, `/en/authors/{slug}`. */

export const authorParams = async () =>
  (await listAuthors()).map((p) => ({ slug: p.slug as string }))

export async function authorMetadata(slug: string, locale: Locale): Promise<Metadata> {
  const p = await getAuthor(slug, locale)
  if (!p) return {}
  const seo = await getSeoDefaults(locale)
  const t = articlesUi[locale].author
  return buildMetadata({
    locale,
    title: `${p.name}${p.role ? `, ${p.role}` : ''}`,
    titleTemplate: seo.titleTemplate,
    siteName: seo.siteName,
    description:
      p.author?.bio || `${p.name}: ${t.wrote.toLowerCase()} ${seo.siteName ?? 'Agrinvest'}.`,
    image: seo.ogImage,
    alternates: { [locale]: authorPath(slug, locale), ...(await authorAlternates(p.id, slug)) },
    noindex: !(await listByPerson(p.id, locale)).length,
  })
}

/** Where a person's text lives: farmer guide, news, market note or finance guide. */
function linkOf(
  d: { section?: string | null; pillar?: string | null; slug?: string | null },
  locale: Locale,
) {
  if (!d.slug) return null
  if (d.section === 'finantare') return guidePath(d.slug, locale)
  if (d.section === 'piata') return marketNotePath(d.slug, locale)
  return hrefOf(d, d.slug, locale)
}

export async function AuthorPage({ slug, locale }: { slug: string; locale: Locale }) {
  const p = await getAuthor(slug, locale)
  if (!p) notFound()
  const t = articlesUi[locale].author
  const url = authorPath(slug, locale)
  const docs = await listByPerson(p.id, locale)
  const cards = (role: 'author' | 'reviewer') =>
    docs.flatMap((d) => {
      const href = linkOf(d, locale)
      return href && d[role] === p.id ? [{ ...d, href }] : []
    })
  const wrote = cards('author')
  const reviewed = cards('reviewer')
  const crumbs = [
    { name: articlesUi[locale].hub.title, url: guidesHubPath(locale) },
    { name: p.name, url },
  ]
  const byline = { name: p.name, role: p.role, photo: imageOf(p.photo) }
  const list = (items: typeof wrote) => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((d) => (
        <ArticleCard
          key={d.id}
          locale={locale}
          href={d.href}
          title={d.title}
          summary={d.summary}
          date={d.publishedAt ?? d.createdAt}
        />
      ))}
    </div>
  )
  return (
    <SiteShell
      locale={locale}
      alternates={{ [locale]: url, ...(await authorAlternates(p.id, slug)) }}
    >
      <JsonLd
        data={[
          webPage({ url, name: p.name, description: p.author?.bio ?? p.name, locale }),
          breadcrumbs(locale, ui[locale].home, crumbs),
          person({
            name: p.name,
            role: p.role,
            url,
            sameAs: (p.author?.sameAs ?? []).map((s) => s.url),
          }),
        ]}
      />
      <PageTitle
        locale={locale}
        title={p.name}
        summary={p.role}
        crumbs={crumbs}
        kicker={t.kicker}
      />
      <div className="mx-auto mt-12 grid max-w-page gap-16 px-4 md:mt-16 md:px-8">
        <AuthorCard person={byline} credentials={p.author?.credentials} bio={p.author?.bio} />
        <section aria-labelledby="scrise" className="grid gap-8">
          <SectionHeading id="scrise" title={t.wrote} />
          {wrote.length ? list(wrote) : <p className="text-body text-muted">{t.none}</p>}
        </section>
        {reviewed.length > 0 && (
          <section aria-labelledby="verificate" className="grid gap-8">
            <SectionHeading id="verificate" title={t.reviewed} />
            {list(reviewed)}
          </section>
        )}
      </div>
    </SiteShell>
  )
}
