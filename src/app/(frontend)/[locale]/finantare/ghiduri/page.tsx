import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { GuideIndex, guideIndexMetadata } from '@/components/templates/GuideIndex'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  return (await props.params).locale === 'ro' ? guideIndexMetadata('ro') : {}
}

export default async function Page(props: Props) {
  if ((await props.params).locale !== 'ro') notFound()
  return <GuideIndex locale="ro" />
}
