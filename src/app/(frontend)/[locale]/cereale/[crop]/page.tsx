import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArrowRightIcon } from '@ds/icons/icons'
import { CropBadge } from '@ds/patterns/parts'
import { KeyFacts, SectionHeading } from '@ds/patterns/Sections'
import { Button } from '@ds/primitives/Button'
import { FactText, resolveFacts, schemaFaq } from '@/components/FactText'
import { JsonLd } from '@/components/JsonLd'
import { Faq, PageTitle } from '@/components/PageParts'
import { BaseListBlock, LeadFormBlock } from '@/components/RenderBlocks'
import { SiteShell } from '@/components/SiteShell'
import { isLocale, localePath } from '@/i18n/config'
import { ui } from '@/i18n/ui'
import { getFigures, getSeoDefaults } from '@/lib/content/globals'
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
  `Cumpărăm ${lower} direct de la fermieri: recepție în bazele Agrinvest, analiza calității, transport cu flota proprie și ofertă rapidă.`

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
  const [hub, figures, crops] = await Promise.all([
    getPage('/cereale', locale).then((p) => p?.page),
    getFigures(locale),
    listCrops(locale),
  ])
  const title = `Vinde ${lower} la Agrinvest`
  const crumbs = [
    ...(hub ? [{ name: hub.title, url: localePath('/cereale', locale) }] : []),
    { name: crop.name, url: localePath(path, locale) },
  ]
  const intro = crop.intro || descriptionOf(lower)
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
  const faq = schemaFaq(crop.faq, figures)

  return (
    <SiteShell locale={locale} alternates={alternates}>
      <JsonLd
        data={[
          webPage({
            url: localePath(path, locale),
            name: title,
            description: resolveFacts(intro, figures).text,
            locale,
            dateModified: crop.updatedAt,
          }),
          breadcrumbs(locale, t.home, crumbs),
          ...(faq.length ? [faqPage(faq)] : []),
        ]}
      />
      <PageTitle
        locale={locale}
        title={title}
        summary={<FactText text={intro} figures={figures} locale={locale} />}
        updatedAt={crop.updatedAt}
        crumbs={crumbs}
        actions={
          <>
            <Button href="#cerere" icon={<ArrowRightIcon />}>
              Cere o ofertă
            </Button>
            <Button href="#baze" variant="secondary">
              Vezi bazele
            </Button>
          </>
        }
        aside={
          <KeyFacts
            items={[
              {
                icon: 'coins',
                label: t.payment,
                value: <FactText text="{{C8}}" figures={figures} locale={locale} />,
              },
              { icon: 'truck', label: t.deliver, value: t.deliverValue },
              ...standards.map((s) => ({ icon: 'drop' as const, ...s })),
            ]}
          />
        }
      />
      <div className="mt-16 grid gap-20 md:mt-24 md:gap-28">
        <BaseListBlock
          block={{ showMap: true }}
          ctx={{ locale }}
          head={
            <SectionHeading
              kicker={t.bases}
              title={`Unde livrezi ${lower}`}
              lead="Alege baza cea mai apropiată de fermă. Fiecare bază are pagina ei, cu serviciile și capacitatea."
              className="mb-10 md:mb-12"
            />
          }
        />
        <LeadFormBlock
          block={{
            leadType: 'vanzare-cereale',
            extraFields: ['county', 'crop', 'base'],
            heading: `Cere o ofertă pentru ${lower}`,
            body: 'Spune-ne cantitatea și unde se află marfa. Te sună reprezentantul din zona ta.',
          }}
          preset={{ crop: String(crop.id) }}
          locale={locale}
          path={path}
        />
        <section className="mx-auto w-full max-w-page px-4 md:px-8">
          <SectionHeading
            kicker={t.crops}
            title="Alte culturi pe care le cumpărăm"
            className="mb-8"
          />
          <ul className="flex flex-wrap gap-3">
            {crops
              .filter((c) => c.id !== crop.id)
              .map((c) => (
                <li key={c.id}>
                  <Link
                    href={localePath(`/cereale/${c.slug}`, locale)}
                    className="flex items-center gap-3 rounded-lg bg-raised py-2 pr-4 pl-2 font-semibold text-ink no-underline shadow-soft ring-1 ring-line hover:ring-accent"
                  >
                    <CropBadge crop={c.key} size="sm" />
                    {c.name}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </div>
      <Faq locale={locale} items={crop.faq} />
    </SiteShell>
  )
}
