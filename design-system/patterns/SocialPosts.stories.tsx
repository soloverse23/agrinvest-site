import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { photos } from '../fixtures/sample'
import { storyLocale } from '../fixtures/story'
import { SocialPostCard } from './SocialPosts'

const meta: Meta = { title: 'Patterns/Social posts', parameters: { layout: 'fullscreen' } }
export default meta
type Story = StoryObj

export const Cards: Story = {
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    const labels = {
      network: 'LinkedIn',
      view: locale === 'ro' ? 'Vezi postarea pe LinkedIn' : 'View the post on LinkedIn',
    }
    const image = { src: photos.harvest.src, alt: photos.harvest.alt[locale] }
    return (
      <div className="mx-auto grid max-w-page gap-6 px-4 py-10 md:grid-cols-3 md:px-8">
        <SocialPostCard
          url="#"
          date="2026-11-04T09:00:00.000Z"
          image={image}
          locale={locale}
          labels={labels}
          text="Am început recepția de porumb la toate bazele Agrinvest. Programul și condițiile sunt pe site."
        />
        <SocialPostCard
          url="#"
          date="2026-10-21T09:00:00.000Z"
          locale={locale}
          labels={labels}
          text="Parteneriat nou cu StoneX pentru acoperirea riscului de preț, la dispoziția clienților noștri."
        />
        <SocialPostCard
          url="#"
          date="2026-10-02T09:00:00.000Z"
          image={image}
          locale={locale}
          labels={labels}
          text="Echipa Agrinvest la târgul agricol: ne-am bucurat să cunoaștem fermieri din toată țara."
        />
      </div>
    )
  },
}
