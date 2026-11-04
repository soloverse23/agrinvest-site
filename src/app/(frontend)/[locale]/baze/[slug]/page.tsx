import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ArrowRightIcon } from '@ds/icons/icons'
import { KeyFacts, SectionHeading } from '@ds/patterns/Sections'
import { Button } from '@ds/primitives/Button'
import { FactMark } from '@/components/Fact'
import { schemaFaq } from '@/components/FactText'
import type { FactStatus } from '@/fields'
import { JsonLd } from '@/components/JsonLd'
import { Faq, PageTitle } from '@/components/PageParts'
import { BaseListBlock, LeadFormBlock } from '@/components/RenderBlocks'
import { SiteShell } from '@/components/SiteShell'
import { isLocale, localePath, type Locale } from '@/i18n/config'
import { ui } from '@/i18n/ui'
import { getFigures, getSeoDefaults } from '@/lib/content/globals'
import { getBase, listBases } from '@/lib/content/locations'
import { getPage, type Alternates } from '@/lib/content/pages'
import { formatQuantity } from '@/lib/format'
import { buildMetadata } from '@/lib/seo/metadata'
import { breadcrumbs, faqPage, localBusiness } from '@/lib/schema'

/**
 * Base pages (`/baze/{slug}`), Romanian only for now. Today's price and the local weather
 * are added in Phase 5, in the header's fact card; until then the page shows only
 * confirmed-or-marked facts.
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

/** Questions every base page answers; a base's own FAQ (Payload) comes first. */
const baseFaq = (name: string) => [
  {
    question: `Ce cereale pot livra la baza ${name}?`,
    answer:
      'Cumpărăm și recepționăm {{C7}}. Sună înainte de livrare ca să confirmi programul și condițiile de recepție.',
  },
  {
    question: `Când primesc banii după livrarea la ${name}?`,
    answer: 'Plata se face {{C8}}, după cântărire și analiza calității.',
  },
  {
    question: 'Puteți ridica marfa de la fermă?',
    answer: 'Da. Când ne ceri, transportăm cerealele cu flota proprie de la fermă la bază.',
  },
]

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
  const [parent, figures] = await Promise.all([
    getPage('/depozitare', locale).then((p) => p?.page),
    getFigures(locale),
  ])
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
  const faq = [...(base.faq ?? []), ...baseFaq(base.name)]
  const facts = [
    base.capacity != null && {
      icon: 'silo' as const,
      label: t.capacity,
      value: (
        <>
          {formatQuantity(base.capacity, 't', locale)}
          {mark(base.capacityStatus, `base:${base.slug}:capacity`)}
        </>
      ),
    },
    county && {
      icon: 'pin' as const,
      label: t.county,
      value: (
        <>
          {county.name}
          {mark(base.locationStatus, `base:${base.slug}:location`)}
        </>
      ),
    },
    !!base.services?.length && {
      icon: 'scale' as const,
      label: t.services,
      value: (
        <>
          {base.services.map((s) => serviceLabels[s]?.[locale] ?? s).join(', ')}
          {mark(base.servicesStatus, `base:${base.slug}:services`)}
        </>
      ),
    },
  ].filter(Boolean) as Parameters<typeof KeyFacts>[0]['items']

  return (
    <SiteShell locale={locale} alternates={alternates}>
      <JsonLd
        data={[
          localBusiness(base, path),
          breadcrumbs(locale, t.home, crumbs),
          ...(schemaFaq(faq, figures).length ? [faqPage(schemaFaq(faq, figures))] : []),
        ]}
      />
      <PageTitle
        locale={locale}
        kicker="Bază de recepție și depozitare"
        title={`Baza Agrinvest ${base.name}`}
        summary={base.intro || descriptionOf(base.name)}
        updatedAt={base.updatedAt}
        crumbs={crumbs}
        actions={
          <>
            <Button href="#cerere" icon={<ArrowRightIcon />}>
              {t.bookAt(base.name)}
            </Button>
            <Button href="/cereale" variant="secondary">
              Vinde cereale
            </Button>
          </>
        }
        aside={facts.length ? <KeyFacts items={facts} /> : undefined}
      />
      <div className="mt-16 grid gap-20 md:mt-24 md:gap-28">
        <LeadFormBlock
          block={{
            leadType: 'depozitare',
            extraFields: ['crop', 'base'],
            heading: t.bookAt(base.name),
            body: 'Spune-ne cultura, cantitatea și când vrei să livrezi. Te contactăm cu programul bazei.',
          }}
          preset={{ base: String(base.id) }}
          locale={locale}
          path={path}
        />
        <BaseListBlock
          block={{ showMap: true }}
          ctx={{ locale }}
          current={localePath(path, locale)}
          head={
            <SectionHeading
              kicker={t.bases}
              title={t.otherBases}
              lead="Toate bazele Agrinvest, după capacitate. Baza aceasta este marcată."
              action={{ href: '/depozitare', label: 'Despre depozitare' }}
              className="mb-10 md:mb-12"
            />
          }
        />
      </div>
      <Faq locale={locale} items={faq} />
    </SiteShell>
  )
}
