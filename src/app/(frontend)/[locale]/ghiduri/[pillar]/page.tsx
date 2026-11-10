import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PillarPage, pillarMetadata, pillarParams } from '@/components/templates/GuidesHub'

/** One pillar of the guides (`/ghiduri/{pillar}`). */
type Props = { params: Promise<{ locale: string; pillar: string }> }

export const dynamicParams = true

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return params.locale === 'ro' ? pillarParams('ro') : []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, pillar } = await props.params
  return locale === 'ro' ? pillarMetadata(pillar, 'ro') : {}
}

export default async function Page(props: Props) {
  const { locale, pillar } = await props.params
  if (locale !== 'ro') notFound()
  return <PillarPage locale="ro" slug={pillar} />
}
