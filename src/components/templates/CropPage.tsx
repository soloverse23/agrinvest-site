import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArrowRightIcon } from '@ds/icons/icons'
import { FinanceLinks } from '@ds/patterns/Finance'
import { CropBadge } from '@ds/patterns/parts'
import { KeyFacts, SectionHeading } from '@ds/patterns/Sections'
import { Button } from '@ds/primitives/Button'
import { FactText, resolveFacts, schemaFaq } from '@/components/FactText'
import { JsonLd } from '@/components/JsonLd'
import { Faq, PageTitle } from '@/components/PageParts'
import { BaseListBlock, LeadFormBlock } from '@/components/RenderBlocks'
import { SiteShell } from '@/components/SiteShell'
import { localePath, type Locale } from '@/i18n/config'
import { financeUi } from '@/i18n/finance'
import { cropPath, sections } from '@/i18n/routes'
import { fixedPaths, ui } from '@/i18n/ui'
import { financeLinks } from '@/lib/content/finance'
import { getFigures, getSeoDefaults } from '@/lib/content/globals'
import { getCrop, listCrops } from '@/lib/content/locations'
import { isGrainKey } from '@/lib/crops'
import { getPage, type Alternates } from '@/lib/content/pages'
import { formatNumber } from '@/lib/format'
import { buildMetadata } from '@/lib/seo/metadata'
import { breadcrumbs, faqPage, webPage } from '@/lib/schema'

/**
 * One crop: `/cereale/{crop}` and `/en/grain/{crop}` (route files in
 * `src/app/(frontend)/[locale]/{cereale,grain}/[crop]`). Same structure in both languages.
 */
const copy = {
  ro: {
    title: (crop: string) => `Vinde ${crop} la Agrinvest`,
    seoTitle: (crop: string) => `Vinde ${crop} la Agrinvest: recepție și transport`,
    description: (crop: string) =>
      `Cumpărăm ${crop} direct de la fermieri: recepție în bazele Agrinvest, analiza calității, transport cu flota proprie și ofertă rapidă.`,
    offer: 'Cere o ofertă',
    seeBases: 'Vezi bazele',
    where: (crop: string) => `Unde livrezi ${crop}`,
    whereLead:
      'Alege baza cea mai apropiată de fermă. Fiecare bază are pagina ei, cu serviciile și capacitatea.',
    form: (crop: string) => `Cere o ofertă pentru ${crop}`,
    formBody: 'Spune-ne cantitatea și unde se află marfa. Te sună reprezentantul din zona ta.',
    others: 'Alte culturi pe care le cumpărăm',
  },
  en: {
    title: (crop: string) => `Romanian ${crop} from Agrinvest`,
    seoTitle: (crop: string) => `Romanian ${crop}: buying, storage and supply`,
    description: (crop: string) =>
      `Agrinvest buys ${crop} directly from Romanian farmers, receives it at its own bases, checks its quality and moves it with its own fleet.`,
    offer: 'Send an enquiry',
    seeBases: 'See the bases',
    where: (crop: string) => `Where ${crop} is received`,
    whereLead:
      'Our bases receive, check and store grain across southern and eastern Romania. Each base has its own page.',
    form: (crop: string) => `Ask about ${crop}`,
    formBody:
      'Tell us the quantity and timing you need, or what you want to sell. The right person replies.',
    others: 'Other crops we trade',
  },
}

export async function cropParams(locale: Locale) {
  return (await listCrops(locale)).map((c) => ({ crop: c.slug }))
}

async function resolve(locale: Locale, slug: string) {
  const crop = await getCrop(slug, locale)
  if (!crop) return null
  // The same crop in the other language (crop slugs are translated).
  const other: Locale = locale === 'ro' ? 'en' : 'ro'
  const twin = (await listCrops(other)).find((c) => c.id === crop.id)
  const alternates: Alternates = {
    [locale]: cropPath(crop.slug, locale),
    ...(twin ? { [other]: cropPath(twin.slug, other) } : {}),
  }
  const lower = crop.name.toLocaleLowerCase(locale)
  return { crop, alternates, lower }
}

