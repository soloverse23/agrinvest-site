import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { GuidePage, guideMetadata, guideParams } from '@/components/templates/GuidePage'

/** English guides. The other language has its own route folder. */
type Props = { params: Promise<{ locale: string; slug: string }> }

export const dynamicParams = true

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return params.locale === 'en' ? guideParams('en') : []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, slug } = await props.params
  return locale === 'en' ? guideMetadata('en', slug) : {}
}

export default async function Page(props: Props) {
  const { locale, slug } = await props.params
  if (locale !== 'en') notFound()
  return <GuidePage locale="en" slug={slug} />
}
