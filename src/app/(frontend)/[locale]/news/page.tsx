import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { NewsPage, newsMetadata } from '@/components/templates/ToolPages'

/** `/en/news`. The other language has its own route folder. */
type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  return (await props.params).locale === 'en' ? newsMetadata('en') : {}
}

export default async function Page(props: Props) {
  if ((await props.params).locale !== 'en') notFound()
  return <NewsPage locale="en" />
}
