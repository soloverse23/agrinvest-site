import { localePath } from '@/i18n/config'
import { getSeoDefaults } from '@/lib/content/globals'
import { listBases, listCrops } from '@/lib/content/locations'
import { payloadClient } from '@/lib/content/payload'
import { absoluteUrl } from '@/lib/site'

export const revalidate = 3600

/**
 * `llms.txt`: a plain index of the site for language-model tools. A help, not a substitute
 * for crawlable pages and sitemaps; built from the same published content.
 */
export async function GET() {
  const payload = await payloadClient()
  const [seoRo, seoEn, bases, crops] = await Promise.all([
    getSeoDefaults('ro'),
    getSeoDefaults('en'),
    listBases('ro'),
    listCrops('ro'),
  ])
  const section = async (locale: 'ro' | 'en') => {
    const { docs } = await payload.find({
      collection: 'pages',
      locale,
      depth: 0,
      limit: 500,
      pagination: false,
      overrideAccess: false,
      where: { languages: { contains: locale }, 'seo.noindex': { not_equals: true } },
      select: { title: true, path: true, summary: true },
      sort: 'path',
    })
    return docs
      .filter((d) => d.path)
      .map(
        (d) =>
          `- [${d.title}](${absoluteUrl(localePath(d.path as string, locale))})${d.summary ? `: ${d.summary}` : ''}`,
      )
  }
  const [ro, en] = await Promise.all([section('ro'), section('en')])

  const body = [
    `# ${seoRo.siteName}`,
    '',
    `> ${seoRo.description ?? ''}`,
    '',
    `${seoEn.description ?? ''}`,
    '',
    '## Pagini (română)',
    ...ro,
    '',
    '## Pages (English)',
    ...en,
    '',
    '## Baze de depozitare',
    ...bases.map((b) => `- [Baza ${b.name}](${absoluteUrl(localePath(`/baze/${b.slug}`, 'ro'))})`),
    '',
    '## Cereale',
    ...crops.map((c) => `- [${c.name}](${absoluteUrl(localePath(`/cereale/${c.slug}`, 'ro'))})`),
    '',
  ].join('\n')

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
