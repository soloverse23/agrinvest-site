import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { baseMetadata, BasePage, baseParams } from '@/components/templates/BasePage'

/** English base pages (`/en/bases/{slug}`). The other language has its own route folder. */
type Props = { params: Promise<{ locale: string; slug: string }> }

export const dynamicParams = true

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return params.locale === 'en' ? baseParams() : []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, slug } = await props.params
  return locale === 'en' ? baseMetadata('en', slug) : {}
}

export default async function Page(props: Props) {
  const { locale, slug } = await props.params
  if (locale !== 'en') notFound()
  return <BasePage locale="en" slug={slug} />
}
