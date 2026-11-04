import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { commerceUi } from '@/i18n/commerce'

import { storyLocale } from '../fixtures/story'
import { CartLink } from './CartLink'
import { CheckoutForm } from './CheckoutForm'
import { AddToCartForm, CartTable, OrderNotice, OrderSummary } from './Commerce'

const meta: Meta = { title: 'Patterns/Commerce', parameters: { layout: 'fullscreen' } }
export default meta
type Story = StoryObj

const Page = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto grid max-w-page gap-8 px-4 py-8 md:px-8">{children}</div>
)
const noop = async () => {}

/** A plain form: it works without JavaScript and opens the cart. */
export const AddToCart: Story = {
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    const t = commerceUi[locale]
    return (
      <Page>
        <AddToCartForm
          action={noop}
          sku="AGR-1"
          locale={locale}
          labels={{ add: t.add, quantity: t.quantity }}
        />
      </Page>
    )
  },
}

/** Shown instead of the button when a product cannot be ordered online. */
export const Notice: Story = {
  render: (_, { globals }) => {
    const t = commerceUi[storyLocale(globals)]
    return (
      <Page>
        <OrderNotice title={t.blockTitle}>{t.blockReasons['registration-expired']}</OrderNotice>
      </Page>
    )
  },
}

export const Cart: Story = {
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    const t = commerceUi[locale]
    return (
      <Page>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <CartTable
              action={noop}
              locale={locale}
              labels={{ quantity: t.quantity, update: t.update, remove: t.remove, each: t.each }}
              rows={[
                {
                  sku: 'AGR-1',
                  name: 'Adengo',
                  href: '#a',
                  pack: '1 l',
                  unitPrice: '700 lei',
                  lineTotal: '1.400 lei',
                  quantity: 2,
                },
                {
                  sku: 'AGR-2',
                  name: 'Tazer 250 SC',
                  pack: '5 l',
                  unitPrice: '1.275 lei',
                  lineTotal: '1.275 lei',
                  quantity: 1,
                  problem: t.problems['sale-stopped'],
                },
              ]}
            />
          </div>
          <div className="lg:col-span-4">
            <OrderSummary
              title={t.summary}
              rows={[
                { label: t.products, value: '2.675 lei' },
                { label: t.delivery, value: t.deliveryValue },
              ]}
              total={{ label: t.total, value: '2.675 lei' }}
              note={t.totalNote}
              action={{ href: '#checkout', label: t.toCheckout }}
            />
          </div>
        </div>
      </Page>
    )
  },
}

/** The header's cart. The count comes from a cookie, so it is 0 here. */
export const HeaderCart: Story = {
  render: (_, { globals }) => (
    <Page>
      <CartLink href="#cart" label={commerceUi[storyLocale(globals)].cart} />
    </Page>
  ),
}

const form = {
  action: async () => ({ status: 'idle' as const }),
  lookup: async () => ({ status: 'unavailable' as const }),
  counties: [{ value: '1', label: 'Buzău' }],
  bases: [{ value: '1', label: 'Pogoanele' }],
  sourcePath: '/comanda',
  privacyHref: '#privacy',
  termsHref: '#terms',
  shopHref: '#shop',
}

/** One page, no JavaScript needed. Company and address fields hide with CSS alone. */
export const Checkout: Story = {
  render: (_, { globals }) => (
    <Page>
      <div className="max-w-2xl">
        <CheckoutForm
          {...form}
          locale={storyLocale(globals)}
          needsCertificate
          hasProtection
          empty={false}
        />
      </div>
    </Page>
  ),
}

export const CheckoutDone: Story = {
  render: (_, { globals }) => (
    <Page>
      <div className="max-w-2xl">
        <CheckoutForm
          {...form}
          locale={storyLocale(globals)}
          needsCertificate={false}
          hasProtection={false}
          empty
          initialState={{
            status: 'success',
            reference: 'AGR-2611-7KQ2M',
            assignee: { name: 'Biroul comercial' },
          }}
        />
      </div>
    </Page>
  ),
}
