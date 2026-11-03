import { indexXml, segments, xmlResponse } from '@/lib/seo/sitemap'

export const revalidate = 3600

export function GET() {
  return xmlResponse(indexXml(Object.keys(segments)))
}
