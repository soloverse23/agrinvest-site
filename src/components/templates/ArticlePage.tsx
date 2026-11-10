import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  ArticleByline,
  ArticleCard,
  AuthorCard,
  NextSteps,
  type Byline,
} from '@ds/patterns/Articles'
import { SourceList } from '@ds/patterns/Finance'
import { Photo } from '@ds/patterns/Photo'
import { CtaBand, Kicker, SectionHeading, Toc } from '@ds/patterns/Sections'
import { schemaFaq } from '@/components/FactText'
import { JsonLd } from '@/components/JsonLd'
import { Crumbs, Faq } from '@/components/PageParts'
import { headingsOf, Prose } from '@/components/RenderBlocks'
import { SiteShell } from '@/components/SiteShell'
import { ToolWidgetCard } from '@/components/ToolWidget'
import type { Locale } from '@/i18n/config'
import { articlesUi } from '@/i18n/articles'
import {
  authorPath,
  guidesHubPath,
  newsPath,
  pillarPath,
  pricesPath,
  productPath,
} from '@/i18n/routes'
import { fixedUrl, ui } from '@/i18n/ui'
import { toolsUi } from '@/i18n/tools'
import { pillarByKey, pillarBySlug } from '@/lib/articles/pillars'
import {
  articleAlternates,
  getArticle,
  imageOf,
  listArticles,
  type ArticleCardData,
  type ArticleSection,
} from '@/lib/content/articles'
import { getFigures, getSeoDefaults } from '@/lib/content/globals'
import { formatDate } from '@/lib/format'
import { article, breadcrumbs, faqPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'
import type { Guide, Person, ToolWidgetBlock } from '@/payload-types'

/**
 * One farmer guide (`/ghiduri/{pillar}/{slug}`) or Agrinvest news piece (`/stiri/{slug}`), with
 * their English twins. Editorial layout: title and byline, an optional cover, then contents,
 * text and a side rail with the page's tools and next steps.
 */
type Where = { section: ArticleSection; slug: string; pillar?: string }

/** The text's words, for the reading time (about 200 words a minute). */
function wordsOf(node: unknown): number {
  if (!node || typeof node !== 'object') return 0
  const n = node as { text?: string; children?: unknown[]; root?: unknown }
  if (n.root) return wordsOf(n.root)
  const own = typeof n.text === 'string' ? n.text.split(/\s+/).filter(Boolean).length : 0
  return own + (n.children ?? []).reduce<number>((sum, c) => sum + wordsOf(c), 0)
}

async function load({ section, slug, pillar }: Where, locale: Locale) {
  const doc = await getArticle(section, slug, locale)
  if (!doc) return null
  // A guide answers only under its own pillar's URL.
  if (section === 'ghid' && pillarBySlug(pillar ?? '', locale)?.key !== doc.pillar) return null
  return doc
}

export async function articleParams(section: ArticleSection, locale: Locale) {
  const list = await listArticles(locale, section)
  return list.map((a) =>
    section === 'ghid'
      ? { pillar: pillarByKey(a.pillar)?.slug[locale] as string, slug: a.slug }
      : { slug: a.slug },
  )
}

export async function articleMetadata(where: Where, locale: Locale): Promise<Metadata> {
  const doc = await load(where, locale)
  if (!doc) return {}
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: doc.title,
    seoTitle: doc.seo?.title,
    titleTemplate: seo.titleTemplate,
    siteName: seo.siteName,
    description: doc.seo?.description || doc.summary,
    image: doc.seo?.image ?? doc.cover ?? seo.ogImage,
    noindex: doc.seo?.noindex,
    alternates: await articleAlternates(doc.id),
    type: 'article',
  })
}

const personOf = (p: Guide['author']) => (typeof p === 'object' ? (p as Person | null) : null)

const bylineOf = (p: Person | null, locale: Locale): Byline | null =>
  p
    ? {
        name: p.name,
        role: p.role,
        href: p.isAuthor && p.slug ? authorPath(p.slug, locale) : null,
        photo: imageOf(p.photo),
      }
    : null

