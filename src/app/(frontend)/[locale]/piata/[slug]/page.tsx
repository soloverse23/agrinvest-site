import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  marketNoteMetadata,
  MarketNotePage,
  marketNoteParams,
} from '@/components/templates/MarketPage'

/** One market note (`/piata/{slug}`). */
type Props = { params: Promise<{ locale: string; slug: string }> }

export const dynamicParams = true

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return params.locale === 'ro' ? marketNoteParams('ro') : []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, slug } = await props.params
  return locale === 'ro' ? marketNoteMetadata('ro', slug) : {}
}

export default async function Page(props: Props) {
  const { locale, slug } = await props.params
  if (locale !== 'ro') notFound()
  return <MarketNotePage locale="ro" slug={slug} />
}
