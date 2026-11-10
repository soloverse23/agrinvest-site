import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ArticlePage, articleMetadata, articleParams } from '@/components/templates/ArticlePage'

/** One Agrinvest news piece (`/stiri/{slug}`). */
type Props = { params: Promise<{ locale: string; slug: string }> }

export const dynamicParams = true

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return params.locale === 'ro' ? articleParams('stiri', 'ro') : []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, slug } = await props.params
  return locale === 'ro' ? articleMetadata({ section: 'stiri', slug }, 'ro') : {}
}

export default async function Page(props: Props) {
  const { locale, slug } = await props.params
  if (locale !== 'ro') notFound()
  return <ArticlePage locale="ro" where={{ section: 'stiri', slug }} />
}
