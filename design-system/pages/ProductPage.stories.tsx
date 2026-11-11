import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { Locale } from '@/i18n/config'
import { fillSlots, shopUi } from '@/i18n/shop'
import type { QuickAddState } from '@/lib/commerce/state'
import { formatQuantity } from '@/lib/format'
import type { QuickRequestState } from '@/lib/leads/state'
import type { PackOption } from '@/lib/shop/dose'

import { cardLabels, sampleCards } from '../fixtures/shop'
import { headerProps } from '../fixtures/props'
import { storyLocale } from '../fixtures/story'
import { BuyForm, type BuyPack } from '../patterns/BuyForm'
import { OrderNotice } from '../patterns/Commerce'
import { DoseCalculator, type CalcUse } from '../patterns/DoseCalculator'
import { FinanceHint } from '../patterns/Finance'
import { ProductCard } from '../patterns/ProductCard'
import {
  BuyBox,
  DocumentTiles,
  DoseUseCards,
  FoldedText,
  HelpBand,
  KeyFacts,
  PackSummary,
  ProductLayout,
  ProductMedia,
  ProductSection,
  ProductShelf,
  ProductTabs,
  SafetyPanel,
  SpecGroups,
  Spectrum,
  type DoseUse,
  type KeyFact,
  type MediaBadge,
} from '../patterns/ProductDetail'
import { QuickRequest } from '../patterns/QuickRequest'
import { Accordion, Breadcrumbs, Updated } from '../patterns/Sections'
import { SiteHeader } from '../patterns/SiteHeader'

/**
 * The product page (Phase 7c.4): gallery with zoom and badges, the buy box (sticky from `lg`),
 * the dose calculator, the anchored tab bar and its sections, then the shelves and the help
 * band. Doses, prices, hazard data and documents here are SAMPLE data for the design review,
 * not label data: the real page shows only what the label or register gives.
 */
const meta: Meta = {
  title: 'Pages/Product',
  parameters: { layout: 'fullscreen', nextjs: { appDirectory: true } },
}
export default meta
type Story = StoryObj

const l = (locale: Locale, ro: string, en: string) => (locale === 'ro' ? ro : en)

const later =
  <T,>(result: T) =>
  async (): Promise<T> =>
    new Promise((r) => setTimeout(() => r(result), 400))

type Variant = 'protection' | 'foliar' | 'blocked' | 'seed'

type Sample = {
  name: string
  brand: string
  category: { ro: string; en: string; slug: string }
  summary: { ro: string; en: string }
  images: string[]
  packs: BuyPack[]
  facts: (locale: Locale) => KeyFact[]
  uses: (locale: Locale) => (DoseUse & { calc: Omit<CalcUse, 'id' | 'label'> })[]
  spectrum?: (locale: Locale) => { kind: 'weed' | 'disease' | 'pest'; items: string[] }[]
  specs: (
    locale: Locale,
  ) => { group: keyof (typeof shopUi)['ro']['product']['specGroups']; rows: [string, string][] }[]
  safety?: 'warning' | 'danger'
  professional?: boolean
}

const crop = (locale: Locale, ro: string, en: string) => l(locale, ro, en)

