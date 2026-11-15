import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { MarketRoute, marketPageMetadata } from '@/components/templates/MarketPages'

/** `/preturi/petrol-brent` (Phase 7f). The other language has its own route folder. */
type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  return (await props.params).locale === 'ro' ? marketPageMetadata('brent', 'ro') : {}
}

export default async function Page(props: Props) {
  if ((await props.params).locale !== 'ro') notFound()
  return <MarketRoute id="brent" locale="ro" />
}
