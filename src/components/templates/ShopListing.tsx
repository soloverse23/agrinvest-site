import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { SearchIcon } from '@ds/icons/server'
import { CategoryRail, type RailCategory } from '@ds/patterns/CategoryRail'
import { DrawerKeysLazy, QuickRequestLazy, ShopSearchLazy } from '@ds/patterns/Lazy'
import { Accordion, SectionHeading, Updated } from '@ds/patterns/Sections'
import {
  FacetCard,
  FacetGroups,
  FilterDrawer,
  ListingEmpty,
  ListingHeader,
  ListingLayout,
  ListingToolbar,
  Pagination,
  type ActiveFilter,
  type FacetGroupV2,
  type ListingChip,
  type ListingTile,
  type SortOption,
} from '@ds/patterns/ShopListing'
import {
  BrandStrip,
  CropTiles,
  PromoCard,
  ShopHero,
  TrustRow,
  type BrandItem,
  type CropTile,
} from '@ds/patterns/ShopLanding'
import { Button } from '@ds/primitives/Button'
import { Fact } from '@/components/Fact'
import { JsonLd } from '@/components/JsonLd'
import { Crumbs, Faq } from '@/components/PageParts'
import { Prose } from '@/components/RenderBlocks'
import { SiteShell } from '@/components/SiteShell'
import { localePath, type Locale } from '@/i18n/config'
import {
  categoryPath,
  hubPath,
  productPath,
  searchPath,
  shopPath,
  type HubKind,
} from '@/i18n/routes'
import { fitTitle, shopUi } from '@/i18n/shop'
import { fixedUrl, ui } from '@/i18n/ui'
import { financeLinks } from '@/lib/content/finance'
import { getFigures, getSeoDefaults } from '@/lib/content/globals'
import type { Alternates } from '@/lib/content/pages'
import {
  hubIndexable,
  inCategory,
  listBrands,
  listCategories,
  listIngredients,
  listProducts,
  listShopCrops,
  getShopHome,
  getShopMenu,
} from '@/lib/content/shop'
import { breadcrumbs, faqPage, itemList, webPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'
import { submitQuickRequest } from '@/lib/leads/actions'
import {
  activePromo,
  applyFilters,
  facetOptions,
  hasListingParams,
  inStock,
  listingHref,
  PAGE_SIZE,
  priceRanges,
  readListing,
  searchProducts,
  seasonalCategory,
  sortListing,
  sortProducts,
  sortValues,
  toggleFilter,
  type FacetKey,
  type ListingState,
  type ProductCardData,
  type SearchParams,
  type SortKey,
} from '@/lib/shop/catalogue'
import type { Category } from '@/payload-types'

import { ProductGrid, ProductList } from './ShopParts'

const other = (locale: Locale): Locale => (locale === 'ro' ? 'en' : 'ro')

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Everything a listing page shows, resolved once for its metadata and its body. */
type Listing = {
  path: string
  alternates: Alternates
  title: string
  seoTitle: string
  description: string
  summary: string
  indexable: boolean
  products: ProductCardData[]
  crumbs: { name: string; url: string }[]
  facets: FacetKey[]
  faq?: { id?: string | null; question: string; answer: string }[] | null
  /** A top category's subcategories, as icon tiles. */
  tiles?: ListingTile[]
  /** A subcategory's siblings (itself active), as chips. */
  chips?: ListingChip[]
  body?: Category['buyingAdvice']
  updatedAt?: string
}

/**
 * The intro's lead (about two lines: whole sentences up to ~170 characters, at least one) and
 * the rest, which folds behind "mai mult" but stays in the HTML.
 */
function splitIntro(text: string): { lead: string; rest?: string } {
  const sentences = text.trim().split(/(?<=[.!?])\s+/)
  let lead = sentences[0]
  let i = 1
  while (i < sentences.length && `${lead} ${sentences[i]}`.length <= 170)
    lead += ` ${sentences[i++]}`
  const rest = sentences.slice(i).join(' ')
  return rest ? { lead, rest } : { lead }
}

/** A listing is as recent as its newest product. */
const latest = (products: ProductCardData[]) =>
  products
    .map((p) => p.updatedAt)
    .sort()
    .at(-1)

const shopCrumb = (locale: Locale) => ({ name: shopUi[locale].shop, url: shopPath(locale) })

async function categoryListing(locale: Locale, slug: string): Promise<Listing | null> {
  const [categories, twins, products] = await Promise.all([
    listCategories(locale),
    listCategories(other(locale)),
    listProducts(locale),
  ])
  const category = categories.find((c) => c.slug === slug)
  if (!category) return null
  const t = shopUi[locale]
  const twin = twins.find((c) => c.id === category.id)
  const list = inCategory(products, category)
  const parent = categories.find((c) => c.id === category.parent)
  const children = categories.filter((c) => c.parent === category.id)
  const siblings = parent ? categories.filter((c) => c.parent === parent.id) : []
  const path = categoryPath(category.slug, locale)
  return {
    path,
    alternates: {
      [locale]: path,
      ...(twin ? { [other(locale)]: categoryPath(twin.slug, other(locale)) } : {}),
    },
    title: category.name,
    seoTitle: category.seo?.title || t.seo.category(category.name),
    description: category.seo?.description || t.seo.categoryDescription(category.name, list.length),
    summary: category.intro || t.seo.categoryDescription(category.name, list.length),
    indexable: hubIndexable(category, list.length),
    products: list,
    crumbs: [
      shopCrumb(locale),
      ...(parent ? [{ name: parent.name, url: categoryPath(parent.slug, locale) }] : []),
      { name: category.name, url: path },
    ],
    facets: (category.facets ?? ['crop', 'brand', 'stock']).flatMap((f) =>
      f === 'target' ? [] : [f],
    ),
    faq: category.faq,
    body: category.buyingAdvice,
    updatedAt: category.updatedAt,
    tiles: children.length
      ? children.map((c) => ({
          href: categoryPath(c.slug, locale),
          label: c.name,
          count: t.products(inCategory(products, c).length),
          icon: c.icon,
        }))
      : undefined,
    chips:
      !children.length && siblings.length > 1
        ? siblings.map((c) => ({
            href: categoryPath(c.slug, locale),
            label: c.name,
            count: inCategory(products, c).length,
            active: c.id === category.id,
          }))
        : undefined,
  }
}

/** Crop, brand or ingredient hub. A hub with no product does not exist. */
async function hubListing(kind: HubKind, locale: Locale, slug: string): Promise<Listing | null> {
  const t = shopUi[locale]
  const load = {
    crop: listShopCrops,
    brand: listBrands,
    ingredient: listIngredients,
  }[kind] as (l: Locale) => Promise<
    {
      id: number
      slug: string
      name: string
      updatedAt: string
      faq?: Listing['faq']
      shop?: Parameters<typeof hubIndexable>[0]
      intro?: string | null
      indexable?: boolean | null
      seo?: { title?: string | null; description?: string | null; noindex?: boolean | null } | null
    }[]
  >
  const [docs, twins, products] = await Promise.all([
    load(locale),
    load(other(locale)),
    listProducts(locale),
  ])
  const doc = docs.find((d) => d.slug === slug)
  if (!doc) return null
  const list = products.filter((p) =>
    kind === 'crop'
      ? p.crops.some((c) => c.id === doc.id)
      : kind === 'brand'
        ? p.brand?.id === doc.id
        : p.ingredients.some((i) => i.id === doc.id),
  )
  if (!list.length) return null
  // A crop keeps its hub fields in a group: its own `intro` and `seo` are for the grain page.
  const hub = (kind === 'crop' ? doc.shop : doc) as Parameters<typeof hubIndexable>[0] & {
    seo?: { title?: string | null; description?: string | null } | null
  }
  const lower = kind === 'crop' ? doc.name.toLocaleLowerCase(locale) : doc.name
  const name = kind === 'ingredient' ? capitalise(doc.name) : lower
  const twin = twins.find((d) => d.id === doc.id)
  const path = hubPath(kind, doc.slug, locale)
  const seoTitle = {
    crop: () => t.seo.crop(lower),
    brand: () => t.seo.brand(doc.name),
    ingredient: () => fitTitle(t.seo.ingredient(name)),
  }[kind]()
  const description = {
    crop: () => t.seo.cropDescription(lower),
    brand: () => t.seo.brandDescription(doc.name),
    ingredient: () => t.seo.ingredientDescription(doc.name),
  }[kind]()
  return {
    path,
    alternates: {
      [locale]: path,
      ...(twin ? { [other(locale)]: hubPath(kind, twin.slug, other(locale)) } : {}),
    },
    title: t.hubTitle[kind](kind === 'ingredient' ? doc.name : lower),
    seoTitle: hub.seo?.title || seoTitle,
    description: hub.seo?.description || description,
    summary: hub.intro || t.hubSummary[kind](kind === 'ingredient' ? doc.name : lower),
    indexable: hubIndexable(hub, list.length),
    products: list,
    crumbs: [shopCrumb(locale), { name: kind === 'ingredient' ? name : doc.name, url: path }],
    facets:
      kind === 'crop'
        ? ['brand', 'ingredient', 'stock']
        : kind === 'brand'
          ? ['crop', 'stock']
          : ['crop', 'brand', 'stock'],
    faq: kind === 'crop' ? null : doc.faq,
    updatedAt: doc.updatedAt,
  }
}

/** Facet order: stock first, then the listing's first facet, price, and the rest. */
function facetOrder(facets: FacetKey[]): FacetKey[] {
  const others = facets.filter((f) => f !== 'stock' && f !== 'price')
  return [
    ...(facets.includes('stock') ? (['stock'] as const) : []),
    ...others.slice(0, 1),
    'price',
    ...others.slice(1),
  ]
}

/**
 * Header, toolbar, facets, results (grid or list, 24 a page) and the empty state of every
 * listing. Filter, sort, view and page are links, so it all works without JavaScript.
 */
function ListingView({
  listing,
  state,
  locale,
  search,
  extra,
}: {
  listing: Listing
  state: ListingState
  locale: Locale
  /** The search page's form under the title. */
  search?: ReactNode
  /** Parameters every link keeps (the search query). */
  extra?: Record<string, string>
}) {
  const t = shopUi[locale]
  const L = t.listing
  const u = ui[locale]
  const href = (next: ListingState) => listingHref(listing.path, next, locale, extra)
  const filtered = applyFilters(listing.products, state.filters)
  const sorted = sortListing(filtered, state.sort, locale)
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const page = Math.min(state.page, pages)
  const shown = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const optionLabel = (key: FacetKey, value: string, label: string) =>
    key === 'stock'
      ? t.inStockOnly
      : key === 'price'
        ? L.priceRanges[value as keyof typeof L.priceRanges]
        : capitalise(label)

  const groups: FacetGroupV2[] = facetOrder(listing.facets).map((key) => {
    const options = facetOptions(listing.products, key, state.filters)
    if (key === 'price')
      options.sort(
        (a, b) =>
          priceRanges.indexOf(a.value as (typeof priceRanges)[number]) -
          priceRanges.indexOf(b.value as (typeof priceRanges)[number]),
      )
    return {
      key,
      label: key === 'price' ? L.price : t[key],
      kind: key === 'stock' ? 'toggle' : 'radio',
      options: options.map((option) => ({
        label: optionLabel(key, option.value, option.label),
        count: option.count,
        active: state.filters[key] === option.value,
        href: href(toggleFilter(state, key, option.value)),
      })),
    }
  })

  const active: ActiveFilter[] = (Object.entries(state.filters) as [FacetKey, string][]).map(
    ([key, value]) => {
      const group = groups.find((g) => g.key === key)
      return {
        group: group?.label ?? (key === 'price' ? L.price : t[key]),
        label: group?.options.find((o) => o.active)?.label ?? optionLabel(key, value, value),
        href: href(toggleFilter(state, key, value)),
      }
    },
  )
  const clear = active.length
    ? { href: href({ ...state, filters: {}, page: 1 }), label: t.clear }
    : undefined

  const sortKeys: SortKey[] = ['relevance', ...(Object.keys(sortValues) as SortKey[])]
  const sort: SortOption[] = sortKeys.map((key) => ({
    href: href({ ...state, sort: key, page: 1 }),
    label: L.sort[key],
    active: state.sort === key,
  }))

  const hasFacets = groups.some((g) => g.options.length)
  const facetLabels = { showAll: L.showAll, less: L.less }

  return (
    <>
      <ListingHeader
        breadcrumbs={<Crumbs locale={locale} items={listing.crumbs} />}
        title={listing.title}
        intro={listing.summary ? splitIntro(listing.summary) : undefined}
        labels={{ more: L.more, less: L.less }}
        tiles={listing.tiles}
        chips={listing.chips}
        chipsLabel={L.subcategories}
        search={search}
        updated={
          listing.updatedAt && (
            <Updated locale={locale} label={u.updated} date={listing.updatedAt} />
          )
        }
      />
      <ListingLayout
        aside={
          hasFacets && (
            <FacetCard title={t.filters} clear={clear}>
              <FacetGroups groups={groups} labels={facetLabels} />
            </FacetCard>
          )
        }
      >
        <ListingToolbar
          count={t.products(sorted.length)}
          sort={sorted.length > 1 ? sort : []}
          view={
            sorted.length
              ? {
                  grid: href({ ...state, view: 'grid' }),
                  list: href({ ...state, view: 'list' }),
                  current: state.view,
                }
              : undefined
          }
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
            hasFacets && (
              <FilterDrawer
                title={t.filters}
                button={L.openFilters(active.length)}
                results={L.showResults(sorted.length)}
                clear={clear}
              >
                <FacetGroups groups={groups} labels={facetLabels} />
                <DrawerKeysLazy />
              </FilterDrawer>
            )
          }
        />
        {shown.length === 0 ? (
          <ListingEmpty
            title={L.emptyTitle}
            text={extra?.q && !active.length ? L.emptySearchText : L.emptyText}
            clear={clear}
            request={
              <QuickRequestLazy
                locale={locale}
                action={submitQuickRequest}
                layout="inline"
                sourcePath={listing.path}
                privacyHref={fixedUrl('privacy', locale)}
                label={L.emptyRequest}
                submitLabel={L.emptySubmit}
              />
            }
          />
        ) : state.view === 'list' ? (
          <ProductList products={shown} locale={locale} sourcePath={listing.path} />
        ) : (
          <ProductGrid
            products={shown}
            locale={locale}
            columns="md:grid-cols-3"
            sourcePath={listing.path}
          />
        )}
        <Pagination
          page={page}
          pages={pages}
          href={(n) => href({ ...state, page: n })}
          labels={{ nav: L.pages, prev: L.prev, next: L.next, page: L.page }}
        />
      </ListingLayout>
    </>
  )
}

