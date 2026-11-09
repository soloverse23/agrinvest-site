import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { financeFixedMetadata } from '@/components/templates/FinanceFixedPage'
import { SimulatorPage } from '@/components/templates/FinanceToolPage'
import { hasParams } from '@/lib/finance/application'
import type { RawParams } from '@/lib/finance/simulator'

/** Repayment simulator. Rendered per request; a URL with parameters is noindex, canonical to the clean page. */
type Props = { params: Promise<{ locale: string }>; searchParams: Promise<RawParams> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  if ((await props.params).locale !== 'ro') return {}
  return financeFixedMetadata('ro', 'simulator', hasParams(await props.searchParams))
}

export default async function Page(props: Props) {
  if ((await props.params).locale !== 'ro') notFound()
  return <SimulatorPage locale="ro" params={await props.searchParams} />
}
