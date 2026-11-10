import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ArticlePage, articleMetadata, articleParams } from '@/components/templates/ArticlePage'

/** One Agrinvest news piece (`/en/news/{slug}`). */
type Props = { params: Promise<{ locale: string; slug: string }> }

export const dynamicParams = true

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return params.locale === 'en' ? articleParams('stiri', 'en') : []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, slug } = await props.params
  return locale === 'en' ? articleMetadata({ section: 'stiri', slug }, 'en') : {}
}

export default async function Page(props: Props) {
  const { locale, slug } = await props.params
  if (locale !== 'en') notFound()
  return <ArticlePage locale="en" where={{ section: 'stiri', slug }} />
}