function listingMetadata(
  listing: Listing,
  locale: Locale,
  seo: Awaited<ReturnType<typeof getSeoDefaults>>,
  filtered: boolean,
): Metadata {
  return buildMetadata({
    locale,
    title: listing.title,
    seoTitle: listing.seoTitle,
    description: listing.description,
    siteName: seo.siteName,
    image: seo.ogImage,
    // Filter, sort, view and page URLs keep the clean listing as canonical, out of the index.
    noindex: filtered || !listing.indexable,
    alternates: listing.alternates,
  })
}

async function ListingPage({
  listing,
  locale,
  params,
}: {
  listing: Listing
  locale: Locale
  params: SearchParams
}) {
  const u = ui[locale]
  // The structured data lists every product, whatever the URL's filters, sort or page.
  const items = sortProducts(listing.products, locale).map((p) => ({
    name: p.name,
    url: productPath(p.category.slug, p.slug, locale),
  }))
  return (
    <SiteShell locale={locale} alternates={listing.alternates}>
      <JsonLd
        data={[
          webPage({
            url: listing.path,
            name: listing.title,
            description: listing.description,
            locale,
            dateModified: listing.updatedAt,
          }),
          breadcrumbs(locale, u.home, listing.crumbs),
          itemList(items),
          ...(listing.faq?.length ? [faqPage(listing.faq)] : []),
        ]}
      />
      <ListingView
        listing={{ ...listing, updatedAt: latest(listing.products) ?? listing.updatedAt }}
        state={readListing(params, locale)}
        locale={locale}
      />
      {listing.body && (
        <section className="mx-auto mt-20 max-w-3xl px-4 md:px-8">
          <Prose data={listing.body} ctx={{ figures: await getFigures(locale), locale }} />
        </section>
      )}
      <Faq locale={locale} items={listing.faq} />
    </SiteShell>
  )
}

