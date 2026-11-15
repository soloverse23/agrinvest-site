import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { FinanceHubPage, financeHubMetadata } from '@/components/templates/FinanceHubPage'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params
  return locale === 'ro' ? financeHubMetadata('ro') : {}
}

export default async function Page(props: Props) {
  const { locale } = await props.params
  if (locale !== 'ro') notFound()
  return <FinanceHubPage locale="ro" />
}