const samples: Record<Variant, Sample> = {
  protection: {
    name: 'Lamdex Extra',
    brand: 'Adama',
    category: { ro: 'Insecticide', en: 'Insecticides', slug: 'insecticide' },
    summary: {
      ro: 'Insecticid de contact și ingestie pe bază de lambda-cihalotrin, pentru dăunătorii din cereale, rapiță și porumb. Acționează rapid, din prima zi după aplicare.',
      en: 'Contact and ingestion insecticide based on lambda-cyhalothrin, for pests in cereals, rapeseed and maize. It acts fast, from the first day after spraying.',
    },
    images: ['/products/lamdex-extra-5-kg-1.png', '/products/lamdex-extra-1-kg-1.jpg'],
    packs: [
      {
        sku: 'AGR-35439',
        label: '1 kg',
        price: 178.5,
        unitPrice: '178,5 lei/kg',
        stock: 'in-stock',
      },
      { sku: 'AGR-35455', label: '5 kg', price: 862, unitPrice: '172,4 lei/kg', stock: 'in-stock' },
    ],
    facts: (locale) => [
      {
        label: l(locale, 'Lambda-cihalotrin 25 g/kg', 'Lambda-cyhalothrin 25 g/kg'),
        href: '#',
        strong: true,
      },
      { label: 'WG' },
      { label: 'IRAC 3A' },
      { label: l(locale, 'Pauză 30 zile', 'PHI 30 days') },
      { label: crop(locale, 'Grâu', 'Wheat'), href: '#' },
      { label: crop(locale, 'Rapiță', 'Rapeseed'), href: '#' },
      { label: crop(locale, 'Porumb', 'Maize'), href: '#' },
      {
        label: '+2',
        href: '#doze',
        title: l(locale, 'Orz, floarea-soarelui', 'Barley, sunflower'),
      },
    ],
    uses: (locale) => [
      {
        key: 'wheat',
        crop: crop(locale, 'Grâu, orz', 'Wheat, barley'),
        timing: l(locale, 'De la înspicare', 'From heading'),
        bbch: 'BBCH 51–69',
        dose: '0,15–0,3 kg/ha',
        water: '200–400 l/ha',
        phi: l(locale, '30 de zile', '30 days'),
        maxTreatments: l(locale, '2 tratamente', '2 treatments'),
        targets: [
          l(locale, 'Ploșnița cerealelor', 'Sunn pest'),
          l(locale, 'Gândacul ovăzului', 'Cereal leaf beetle'),
          l(locale, 'Afide', 'Aphids'),
          l(locale, 'Tripși', 'Thrips'),
          l(locale, 'Muștele cerealelor', 'Cereal flies'),
          l(locale, 'Viespea grâului', 'Wheat sawfly'),
          l(locale, 'Cicade', 'Leafhoppers'),
          l(locale, 'Gândacul ghebos', 'Cereal ground beetle'),
        ].map((label) => ({ label, href: '#' })),
        calc: {
          doseText: '0,15–0,3 kg/ha',
          min: 0.15,
          max: 0.3,
          unit: 'kg/ha',
          water: '200–400 l/ha',
        },
      },
      {
        key: 'rape',
        crop: crop(locale, 'Rapiță', 'Rapeseed'),
        timing: l(locale, 'Butonizare', 'Green bud'),
        bbch: 'BBCH 51–59',
        dose: '0,15 kg/ha',
        water: '200–300 l/ha',
        phi: l(locale, '45 de zile', '45 days'),
        maxTreatments: l(locale, '1 tratament', '1 treatment'),
        targets: [
          l(locale, 'Gândacul lucios', 'Pollen beetle'),
          l(locale, 'Gărgărița tulpinilor', 'Stem weevil'),
          l(locale, 'Puricii cruciferelor', 'Flea beetles'),
        ].map((label) => ({ label })),
        calc: {
          doseText: '0,15 kg/ha',
          min: 0.15,
          max: 0.15,
          unit: 'kg/ha',
          water: '200–300 l/ha',
        },
      },
      {
        key: 'maize',
        crop: crop(locale, 'Porumb', 'Maize'),
        timing: l(locale, 'La apariția dăunătorului', 'When the pest appears'),
        dose: l(locale, 'conform etichetei', 'as per label'),
        notes: l(
          locale,
          'Doza depinde de dăunător; eticheta nu o dă ca număr.',
          'The dose depends on the pest; the label does not give it as a number.',
        ),
        calc: { doseText: l(locale, 'conform etichetei, după dăunător', 'as per label, by pest') },
      },
    ],
    spectrum: (locale) => [
      {
        kind: 'pest',
        items: [
          l(locale, 'Ploșnița cerealelor', 'Sunn pest'),
          l(locale, 'Gândacul ovăzului', 'Cereal leaf beetle'),
          l(locale, 'Afide', 'Aphids'),
          l(locale, 'Tripși', 'Thrips'),
          l(locale, 'Gândacul lucios', 'Pollen beetle'),
          l(locale, 'Puricii cruciferelor', 'Flea beetles'),
          l(locale, 'Viermele vestic al rădăcinilor', 'Western corn rootworm'),
        ],
      },
    ],
    specs: (locale) => [
      {
        group: 'identity',
        rows: [
          [l(locale, 'Producător', 'Manufacturer'), 'Adama'],
          [l(locale, 'Tip', 'Type'), l(locale, 'Insecticid', 'Insecticide')],
          [
            l(locale, 'Substanțe active', 'Active ingredients'),
            l(locale, 'Lambda-cihalotrin 25 g/kg', 'Lambda-cyhalothrin 25 g/kg'),
          ],
        ],
      },
      {
        group: 'formulation',
        rows: [
          [
            l(locale, 'Formulare', 'Formulation'),
            l(locale, 'WG (granule dispersabile în apă)', 'WG (water-dispersible granules)'),
          ],
          [
            l(locale, 'Compatibilitate', 'Compatibility'),
            l(locale, 'Miscibil cu majoritatea fungicidelor', 'Mixes with most fungicides'),
          ],
        ],
      },
      {
        group: 'action',
        rows: [
          [
            l(locale, 'Mod de acțiune', 'Mode of action'),
            l(
              locale,
              'Contact și ingestie, efect de șoc',
              'Contact and ingestion, knock-down effect',
            ),
          ],
          [l(locale, 'Grupă de rezistență', 'Resistance group'), 'IRAC 3A'],
        ],
      },
      {
        group: 'registration',
        rows: [
          [l(locale, 'Număr de omologare', 'Registration number'), '0000/12.03.2019'],
          [
            l(locale, 'Omologare valabilă până la', 'Registration valid until'),
            l(locale, '31 decembrie 2027', '31 December 2027'),
          ],
          [l(locale, 'Utilizare', 'Use'), l(locale, 'Uz profesional', 'Professional use')],
        ],
      },
    ],
    safety: 'warning',
    professional: true,
  },
  foliar: {
    name: 'Amino',
    brand: 'Naturalis',
    category: {
      ro: 'Fertilizanți foliari',
      en: 'Foliar fertilisers',
      slug: 'fertilizanti-foliare',
    },
    summary: {
      ro: 'Biostimulator cu aminoacizi liberi pentru toate culturile, aplicat foliar sau prin fertirigare, în perioadele de stres.',
      en: 'Biostimulant with free amino acids for all crops, applied as a foliar spray or by fertigation in stress periods.',
    },
    images: ['/products/amino-1.png', '/products/amino-20l-1.png'],
    packs: [
      { sku: 'AGR-34423', label: '1 l', price: 99, unitPrice: '99 lei/l', stock: 'in-stock' },
      { sku: 'AGR-34438', label: '20 l', price: 1580, unitPrice: '79 lei/l', stock: 'in-stock' },
    ],
    facts: (locale) => [
      { label: l(locale, 'Aminoacizi liberi', 'Free amino acids'), strong: true },
      { label: 'N 5%' },
      { label: l(locale, 'Lichid', 'Liquid') },
      { label: l(locale, 'Toate culturile', 'All crops') },
    ],
    uses: (locale) => [
      {
        key: 'foliar',
        crop: l(locale, 'Toate culturile, foliar', 'All crops, foliar'),
        timing: l(locale, 'În perioadele de stres', 'In stress periods'),
        dose: '2 l/ha',
        water: '200–400 l/ha',
        calc: { doseText: '2 l/ha', min: 2, max: 2, unit: 'l/ha', water: '200–400 l/ha' },
      },
      {
        key: 'fert',
        crop: l(locale, 'Toate culturile, fertirigare', 'All crops, fertigation'),
        timing: l(locale, 'De 2–3 ori pe sezon', '2–3 times a season'),
        dose: '7–15 l/ha',
        calc: { doseText: '7–15 l/ha', min: 7, max: 15, unit: 'l/ha' },
      },
    ],
    specs: (locale) => [
      {
        group: 'nutrition',
        rows: [
          [
            l(locale, 'Compoziție', 'Composition'),
            l(locale, 'Aminoacizi liberi 30% · N 5%', 'Free amino acids 30% · N 5%'),
          ],
          [l(locale, 'Formă', 'Form'), l(locale, 'Lichid', 'Liquid')],
          [
            l(locale, 'Depozitare', 'Storage'),
            l(locale, 'Ferit de îngheț, între 5 și 30 °C', 'Frost-free, between 5 and 30 °C'),
          ],
        ],
      },
    ],
  },
  blocked: {
    name: l('ro', 'Insecticid (GHS06)', 'Insecticide (GHS06)'),
    brand: 'FMC',
    category: { ro: 'Insecticide', en: 'Insecticides', slug: 'insecticide' },
    summary: {
      ro: 'Insecticid cu toxicitate acută ridicată. Conform OUG 53/2025, se vinde doar prin consultant, nu online.',
      en: 'Insecticide with high acute toxicity. Under OUG 53/2025 it is sold through a consultant only, not online.',
    },
    images: [],
    packs: [{ sku: 'X-1', label: '5 l', price: 410, unitPrice: '82 lei/l', stock: 'in-stock' }],
    facts: (locale) => [
      { label: l(locale, 'Clorpirifos 480 g/l', 'Chlorpyrifos 480 g/l'), strong: true },
      { label: 'EC' },
      { label: l(locale, 'Pauză 21 zile', 'PHI 21 days') },
      { label: crop(locale, 'Floarea-soarelui', 'Sunflower'), href: '#' },
    ],
    uses: (locale) => [
      {
        key: 'sun',
        crop: crop(locale, 'Floarea-soarelui', 'Sunflower'),
        timing: 'BBCH 14–18',
        dose: '1 l/ha',
        water: '300 l/ha',
        phi: l(locale, '21 de zile', '21 days'),
        calc: { doseText: '1 l/ha', min: 1, max: 1, unit: 'l/ha', water: '300 l/ha' },
      },
    ],
    specs: (locale) => [
      {
        group: 'identity',
        rows: [
          [l(locale, 'Producător', 'Manufacturer'), 'FMC'],
          [l(locale, 'Formulare', 'Formulation'), 'EC'],
        ],
      },
    ],
    safety: 'danger',
    professional: true,
  },
  seed: {
    name: 'Grâu Avenue C1',
    brand: 'Limagrain',
    category: { ro: 'Semințe de grâu', en: 'Wheat seed', slug: 'seminte-grau' },
    summary: {
      ro: 'Soi de grâu de toamnă semitimpuriu, cu toleranță bună la iernare și calitate de panificație.',
      en: 'Mid-early winter wheat with good winter hardiness and bread-making quality.',
    },
    images: ['/products/samanta-grau-avenue-c1-800-kg-1.webp'],
    packs: [
      { sku: 'S-800', label: '800 kg', price: null, stock: 'on-request' },
      { sku: 'S-25', label: '25 kg', price: null, stock: 'on-request' },
    ],
    facts: (locale) => [
      { label: l(locale, 'Grâu de toamnă', 'Winter wheat'), strong: true },
      { label: 'C1' },
      { label: l(locale, 'Semitimpuriu', 'Mid-early') },
    ],
    uses: (locale) => [
      {
        key: 'sow',
        crop: l(locale, 'Semănat de toamnă', 'Autumn sowing'),
        dose: '200–220 kg/ha',
        timing: l(locale, '1–20 octombrie', '1–20 October'),
        calc: { doseText: '200–220 kg/ha', min: 200, max: 220, unit: 'kg/ha' },
      },
    ],
    specs: (locale) => [
      {
        group: 'seed',
        rows: [
          [
            l(locale, 'Specie', 'Species'),
            l(locale, 'Grâu comun de toamnă', 'Common winter wheat'),
          ],
          [l(locale, 'Soi sau hibrid', 'Variety or hybrid'), 'Avenue'],
          [l(locale, 'Maturitate', 'Maturity'), l(locale, 'Semitimpuriu', 'Mid-early')],
          [l(locale, 'Semințe la hectar', 'Seeds per hectare'), '200–220 kg/ha'],
        ],
      },
    ],
  },
}