export async function categoryParams(locale: Locale) {
  return (await listCategories(locale)).map((c) => ({ category: c.slug }))
}

export async function categoryMetadata(
  locale: Locale,
  slug: string,
  params: SearchParams,
): Promise<Metadata> {
  const [listing, seo] = await Promise.all([categoryListing(locale, slug), getSeoDefaults(locale)])
  if (!listing) return {}
  return listingMetadata(listing, locale, seo, hasListingParams(params, locale))
}

export async function CategoryPage(props: { locale: Locale; slug: string; params: SearchParams }) {
  const listing = await categoryListing(props.locale, props.slug)
  if (!listing) notFound()
  return <ListingPage listing={listing} locale={props.locale} params={props.params} />
}

export async function hubMetadata(
  kind: HubKind,
  locale: Locale,
  slug: string,
  params: SearchParams,
): Promise<Metadata> {
  const [listing, seo] = await Promise.all([hubListing(kind, locale, slug), getSeoDefaults(locale)])
  if (!listing) return {}
  return listingMetadata(listing, locale, seo, hasListingParams(params, locale))
}

export async function HubPage(props: {
  kind: HubKind
  locale: Locale
  slug: string
  params: SearchParams
}) {
  const listing = await hubListing(props.kind, props.locale, props.slug)
  if (!listing) notFound()
  return <ListingPage listing={listing} locale={props.locale} params={props.params} />
}

