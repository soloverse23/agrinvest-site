import { notFound, permanentRedirect } from 'next/navigation'

import { financeRoutePath } from '@/i18n/routes'

/** The old FAQ page: its questions are their own pages since Phase 7g. */
type Props = { params: Promise<{ locale: string }> }

export default async function Page(props: Props) {
  if ((await props.params).locale !== 'ro') notFound()
  permanentRedirect(financeRoutePath('questions', 'ro'))
}
