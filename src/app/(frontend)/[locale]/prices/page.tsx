import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PricesHubPage, pricesHubMetadata } from '@/components/templates/PricePage'

/** Grain price hub (`/en/prices`). The other language has its own route folder. */
type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  return (await props.params).locale === 'en' ? pricesHubMetadata('en') : {}
}

export default async function Page(props: Props) {
  if ((await props.params).locale !== 'en') notFound()
  return <PricesHubPage locale="en" />
}