function SearchForm({ locale, query }: { locale: Locale; query?: string }) {
  const t = shopUi[locale]
  return (
    <form action={searchPath(locale)} role="search" className="flex w-full max-w-xl gap-2">
      <label htmlFor="shop-search" className="sr-only">
        {t.searchLabel}
      </label>
      <input
        id="shop-search"
        name="q"
        type="search"
        defaultValue={query}
        placeholder={t.searchPlaceholder}
        className="min-h-11 w-full min-w-0 flex-1 rounded-md border border-field-line bg-raised px-3 text-ink"
      />
      <Button type="submit">{t.search}</Button>
    </form>
  )
}

export async function shopMetadata(locale: Locale): Promise<Metadata> {
  const t = shopUi[locale]
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: t.shop,
    seoTitle: `${t.seoTitle} · Agrinvest`.slice(0, 60),
    description: t.seoDescription,
    siteName: seo.siteName,
    image: seo.ogImage,
    alternates: { ro: shopPath('ro'), en: shopPath('en') },
  })
}

export async function ShopHome({ locale }: { locale: Locale }) {
  const t = shopUi[locale]
  const L = t.landing
  const u = ui[locale]
  const [products, menu, categories, crops, home, finance] = await Promise.all([
    listProducts(locale),
    getShopMenu(locale),
    listCategories(locale),
    listShopCrops(locale),
    getShopHome(locale),
    financeLinks(['inputuri-plata-la-recolta', 'credit-productie'], locale),
  ])
  const inputsFinance = finance['inputuri-plata-la-recolta'] ?? finance['credit-productie']
  const alternates = { ro: shopPath('ro'), en: shopPath('en') }
  const crumbs = [shopCrumb(locale)]
  const docs = new Map(categories.map((c) => [c.slug, c]))
  const cropKeys = new Map(crops.map((c) => [c.slug, c.key]))

  const rail: RailCategory[] = menu.categories.map((c) => ({
    href: categoryPath(c.slug, locale),
    label: c.name,
    count: L.products(c.count),
    icon: docs.get(c.slug)?.icon ?? 'other',
    children: c.children.map((child) => ({
      href: categoryPath(child.slug, locale),
      label: child.name,
    })),
  }))

  // The staff promo while it runs; otherwise the category that is in season.
  const staff = activePromo(home.promo)
  const season = staff ? null : seasonalCategory(products)
  const seasonDoc = season ? docs.get(season.slug) : undefined
  const promo = staff ? (
    <PromoCard
      kicker={staff.kicker || L.seasonKicker}
      title={staff.title as string}
      text={staff.text}
      href={staff.link?.href as string}
      linkLabel={staff.link?.label || L.promoLink}
      image={staff.image ? { src: staff.image.url, alt: staff.image.alt } : null}
    />
  ) : season ? (
    <PromoCard
      kicker={L.seasonKicker}
      title={season.name}
      text={L.seasonText(season.inStock)}
      href={categoryPath(season.slug, locale)}
      linkLabel={L.seasonLink(season.name)}
      icon={seasonDoc?.icon}
      packshots={products
        .filter(
          (p) =>
            inStock(p) &&
            p.image &&
            (p.category.id === season.id || p.category.parent === season.id),
        )
        .slice(0, 3)
        .map((p) => (p.image as { url: string }).url)}
    />
  ) : null

  const featuredIds = new Set(home.featured)
  const picked = products.filter((p) => featuredIds.has(p.id))
  const recommended = (
    picked.length
      ? picked
      : [...products]
          .filter(inStock)
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.name.localeCompare(b.name))
  ).slice(0, 8)

  const cropTiles: CropTile[] = menu.crops.slice(0, 12).map((c) => ({
    href: hubPath('crop', c.slug, locale),
    label: c.name,
    count: L.products(c.count),
    crop: cropKeys.get(c.slug),
  }))
  const brandItems: BrandItem[] = menu.brands.slice(0, 11).map((b) => ({
    href: hubPath('brand', b.slug, locale),
    name: b.name,
    count: L.products(b.count),
  }))

  return (
    <SiteShell locale={locale} alternates={alternates}>
      <JsonLd
        data={[
          webPage({ url: shopPath(locale), name: t.title, description: t.seoDescription, locale }),
          breadcrumbs(locale, u.home, crumbs),
        ]}
      />
      <ShopHero
        crumbs={{
          label: u.breadcrumb,
          items: [
            { name: u.home, url: localePath('/', locale) },
            ...crumbs.map((c) => ({ name: c.name, url: c.url })),
          ],
        }}
        kicker={L.kicker}
        title={t.title}
        counts={[L.products(products.length), L.inStock(products.filter(inStock).length)]}
        search={
          <ShopSearchLazy
            action={searchPath(locale)}
            indexUrl={`/shop-index.json?l=${locale}`}
            icon={<SearchIcon className="size-6" />}
            labels={{
              label: t.searchLabel,
              placeholder: L.searchPlaceholder,
              submit: t.search,
              searchAll: L.searchAll,
              kinds: L.kinds,
              products: L.suggestCount,
            }}
          />
        }
        crops={{
          label: L.cropsLabel,
          items: menu.crops.slice(0, 6).map((c) => ({
            href: hubPath('crop', c.slug, locale),
            label: c.name,
          })),
          all: { href: '#culturi', label: L.allCrops },
        }}
        promo={promo}
        rail={<CategoryRail label={t.categories} items={rail} />}
      />
      {recommended.length > 0 && (
        <section
          aria-labelledby="recomandate"
          className="mx-auto mt-14 grid max-w-page gap-8 px-4 md:mt-20 md:px-8"
        >
          <SectionHeading
            id="recomandate"
            title={picked.length ? L.recommended : L.newest}
            action={{ href: searchPath(locale), label: L.allProducts }}
          />
          <ProductGrid products={recommended} locale={locale} columns="md:grid-cols-4" />
        </section>
      )}
      {cropTiles.length > 0 && (
        <section
          aria-labelledby="culturi"
          className="mx-auto mt-16 grid max-w-page gap-8 px-4 md:mt-24 md:px-8"
        >
          <SectionHeading id="culturi" title={L.byCrop} />
          <CropTiles items={cropTiles} />
        </section>
      )}
      {brandItems.length > 0 && (
        <section
          aria-labelledby="producatori"
          className="mx-auto mt-16 grid max-w-page gap-8 px-4 md:mt-24 md:px-8"
        >
          <SectionHeading id="producatori" title={L.brands} />
          <BrandStrip items={brandItems} />
        </section>
      )}
      <section
        aria-labelledby="incredere"
        className="mx-auto mt-16 grid max-w-page gap-8 px-4 md:mt-24 md:px-8"
      >
        <h2 id="incredere" className="sr-only">
          {L.trust}
        </h2>
        <TrustRow
          items={[
            { icon: 'consultant', ...L.trustItems.consultant },
            {
              icon: 'pickup',
              title: L.trustItems.pickup.title,
              text: (
                <>
                  {L.trustItems.pickup.before}
                  <Fact k="S1" locale={locale} />
                  {L.trustItems.pickup.after}
                </>
              ),
            },
            {
              icon: 'finance',
              title: L.trustItems.finance.title,
              text: L.trustItems.finance.text,
              link: inputsFinance
                ? { href: inputsFinance.href, label: L.trustItems.finance.link }
                : null,
            },
            { icon: 'certificate', ...L.trustItems.certificate },
          ]}
        />
      </section>
      <section
        aria-labelledby="intrebari"
        className="mx-auto mt-16 grid max-w-page gap-8 px-4 md:mt-24 md:px-8 lg:grid-cols-12"
      >
        <div className="lg:col-span-4">
          <SectionHeading id="intrebari" title={L.faq} />
        </div>
        <div className="lg:col-span-8">
          <Accordion items={L.faqItems} />
        </div>
      </section>
    </SiteShell>
  )
}

