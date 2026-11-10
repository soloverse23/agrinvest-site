import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { cropPriceMetadata, CropPricePage, cropPriceParams } from '@/components/templates/PricePage'

/** One crop's prices (`/en/prices/{crop}`), by the crop's own slug. */
type Props = { params: Promise<{ locale: string; crop: string }> }

export const dynamicParams = true

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return params.locale === 'en' ? cropPriceParams('en') : []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, crop } = await props.params
  return locale === 'en' ? cropPriceMetadata('en', crop) : {}
}

export default async function Page(props: Props) {
  const { locale, crop } = await props.params
  if (locale !== 'en') notFound()
  return <CropPricePage locale="en" slug={crop} />
}
