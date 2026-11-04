import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { hubMetadata, HubPage } from '@/components/templates/ShopListing'
import type { SearchParams } from '@/lib/shop/catalogue'

/** Shop hub by brand. */
type Props = {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<SearchParams>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, slug } = await props.params
  return locale === 'en' ? hubMetadata('brand', 'en', slug, await props.searchParams) : {}
}

export default async function Page(props: Props) {
  const { locale, slug } = await props.params
  if (locale !== 'en') notFound()
  return <HubPage kind="brand" locale="en" slug={slug} params={await props.searchParams} />
}