export async function searchMetadata(locale: Locale): Promise<Metadata> {
  const t = shopUi[locale]
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: t.searchTitle,
    seoTitle: `${t.searchTitle} · Agrinvest ${t.shop.toLowerCase()}`,
    description: t.searchSummary,
    siteName: seo.siteName,
    noindex: true,
    alternates: { ro: searchPath('ro'), en: searchPath('en') },
  })
}

/**
 * Search results in the listing template. Without a query it lists the whole catalogue, so
 * "Toate produsele" has somewhere to go. Always noindex.
 */
export async function SearchPage({ locale, params }: { locale: Locale; params: SearchParams }) {
  const t = shopUi[locale]
  const query = typeof params.q === 'string' ? params.q.trim().slice(0, 80) : ''
  const all = await listProducts(locale)
  const path = searchPath(locale)
  const listing: Listing = {
    path,
    alternates: { ro: searchPath('ro'), en: searchPath('en') },
    title: query ? t.searchResults(query) : t.searchTitle,
    seoTitle: t.searchTitle,
    description: t.searchSummary,
    summary: t.searchSummary,
    indexable: false,
    products: query ? searchProducts(all, query) : all,
    crumbs: [shopCrumb(locale), { name: t.search, url: path }],
    facets: ['stock', 'crop', 'brand'],
  }
  return (
    <SiteShell locale={locale} alternates={listing.alternates}>
      <ListingView
        listing={listing}
        state={readListing(params, locale)}
        locale={locale}
        search={<SearchForm locale={locale} query={query} />}
        extra={query ? { q: query } : undefined}
      />
    </SiteShell>
  )
}
