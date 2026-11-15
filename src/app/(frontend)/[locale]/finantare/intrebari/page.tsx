import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  FinanceQuestionIndex,
  questionIndexMetadata,
} from '@/components/templates/FinanceQuestionIndex'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params
  return locale === 'ro' ? questionIndexMetadata('ro') : {}
}

export default async function Page(props: Props) {
  const { locale } = await props.params
  if (locale !== 'ro') notFound()
  return <FinanceQuestionIndex locale="ro" />
}
