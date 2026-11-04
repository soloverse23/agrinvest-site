import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { cropMetadata, CropPage, cropParams } from '@/components/templates/CropPage'

/** English crop pages (`/en/grain/{crop}`). The other language has its own route folder. */
type Props = { params: Promise<{ locale: string; crop: string }> }

export const dynamicParams = true

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return params.locale === 'en' ? cropParams('en') : []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, crop } = await props.params
  return locale === 'en' ? cropMetadata('en', crop) : {}
}

export default async function Page(props: Props) {
  const { locale, crop } = await props.params
  if (locale !== 'en') notFound()
  return <CropPage locale="en" slug={crop} />
}
