import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  FinanceQuestionPage,
  questionMetadata,
  questionParams,
} from '@/components/templates/FinanceQuestionPage'

type Props = { params: Promise<{ locale: string; slug: string }> }

export const dynamicParams = true

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return params.locale === 'ro' ? questionParams('ro') : []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, slug } = await props.params
  return locale === 'ro' ? questionMetadata('ro', slug) : {}
}

export default async function Page(props: Props) {
  const { locale, slug } = await props.params
  if (locale !== 'ro') notFound()
  return <FinanceQuestionPage locale="ro" slug={slug} />
}