const ghsLabels = {
  ro: {
    GHS06: 'GHS06: toxicitate acută',
    GHS07: 'GHS07: iritant, nociv',
    GHS08: 'GHS08: pericol pentru sănătate',
    GHS09: 'GHS09: periculos pentru mediu',
  },
  en: {
    GHS06: 'GHS06: acute toxicity',
    GHS07: 'GHS07: irritant, harmful',
    GHS08: 'GHS08: health hazard',
    GHS09: 'GHS09: hazardous to the environment',
  },
} as const

function Product({
  locale,
  variant,
  zoom,
  bar,
  plainSafety,
}: {
  locale: Locale
  variant: Variant
  zoom?: boolean
  bar?: boolean
  /** The safety text only, as products show until the hazard fields are filled. */
  plainSafety?: boolean
}) {
  const t = shopUi[locale]
  const P = t.product
  const s = samples[variant]
  const base = l(locale, '/magazin', '/en/shop')
  const cart = l(locale, '/cos', '/en/cart')
  const privacy = l(locale, '/confidentialitate', '/en/privacy')
  const blocked = variant === 'blocked'
  const onRequest = s.packs.every((p) => p.price == null)
  const name =
    variant === 'blocked' ? l(locale, 'Insecticid (GHS06)', 'Insecticide (GHS06)') : s.name
  const uses = s.uses(locale)
  const images = s.images.map((url, i) => ({ url, alt: `${name} ${i + 1}` }))
  const stock = s.packs.some((p) => p.stock === 'in-stock')
  const badges: MediaBadge[] = [
    ...(s.professional ? [{ label: P.professional, tone: 'forest' as const }] : []),
    stock
      ? { label: t.inStock, tone: 'accent' as const }
      : { label: t.onRequest, tone: 'warning' as const },
  ]
  const mark = (
    <span className="ml-1.5 inline-block rounded-sm bg-warning-soft px-1.5 align-middle text-caption font-medium text-warning">
      {l(locale, 'de confirmat', 'to confirm')}
    </span>
  )
  const crumbs = [
    { name: l(locale, 'Acasă', 'Home'), url: l(locale, '/', '/en') },
    { name: t.shop, url: base },
    { name: s.category[locale], url: `${base}/${s.category.slug}` },
    { name, url: `${base}/${s.category.slug}/x` },
  ]
  const request = (label: string, submit: string) => (
    <QuickRequest
      locale={locale}
      layout="inline"
      sourcePath={`${base}/${s.category.slug}/x`}
      privacyHref={privacy}
      action={later<QuickRequestState>({ status: 'success', contact: 'phone' })}
      label={label}
      submitLabel={submit}
    />
  )
  const calcUses: CalcUse[] = uses.map((u) => ({
    id: u.key,
    label: [u.crop, u.bbch ?? u.timing].filter(Boolean).join(' · '),
    ...u.calc,
  }))
  const calcPacks: PackOption[] = s.packs.map((p) => ({
    sku: p.sku,
    size: Number(p.label.split(' ')[0]),
    unit: p.label.split(' ')[1],
    price: p.price,
    stock: p.stock,
  }))
  const specs = s.specs(locale)
  const spectrum = s.spectrum?.(locale)
  const tabs = [
    { id: 'doze', label: P.tab.doses },
    { id: 'date-tehnice', label: P.tab.specs },
    ...(spectrum ? [{ id: 'spectru', label: P.tab.spectrum }] : []),
    ...(s.safety ? [{ id: 'siguranta', label: P.tab.safety }] : []),
    { id: 'documente', label: P.tab.documents },
    { id: 'descriere', label: P.tab.description },
    { id: 'intrebari', label: P.tab.faq },
  ]
  const cards = sampleCards(locale)

  const form =
    blocked || onRequest ? (
      <PackSummary
        label={P.packs}
        packs={s.packs.map((p) => ({
          key: p.sku,
          pack: p.label,
          price:
            p.price != null ? (
              formatQuantity(p.price, 'lei', locale)
            ) : (
              <span className="text-small">{P.onRequest}</span>
            ),
          unitPrice: p.unitPrice,
        }))}
      />
    ) : (
      <BuyForm
        locale={locale}
        name={name}
        packs={s.packs}
        cartHref={cart}
        action={later<QuickAddState>({ status: 'added', count: 2 })}
        priceMark={mark}
        barVisible={bar}
        labels={{
          packs: P.packs,
          quantity: P.quantity,
          decrease: P.decrease,
          increase: P.increase,
          lineTotal: P.lineTotal,
          add: P.add,
          adding: P.adding,
          added: P.added,
          viewCart: P.viewCart,
          failed: P.failed,
          unavailable: P.unavailable,
          onRequest: P.onRequest,
          inStock: t.inStock,
          stockOnRequest: t.onRequest,
        }}
      />
    )

  return (
    <div className="min-h-screen overflow-x-clip bg-paper pb-24 text-ink">
      <SiteHeader {...headerProps(locale)} />
      <main className="grid gap-20 md:gap-24">
        <ProductLayout
          breadcrumbs={
            <Breadcrumbs label={l(locale, 'Ești aici', 'You are here')} items={crumbs} />
          }
          gallery={
            <ProductMedia
              id="galerie"
              images={images}
              badges={badges}
              labels={{
                photos: P.photos,
                zoom: P.zoom,
                close: P.close,
                prev: P.prev,
                next: P.next,
                photo: (n, total) => fillSlots(P.photo, { n, total }),
              }}
              zoomOpen={zoom ? 0 : undefined}
            />
          }
          buy={
            <BuyBox
              brand={{ name: s.brand, href: '#' }}
              title={name}
              summary={s.summary[locale]}
              facts={<KeyFacts label={P.facts} items={s.facts(locale)} />}
              notice={
                blocked && (
                  <OrderNotice
                    title={l(locale, 'Nu se poate comanda online', 'Cannot be ordered online')}
                  >
                    {l(
                      locale,
                      'Produsele cu pictograma GHS06 (toxicitate acută) se vând doar prin consultant, conform OUG 53/2025.',
                      'Products with the GHS06 pictogram (acute toxicity) are sold through a consultant only, under OUG 53/2025.',
                    )}
                  </OrderNotice>
                )
              }
              form={form}
              calcLink={{ href: '#calculator', label: P.calcLink }}
              request={
                blocked || onRequest
                  ? request(
                      blocked ? P.blockedLabel : t.card.requestLabel,
                      blocked ? P.bulkSubmit : t.card.request,
                    )
                  : request(P.bulkLabel, P.bulkSubmit)
              }
              notes={
                <>
                  {variant !== 'blocked' && (
                    <FinanceHint
                      text={l(
                        locale,
                        'Poți plăti inputurile la recoltă, prin Agrinvest Credit IFN.',
                        'You can pay for inputs at harvest, through Agrinvest Credit IFN.',
                      )}
                      link={{ href: '#', label: l(locale, 'Vezi cum', 'See how') }}
                    />
                  )}
                  <p>{t.priceNote}</p>
                  <Updated
                    locale={locale}
                    label={l(locale, 'Actualizat', 'Updated')}
                    date="2026-11-10T09:00:00Z"
                  />
                </>
              }
            />
          }
        >
          <ProductTabs label={P.tabs} items={tabs} current="doze" />

          <ProductSection id="doze" title={t.doses} lead={t.doseNote}>
            <div id="calculator" className="scroll-mt-16">
              <DoseCalculator
                locale={locale}
                uses={calcUses}
                packs={calcPacks}
                cartHref={cart}
                consultHref="#cerere"
                canOrder={!blocked}
                action={later<QuickAddState>({ status: 'added', count: 2 })}
                initial={{ area: variant === 'seed' ? 25 : 40 }}
                labels={{
                  ...P.calc,
                  adding: P.adding,
                  added: P.added,
                  viewCart: P.viewCart,
                  failed: P.failed,
                }}
              />
            </div>
            <DoseUseCards
              uses={uses}
              labels={{
                ...P.doseUse,
                more: (n) => fillSlots(P.doseUse.more, { n }),
              }}
            />
          </ProductSection>

          <ProductSection id="date-tehnice" title={t.specs}>
            <SpecGroups
              groups={specs.map((g) => ({
                title: P.specGroups[g.group],
                rows: g.rows.map(([label, value]) => ({ label, value })),
              }))}
            />
          </ProductSection>

          {spectrum && (
            <ProductSection id="spectru" title={P.tab.spectrum}>
              <Spectrum
                groups={spectrum.map((g) => ({
                  kind: g.kind,
                  label: P.spectrum[g.kind],
                  items: g.items.map((label, i) => ({ label, href: i < 3 ? '#' : undefined })),
                }))}
              />
            </ProductSection>
          )}

          {s.safety && (
            <ProductSection id="siguranta" title={t.safety}>
              {plainSafety ? (
                <SafetyPanel
                  labels={P.safety}
                  fallback={l(
                    locale,
                    'Nociv în caz de înghițire. Foarte toxic pentru organismele acvatice. Poartă mănuși, ochelari și echipament de protecție la preparare și aplicare.',
                    'Harmful if swallowed. Very toxic to aquatic life. Wear gloves, goggles and protective clothing when mixing and spraying.',
                  )}
                />
              ) : (
                <SafetyPanel
                  labels={P.safety}
                  signal={{
                    label: s.safety === 'danger' ? P.safety.danger : P.safety.warning,
                    level: s.safety,
                  }}
                  pictograms={(s.safety === 'danger'
                    ? (['GHS06', 'GHS08', 'GHS09'] as const)
                    : (['GHS07', 'GHS09'] as const)
                  ).map((code) => ({ code, label: ghsLabels[locale][code] }))}
                  hazards={
                    s.safety === 'danger'
                      ? [
                          l(locale, 'H301 Toxic în caz de înghițire.', 'H301 Toxic if swallowed.'),
                          l(locale, 'H331 Toxic în caz de inhalare.', 'H331 Toxic if inhaled.'),
                          l(
                            locale,
                            'H410 Foarte toxic pentru mediul acvatic, cu efecte pe termen lung.',
                            'H410 Very toxic to aquatic life with long lasting effects.',
                          ),
                        ]
                      : [
                          l(
                            locale,
                            'H302 Nociv în caz de înghițire.',
                            'H302 Harmful if swallowed.',
                          ),
                          l(
                            locale,
                            'H410 Foarte toxic pentru mediul acvatic, cu efecte pe termen lung.',
                            'H410 Very toxic to aquatic life with long lasting effects.',
                          ),
                        ]
                  }
                  buffer={l(locale, '20 m față de apele de suprafață', '20 m from surface water')}
                />
              )}
            </ProductSection>
          )}

          <ProductSection id="documente" title={t.documents}>
            <DocumentTiles
              items={[
                {
                  href: '#',
                  title: l(locale, 'Eticheta produsului', 'Product label'),
                  meta: P.documentSize(t.documentKinds.label, '412 KB'),
                },
                {
                  href: '#a',
                  title: l(locale, 'Fișa tehnică', 'Technical sheet'),
                  meta: P.documentSize(t.documentKinds.technical, '238 KB'),
                },
                ...(s.safety
                  ? [
                      {
                        href: '#b',
                        title: l(locale, 'Fișa cu date de securitate', 'Safety data sheet'),
                        meta: P.documentSize(t.documentKinds.safety, '1,2 MB'),
                      },
                    ]
                  : []),
              ]}
            />
          </ProductSection>

          <ProductSection id="descriere" title={t.about}>
            <FoldedText labels={{ more: P.readAll, less: P.readLess }}>
              <div className="grid max-w-text gap-4 text-body text-ink">
                <p>{s.summary[locale]}</p>
                <p>
                  {l(
                    locale,
                    'Textul de descriere vine din fișa importată a produsului. Curățarea textelor importate este o sarcină de conținut separată; aici se arată doar cum se pliază un text lung după aproximativ douăsprezece rânduri.',
                    'The description comes from the product’s imported sheet. Cleaning the imported texts is a separate content task; this only shows how a long text folds after about twelve lines.',
                  )}
                </p>
                <p>
                  {l(
                    locale,
                    'Al treilea paragraf continuă descrierea, cu informații despre modul de aplicare, perioada optimă și combinațiile recomandate cu alte produse din aceeași campanie de tratamente, astfel încât textul să treacă de pragul de pliere.',
                    'The third paragraph continues the description, with notes on how to apply it, the best period and the recommended mixes with other products in the same spray programme, so that the text passes the fold.',
                  )}
                </p>
                <p>
                  {l(
                    locale,
                    'Ultimul paragraf apare doar după „Citește tot”, dar este în HTML de la început.',
                    'The last paragraph shows only after “Read all”, but it is in the HTML from the start.',
                  )}
                </p>
              </div>
            </FoldedText>
          </ProductSection>

          <ProductSection id="intrebari" title={P.tab.faq}>
            <Accordion
              items={[
                {
                  question: l(
                    locale,
                    'Pot amesteca produsul cu un fungicid?',
                    'Can I mix it with a fungicide?',
                  ),
                  answer: l(
                    locale,
                    'Da, cu majoritatea fungicidelor. Fă întâi un test de compatibilitate într-un vas mic.',
                    'Yes, with most fungicides. Run a compatibility test in a small container first.',
                  ),
                },
                {
                  question: l(
                    locale,
                    'Am nevoie de certificat pentru a-l cumpăra?',
                    'Do I need a certificate to buy it?',
                  ),
                  answer: l(
                    locale,
                    'Da, pentru produsele de uz profesional ceri certificatul la comandă.',
                    'Yes, products for professional use need the certificate at checkout.',
                  ),
                },
              ]}
            />
          </ProductSection>
        </ProductLayout>

        <ProductShelf title={P.sameCategory}>
          <ul className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
            {cards.slice(0, 4).map((c) => (
              <li key={c.href}>
                <ProductCard
                  {...c}
                  locale={locale}
                  labels={cardLabels(locale)}
                  className="h-full"
                />
              </li>
            ))}
          </ul>
        </ProductShelf>

        <ProductShelf title={P.together}>
          <ul className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
            {cards.slice(4, 8).map((c) => (
              <li key={c.href}>
                <ProductCard
                  {...c}
                  locale={locale}
                  labels={cardLabels(locale)}
                  className="h-full"
                />
              </li>
            ))}
          </ul>
        </ProductShelf>

        <HelpBand
          title={P.helpTitle}
          text={P.helpText}
          request={request(P.helpLabel, P.bulkSubmit)}
        />
      </main>
    </div>
  )
}

export const Protection: Story = {
  name: 'Crop protection (two packs)',
  render: (_, { globals }) => <Product locale={storyLocale(globals)} variant="protection" />,
}

export const Foliar: Story = {
  name: 'Foliar fertiliser (no hazard label)',
  render: (_, { globals }) => <Product locale={storyLocale(globals)} variant="foliar" />,
}

export const Blocked: Story = {
  name: 'Not sold online (OUG 53/2025)',
  render: (_, { globals }) => <Product locale={storyLocale(globals)} variant="blocked" />,
}

export const Seed: Story = {
  name: 'Seed on request (no price)',
  render: (_, { globals }) => <Product locale={storyLocale(globals)} variant="seed" />,
}

export const PhoneBar: Story = {
  name: 'Phone buy bar shown',
  render: (_, { globals }) => (
    <Product locale={storyLocale(globals)} variant="protection" bar plainSafety />
  ),
}

export const Zoom: Story = {
  name: 'Gallery zoom open',
  render: (_, { globals }) => <Product locale={storyLocale(globals)} variant="protection" zoom />,
}
