import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { defaultLocale, locales } from './i18n/config'

/**
 * Locale routing.
 * - `/en/...` is served as is.
 * - `/ro/...` permanently redirects to the unprefixed URL, so each page has one canonical address.
 * - Every other path is rewritten internally to `/ro/...`.
 */
export function proxy(request: NextRequest) {
  return withStaffHint(request, route(request))
}

/**
 * The panel session cookie is httpOnly, so pages cannot see it. A readable `ag-staff=1` flag,
 * kept in step with it, tells the page to ask `/api/panel/here` for its edit links; visitors
 * never send that request. The flag grants nothing: the endpoint checks the real session.
 */
export const STAFF_HINT = 'ag-staff'

function withStaffHint(request: NextRequest, response: NextResponse): NextResponse {
  const signedIn = request.cookies.has('payload-token')
  const hinted = request.cookies.get(STAFF_HINT)?.value === '1'
  if (signedIn && !hinted)
    response.cookies.set(STAFF_HINT, '1', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
  else if (!signedIn && request.cookies.has(STAFF_HINT)) response.cookies.delete(STAFF_HINT)
  return response
}

function route(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl
  const [, first] = pathname.split('/')

  if (first === defaultLocale) {
    const stripped = pathname.slice(defaultLocale.length + 1) || '/'
    return NextResponse.redirect(new URL(stripped + search, request.url), 308)
  }

  if ((locales as readonly string[]).includes(first)) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  // Skip Payload (admin + API), Next internals and files with an extension.
  matcher: ['/((?!admin|api|next/|_next|.*\\..*).*)'],
}
