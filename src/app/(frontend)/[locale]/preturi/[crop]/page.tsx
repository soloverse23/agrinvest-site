import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { cropPriceMetadata, CropPricePage, cropPriceParams } from '@/components/templates/PricePage'

/** One crop's prices (`/preturi/{crop}`), by the crop's own slug. */
type Props = { params: Promise<{ locale: string; crop: string }> }

export const dynamicParams = true

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return params.locale === 'ro' ? cropPriceParams('ro') : []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, crop } = await props.params
  return locale === 'ro' ? cropPriceMetadata('ro', crop) : {}
}

export default async function Page(props: Props) {
  const { locale, crop } = await props.params
  if (locale !== 'ro') notFound()
  return <CropPricePage locale="ro" slug={crop} />
}
