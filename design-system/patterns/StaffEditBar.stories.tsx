import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { storyLocale } from '../fixtures/story'
import { StaffEditBar } from './StaffEditBar'

/**
 * Staff editing (Phase 9): shown on public pages only to signed-in panel accounts, and only
 * for what that account's department may change. Links go straight to the edit screen.
 */
const meta: Meta = { title: 'Patterns/Staff edit bar', parameters: { layout: 'fullscreen' } }
export default meta
type Story = StoryObj

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-96 bg-paper">{children}</div>
)

export const OnePage: Story = {
  name: 'A page',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <Frame>
        <StaffEditBar
          locale={locale}
          links={[
            {
              label: locale === 'ro' ? 'Editează pagina' : 'Edit this page',
              href: '/admin/collections/products/12',
            },
          ]}
          onHide={() => undefined}
        />
      </Frame>
    )
  },
}

export const Prices: Story = {
  name: 'A page and a section',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <Frame>
        <StaffEditBar
          locale={locale}
          links={[
            {
              label: locale === 'ro' ? 'Editează pagina' : 'Edit this page',
              href: '/admin/collections/crops/3',
            },
            {
              label: locale === 'ro' ? 'Editează: prețuri de achiziție' : 'Edit: buy prices',
              href: '/admin/collections/buy-prices',
            },
          ]}
          onHide={() => undefined}
        />
      </Frame>
    )
  },
}
