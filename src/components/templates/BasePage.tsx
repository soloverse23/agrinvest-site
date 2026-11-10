import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ArrowRightIcon } from '@ds/icons/icons'
import { FinanceLinks } from '@ds/patterns/Finance'
import { KeyFacts, SectionHeading } from '@ds/patterns/Sections'
import { GrainPrices } from '@ds/patterns/widgets/GrainPrices'
import { Button } from '@ds/primitives/Button'
import { FactMark } from '@/components/Fact'
import { schemaFaq } from '@/components/FactText'
import { JsonLd } from '@/components/JsonLd'
import { Faq, PageTitle } from '@/components/PageParts'
import { BaseListBlock, LeadFormBlock } from '@/components/RenderBlocks'
import { SiteShell } from '@/components/SiteShell'
import { grainPricesProps } from '@/components/templates/PricePage'
import { pricesUi } from '@/i18n/prices'
import { grainItems } from '@/lib/prices/overview'
import { priceRange } from '@/lib/prices/grain'
import type { FactStatus } from '@/fields'
import { localePath, locales, type Locale } from '@/i18n/config'
import { financeUi } from '@/i18n/finance'
import { basePath, financePath, sections } from '@/i18n/routes'
import { fixedPaths, ui } from '@/i18n/ui'
import { financeLinks } from '@/lib/content/finance'
import { getFigures, getSeoDefaults } from '@/lib/content/globals'
import { getBase, listBases } from '@/lib/content/locations'
import { getPage, type Alternates } from '@/lib/content/pages'
import { formatQuantity } from '@/lib/format'
import { buildMetadata } from '@/lib/seo/metadata'
import { breadcrumbs, faqPage, localBusiness } from '@/lib/schema'

/**
 * One base: `/baze/{slug}` and `/en/bases/{slug}` (route files in
 * `src/app/(frontend)/[locale]/{baze,bases}/[slug]`). Today's price and the local weather
 * join the key facts in Phase 5; until then the page shows only confirmed-or-marked facts.
 */
const copy = {
  ro: {
    kicker: 'Bază de recepție și depozitare',
    title: (name: string) => `Baza Agrinvest ${name}`,
    crumb: (name: string) => `Baza ${name}`,
    seoTitle: (name: string) => `Baza ${name}: recepție și depozitare cereale`,
    description: (name: string) =>
      `Baza Agrinvest ${name}: recepție, cântărire și depozitare de cereale. Vezi capacitatea bazei, serviciile disponibile și cum ne contactezi.`,
    book: (name: string) => `Programează o livrare la ${name}`,
    bookBody:
      'Spune-ne cultura, cantitatea și când vrei să livrezi. Te contactăm cu programul bazei.',
    sell: 'Vinde cereale',
    others: 'Alte baze',
    othersLead: 'Toate bazele Agrinvest. Baza aceasta este marcată.',
    aboutStorage: 'Despre depozitare',
    faq: (name: string) => [
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
    ],
    services: {
      reception: 'Recepție',
      drying: 'Uscare',
      cleaning: 'Precurățare',
      weighing: 'Cântărire',
      storage: 'Depozitare',
    },
  },
  en: {
    kicker: 'Grain reception and storage base',
    title: (name: string) => `Agrinvest ${name} base`,
    crumb: (name: string) => `${name} base`,
    seoTitle: (name: string) => `${name} grain base: reception and storage`,
    description: (name: string) =>
      `The Agrinvest ${name} base: grain reception, weighing and storage in Romania. See the base capacity, its services and how to reach us.`,
    book: (name: string) => `Ask about the ${name} base`,
    bookBody:
      'Tell us the crop, the quantity and the timing. We reply with the base schedule and terms.',
    sell: 'Grain',
    others: 'Other bases',
    othersLead: 'Every Agrinvest base. This base is marked.',
    aboutStorage: 'About storage',
    faq: (name: string) => [
      {
        question: `Which crops does the ${name} base receive?`,
        answer:
          'Agrinvest buys and receives {{C7}}. Call before delivery to confirm the schedule and reception terms.',
      },
      {
        question: `When are farmers paid after delivering to ${name}?`,
        answer: 'Payment is made {{C8}}, after weighing and quality analysis.',
      },
      {
        question: 'Can Agrinvest collect grain from the farm?',
        answer: 'Yes. On request, our own trucks move the grain from the farm to the base.',
      },
    ],
    services: {
      reception: 'Reception',
      drying: 'Drying',
      cleaning: 'Cleaning',
      weighing: 'Weighing',
      storage: 'Storage',
    },
  },
}

export async function baseParams() {
  return (await listBases('ro')).map((b) => ({ slug: b.slug }))
}

async function resolve(locale: Locale, slug: string) {
  const base = await getBase(slug, locale)
  if (!base) return null
  // The base slug is shared, so every base exists in both languages.
  const alternates: Alternates = Object.fromEntries(locales.map((l) => [l, basePath(base.slug, l)]))
  return { base, alternates }
}

