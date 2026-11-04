import { describe, expect, it } from 'vitest'

import type { Figure } from '@/lib/content/globals'
import { slugify } from '@/lib/slugify'
import { absoluteUrl } from '@/lib/site'
import { buildMetadata } from '@/lib/seo/metadata'
import { indexXml, urlsetXml } from '@/lib/seo/sitemap'
import { breadcrumbs, faqPage, localBusiness, organization } from '@/lib/schema'

/** schema-dts types are unions of every subtype; tests read the built object as plain data. */
const plain = <T = Record<string, unknown>>(value: unknown) => value as T

const fig = (key: string, value: string, status: Figure['status']): Figure => ({
  key,
  label: key,
  value,
  status,
})

describe('slugify', () => {
  it('drops Romanian diacritics in both forms', () => {
    expect(slugify('Crețești')).toBe('cretesti')
    expect(slugify('Ştiubei')).toBe('stiubei')
    expect(slugify('Slobozia Mândră')).toBe('slobozia-mandra')
    expect(slugify('  Floarea-soarelui! ')).toBe('floarea-soarelui')
  })
})

describe('buildMetadata', () => {
  const base = {
    title: 'Despre',
    seoTitle: 'Despre Agrinvest: companie agricolă',
    description: 'x',
  }

  it('pairs hreflang with x-default to the Romanian page', () => {
    const m = buildMetadata({
      ...base,
      locale: 'en',
      alternates: { ro: '/despre', en: '/en/about' },
    })
    expect(m.alternates?.canonical).toBe(absoluteUrl('/en/about'))
    expect(m.alternates?.languages).toEqual({
      ro: absoluteUrl('/despre'),
      en: absoluteUrl('/en/about'),
      'x-default': absoluteUrl('/despre'),
    })
  })

  it('gives a one-language page a canonical but no hreflang', () => {
    const m = buildMetadata({ ...base, locale: 'ro', alternates: { ro: '/despre/cifre' } })
    expect(m.alternates?.canonical).toBe(absoluteUrl('/despre/cifre'))
    expect(m.alternates?.languages).toBeUndefined()
  })

  it('applies the title template only without an SEO title', () => {
    const m = buildMetadata({ locale: 'ro', title: 'Contact', alternates: { ro: '/contact' } })
    expect(m.title).toEqual({ absolute: 'Contact · Agrinvest' })
  })

  it('stays noindex before launch', () => {
    const m = buildMetadata({ ...base, locale: 'ro', alternates: { ro: '/despre' } })
    expect(m.robots).toEqual({ index: false, follow: false })
  })
})

describe('JSON-LD', () => {
  it('states only confirmed facts on the Organization', () => {
    const org = plain(
      organization({
        figures: {
          'C9.phone': fig('C9.phone', '+40 786 222 238', 'to-confirm'),
          'C9.email': fig('C9.email', 'office@agrinvest.ro', 'confirmed'),
          C1: fig('C1', '2003, la Buzău', 'confirmed'),
        },
      }),
    )
    expect(org.telephone).toBeUndefined()
    expect(org.email).toBe('office@agrinvest.ro')
    expect(org.foundingDate).toBe('2003')
  })

  it('hides a base address and phone until they are confirmed', () => {
    const input = {
      name: 'Pogoanele',
      slug: 'pogoanele',
      address: { locality: 'Pogoanele' },
      geo: { lat: 44.9, lng: 27 },
      phone: '0700 000 000',
    }
    const draft = plain(
      localBusiness({ ...input, locationStatus: 'to-confirm' }, '/baze/pogoanele'),
    )
    expect(draft.address).toBeUndefined()
    expect(draft.geo).toBeUndefined()
    expect(draft.telephone).toBeUndefined()
    const live = plain(
      localBusiness(
        { ...input, locationStatus: 'confirmed', contactStatus: 'confirmed' },
        '/baze/pogoanele',
      ),
    )
    expect(live.address).toMatchObject({ addressLocality: 'Pogoanele', addressCountry: 'RO' })
    expect(live.telephone).toBe('0700 000 000')
  })

  it('numbers breadcrumbs from home', () => {
    const list = plain<{ itemListElement: { position: number; item: string }[] }>(
      breadcrumbs('ro', 'Acasă', [{ name: 'Depozitare', url: '/depozitare' }]),
    )
    expect(list.itemListElement.map((i) => i.position)).toEqual([1, 2])
    expect(list.itemListElement[1].item).toBe(absoluteUrl('/depozitare'))
  })

  it('builds an FAQPage', () => {
    const faq = plain<{ mainEntity: unknown[] }>(faqPage([{ question: 'Cât?', answer: 'Mult.' }]))
    expect(faq.mainEntity).toHaveLength(1)
  })
})

describe('sitemaps', () => {
  it('writes hreflang links only for paired URLs', () => {
    const xml = urlsetXml([
      { url: '/despre', alternates: { ro: '/despre', en: '/en/about' } },
      { url: '/despre/cifre', alternates: { ro: '/despre/cifre' } },
    ])
    expect(xml.match(/hreflang="x-default"/g)).toHaveLength(1)
    expect(xml).toContain(`<loc>${absoluteUrl('/despre/cifre')}</loc>`)
  })

  it('indexes every segment', () => {
    expect(indexXml(['pages', 'bases'])).toContain(absoluteUrl('/sitemaps/bases.xml'))
  })
})
