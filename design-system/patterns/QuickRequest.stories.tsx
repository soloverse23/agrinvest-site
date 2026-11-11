import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { QuickRequestState } from '@/lib/leads/state'

import { storyLocale } from '../fixtures/story'
import { QuickRequest, type QuickRequestProps } from './QuickRequest'

/**
 * One-field quick request (decision 0010): a phone or an email and one button; the visitor
 * keeps shopping. Accessibility: the field has a visible label; the error is linked with
 * aria-describedby and announced as an alert; success is a status that takes focus. The
 * "add your phone" step is a native details element, so it opens without JavaScript.
 * In stories the action is a stub that answers after a short delay.
 */
const meta: Meta = { title: 'Patterns/Quick request', parameters: { layout: 'padded' } }
export default meta
type Story = StoryObj

const stub =
  (result: QuickRequestState): QuickRequestProps['action'] =>
  async () =>
    new Promise((r) => setTimeout(() => r(result), 400))

const props = (locale: 'ro' | 'en'): QuickRequestProps => ({
  locale,
  sourcePath: '/magazin/erbicide/adengo',
  privacyHref: locale === 'ro' ? '/confidentialitate' : '/en/privacy',
  products: [12],
  action: stub({ status: 'success', contact: 'phone' }),
})

const errorText = {
  ro: 'Scrie un telefon (de exemplu 0741 201 056) sau o adresă de e-mail.',
  en: 'Enter a phone number (e.g. +40 741 201 056) or an email address.',
}

const followUp = { lead: 1, token: 'story' }

const Frame = ({ children, width = 'max-w-xl' }: { children: React.ReactNode; width?: string }) => (
  <div className={width}>{children}</div>
)

export const Empty: Story = {
  render: (_, { globals }) => (
    <Frame>
      <QuickRequest {...props(storyLocale(globals))} />
    </Frame>
  ),
}

export const BuyBox: Story = {
  name: 'In the buy box',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <Frame>
        <QuickRequest
          {...props(locale)}
          label={
            locale === 'ro'
              ? 'Vrei ofertă pentru cantitate mare?'
              : 'Want a quote for a large quantity?'
          }
        />
      </Frame>
    )
  },
}

export const WithError: Story = {
  name: 'With error',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <Frame>
        <QuickRequest
          {...props(locale)}
          initialState={{ status: 'error', value: '0741 20', error: errorText[locale] }}
        />
      </Frame>
    )
  },
}

export const SentPhone: Story = {
  name: 'Sent (phone)',
  render: (_, { globals }) => (
    <Frame>
      <QuickRequest
        {...props(storyLocale(globals))}
        initialState={{ status: 'success', contact: 'phone' }}
      />
    </Frame>
  ),
}

export const SentEmail: Story = {
  name: 'Sent (email), add phone',
  render: (_, { globals }) => (
    <Frame>
      <QuickRequest
        {...props(storyLocale(globals))}
        action={stub({ status: 'success', contact: 'phone', completed: true })}
        initialState={{ status: 'success', contact: 'email', followUp }}
      />
    </Frame>
  ),
}

export const Completed: Story = {
  name: 'Phone added',
  render: (_, { globals }) => (
    <Frame>
      <QuickRequest
        {...props(storyLocale(globals))}
        initialState={{ status: 'success', contact: 'phone', completed: true }}
      />
    </Frame>
  ),
}

export const Compact: Story = {
  name: 'Compact (card)',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <Frame width="max-w-60">
        <QuickRequest
          {...props(locale)}
          layout="compact"
          label={locale === 'ro' ? 'Preț la cerere' : 'Price on request'}
          submitLabel={locale === 'ro' ? 'Cere preț' : 'Ask for price'}
        />
      </Frame>
    )
  },
}
