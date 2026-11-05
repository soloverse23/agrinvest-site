import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  childProductParams,
  FinanceProductPage,
  financeProductMetadata,
} from '@/components/templates/FinanceProductPage'

type Props = { params: Promise<{ locale: string; product: string; child: string }> }

export const dynamicParams = true

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return params.locale === 'en' ? childProductParams('en') : []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, product, child } = await props.params
  return locale === 'en' ? financeProductMetadata('en', child, product) : {}
}

export default async function Page(props: Props) {
  const { locale, product, child } = await props.params
  if (locale !== 'en') notFound()
  return <FinanceProductPage locale="en" slug={child} parentSlug={product} />
}
