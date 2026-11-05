import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { FinanceFixedPage, financeFixedMetadata } from '@/components/templates/FinanceFixedPage'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  return (await props.params).locale === 'ro' ? financeFixedMetadata('ro', 'faq') : {}
}

export default async function Page(props: Props) {
  if ((await props.params).locale !== 'ro') notFound()
  return <FinanceFixedPage locale="ro" route="faq" />
}
