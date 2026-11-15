import { ArrowRightIcon } from '@ds/icons/icons'
import { SeasonChain, SeasonNext } from '@ds/patterns/Company'
import { Button } from '@ds/primitives/Button'
import type { Locale } from '@/i18n/config'
import { companyChain, companyUi, nextStep } from '@/lib/company'
import { sectionFor } from '@/lib/sections'

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
    aside: (
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

/** The end of a company page: the step it hands over to, and the pages around it. */
export function CompanyNext({ locale, url }: { locale: Locale; url: string }) {
  const section = sectionFor(locale, url)
  if (section?.id !== 'company') return null
  const t = companyUi[locale]
  const at = section.items.findIndex((i) => i.href === section.current)
  const around = (i: number, kicker: string) => {
    const item = section.items[i]
    return item && item.href !== url ? { kicker, label: item.label, href: item.href } : null
  }
  const step = nextStep(locale, url)
  return (
    <SeasonNext
      className="mt-20 md:mt-28"
      next={
        step && {
          kicker: t.next,
          number: step.number,
          total: step.total,
          label: step.label,
          body: step.body,
          href: step.href,
          icon: step.icon,
        }
      }
      pager={{
        label: t.inSection,
        // A sub-page (drying) goes back to its parent first.
        prev: section.current !== url ? around(at, t.prev) : around(at - 1, t.prev),
        next: around(at + 1, t.forward),
      }}
    />
  )
}
