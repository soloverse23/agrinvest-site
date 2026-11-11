import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { Locale } from '@/i18n/config'

import { headerProps } from '../fixtures/props'
import { footerColumns, menuNav, shopPanelData } from '../fixtures/menu'
import { storyLocale } from '../fixtures/story'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

const meta: Meta = { title: 'Patterns/Navigation', parameters: { layout: 'fullscreen' } }
export default meta
type Story = StoryObj

const l = (locale: Locale, ro: string, en: string) => (locale === 'ro' ? ro : en)

const header = (locale: Locale, openPanel?: string, current = '/magazin') => {
  const base = headerProps(locale)
  return (
    <div className="min-h-[34rem]">
      <SiteHeader
        {...base}
        nav={menuNav(locale)}
        shop={shopPanelData(locale)}
        current={current}
        openPanel={openPanel}
        phone="+40 786 222 238"
        labels={{
          ...base.labels,
          all: l(locale, 'Vezi tot', 'See all'),
          call: l(locale, 'Sună', 'Call'),
        }}
      />
    </div>
  )
}

/** The shop panel: categories with counts, crops, brands, search and a financing hint. */
export const ShopMenu: Story = {
  name: 'Mega menu: shop',
  render: (_, { globals }) => header(storyLocale(globals), '/magazin'),
}

/** A grouped panel: crop prices, other prices and tools under their headings. */
export const GroupedMenu: Story = {
  name: 'Mega menu: grouped links',
  render: (_, { globals }) => header(storyLocale(globals), '/preturi', '/preturi'),
}

export const CompanyMenu: Story = {
  name: 'Mega menu: Company',
  render: (_, { globals }) => header(storyLocale(globals), '/despre', '/despre'),
}

/** Closed: ticker with each crop and diesel as links, then the five items. */
export const ClosedMenu: Story = {
  name: 'Header: five items',
  render: (_, { globals }) => header(storyLocale(globals)),
}

export const Footer: Story = {
  name: 'Footer: five columns and brand',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <SiteFooter
        homeHref="/"
        about={l(
          locale,
          'Companie agricolă cu capital românesc, care lucrează direct cu fermierii.',
          'A Romanian-owned agribusiness that works directly with farmers.',
        )}
        labels={{ contact: 'Contact', social: 'Social', footer: l(locale, 'Subsol', 'Footer') }}
        contact={[
          {
            label: l(locale, 'Telefon', 'Phone'),
            value: '+40 786 222 238',
            href: 'tel:+40786222238',
          },
          { label: 'E-mail', value: 'office@agrinvest.ro', href: 'mailto:office@agrinvest.ro' },
        ]}
        columns={footerColumns(locale)}
        social={[
          { href: 'https://www.linkedin.com/company/sc-agrinvest-srl', label: 'LinkedIn' },
          { href: 'https://www.facebook.com/agrinvest', label: 'Facebook' },
          { href: 'https://www.youtube.com/@agrinvest', label: 'YouTube' },
        ]}
        legal={l(
          locale,
          'Agrinvest SRL și Agrinvest Credit IFN SA, companii cu capital românesc.',
          'Agrinvest SRL and Agrinvest Credit IFN SA, Romanian-owned companies.',
        )}
        bottomLinks={[
          { href: '/confidentialitate', label: l(locale, 'Confidențialitate', 'Privacy') },
          { href: '/termeni', label: l(locale, 'Termeni', 'Terms') },
        ]}
      />
    )
  },
}
