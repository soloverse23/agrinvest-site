import { redirect } from 'next/navigation'

/**
 * The footer's "Autentificare echipă": opens the panel sign-in and, after it, brings the
 * person back to the page they came from, where "Editează pagina" then shows. Only a path on
 * this site is passed on (Payload checks it again); anything else falls back to the panel.
 */
export function GET(request: Request): never {
  const here = new URL(request.url)
  let back = ''
  try {
    const from = new URL(request.headers.get('referer') ?? '')
    if (from.origin === here.origin && !from.pathname.startsWith('/admin'))
      back = from.pathname + from.search
  } catch {
    back = ''
  }
  redirect(back ? `/admin/login?redirect=${encodeURIComponent(back)}` : '/admin/login')
}