export async function ArticlePage({ where, locale }: { where: Where; locale: Locale }) {
  const doc = await load(where, locale)
  if (!doc) notFound()
  const t = articlesUi[locale]
  const news = where.section === 'stiri'
  const pillar = pillarByKey(doc.pillar)
  const [figures, alternates, siblings] = await Promise.all([
    getFigures(locale),
    articleAlternates(doc.id),
    listArticles(locale, where.section),
  ])
  const url = alternates[locale] as string
  const crumbs = news
    ? [
        { name: toolsUi[locale].news.title, url: newsPath(locale) },
        { name: doc.title, url },
      ]
    : [
        { name: t.hub.title, url: guidesHubPath(locale) },
        ...(pillar
          ? [{ name: pillar.name[locale], url: pillarPath(pillar.slug[locale], locale) }]
          : []),
        { name: doc.title, url },
      ]

  const author = personOf(doc.author)
  const reviewer = personOf(doc.reviewer)
  const published = doc.publishedAt ?? doc.createdAt
  const cover = imageOf(doc.cover)
  const headings = headingsOf(doc.body)
  const sources = doc.sources ?? []
  const faq = schemaFaq(doc.faq, figures)
  const tools = (doc.tools ?? []) as ToolWidgetBlock[]
  const products = (doc.shopProducts ?? []).flatMap((p) =>
    typeof p === 'object' && typeof p.primaryCategory === 'object' && p.primaryCategory?.slug
      ? [{ href: productPath(p.primaryCategory.slug, p.slug, locale), label: p.name }]
      : [],
  )
  const chosen = (doc.relatedGuides ?? []).flatMap((g) => (typeof g === 'object' ? [g.id] : []))
  const others = siblings.filter((a) => a.id !== doc.id)
  const related: ArticleCardData[] = [
    ...others.filter((a) => chosen.includes(a.id)),
    ...others.filter((a) => !chosen.includes(a.id) && (news || a.pillar === doc.pillar)),
  ].slice(0, 3)
  const next = pillar
    ? pillar.links(locale)
    : [{ href: pricesPath(locale), label: t.article.cta.secondary }]

  return (
    <SiteShell locale={locale} alternates={alternates}>
      <JsonLd
        data={[
          article({
            url,
            headline: doc.title,
            description: doc.summary,
            locale,
            datePublished: published,
            dateModified: doc.updatedAt,
            authorName: author?.name,
            authorUrl: author?.isAuthor && author.slug ? authorPath(author.slug, locale) : null,
            image: cover?.src,
            section: news ? t.news.kicker : pillar?.name[locale],
            type: news ? 'NewsArticle' : 'Article',
            citations: sources.map((s) => s.url),
          }),
          breadcrumbs(locale, ui[locale].home, crumbs),
          ...(faq.length ? [faqPage(faq)] : []),
        ]}
      />

      <header className="mx-auto grid max-w-page gap-8 px-4 pt-6 md:px-8 md:pt-10">
        <Crumbs locale={locale} items={crumbs} />
        <div className="grid max-w-4xl gap-5">
          <Kicker>{news ? t.news.kicker : (pillar?.name[locale] ?? t.hub.kicker)}</Kicker>
          <h1 className="text-h1 font-semibold text-balance">{doc.title}</h1>
          <p className="max-w-3xl text-lead text-muted">{doc.summary}</p>
        </div>
        <ArticleByline
          locale={locale}
          author={bylineOf(author, locale)}
          reviewer={bylineOf(reviewer, locale)}
          published={published}
          updated={doc.updatedAt}
          minutes={Math.max(1, Math.round(wordsOf(doc.body) / 200))}
          labels={t.article}
        />
        {cover && (
          <figure className="relative aspect-video overflow-hidden rounded-xl bg-surface lg:aspect-2/1">
            <Photo
              src={cover.src}
              alt={cover.alt}
              fill
              priority
              sizes="(min-width: 1312px) 1248px, 100vw"
              className="object-cover"
            />
          </figure>
        )}
      </header>

      <div className="mx-auto mt-10 grid max-w-page gap-10 px-4 md:mt-14 md:px-8 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <Toc label={t.article.contents} items={headings} />
          </div>
        </aside>
        <div className="grid min-w-0 content-start gap-10 lg:col-span-6">
          <Prose data={doc.body} ctx={{ figures, locale }} />
          {sources.length > 0 && (
            <SourceList
              title={t.article.sources}
              lead={t.article.sourcesLead}
              retrieved={t.article.retrieved}
              items={sources.map((s) => ({
                title: s.title,
                url: s.url,
                date: formatDate(new Date(s.retrieved), locale),
              }))}
            />
          )}
          {author?.isAuthor && (
            <AuthorCard
              heading={
                <p className="text-caption font-semibold text-subtle">{t.article.aboutAuthor}</p>
              }
              person={bylineOf(author, locale) as Byline}
              credentials={author.author?.credentials}
              bio={author.author?.bio}
              link={
                author.slug
                  ? { href: authorPath(author.slug, locale), label: t.article.authorLink }
                  : null
              }
            />
          )}
        </div>
        <aside className="grid content-start gap-6 lg:col-span-3">
          <div className="grid gap-6 lg:sticky lg:top-24">
            {tools.map((block) => (
              <ToolWidgetCard key={block.id ?? block.widget} block={block} locale={locale} />
            ))}
            <NextSteps title={t.article.next} links={next} />
            <NextSteps title={t.article.products} links={products} />
          </div>
        </aside>
      </div>

      <Faq locale={locale} items={doc.faq} />

      {related.length > 0 && (
        <section
          aria-labelledby="citeste"
          className="mx-auto mt-20 grid max-w-page gap-8 px-4 md:mt-28 md:px-8"
        >
          <SectionHeading
            id="citeste"
            title={t.article.related}
            action={
              news
                ? { href: newsPath(locale), label: t.news.more }
                : pillar
                  ? { href: pillarPath(pillar.slug[locale], locale), label: pillar.name[locale] }
                  : null
            }
          />
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((a) => (
              <ArticleCard
                key={a.id}
                locale={locale}
                href={a.href}
                title={a.title}
                summary={a.summary}
                date={a.date}
                image={a.image}
                kicker={pillarByKey(a.pillar)?.name[locale]}
              />
            ))}
          </div>
        </section>
      )}

      <div className="mx-auto mt-20 max-w-page px-4 md:mt-28 md:px-8">
        <CtaBand
          title={t.article.cta.title}
          body={t.article.cta.body}
          primary={{ href: fixedUrl('contact', locale), label: t.article.cta.primary }}
          secondary={{ href: pricesPath(locale), label: t.article.cta.secondary }}
        />
      </div>
    </SiteShell>
  )
}
