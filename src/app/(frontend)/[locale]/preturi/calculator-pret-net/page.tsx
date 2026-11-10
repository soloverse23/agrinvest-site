import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  hasNetPriceParams,
  netPriceMetadata,
  NetPricePage,
} from '@/components/templates/NetPricePage'
import type { RawParams } from '@/lib/prices/net-price'

/** Net-price calculator. Rendered per request; a URL with parameters is noindex, canonical to the clean page. */
type Props = { params: Promise<{ locale: string }>; searchParams: Promise<RawParams> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  if ((await props.params).locale !== 'ro') return {}
  return netPriceMetadata('ro', hasNetPriceParams(await props.searchParams))
}

export default async function Page(props: Props) {
  if ((await props.params).locale !== 'ro') notFound()
  return <NetPricePage locale="ro" params={await props.searchParams} />
}
