import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { Locale } from '@/i18n/config'
import { shopUi } from '@/i18n/shop'
import type { QuickRequestState } from '@/lib/leads/state'

import { headerProps } from '../fixtures/props'
import { cardLabels, sampleCards } from '../fixtures/shop'
import { storyLocale } from '../fixtures/story'
import { ProductCard } from '../patterns/ProductCard'
import { QuickRequest } from '../patterns/QuickRequest'
import { Breadcrumbs, Updated } from '../patterns/Sections'
import {
  FacetCard,
  FacetGroups,
  FilterDrawer,
  ListingEmpty,
  ListingHeader,
  ListingLayout,
  ListingToolbar,
  Pagination,
  ProductRow,
  type ActiveFilter,
  type FacetGroupV2,
  type ListingChip,
  type ListingTile,
  type SortOption,
} from '../patterns/ShopListing'
import { SiteHeader } from '../patterns/SiteHeader'

/**
 * Shop listings (Phase 7c.3): one template for category, crop, brand, active-ingredient and
 * search pages. Header with tiles or chips, toolbar (count, sort, view, active filters),
 * grouped facets, the phone drawer, grid or list, pagination and the empty state. Counts,
 * prices and doses here are sample data.
 */
const meta: Meta = {
  title: 'Pages/Shop listing',
  parameters: { layout: 'fullscreen', nextjs: { appDirectory: true } },
}
export default meta
type Story = StoryObj

const l = (locale: Locale, ro: string, en: string) => (locale === 'ro' ? ro : en)

type Variant = 'top' | 'filtered' | 'empty' | 'drawer'

const tiles = (locale: Locale): ListingTile[] => {
  const n = shopUi[locale].products
  return (
    [
      ['erbicide', 'Erbicide', 'Herbicides', 'herbicide', 14],
      ['fungicide', 'Fungicide', 'Fungicides', 'fungicide', 9],
      ['insecticide', 'Insecticide', 'Insecticides', 'insecticide', 7],
      ['tratament-samanta', 'Tratament sămânță', 'Seed treatment', 'seed-treatment', 3],
      ['adjuvanti', 'Adjuvanți', 'Adjuvants', 'adjuvant', 2],
      ['regulatori', 'Regulatori de creștere', 'Growth regulators', 'growth', 1],
    ] as const
  ).map(([slug, ro, en, icon, count]) => ({
    href: `/magazin/${slug}`,
    label: l(locale, ro, en),
    count: n(count),
    icon,
  }))
}

const siblings = (locale: Locale): ListingChip[] =>
  (
    [
      ['erbicide', 'Erbicide', 'Herbicides', 14],
      ['fungicide', 'Fungicide', 'Fungicides', 9],
      ['insecticide', 'Insecticide', 'Insecticides', 7],
      ['tratament-samanta', 'Tratament sămânță', 'Seed treatment', 3],
      ['adjuvanti', 'Adjuvanți', 'Adjuvants', 2],
    ] as const
  ).map(([slug, ro, en, count]) => ({
    href: `/magazin/${slug}`,
    label: l(locale, ro, en),
    count,
    active: slug === 'erbicide',
  }))

const facets = (locale: Locale, filtered: boolean): FacetGroupV2[] => {
  const t = shopUi[locale]
  const opts = (rows: [string, number][], active?: string) =>
    rows.map(([label, count]) => ({ label, count, href: '#', active: label === active }))
  return [
    {
      key: 'stock',
      label: t.stock,
      kind: 'toggle',
      options: opts([[t.inStockOnly, 23]], filtered ? t.inStockOnly : undefined),
    },
    {
      key: 'crop',
      label: t.crop,
      options: opts(
        [
          [l(locale, 'Porumb', 'Maize'), 12],
          [l(locale, 'Grâu', 'Wheat'), 11],
          [l(locale, 'Floarea-soarelui', 'Sunflower'), 8],
          [l(locale, 'Rapiță', 'Rapeseed'), 7],
          [l(locale, 'Orz', 'Barley'), 6],
          [l(locale, 'Soia', 'Soya'), 4],
          [l(locale, 'Sfeclă de zahăr', 'Sugar beet'), 3],
          [l(locale, 'Cartof', 'Potato'), 2],
          [l(locale, 'Lucernă', 'Lucerne'), 1],
        ],
        filtered ? l(locale, 'Porumb', 'Maize') : undefined,
      ),
    },
    {
      key: 'price',
      label: t.listing.price,
      options: opts(
        (Object.entries(t.listing.priceRanges) as [string, string][]).map(
          ([, label], i) => [label, [6, 9, 5, 3][i]] as [string, number],
        ),
      ),
    },
    {
      key: 'brand',
      label: t.brand,
      options: opts([
        ['Bayer', 6],
        ['Syngenta', 5],
        ['Adama', 4],
        ['Corteva', 3],
        ['BASF', 3],
        ['FMC', 2],
        ['Nufarm', 2],
        ['Alcedo', 1],
      ]),
    },
    {
      key: 'formulation',
      label: t.formulation,
      options: opts([
        ['SC', 7],
        ['EC', 5],
        ['WG', 4],
        ['OD', 2],
        ['SL', 1],
      ]),
    },
  ]
}

