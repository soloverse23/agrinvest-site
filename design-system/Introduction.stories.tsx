import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Lockup } from './patterns/parts'

function Introduction() {
  return (
    <div className="grid max-w-text gap-4">
      <Lockup />
      <h1 className="text-h2 font-semibold">Agrinvest design system</h1>
      <p className="text-lead text-muted">
        Calm, precise and warm: real footage, deep forest green with the logo lime, soft rounded
        shapes and one highly legible family, Onest.
      </p>
      <ul className="list-disc pl-5 text-muted">
        <li>Foundations: colours, type, shape, elevation, icons.</li>
        <li>Primitives: buttons, badges, price changes, fields, segmented control.</li>
        <li>Patterns: header, hero, price tiles and table, product card, figures, finance band.</li>
        <li>Pages: the patterns composed, starting with the homepage.</li>
      </ul>
      <p className="text-small text-muted">Switch Romanian / English with the Locale toolbar.</p>
    </div>
  )
}

const meta: Meta<typeof Introduction> = { title: 'Introduction', component: Introduction }
export default meta
export const Default: StoryObj<typeof Introduction> = {}
