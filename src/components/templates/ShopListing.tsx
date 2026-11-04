import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { Kicker, SectionHeading } from '@ds/patterns/Sections'
import { FacetPanel, ShopTile, type FacetGroup } from '@ds/patterns/Shop'
import { Button } from '@ds/primitives/Button'
import { JsonLd } from '@/components/JsonLd'
import { Faq, PageTitle } from '@/components/PageParts'
import { Prose } from '@/components/RenderBlocks'
import { SiteShell } from '@/components/SiteShell'
import type { Locale } from '@/i18n/config'
import {
  categoryPath,
  hubPath,
  productPath,
  searchPath,
  shopPath,
  type HubKind,
} from '@/i18n/routes'
import { fitTitle, shopUi } from '@/i18n/shop'
import { ui } from '@/i18n/ui'
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
} from '@/lib/content/shop'
import { breadcrumbs, faqPage, itemList, webPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'
import {
  applyFilters,
  facetHref,
  facetOptions,
  readFilters,
  searchProducts,
  sortProducts,
  type FacetKey,
  type Filters,
  type ProductCardData,
  type SearchParams,
} from '@/lib/shop/catalogue'
import type { Category } from '@/payload-types'

import { ProductGrid } from './ShopParts'

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
  extra?: ReactNode
  body?: Category['buyingAdvice']
  updatedAt?: string
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
    facets: (category.facets ?? ['crop', 'brand', 'stock']).filter(
      (f): f is FacetKey => f !== 'target',
    ),
    faq: category.faq,
    body: category.buyingAdvice,
    updatedAt: category.updatedAt,
    extra: children.length > 0 && (
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {children.map((c) => (
          <li key={c.id}>
            <ShopTile
              href={categoryPath(c.slug, locale)}
              title={c.name}
              meta={t.products(inCategory(products, c).length)}
            />
          </li>
        ))}
      </ul>
    ),
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

function FilteredList({
  listing,
  filters,
  locale,
}: {
  listing: Listing
  filters: Filters
  locale: Locale
}) {
  const t = shopUi[locale]
  const shown = sortProducts(applyFilters(listing.products, filters), locale)
  const groups: FacetGroup[] = listing.facets.map((key) => ({
    key,
    label: t[key],
    options: facetOptions(listing.products, key, filters).map((option) => ({
      label: key === 'stock' ? t.inStockOnly : capitalise(option.label),
      count: option.count,
      active: filters[key] === option.value,
      href: facetHref(listing.path, filters, key, option.value, locale),
    })),
  }))
  return (
    <div className="mx-auto mt-10 grid max-w-page gap-8 px-4 md:mt-14 md:px-8 lg:grid-cols-12">
      <aside className="lg:col-span-3">
        <FacetPanel
          title={t.filters}
          groups={groups}
          clear={Object.keys(filters).length ? { href: listing.path, label: t.clear } : undefined}
        />
      </aside>
      <div className="grid content-start gap-5 lg:col-span-9">
        <p className="text-small text-muted" role="status">
          {t.products(shown.length)}
        </p>
        {shown.length ? (
          <ProductGrid products={shown} locale={locale} />
        ) : (
          <p className="rounded-lg bg-raised p-6 ring-1 ring-line">{t.noResults}</p>
        )}
      </div>
    </div>
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
    // Filter URLs keep the clean listing as their canonical and stay out of the index.
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
  const filters = readFilters(params, locale)
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
      <PageTitle
        locale={locale}
        title={listing.title}
        summary={listing.summary}
        updatedAt={latest(listing.products) ?? listing.updatedAt}
        crumbs={listing.crumbs}
      />
      {listing.extra && (
        <div className="mx-auto mt-10 max-w-page px-4 md:px-8">{listing.extra}</div>
      )}
      <FilteredList listing={listing} filters={filters} locale={locale} />
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
  return listingMetadata(listing, locale, seo, Object.keys(readFilters(params, locale)).length > 0)
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
  return listingMetadata(listing, locale, seo, Object.keys(readFilters(params, locale)).length > 0)
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
    <form action={searchPath(locale)} role="search" className="flex w-full max-w-xl min-w-72 gap-2">
      <label htmlFor="shop-search" className="sr-only">
        {t.searchLabel}
      </label>
      <input
        id="shop-search"
        name="q"
        type="search"
        defaultValue={query}
        placeholder={t.searchPlaceholder}
        className="min-h-11 w-full flex-1 rounded-md border border-field-line bg-raised px-3 text-ink"
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
  const u = ui[locale]
  const [categories, products, crops] = await Promise.all([
    listCategories(locale),
    listProducts(locale),
    listShopCrops(locale),
  ])
  const alternates = { ro: shopPath('ro'), en: shopPath('en') }
  const crumbs = [shopCrumb(locale)]
  const top = categories.filter((c) => !c.parent)
  const withProducts = crops.flatMap((crop) => {
    const count = products.filter((p) => p.crops.some((c) => c.id === crop.id)).length
    return count ? [{ crop, count }] : []
  })
  const featured = sortProducts(products, locale).slice(0, 6)
  return (
    <SiteShell locale={locale} alternates={alternates}>
      <JsonLd
        data={[
          webPage({ url: shopPath(locale), name: t.title, description: t.seoDescription, locale }),
          breadcrumbs(locale, u.home, crumbs),
        ]}
      />
      <PageTitle
        locale={locale}
        title={t.title}
        summary={t.summary}
        updatedAt={latest(products)}
        crumbs={crumbs}
        actions={<SearchForm locale={locale} />}
      />
      <section className="mx-auto mt-14 grid max-w-page gap-6 px-4 md:px-8">
        <Kicker>{t.categories}</Kicker>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {top.map((c) => (
            <li key={c.id}>
              <ShopTile
                href={categoryPath(c.slug, locale)}
                title={c.name}
                meta={t.products(inCategory(products, c).length)}
              />
            </li>
          ))}
        </ul>
      </section>
      <section className="mx-auto mt-14 grid max-w-page gap-6 px-4 md:px-8">
        <Kicker>{t.byCrop}</Kicker>
        <ul className="flex flex-wrap gap-2">
          {withProducts.map(({ crop, count }) => (
            <li key={crop.id}>
              <Button href={hubPath('crop', crop.slug, locale)} variant="secondary" size="sm">
                {`${crop.name} · ${count}`}
              </Button>
            </li>
          ))}
        </ul>
      </section>
      <section className="mx-auto mt-16 grid max-w-page gap-8 px-4 md:px-8">
        <SectionHeading title={t.popular} />
        <ProductGrid products={featured} locale={locale} />
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

export async function SearchPage({ locale, params }: { locale: Locale; params: SearchParams }) {
  const t = shopUi[locale]
  const query = typeof params.q === 'string' ? params.q.trim().slice(0, 80) : ''
  const results = sortProducts(searchProducts(await listProducts(locale), query), locale)
  const path = searchPath(locale)
  return (
    <SiteShell locale={locale} alternates={{ ro: searchPath('ro'), en: searchPath('en') }}>
      <PageTitle
        locale={locale}
        title={query ? t.searchResults(query) : t.searchTitle}
        summary={t.searchSummary}
        crumbs={[shopCrumb(locale), { name: t.search, url: path }]}
        actions={<SearchForm locale={locale} query={query} />}
      />
      <div className="mx-auto mt-10 grid max-w-page gap-5 px-4 md:px-8">
        {query && (
          <p className="text-small text-muted" role="status">
            {t.products(results.length)}
          </p>
        )}
        {query && !results.length && (
          <p className="rounded-lg bg-raised p-6 ring-1 ring-line">{t.noResults}</p>
        )}
        <ProductGrid products={results} locale={locale} columns="lg:grid-cols-4" />
      </div>
    </SiteShell>
  )
}
