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
  return params.locale === 'en' ? topProductParams('en') : []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, product } = await props.params
  return locale === 'en' ? financeProductMetadata('en', product) : {}
}

export default async function Page(props: Props) {
  const { locale, product } = await props.params
  if (locale !== 'en') notFound()
  return <FinanceProductPage locale="en" slug={product} />
}
