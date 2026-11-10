import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { AuthorPage, authorMetadata, authorParams } from '@/components/templates/AuthorPage'

/** An author (`/en/authors/{slug}`). */
type Props = { params: Promise<{ locale: string; slug: string }> }

export const dynamicParams = true

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return params.locale === 'en' ? authorParams() : []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, slug } = await props.params
  return locale === 'en' ? authorMetadata(slug, 'en') : {}
}

export default async function Page(props: Props) {
  const { locale, slug } = await props.params
  if (locale !== 'en') notFound()
  return <AuthorPage locale="en" slug={slug} />
}
