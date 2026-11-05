import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  FinanceProductPage,
  financeProductMetadata,
  topProductParams,
} from '@/components/templates/FinanceProductPage'

type Props = { params: Promise<{ locale: string; product: string }> }

export const dynamicParams = true

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return params.locale === 'ro' ? topProductParams('ro') : []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, product } = await props.params
  return locale === 'ro' ? financeProductMetadata('ro', product) : {}
}

export default async function Page(props: Props) {
  const { locale, product } = await props.params
  if (locale !== 'ro') notFound()
  return <FinanceProductPage locale="ro" slug={product} />
}
