import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { NewsDayPage, newsDayMetadata } from '@/components/templates/NewsPages'
import { getEdition } from '@/lib/news/load'

/** `/stiri/zi/{date}`: one day's ranked news (Phase 7e). The other language has its own route folder. */
type Props = { params: Promise<{ locale: string; date: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, date } = await props.params
  return locale === 'ro' ? newsDayMetadata('ro', date) : {}
}

export default async function Page(props: Props) {
  const { locale, date } = await props.params
  if (locale !== 'ro' || !(await getEdition(date))) notFound()
  return <NewsDayPage locale="ro" date={date} />
}