export async function baseMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const found = await resolve(locale, slug)
  if (!found) return {}
  const { base, alternates } = found
  const t = copy[locale]
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: base.name,
    seoTitle: base.seo?.title || t.seoTitle(base.name),
    description: base.seo?.description || t.description(base.name),
    siteName: seo.siteName,
    image: base.seo?.image ?? seo.ogImage,
    noindex: base.seo?.noindex,
    alternates,
  })
}

export async function BasePage({ locale, slug }: { locale: Locale; slug: string }) {
  const found = await resolve(locale, slug)
  if (!found) notFound()
  const { base, alternates } = found
  const t = copy[locale]
  const u = ui[locale]
  const path = basePath(base.slug, locale)
  const storage = fixedPaths.storage[locale]
  const [parent, figures, finance, prices] = await Promise.all([
    getPage(storage, locale).then((p) => p?.page),
    getFigures(locale),
    financeLinks(['finantare-stocuri'], locale),
    grainPricesProps(locale, pricesUi[locale].base.title(base.name)),
  ])
  // This base's own prices: a row for this base, or one that applies at every base.
  const here = prices.overview.map((c) => {
    const rows = c.bases.filter((r) => !r.base || r.base.id === base.id)
    return { ...c, range: priceRange(rows) }
  })
  const f = financeUi[locale].crossSell
  // Stock financing, and the IFN's general contact until regional advisors are named (4.5).
  const financeItems = [
    finance['finantare-stocuri'] && { ...finance['finantare-stocuri'], body: f.stock },
    { href: `${financePath(locale)}#cerere`, title: f.talk, body: f.talkBody },
  ].filter((x) => !!x)
  const crumbs = [
    ...(parent ? [{ name: parent.title, url: localePath(storage, locale) }] : []),
    { name: t.crumb(base.name), url: path },
  ]
  const county = typeof base.county === 'object' && base.county ? base.county : null
  const mark = (status: FactStatus | null | undefined, key: string) => (
    <FactMark
      figure={{ key, label: key, value: '', status: status ?? 'to-confirm' }}
      locale={locale}
    />
  )
  const faq = [...(base.faq ?? []), ...t.faq(base.name)]
  const structuredFaq = schemaFaq(faq, figures)
  const facts = [
    base.capacity != null && {
      icon: 'silo' as const,
      label: u.capacity,
      value: (
        <>
          {formatQuantity(base.capacity, 't', locale)}
          {mark(base.capacityStatus, `base:${base.slug}:capacity`)}
        </>
      ),
    },
    county && {
      icon: 'pin' as const,
      label: u.county,
      value: (
        <>
          {county.name}
          {mark(base.locationStatus, `base:${base.slug}:location`)}
        </>
      ),
    },
    !!base.services?.length && {
      icon: 'scale' as const,
      label: u.services,
      value: (
        <>
          {base.services.map((s) => t.services[s] ?? s).join(', ')}
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
          breadcrumbs(locale, u.home, crumbs),
          ...(structuredFaq.length ? [faqPage(structuredFaq)] : []),
        ]}
      />
      <PageTitle
        locale={locale}
        kicker={t.kicker}
        title={t.title(base.name)}
        summary={base.intro || t.description(base.name)}
        updatedAt={base.updatedAt}
        crumbs={crumbs}
        actions={
          <>
            <Button href="#cerere" icon={<ArrowRightIcon />}>
              {t.book(base.name)}
            </Button>
            <Button href={localePath(fixedPaths.grain[locale], locale)} variant="secondary">
              {t.sell}
            </Button>
          </>
        }
        aside={facts.length ? <KeyFacts items={facts} /> : undefined}
      />
      <div className="mt-16 grid gap-20 md:mt-24 md:gap-28">
        <section className="mx-auto w-full max-w-page px-4 md:px-8">
          <div className="max-w-2xl">
            <GrainPrices {...prices.props} items={grainItems(here)} level={2} />
          </div>
        </section>
        <LeadFormBlock
          block={{
            leadType: 'depozitare',
            extraFields: ['crop', 'base'],
            heading: t.book(base.name),
            body: t.bookBody,
          }}
          preset={{ base: String(base.id) }}
          locale={locale}
          path={`${sections.bases[locale]}/${base.slug}`}
        />
        <FinanceLinks kicker={f.cropKicker} title={f.baseTitle} items={financeItems} />
        <BaseListBlock
          block={{ showMap: true }}
          ctx={{ locale }}
          current={path}
          head={
            <SectionHeading
              kicker={u.bases}
              title={t.others}
              lead={t.othersLead}
              action={{ href: localePath(storage, locale), label: t.aboutStorage }}
              className="mb-10 md:mb-12"
            />
          }
        />
      </div>
      <Faq locale={locale} items={faq} />
    </SiteShell>
  )
}
