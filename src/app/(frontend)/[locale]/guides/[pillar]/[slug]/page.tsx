import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ArticlePage, articleMetadata, articleParams } from '@/components/templates/ArticlePage'

/** One farmer guide (`/en/guides/{pillar}/{slug}`). */
type Props = { params: Promise<{ locale: string; pillar: string; slug: string }> }

export const dynamicParams = true

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return params.locale === 'en' ? articleParams('ghid', 'en') : []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, pillar, slug } = await props.params
  return locale === 'en' ? articleMetadata({ section: 'ghid', pillar, slug }, 'en') : {}
}

export default async function Page(props: Props) {
  const { locale, pillar, slug } = await props.params
  if (locale !== 'en') notFound()
  return <ArticlePage locale="en" where={{ section: 'ghid', pillar, slug }} />
}
