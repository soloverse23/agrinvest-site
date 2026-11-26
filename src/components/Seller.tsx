import type { ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import { commerceUi } from '@/i18n/commerce'
import type { Figures } from '@/lib/content/globals'

import { FactMark } from './Fact'

/**
 * The seller's identity, from the figures register: name, CUI, trade register, EUID, both
 * offices and the country. ING WebPay asks for it on every page and on the payment page.
 */
export function sellerLines(figures: Figures, locale: Locale): ReactNode[] {
  const t = commerceUi[locale]
  const line = (label: string | null, key: string, suffix?: string) => {
    const figure = figures[key]
    if (!figure) return null
    return (
      <>
        {label && `${label}: `}
        {figure.value}
        {suffix}
        <FactMark figure={figure} locale={locale} />
      </>
    )
  }
  return [
    'Agrinvest SRL',
    line(t.cui, 'C11.cui'),
    line(t.reg, 'C11.reg'),
    line(t.euid, 'C11.euid'),
    line(t.registeredOffice, 'C3', `, ${t.country}`),
    line(t.commercialOffice, 'C12', `, ${t.country}`),
  ].filter(Boolean)
}

/** The shop's contact lines: orders phone and email, linked. */
export function sellerContacts(figures: Figures, locale: Locale) {
  const t = commerceUi[locale]
  const phone = figures['C13.phone']
  const email = figures['C13.email']
  return [
    ...(phone
      ? [
          {
            label: t.ordersPhone,
            href: `tel:${phone.value.replace(/\s/g, '')}`,
            value: (
              <>
                {phone.value}
                <FactMark figure={phone} locale={locale} />
              </>
            ),
          },
        ]
      : []),
    ...(email
      ? [
          {
            label: t.ordersEmail,
            href: `mailto:${email.value}`,
            value: (
              <>
                {email.value}
                <FactMark figure={email} locale={locale} />
              </>
            ),
          },
        ]
      : []),
  ]
}
