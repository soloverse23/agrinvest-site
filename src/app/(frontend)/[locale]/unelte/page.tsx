import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ToolsHubPage, toolsHubMetadata } from '@/components/templates/ToolsHub'

/** `/unelte`. The other language has its own route folder. */
type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  return (await props.params).locale === 'ro' ? toolsHubMetadata('ro') : {}
}

export default async function Page(props: Props) {
  if ((await props.params).locale !== 'ro') notFound()
  return <ToolsHubPage locale="ro" />
}
