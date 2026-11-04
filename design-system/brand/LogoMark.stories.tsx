import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { LogoMark } from './LogoMark'
import source from './source-logo.png'

const meta: Meta<typeof LogoMark> = {
  title: 'Brand/LogoMark',
  component: LogoMark,
  args: { variant: 'colour', className: 'w-48' },
  parameters: {
    docs: {
      description: {
        component:
          'Rebuilt from the 300 px source PNG by `scripts/brand/build-logo.ts`; checked with `scripts/checks/logo-diff.ts`. Replace with Agrinvest’s own vector when it arrives. The halo around the leaf and the vein are knockouts, so the mark works on any background. Accessibility: `role="img"` with the name “Agrinvest”; pass `title=""` when the company name is already visible next to the mark.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof LogoMark>

export const Colour: Story = {}

export const MonoOnDark: Story = {
  args: { variant: 'mono' },
  decorators: [
    (Story) => (
      <div className="inline-block rounded-lg bg-forest p-8 text-on-forest">
        <Story />
      </div>
    ),
  ],
}

export const MonoOnLight: Story = {
  args: { variant: 'mono', className: 'w-48 text-ink' },
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-6">
      {['w-6', 'w-10', 'w-16', 'w-32', 'w-64'].map((size) => (
        <LogoMark key={size} {...args} className={size} />
      ))}
    </div>
  ),
}

/** The rebuilt mark over the source PNG at 50% opacity, to check the fit by eye. */
export const OverlayOnSource: Story = {
  render: () => (
    // Fixed size for pixel comparison; scrolls on narrow screens.
    <div data-scroll-x className="overflow-x-auto">
      <div className="relative w-[592px] overflow-hidden" style={{ aspectRatio: '296 / 248' }}>
        {/* The source is 300 × 300; the mark's viewBox starts at y = 26. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- review-only source PNG */}
        <img
          src={typeof source === 'string' ? source : source.src}
          alt=""
          className="absolute left-0 w-[600px] max-w-none"
          style={{ top: -52 }}
        />
        <LogoMark className="absolute inset-0 w-full opacity-50" title="" />
      </div>
    </div>
  ),
}
