import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { GuidesHubPage, hubMetadata } from '@/components/templates/GuidesHub'

/** The knowledge hub (`/en/guides`). The other language has its own route folder. */
type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  return (await props.params).locale === 'en' ? hubMetadata('en') : {}
}

export default async function Page(props: Props) {
  if ((await props.params).locale !== 'en') notFound()
  return <GuidesHubPage locale="en" />
}
