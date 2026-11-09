import { notFound } from 'next/navigation'

import { ApplicationForm } from '@ds/patterns/ApplicationForm'
import { FactText } from '@/components/FactText'
import type { Locale } from '@/i18n/config'
import { applicationUi } from '@/i18n/finance-apply'
import { financeRoutePath, financeRoutes } from '@/i18n/routes'
import { fixedUrl } from '@/i18n/ui'
import { lookupCompany } from '@/lib/commerce/actions'
import { getFinancePage, listFinanceProducts } from '@/lib/content/finance'
import { getFigures } from '@/lib/content/globals'
import { listCounties } from '@/lib/content/locations'
import { submitApplication } from '@/lib/finance/actions'
import { applicationPrefill } from '@/lib/finance/application'
import { harvestCropLabels, harvestCrops } from '@/lib/finance/calendar'
import { maxTermMonths } from '@/lib/finance/choices'
import {
  borrowerKinds,
  borrowerLabels,
  guaranteeKinds,
  guaranteeLabels,
} from '@/lib/finance/options'
import type { RawParams } from '@/lib/finance/simulator'

import { ToolFrame } from './FinanceToolPage'

/**
 * Its own file, so the simulator's route does not load the application form's client code.
 */
/** `/finantare/aplica`: the application on one page, like checkout. */
export async function ApplicationPage({ locale, params }: { locale: Locale; params: RawParams }) {
  const page = await getFinancePage(financeRoutes.apply[locale], locale)
  if (!page) notFound()
  const [figures, maxMonths, products, counties] = await Promise.all([
    getFigures(locale),
    maxTermMonths(locale),
    listFinanceProducts(locale),
    listCounties(),
  ])
  const prefill = applicationPrefill(params, (slug) => products.find((p) => p.slug === slug)?.id)
  const url = financeRoutePath('apply', locale)
  return (
    <ToolFrame locale={locale} tool="apply" page={page} figures={figures}>
      <div className="mx-auto mt-10 max-w-page px-4 md:px-8">
        <div className="max-w-2xl">
          <ApplicationForm
            locale={locale}
            labels={applicationUi[locale]}
            action={submitApplication}
            lookup={lookupCompany}
            borrowers={borrowerKinds.map((k) => ({ value: k, label: borrowerLabels[k][locale] }))}
            counties={counties.map((c) => ({ value: String(c.id), label: c.name }))}
            products={products.map((p) => ({ value: String(p.id), label: p.title }))}
            crops={harvestCrops.map((c) => ({ value: c, label: harvestCropLabels[c][locale] }))}
            guarantees={guaranteeKinds.map((k) => ({
              value: k,
              label: guaranteeLabels[k][locale],
            }))}
            maxMonths={maxMonths}
            replyTime={<FactText text="{{F4.reply}}" figures={figures} locale={locale} />}
            sourcePath={url}
            privacyHref={fixedUrl('privacy', locale)}
            initialState={{ status: 'idle', values: prefill }}
          />
        </div>
      </div>
    </ToolFrame>
  )
}
