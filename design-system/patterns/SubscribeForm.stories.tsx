import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { pricesUi } from '@/i18n/prices'
import type { SubscriptionFormState } from '@/lib/subscriptions/state'

import { storyLocale } from '../fixtures/story'
import { SubscribeForm, type SubscribeFormProps } from './SubscribeForm'

/**
 * Price-alert sign-up on the crop price pages. The consent text shown is the one stored with
 * the subscription. Errors are summarised in an alert that takes focus; success is a status.
 * In stories the action is a stub that answers after a short delay.
 */
const meta: Meta = { title: 'Patterns/Subscribe form', parameters: { layout: 'padded' } }
export default meta
type Story = StoryObj

const stub =
  (result: SubscriptionFormState): SubscribeFormProps['action'] =>
  async () =>
    new Promise((r) => setTimeout(() => r(result), 400))

const props = (locale: 'ro' | 'en'): SubscribeFormProps => ({
  locale,
  action: stub({ status: 'success' }),
  heading: pricesUi[locale].crop.alertTitle(locale === 'ro' ? 'grâu' : 'Wheat'),
  body: pricesUi[locale].crop.alertBody,
  crop: '1',
  sourcePath: '/preturi/grau',
  privacyHref: locale === 'ro' ? '/confidentialitate' : '/en/privacy',
  labels: pricesUi[locale].alert,
})

const Box = ({ children }: { children: React.ReactNode }) => (
  <div className="max-w-xl rounded-xl bg-raised p-6 ring-1 ring-line">{children}</div>
)

export const Empty: Story = {
  render: (_, { globals }) => (
    <Box>
      <SubscribeForm {...props(storyLocale(globals))} />
    </Box>
  ),
}

export const WithErrors: Story = {
  name: 'With errors',
  render: (_, { globals }) => {
    const l = storyLocale(globals)
    return (
      <Box>
        <SubscribeForm
          {...props(l)}
          initialState={{
            status: 'error',
            errors: {
              email:
                l === 'ro'
                  ? 'Scrie o adresă de e-mail validă.'
                  : 'Please enter a valid email address.',
              threshold:
                l === 'ro'
                  ? 'Scrie pragul în lei pe tonă.'
                  : 'Enter the threshold in lei per tonne.',
            },
            values: { rule: 'above' },
          }}
        />
      </Box>
    )
  },
}

export const Saved: Story = {
  render: (_, { globals }) => (
    <Box>
      <SubscribeForm {...props(storyLocale(globals))} initialState={{ status: 'success' }} />
    </Box>
  ),
}

/** The weekly newsletter: no rule or threshold, only the address and consent. */
export const Newsletter: Story = {
  render: (_, { globals }) => {
    const l = storyLocale(globals)
    return (
      <Box>
        <SubscribeForm
          {...props(l)}
          topic="newsletter"
          crop={undefined}
          heading={l === 'ro' ? 'Buletinul săptămânal Agrinvest' : 'The Agrinvest weekly'}
          body={undefined}
        />
      </Box>
    )
  },
}
