import { CompanySection, FinanceToolsRow } from '@ds/patterns/HomeSections'
import { FactMark } from '@/components/Fact'
import { FactText } from '@/components/FactText'
import { localePath, type Locale } from '@/i18n/config'
import { homeUi } from '@/i18n/home'
import {
  dieselPath,
  fertiliserPricesPath,
  financePath,
  financeRoutePath,
  netPricePath,
  toolsHubPath,
} from '@/i18n/routes'
import { fixedUrl } from '@/i18n/ui'
import { getFigures } from '@/lib/content/globals'

/** Pages the company tiles open; Logistics and About are CMS pages with these paths. */
const paths = {
  logistics: { ro: '/logistica', en: '/logistics' },
  about: { ro: '/despre', en: '/about' },
} as const

/** Home: financing and the farm tools in one row. */
export async function HomeFinanceTools({ locale }: { locale: Locale }) {
  const t = homeUi[locale]
  const figures = await getFigures(locale)
  return (
    <FinanceToolsRow
      finance={{
        kicker: t.finance.kicker,
        title: t.finance.title,
        note: <FactMark figure={figures['F5.instalments']} locale={locale} />,
        instalments: t.finance.instalments,
        cta: { href: financePath(locale), label: t.finance.cta },
      }}
      tools={{
        title: t.tools.title,
        items: [
          { key: 'netPrice', href: netPricePath(locale), label: t.tools.netPrice },
          {
            key: 'simulator',
            href: financeRoutePath('simulator', locale),
            label: t.tools.simulator,
          },
          { key: 'fertilisers', href: fertiliserPricesPath(locale), label: t.tools.fertilisers },
          { key: 'diesel', href: dieselPath(locale), label: t.tools.diesel },
        ],
        all: { href: toolsHubPath(locale), label: t.tools.all },
      }}
    />
  )
}

/** Home: Agrinvest in one section, with four register figures and four links. */
export async function HomeCompany({ locale }: { locale: Locale }) {
  const t = homeUi[locale].company
  const figures = await getFigures(locale)
  const fact = (text: string) => <FactText text={text} figures={figures} locale={locale} />
  return (
    <CompanySection
      kicker={t.kicker}
      title={t.title}
      figures={(['S2', 'S1', 'C4', 'L1'] as const)
        .filter((key) => figures[key])
        .map((key) => ({ key, value: fact(`{{${key}}}`), label: t.figures[key] }))}
      tiles={[
        {
          href: fixedUrl('grain', locale),
          icon: 'wheat',
          title: t.tiles.grain.title,
          line: fact(t.tiles.grain.line),
        },
        {
          href: fixedUrl('storage', locale),
          icon: 'silo',
          title: t.tiles.storage.title,
          line: t.tiles.storage.line,
        },
        {
          href: localePath(paths.logistics[locale], locale),
          icon: 'truck',
          title: t.tiles.logistics.title,
          line: t.tiles.logistics.line,
        },
        {
          href: localePath(paths.about[locale], locale),
          icon: 'handshake',
          title: t.tiles.about.title,
          line: t.tiles.about.line,
        },
      ]}
    />
  )
}
