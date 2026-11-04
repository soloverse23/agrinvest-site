import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { categoryMetadata, CategoryPage } from '@/components/templates/ShopListing'
import type { SearchParams } from '@/lib/shop/catalogue'

/** A shop category. Filters live in the query string, so this page renders per request. */
type Props = {
  params: Promise<{ locale: string; category: string }>
  searchParams: Promise<SearchParams>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, category } = await props.params
  return locale === 'ro' ? categoryMetadata('ro', category, await props.searchParams) : {}
}

export default async function Page(props: Props) {
  const { locale, category } = await props.params
  if (locale !== 'ro') notFound()
  return <CategoryPage locale="ro" slug={category} params={await props.searchParams} />
}
