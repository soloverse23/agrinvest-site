import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { FertiliserPricesPage, fertiliserMetadata } from '@/components/templates/ToolPages'

/** `/preturi/ingrasaminte`. The other language has its own route folder. */
type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  return (await props.params).locale === 'ro' ? fertiliserMetadata('ro') : {}
}

export default async function Page(props: Props) {
  if ((await props.params).locale !== 'ro') notFound()
  return <FertiliserPricesPage locale="ro" />
}
