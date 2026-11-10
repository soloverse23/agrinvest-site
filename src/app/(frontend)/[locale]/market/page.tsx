import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { MarketIndexPage, marketMetadata } from '@/components/templates/MarketPage'

/** Weekly market notes (`/en/market`). */
type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  return (await props.params).locale === 'en' ? marketMetadata('en') : {}
}

export default async function Page(props: Props) {
  if ((await props.params).locale !== 'en') notFound()
  return <MarketIndexPage locale="en" />
}
