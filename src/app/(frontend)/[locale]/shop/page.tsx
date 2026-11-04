import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { shopMetadata, ShopHome } from '@/components/templates/ShopListing'

/** Shop home in this language. The other language has its own route folder. */
type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params
  return locale === 'en' ? shopMetadata('en') : {}
}

export default async function Page(props: Props) {
  const { locale } = await props.params
  if (locale !== 'en') notFound()
  return <ShopHome locale="en" />
}
