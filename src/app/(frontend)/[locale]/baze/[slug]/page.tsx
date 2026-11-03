import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { FactMark } from '@/components/Fact'
import type { FactStatus } from '@/fields'
import { JsonLd } from '@/components/JsonLd'
import { Faq, PageHeader } from '@/components/PageParts'
import { RenderBlocks } from '@/components/RenderBlocks'
import { SiteShell } from '@/components/SiteShell'
import { isLocale, localePath, type Locale } from '@/i18n/config'
import { ui } from '@/i18n/ui'
import { getSeoDefaults } from '@/lib/content/globals'
import { getBase, listBases } from '@/lib/content/locations'
import { getPage, type Alternates } from '@/lib/content/pages'
import { formatQuantity } from '@/lib/format'
import { buildMetadata } from '@/lib/seo/metadata'
import { breadcrumbs, faqPage, localBusiness } from '@/lib/schema'

/**
 * Base pages (`/baze/{slug}`), Romanian only for now. Slots for today's price and local
 * weather are added in Phase 5; until then the page shows only confirmed-or-marked facts.
 */
type Props = { params: Promise<{ locale: string; slug: string }> }

export const dynamicParams = true

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  if (params.locale !== 'ro') return []
  return (await listBases('ro')).map((b) => ({ slug: b.slug }))
}

const serviceLabels: Record<string, Record<Locale, string>> = {
  reception: { ro: 'Recepție', en: 'Reception' },
  drying: { ro: 'Uscare', en: 'Drying' },
  cleaning: { ro: 'Precurățare', en: 'Cleaning' },
  weighing: { ro: 'Cântărire', en: 'Weighing' },
  storage: { ro: 'Depozitare', en: 'Storage' },
}

async function resolve(props: Props) {
  const { locale, slug } = await props.params
  if (!isLocale(locale) || locale !== 'ro') return null
  const base = await getBase(slug, locale)
  if (!base) return null
  const path = `/baze/${base.slug}`
  const alternates: Alternates = { ro: localePath(path, 'ro') }
  return { base, locale, path, alternates }
}

const titleOf = (name: string) => `Baza ${name}: recepție și depozitare cereale`
const descriptionOf = (name: string) =>
  `Baza Agrinvest ${name}: recepție, cântărire și depozitare de cereale. Vezi capacitatea bazei, serviciile disponibile și cum ne contactezi.`

export async function generateMetadata(props: Props): Promise<Metadata> {
  const found = await resolve(props)
  if (!found) return {}
  const { base, locale, alternates } = found
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: base.name,
    seoTitle: base.seo?.title || titleOf(base.name),
    description: base.seo?.description || descriptionOf(base.name),
    siteName: seo.siteName,
    image: base.seo?.image ?? seo.ogImage,
    noindex: base.seo?.noindex,
    alternates,
  })
}

export default async function BasePage(props: Props) {
  const found = await resolve(props)
  if (!found) notFound()
  const { base, locale, path, alternates } = found
  const t = ui[locale]
  const parent = (await getPage('/depozitare', locale))?.page
  const crumbs = [
    ...(parent ? [{ name: parent.title, url: localePath('/depozitare', locale) }] : []),
    { name: `Baza ${base.name}`, url: localePath(path, locale) },
  ]
  const county = typeof base.county === 'object' && base.county ? base.county : null
  const mark = (status: FactStatus | null | undefined, key: string) => (
    <FactMark
      figure={{ key, label: key, value: '', status: status ?? 'to-confirm' }}
      locale={locale}
    />
  )

  return (
    <SiteShell locale={locale} alternates={alternates}>
      <JsonLd
        data={[
          localBusiness(base, path),
          breadcrumbs(locale, t.home, crumbs),
          ...(base.faq?.length ? [faqPage(base.faq)] : []),
        ]}
      />
      <PageHeader
        locale={locale}
        title={`Baza Agrinvest ${base.name}`}
        summary={base.intro || descriptionOf(base.name)}
        updatedAt={base.updatedAt}
        crumbs={crumbs}
      />
      <section className="mx-auto max-w-page px-4 md:px-8">
        <dl className="grid gap-6 border-y border-line py-8 md:grid-cols-3">
          {base.capacity != null && (
            <div className="grid gap-1">
              <dt className="text-small text-muted">{t.capacity}</dt>
              <dd className="text-h2 font-semibold tabular-nums">
                {formatQuantity(base.capacity, 't', locale)}
                {mark(base.capacityStatus, `base:${base.slug}:capacity`)}
              </dd>
            </div>
          )}
          {county && (
            <div className="grid gap-1">
              <dt className="text-small text-muted">{t.county}</dt>
              <dd className="text-h3 font-semibold">
                {county.name}
                {mark(base.locationStatus, `base:${base.slug}:location`)}
              </dd>
            </div>
          )}
          {!!base.services?.length && (
            <div className="grid gap-1">
              <dt className="text-small text-muted">{t.services}</dt>
              <dd className="text-body">
                {base.services.map((s) => serviceLabels[s]?.[locale] ?? s).join(', ')}
                {mark(base.servicesStatus, `base:${base.slug}:services`)}
              </dd>
            </div>
          )}
        </dl>
      </section>
      <div className="mt-16">
        <RenderBlocks
          blocks={[
            {
              blockType: 'leadForm',
              leadType: 'depozitare',
              extraFields: ['crop'],
              heading:
                locale === 'ro'
                  ? `Programează o livrare la ${base.name}`
                  : `Book a delivery to ${base.name}`,
            },
          ]}
          locale={locale}
          path={path}
        />
      </div>
      <Faq locale={locale} items={base.faq} />
    </SiteShell>
  )
}
