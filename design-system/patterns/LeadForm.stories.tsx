import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { LeadFormState } from '@/lib/leads/state'

import { storyLocale } from '../fixtures/story'
import { LeadForm, type LeadFormProps } from './LeadForm'

/**
 * Lead form. Phone and email are required for every type; extra fields depend on the type.
 * Accessibility: every control has a visible label; errors are linked with aria-describedby
 * and summarised in an alert that takes focus; success is announced as a status.
 * In stories the action is a stub that answers after a short delay.
 */
const meta: Meta = { title: 'Patterns/Lead form', parameters: { layout: 'padded' } }
export default meta
type Story = StoryObj

const stub =
  (result: LeadFormState): LeadFormProps['action'] =>
  async () =>
    new Promise((r) => setTimeout(() => r(result), 400))

const props = (locale: 'ro' | 'en'): LeadFormProps => ({
  locale,
  type: 'vanzare-cereale',
  sourcePath: '/cereale',
  privacyHref: locale === 'ro' ? '/confidentialitate' : '/en/privacy',
  extra: ['county', 'crop'],
  options: {
    county: [
      { value: '1', label: 'Buzău' },
      { value: '2', label: 'Ialomița' },
    ],
    crop: [
      { value: '1', label: locale === 'ro' ? 'Grâu' : 'Wheat' },
      { value: '2', label: locale === 'ro' ? 'Porumb' : 'Corn' },
    ],
  },
  action: stub({
    status: 'success',
    assignee: { name: 'Toma Ion', role: 'Director ADT – Logistică' },
  }),
})

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="max-w-text">{children}</div>
)

export const Empty: Story = {
  render: (_, { globals }) => (
    <Frame>
      <LeadForm {...props(storyLocale(globals))} />
    </Frame>
  ),
}

export const WithErrors: Story = {
  name: 'With errors',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    const ro = locale === 'ro'
    return (
      <Frame>
        <LeadForm
          {...props(locale)}
          initialState={{
            status: 'error',
            values: { name: 'Ion Popescu', phone: '0741', email: 'ion@' },
            errors: {
              phone: ro
                ? 'Scrie un număr de telefon valid, de exemplu 0741 201 056.'
                : 'Please enter a valid phone number, e.g. +40 741 201 056.',
              email: ro
                ? 'Scrie o adresă de e-mail validă.'
                : 'Please enter a valid email address.',
              consent: ro
                ? 'Avem nevoie de acordul tău ca să te contactăm.'
                : 'We need your consent to contact you.',
            },
          }}
        />
      </Frame>
    )
  },
}

export const Sent: Story = {
  render: (_, { globals }) => (
    <Frame>
      <LeadForm
        {...props(storyLocale(globals))}
        initialState={{
          status: 'success',
          assignee: { name: 'Toma Ion', role: 'Director ADT – Logistică' },
        }}
      />
    </Frame>
  ),
}
