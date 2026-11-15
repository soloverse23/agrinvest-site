import { notFound, permanentRedirect } from 'next/navigation'

import { baseUrl } from '@/i18n/routes'

/**
 * Old English base pages (`/en/bases/{slug}`). Bases have no pages of their own any
 * more: the URL moves to the base's dot on the storage page's map.
 */
type Props = { params: Promise<{ locale: string; slug: string }> }

export default async function Page(props: Props) {
  const { locale, slug } = await props.params
  if (locale !== 'en') notFound()
  permanentRedirect(baseUrl(slug, 'en'))
}
