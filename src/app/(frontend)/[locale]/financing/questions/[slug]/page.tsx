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
  return params.locale === 'en' ? questionParams('en') : []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, slug } = await props.params
  return locale === 'en' ? questionMetadata('en', slug) : {}
}

export default async function Page(props: Props) {
  const { locale, slug } = await props.params
  if (locale !== 'en') notFound()
  return <FinanceQuestionPage locale="en" slug={slug} />
}
