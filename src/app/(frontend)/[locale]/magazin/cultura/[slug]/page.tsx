import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { hubMetadata, HubPage } from '@/components/templates/ShopListing'
import type { SearchParams } from '@/lib/shop/catalogue'

/** Shop hub by crop. */
type Props = {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<SearchParams>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, slug } = await props.params
  return locale === 'ro' ? hubMetadata('crop', 'ro', slug, await props.searchParams) : {}
}

export default async function Page(props: Props) {
  const { locale, slug } = await props.params
  if (locale !== 'ro') notFound()
  return <HubPage kind="crop" locale="ro" slug={slug} params={await props.searchParams} />
}
