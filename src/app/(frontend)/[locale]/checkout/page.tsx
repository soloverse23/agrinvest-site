import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CheckoutPage, checkoutMetadata } from '@/components/templates/CheckoutPage'

/** Checkout, in this language. The other language has its own route folder. */
type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params
  return locale === 'en' ? checkoutMetadata('en') : {}
}

export default async function Page(props: Props) {
  const { locale } = await props.params
  if (locale !== 'en') notFound()
  return <CheckoutPage locale="en" />
}
