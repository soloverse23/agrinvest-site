import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ArticlePage, articleMetadata, articleParams } from '@/components/templates/ArticlePage'

/** One farmer guide (`/ghiduri/{pillar}/{slug}`). */
type Props = { params: Promise<{ locale: string; pillar: string; slug: string }> }

export const dynamicParams = true

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return params.locale === 'ro' ? articleParams('ghid', 'ro') : []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, pillar, slug } = await props.params
  return locale === 'ro' ? articleMetadata({ section: 'ghid', pillar, slug }, 'ro') : {}
}

export default async function Page(props: Props) {
  const { locale, pillar, slug } = await props.params
  if (locale !== 'ro') notFound()
  return <ArticlePage locale="ro" where={{ section: 'ghid', pillar, slug }} />
}
