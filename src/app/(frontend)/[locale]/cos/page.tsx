import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CartPage, cartMetadata } from '@/components/templates/CartPage'

/** Cart, in this language. The other language has its own route folder. */
type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params
  return locale === 'ro' ? cartMetadata('ro') : {}
}

export default async function Page(props: Props) {
  const { locale } = await props.params
  if (locale !== 'ro') notFound()
  return <CartPage locale="ro" />
}
