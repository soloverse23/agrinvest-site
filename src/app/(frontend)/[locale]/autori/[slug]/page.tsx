import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { AuthorPage, authorMetadata, authorParams } from '@/components/templates/AuthorPage'

/** An author (`/autori/{slug}`). */
type Props = { params: Promise<{ locale: string; slug: string }> }

export const dynamicParams = true

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return params.locale === 'ro' ? authorParams() : []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, slug } = await props.params
  return locale === 'ro' ? authorMetadata(slug, 'ro') : {}
}

export default async function Page(props: Props) {
  const { locale, slug } = await props.params
  if (locale !== 'ro') notFound()
  return <AuthorPage locale="ro" slug={slug} />
}
