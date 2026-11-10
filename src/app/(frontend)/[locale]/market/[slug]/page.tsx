import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  marketNoteMetadata,
  MarketNotePage,
  marketNoteParams,
} from '@/components/templates/MarketPage'

/** One market note (`/en/market/{slug}`). */
type Props = { params: Promise<{ locale: string; slug: string }> }

export const dynamicParams = true

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return params.locale === 'en' ? marketNoteParams('en') : []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, slug } = await props.params
  return locale === 'en' ? marketNoteMetadata('en', slug) : {}
}

export default async function Page(props: Props) {
  const { locale, slug } = await props.params
  if (locale !== 'en') notFound()
  return <MarketNotePage locale="en" slug={slug} />
}
