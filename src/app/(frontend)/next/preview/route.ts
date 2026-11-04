import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import { isLocale, localePath } from '@/i18n/config'
import { payloadClient } from '@/lib/content/payload'

/**
 * Admin "Preview" button: turns on Next draft mode for a signed-in staff member and opens
 * the page. Anyone else gets a 403, so drafts are never visible to the public.
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const path = url.searchParams.get('path') ?? '/'
  const locale = url.searchParams.get('locale') ?? 'ro'
  if (!path.startsWith('/') || path.startsWith('//') || !isLocale(locale)) {
    return new Response('Bad request', { status: 400 })
  }

  const payload = await payloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return new Response('Sign in to the admin to preview drafts.', { status: 403 })

  ;(await draftMode()).enable()
  redirect(localePath(path, locale))
}
