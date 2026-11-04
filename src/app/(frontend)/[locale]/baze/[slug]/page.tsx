import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { baseMetadata, BasePage, baseParams } from '@/components/templates/BasePage'

/** Romanian base pages (`/baze/{slug}`). The other language has its own route folder. */
type Props = { params: Promise<{ locale: string; slug: string }> }

export const dynamicParams = true

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return params.locale === 'ro' ? baseParams() : []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, slug } = await props.params
  return locale === 'ro' ? baseMetadata('ro', slug) : {}
}

export default async function Page(props: Props) {
  const { locale, slug } = await props.params
  if (locale !== 'ro') notFound()
  return <BasePage locale="ro" slug={slug} />
}
