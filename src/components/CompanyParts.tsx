import Link from 'next/link'

import { ArrowRightIcon } from '@ds/icons/icons'
import { SeasonChain, ServiceList } from '@ds/patterns/Company'
import { Photo } from '@ds/patterns/Photo'
import { SectionHeading } from '@ds/patterns/Sections'
import { Button } from '@ds/primitives/Button'
import type { Locale } from '@/i18n/config'
import { companyChain, companyCover, companyServices, companyUi, servicesPage } from '@/lib/company'

import { BaseListBlock } from './RenderBlocks'

/**
 * The company pages' title-band parts (kicker, actions, the season chain) for a page address,
 * or null for a page outside the company section. Feeds `PageTitle`.
 */
export function companyTitle(locale: Locale, url: string) {
  const chain = companyChain(locale, url)
  if (!chain) return null
  const t = companyUi[locale]
  const [first, ...rest] = chain.actions
  return {
    kicker: chain.kicker,
    align: 'center' as const,
    actions: (
      <>
        <Button href={first.href} icon={<ArrowRightIcon />}>
          {first.label}
        </Button>
        {rest.map((a) => (
          <Button key={a.href} href={a.href} variant="secondary">
            {a.label}
          </Button>
        ))}
      </>
    ),
    // The services page lists the same steps in full right below, so its band has a photo.
    aside: isServicesPage(locale, url) ? (
      <div className="relative aspect-3/2 overflow-hidden rounded-xl shadow-raised">
        <Photo
          src={companyCover}
          alt={companyServices(locale).cover}
          fill
          priority
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover"
        />
      </div>
    ) : (
      <SeasonChain
        title={chain.title}
        steps={chain.steps}
        here={url}
        hereLabel={t.here}
        again={t.again}
      />
    ),
  }
}

const isServicesPage = (locale: Locale, url: string) =>
  url.replace(/\/$/, '') === servicesPage[locale]

/**
 * The services page's lead: the whole package in season order, then the bases on the map. The
 * CMS blocks (the company's story) follow under their own heading, which the menu's About link
 * opens.
 */
export function CompanyServices({ locale, url }: { locale: Locale; url: string }) {
  if (!isServicesPage(locale, url)) return null
  const { services, kicker, title, intro, about, map } = companyServices(locale)
  return (
    <>
      <ServiceList kicker={kicker} title={title} intro={intro} services={services} />
      <div className="mt-20 grid gap-6 md:mt-28">
        <BaseListBlock
          block={{ showMap: true }}
          ctx={{ locale }}
          head={
            <SectionHeading
              kicker={map.kicker}
              title={map.title}
              lead={map.lead}
              className="mb-10 md:mb-12"
            />
          }
        />
        <ul className="mx-auto flex w-full max-w-page flex-wrap justify-center gap-x-6 gap-y-2 px-4 md:px-8">
          {map.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                prefetch={false}
                className="inline-flex items-center gap-1 font-medium text-accent no-underline hover:underline"
              >
                {link.label}
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <h2
        id="compania"
        className="mx-auto mt-20 w-full max-w-page scroll-mt-24 px-4 text-h1 font-semibold md:mt-28 md:px-8"
      >
        {about}
      </h2>
    </>
  )
}