const later =
  <T,>(result: T) =>
  async (): Promise<T> =>
    new Promise((r) => setTimeout(() => r(result), 400))

/** Label doses and crops for the list view rows (sample values). */
const rowExtras = (locale: Locale) => [
  { dose: '0,33–0,44 l/ha', crops: [l(locale, 'Porumb', 'Maize')] },
  {
    dose: '1–2 l/ha',
    crops: [
      l(locale, 'Grâu', 'Wheat'),
      l(locale, 'Porumb', 'Maize'),
      l(locale, 'Floarea-soarelui', 'Sunflower'),
      l(locale, 'Rapiță', 'Rapeseed'),
      l(locale, 'Orz', 'Barley'),
      l(locale, 'Soia', 'Soya'),
    ],
  },
  { dose: '0,15–0,3 kg/ha', crops: [l(locale, 'Grâu', 'Wheat'), l(locale, 'Rapiță', 'Rapeseed')] },
  { crops: [l(locale, 'Grâu', 'Wheat')] },
  { dose: '1–3 l/ha', crops: [l(locale, 'Porumb', 'Maize')] },
  { dose: '3–5 l/ha', crops: [l(locale, 'Rapiță', 'Rapeseed')] },
]

function Listing({ locale, variant }: { locale: Locale; variant: Variant }) {
  const t = shopUi[locale]
  const L = t.listing
  const top = variant === 'top'
  const filtered = variant !== 'top'
  const empty = variant === 'empty'
  const view = variant === 'filtered' || variant === 'drawer' ? 'list' : 'grid'
  const cards = sampleCards(locale).slice(0, 6)
  const all = top ? [...cards, ...cards.slice(0, 3)] : cards
  const count = empty ? 0 : top ? 36 : 6
  const base = l(locale, '/magazin', '/en/shop')
  const title = top
    ? l(locale, 'Protecția plantelor', 'Crop protection')
    : l(locale, 'Erbicide', 'Herbicides')
  const crumbs = [
    { name: l(locale, 'Acasă', 'Home'), url: l(locale, '/', '/en') },
    { name: t.shop, url: base },
    ...(top
      ? []
      : [{ name: l(locale, 'Protecția plantelor', 'Crop protection'), url: `${base}/protectie` }]),
    { name: title, url: `${base}/x` },
  ]
  const intro = top
    ? {
        lead: l(
          locale,
          'Erbicide, fungicide, insecticide și tratamente pentru sămânță, omologate în România, cu doza de pe etichetă la fiecare produs.',
          'Herbicides, fungicides, insecticides and seed treatments registered in Romania, with the label dose on every product.',
        ),
        rest: l(
          locale,
          'Produsele pentru uz profesional se vând pe baza certificatului de utilizator. Un consultant confirmă prețul, stocul și doza pentru cultura ta înainte de factură.',
          'Products for professional use are sold against the user certificate. A consultant confirms the price, stock and dose for your crop before the invoice.',
        ),
      }
    : {
        lead: l(
          locale,
          'Erbicide pentru cereale, porumb, floarea-soarelui și rapiță, pre- și postemergente.',
          'Pre- and post-emergence herbicides for cereals, maize, sunflower and rapeseed.',
        ),
        rest: l(
          locale,
          'Alege după cultură și după buruienile pe care le ai în câmp; fiecare produs are doza de pe etichetă și pauza până la recoltare.',
          'Choose by crop and by the weeds in your field; every product shows the label dose and the interval before harvest.',
        ),
      }
  const sort: SortOption[] = (Object.entries(L.sort) as [string, string][]).map(([key, label]) => ({
    href: '#',
    label,
    active: filtered ? key === 'price-asc' : key === 'relevance',
  }))
  const active: ActiveFilter[] = filtered
    ? [
        { group: t.crop, label: l(locale, 'Porumb', 'Maize'), href: '#' },
        { group: t.stock, label: t.inStockOnly, href: '#' },
      ]
    : []
  const clear = filtered ? { href: '#', label: t.clear } : undefined
  const groups = facets(locale, filtered)
  const facetLabels = { showAll: L.showAll, less: L.less }
  const extras = rowExtras(locale)

  return (
    <div className="min-h-screen overflow-x-clip bg-paper pb-24 text-ink">
      <SiteHeader {...headerProps(locale)} />
      <main>
        <ListingHeader
          breadcrumbs={
            <Breadcrumbs label={l(locale, 'Ești aici', 'You are here')} items={crumbs} />
          }
          title={title}
          intro={intro}
          labels={{ more: L.more, less: L.less }}
          tiles={top ? tiles(locale) : undefined}
          chips={top ? undefined : siblings(locale)}
          chipsLabel={L.subcategories}
          updated={
            <Updated
              locale={locale}
              label={l(locale, 'Actualizat', 'Updated')}
              date="2026-11-10T09:00:00Z"
            />
          }
        />
        <ListingLayout
          aside={
            <FacetCard title={t.filters} clear={clear}>
              <FacetGroups groups={groups} labels={facetLabels} />
            </FacetCard>
          }
        >
          <ListingToolbar
            count={t.products(count)}
            sort={sort}
            view={{ grid: '#', list: '#', current: view }}
            active={active}
            clear={clear}
            labels={{
              sort: L.sortLabel,
              view: L.view,
              grid: L.grid,
              list: L.list,
              active: L.active,
              remove: L.remove,
            }}
            drawer={
              <FilterDrawer
                title={t.filters}
                button={L.openFilters(active.length)}
                results={L.showResults(count)}
                clear={clear}
                open={variant === 'drawer'}
              >
                <FacetGroups groups={groups} labels={facetLabels} />
              </FilterDrawer>
            }
          />
          {empty ? (
            <ListingEmpty
              title={L.emptyTitle}
              text={L.emptyText}
              clear={clear}
              request={
                <QuickRequest
                  locale={locale}
                  layout="inline"
                  sourcePath={`${base}/erbicide`}
                  privacyHref={l(locale, '/confidentialitate', '/en/privacy')}
                  action={later<QuickRequestState>({ status: 'success', contact: 'phone' })}
                  label={L.emptyRequest}
                  submitLabel={L.emptySubmit}
                />
              }
            />
          ) : view === 'grid' ? (
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
              {all.map((c, i) => (
                <li key={`${c.href}-${i}`}>
                  <ProductCard
                    {...c}
                    locale={locale}
                    labels={cardLabels(locale)}
                    className="h-full"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="grid gap-3">
              {cards.map((c, i) => (
                <li key={c.href}>
                  <ProductRow
                    {...c}
                    {...extras[i]}
                    locale={locale}
                    labels={cardLabels(locale)}
                    rowLabels={{ dose: L.dose, crops: L.crops, moreCrops: L.moreCrops }}
                  />
                </li>
              ))}
            </ul>
          )}
          {top && (
            <Pagination
              page={1}
              pages={2}
              href={() => '#'}
              labels={{ nav: L.pages, prev: L.prev, next: L.next, page: L.page }}
            />
          )}
        </ListingLayout>
      </main>
    </div>
  )
}

export const TopCategory: Story = {
  name: 'Top category (grid)',
  render: (_, { globals }) => <Listing locale={storyLocale(globals)} variant="top" />,
}

export const FilteredList: Story = {
  name: 'Filtered (list view)',
  render: (_, { globals }) => <Listing locale={storyLocale(globals)} variant="filtered" />,
}

export const Empty: Story = {
  name: 'No results',
  render: (_, { globals }) => <Listing locale={storyLocale(globals)} variant="empty" />,
}

export const Drawer: Story = {
  name: 'Phone filter drawer',
  render: (_, { globals }) => <Listing locale={storyLocale(globals)} variant="drawer" />,
}
