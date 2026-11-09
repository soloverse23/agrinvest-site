import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { applicationUi } from '@/i18n/finance-apply'

import { storyLocale } from '../fixtures/story'
import { ApplicationForm } from './ApplicationForm'

const meta: Meta = { title: 'Patterns/Application form', parameters: { layout: 'fullscreen' } }
export default meta
type Story = StoryObj

const props = {
  action: async () => ({ status: 'idle' as const }),
  lookup: async () => ({ status: 'unavailable' as const }),
  borrowers: [
    { value: 'pfa', label: 'Persoană fizică autorizată (PFA)' },
    { value: 'srl', label: 'Societate cu răspundere limitată (SRL)' },
  ],
  counties: [{ value: '1', label: 'Buzău' }],
  products: [{ value: '1', label: 'Credit de producție' }],
  crops: [
    { value: 'wheat', label: 'Grâu' },
    { value: 'maize', label: 'Porumb' },
  ],
  guarantees: [
    { value: 'promissory-note', label: 'Bilet la ordin' },
    { value: 'machinery', label: 'Utilaje agricole' },
  ],
  maxMonths: 120,
  replyTime: 'în 24 h de la dosarul complet',
  sourcePath: '/finantare/aplica',
  privacyHref: '#privacy',
}

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto max-w-2xl px-4 py-8 md:px-8">{children}</div>
)

/** One page, no JavaScript needed; JavaScript adds only the ANAF lookup. */
export const Empty: Story = {
  render: (_, { globals }) => (
    <Frame>
      <ApplicationForm
        {...props}
        locale={storyLocale(globals)}
        labels={applicationUi[storyLocale(globals)]}
      />
    </Frame>
  ),
}

/** Filled from the simulator: amount, term and crops. */
export const Prefilled: Story = {
  render: (_, { globals }) => (
    <Frame>
      <ApplicationForm
        {...props}
        locale={storyLocale(globals)}
        labels={applicationUi[storyLocale(globals)]}
        initialState={{
          status: 'idle',
          values: { amount: '300000', termMonths: '24', crops: 'wheat,maize' },
        }}
      />
    </Frame>
  ),
}

/** The confirmation: reference, who calls, and that nothing is decided yet. */
export const Sent: Story = {
  render: (_, { globals }) => (
    <Frame>
      <ApplicationForm
        {...props}
        locale={storyLocale(globals)}
        labels={applicationUi[storyLocale(globals)]}
        initialState={{
          status: 'success',
          reference: 'CRD-2611-7KQ2M',
          assignee: { name: 'Echipa IFN', role: 'Agrinvest Credit IFN' },
        }}
      />
    </Frame>
  ),
}
