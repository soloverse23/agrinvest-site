import { ActionBar, ConsultantButton } from '@ds/patterns/FinanceGuide'
import { ConsultantLauncherLazy } from '@ds/patterns/Lazy'
import type { Locale } from '@/i18n/config'
import { financeGuideUi } from '@/i18n/finance-guide'
import { financeRoutePath } from '@/i18n/routes'
import { fixedUrl } from '@/i18n/ui'
import { getFigures } from '@/lib/content/globals'
import { submitConsultant } from '@/lib/finance/consultant'
import { needs } from '@/lib/finance/needs'

/**
 * The consultant drawer and the phone action bar, once per finance page (Phase 7g). Every
 * `ConsultantButton` on the page opens the drawer; without JavaScript they lead to the
 * detailed application.
 */
export async function FinanceConsultant({
  locale,
  sourcePath,
  need,
  credit,
  creditSlug,
}: {
  locale: Locale
  sourcePath: string
  need?: string
  /** The credit page's key, stored in the lead. */
  credit?: string
  /** The credit's slug in this language, to pre-fill the detailed application. */
  creditSlug?: string
}) {
  const t = financeGuideUi[locale]
  const reply = (await getFigures(locale))['F4.reply']
  return (
    <>
      <ConsultantLauncherLazy
        locale={locale}
        action={submitConsultant}
        sourcePath={sourcePath}
        privacyHref={fixedUrl('privacy', locale)}
        needs={needs.map((n) => ({ id: n.id, label: n.label[locale] }))}
        defaultNeed={need}
        credit={credit}
        applyHref={`${financeRoutePath('apply', locale)}${creditSlug ? `?produs=${encodeURIComponent(creditSlug)}` : ''}`}
        reply={reply?.status === 'confirmed' ? reply.value : undefined}
      />
      <ActionBar>
        <ConsultantButton href={financeRoutePath('apply', locale)} need={need} fullWidth>
          {t.consultant}
        </ConsultantButton>
      </ActionBar>
      {/* Room for the phone action bar, so it never covers the end of the page. */}
      <div className="h-20 md:hidden" aria-hidden="true" />
    </>
  )
}
