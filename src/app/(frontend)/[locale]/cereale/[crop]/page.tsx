import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/JsonLd'
import { Faq, PageHeader } from '@/components/PageParts'
import { RenderBlocks } from '@/components/RenderBlocks'
import { SiteShell } from '@/components/SiteShell'
import { isLocale, localePath } from '@/i18n/config'
import { ui } from '@/i18n/ui'
import { getSeoDefaults } from '@/lib/content/globals'
import { getCrop, listCrops } from '@/lib/content/locations'
import { getPage, type Alternates } from '@/lib/content/pages'
import { formatNumber } from '@/lib/format'
import { buildMetadata } from '@/lib/seo/metadata'
import { breadcrumbs, faqPage, webPage } from '@/lib/schema'

/**
 * Selling one crop (`/cereale/{crop}`), Romanian. The English equivalents are the export
 * pages (`/en/export/{crop}`, 2.3); they become the hreflang pair when they exist.
 */
type Props = { params: Promise<{ locale: string; crop: string }> }

export const dynamicParams = true

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  if (params.locale !== 'ro') return []
  return (await listCrops('ro')).map((c) => ({ crop: c.slug }))
}

async function resolve(props: Props) {
  const { locale, crop: slug } = await props.params
  if (!isLocale(locale) || locale !== 'ro') return null
  const crop = await getCrop(slug, locale)
  if (!crop) return null
  const path = `/cereale/${crop.slug}`
  const alternates: Alternates = { ro: localePath(path, 'ro') }
  const lower = crop.name.toLocaleLowerCase('ro')
  return { crop, locale, path, alternates, lower }
}

const descriptionOf = (lower: string) =>
  `Cumpărăm ${lower} direct de la fermieri: recepție în bazele Agrinvest, condiții de calitate clare, transport cu flota proprie și ofertă rapidă.`

export async function generateMetadata(props: Props): Promise<Metadata> {
  const found = await resolve(props)
  if (!found) return {}
  const { crop, locale, alternates, lower } = found
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: crop.name,
    seoTitle: crop.seo?.title || `Vinde ${lower} la Agrinvest: recepție și transport`,
    description: crop.seo?.description || descriptionOf(lower),
    siteName: seo.siteName,
    image: crop.seo?.image ?? seo.ogImage,
    noindex: crop.seo?.noindex,
    alternates,
  })
}

export default async function CropPage(props: Props) {
  const found = await resolve(props)
  if (!found) notFound()
  const { crop, locale, path, alternates, lower } = found
  const t = ui[locale]
  const hub = (await getPage('/cereale', locale))?.page
  const title = `Vinde ${lower} la Agrinvest`
  const crumbs = [
    ...(hub ? [{ name: hub.title, url: localePath('/cereale', locale) }] : []),
    { name: crop.name, url: localePath(path, locale) },
  ]
  const q = crop.quality
  const standards = [
    q?.moisture != null && { label: t.moisture, value: `${formatNumber(q.moisture, locale)} %` },
    q?.impurities != null && {
      label: t.impurities,
      value: `${formatNumber(q.impurities, locale)} %`,
    },
    q?.hectolitre != null && {
      label: t.hectolitre,
      value: `${formatNumber(q.hectolitre, locale)} kg/hl`,
    },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <SiteShell locale={locale} alternates={alternates}>
      <JsonLd
        data={[
          webPage({
            url: localePath(path, locale),
            name: title,
            description: crop.intro || descriptionOf(lower),
            locale,
            dateModified: crop.updatedAt,
          }),
          breadcrumbs(locale, t.home, crumbs),
          ...(crop.faq?.length ? [faqPage(crop.faq)] : []),
        ]}
      />
      <PageHeader
        locale={locale}
        title={title}
        summary={crop.intro || descriptionOf(lower)}
        updatedAt={crop.updatedAt}
        crumbs={crumbs}
      />
      {standards.length > 0 && (
        <section className="mx-auto max-w-page px-4 md:px-8">
          <h2 className="mb-4 text-h3 font-semibold">{t.quality}</h2>
          <dl className="grid gap-6 border-y border-line py-6 md:grid-cols-3">
            {standards.map((s) => (
              <div key={s.label} className="grid gap-1">
                <dt className="text-small text-muted">{s.label}</dt>
                <dd className="text-h3 font-semibold tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      <div className="mt-16">
        <RenderBlocks
          blocks={[
            {
              blockType: 'leadForm',
              leadType: 'vanzare-cereale',
              extraFields: ['county', 'base'],
              heading: `Cere o ofertă pentru ${lower}`,
            },
          ]}
          locale={locale}
          path={path}
        />
      </div>
      <Faq locale={locale} items={crop.faq} />
    </SiteShell>
  )
}
