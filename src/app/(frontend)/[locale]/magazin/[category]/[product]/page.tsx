import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { productMetadata, ProductPage, productParams } from '@/components/templates/ProductPage'

/** A product page in this language. The other language has its own route folder. */
type Props = { params: Promise<{ locale: string; category: string; product: string }> }

export const dynamicParams = true

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return params.locale === 'ro' ? productParams('ro') : []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, category, product } = await props.params
  return locale === 'ro' ? productMetadata('ro', category, product) : {}
}

export default async function Page(props: Props) {
  const { locale, category, product } = await props.params
  if (locale !== 'ro') notFound()
  return <ProductPage locale="ro" category={category} slug={product} />
}
