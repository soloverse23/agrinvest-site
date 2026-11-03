import { isSegment, segments, urlsetXml, xmlResponse } from '@/lib/seo/sitemap'

export const revalidate = 3600

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const name = (await params).name.replace(/\.xml$/, '')
  if (!isSegment(name)) return new Response('Not found', { status: 404 })
  return xmlResponse(urlsetXml(await segments[name]()))
}
