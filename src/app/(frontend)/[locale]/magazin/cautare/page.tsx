import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { searchMetadata, SearchPage } from '@/components/templates/ShopListing'
import type { SearchParams } from '@/lib/shop/catalogue'

/** Shop search: noindex, rendered per request. */
type Props = { params: Promise<{ locale: string }>; searchParams: Promise<SearchParams> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params
  return locale === 'ro' ? searchMetadata('ro') : {}
}

export default async function Page(props: Props) {
  const { locale } = await props.params
  if (locale !== 'ro') notFound()
  return <SearchPage locale="ro" params={await props.searchParams} />
}