export async function cropMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const found = await resolve(locale, slug)
  if (!found) return {}
  const { crop, alternates, lower } = found
  const t = copy[locale]
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: crop.name,
    seoTitle: crop.seo?.title || t.seoTitle(lower),
    description: crop.seo?.description || t.description(lower),
    siteName: seo.siteName,
    image: crop.seo?.image ?? seo.ogImage,
    noindex: crop.seo?.noindex,
    alternates,
  })
}

export async function CropPage({ locale, slug }: { locale: Locale; slug: string }) {
  const found = await resolve(locale, slug)
  if (!found) notFound()
  const { crop, alternates, lower } = found
  const t = copy[locale]
  const u = ui[locale]
  const path = cropPath(crop.slug, locale)
  const [hub, figures, crops, finance] = await Promise.all([
    getPage(fixedPaths.grain[locale], locale).then((p) => p?.page),
    getFigures(locale),
    listCrops(locale),
    financeLinks(['finantare-stocuri', 'credit-contracte-cereale'], locale),
  ])
  const f = financeUi[locale].crossSell
  // Until the Phase 5 price tool exists: stock financing and contract credit (4.5).
  const financeItems = [
    finance['finantare-stocuri'] && { ...finance['finantare-stocuri'], body: f.stock },
    finance['credit-contracte-cereale'] && {
      ...finance['credit-contracte-cereale'],
      body: f.contract,
    },
  ].filter((x) => !!x)
  const title = t.title(lower)
  const crumbs = [
    ...(hub ? [{ name: hub.title, url: localePath(fixedPaths.grain[locale], locale) }] : []),
    { name: crop.name, url: path },
  ]
  const intro = crop.intro || t.description(lower)
  const q = crop.quality
  const standards = [
    q?.moisture != null && { label: u.moisture, value: `${formatNumber(q.moisture, locale)} %` },
    q?.impurities != null && {
      label: u.impurities,
      value: `${formatNumber(q.impurities, locale)} %`,
    },
    q?.hectolitre != null && {
      label: u.hectolitre,
      value: `${formatNumber(q.hectolitre, locale)} kg/hl`,
    },
  ].filter(Boolean) as { label: string; value: string }[]
  const faq = schemaFaq(crop.faq, figures)
  // Leads store the locale-relative path (without /en), like CMS pages.
  const leadPath = `${sections.crops[locale]}/${crop.slug}`

  return (
    <SiteShell locale={locale} alternates={alternates}>
      <JsonLd
        data={[
          webPage({
            url: path,
            name: title,
            description: resolveFacts(intro, figures).text,
            locale,
            dateModified: crop.updatedAt,
          }),
          breadcrumbs(locale, u.home, crumbs),
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
              {t.offer}
            </Button>
            <Button href="#baze" variant="secondary">
              {t.seeBases}
            </Button>
          </>
        }
        aside={
          <KeyFacts
            items={[
              {
                icon: 'coins',
                label: u.payment,
                value: <FactText text="{{C8}}" figures={figures} locale={locale} />,
              },
              { icon: 'truck', label: u.deliver, value: u.deliverValue },
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
              kicker={u.bases}
              title={t.where(lower)}
              lead={t.whereLead}
              className="mb-10 md:mb-12"
            />
          }
        />
        <LeadFormBlock
          block={{
            leadType: 'vanzare-cereale',
            extraFields: ['county', 'crop', 'base'],
            heading: t.form(lower),
            body: t.formBody,
          }}
          preset={{ crop: String(crop.id) }}
          locale={locale}
          path={leadPath}
        />
        <FinanceLinks kicker={f.cropKicker} title={f.cropTitle} items={financeItems} />
        <section className="mx-auto w-full max-w-page px-4 md:px-8">
          <SectionHeading kicker={u.crops} title={t.others} className="mb-8" />
          <ul className="flex flex-wrap gap-3">
            {crops
              .filter((c) => c.id !== crop.id)
              .map((c) => (
                <li key={c.id}>
                  <Link
                    href={cropPath(c.slug, locale)}
                    className="flex items-center gap-3 rounded-lg bg-raised py-2 pr-4 pl-2 font-semibold text-ink no-underline shadow-soft ring-1 ring-line hover:ring-accent"
                  >
                    {isGrainKey(c.key) && <CropBadge crop={c.key} size="sm" />}
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
