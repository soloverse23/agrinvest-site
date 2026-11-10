import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { DieselPage, dieselMetadata } from '@/components/templates/ToolPages'

/** `/motorina`. The other language has its own route folder. */
type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  return (await props.params).locale === 'ro' ? dieselMetadata('ro') : {}
}

export default async function Page(props: Props) {
  if ((await props.params).locale !== 'ro') notFound()
  return <DieselPage locale="ro" />
}
