import type { Meta, StoryObj } from '@storybook/nextjs-vite'

function Introduction() {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold">Agrinvest design system</h1>
      <p className="mt-3">
        Tokens, primitives and patterns are added here in Phase 1. Every component gets a story with
        its states, an accessibility note and RO/EN content.
      </p>
    </div>
  )
}

const meta: Meta<typeof Introduction> = {
  title: 'Introduction',
  component: Introduction,
}

export default meta

export const Default: StoryObj<typeof Introduction> = {}
