import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { photos } from '../fixtures/sample'
import { storyLocale } from '../fixtures/story'
import { StoryCarousel, type StoryCard } from './StoryCarousel'

const meta: Meta = { title: 'Patterns/StoryCarousel', parameters: { layout: 'fullscreen' } }
export default meta
type Story = StoryObj

const stories = (locale: 'ro' | 'en'): StoryCard[] =>
  (
    [
      ['Știri Agrinvest', 'Recepția de porumb se deschide la toate bazele', photos.silos],
      ['Grâu', 'Umiditatea grâului la recepție', photos.harvest],
      ['Floarea-soarelui', 'Când se recoltează floarea-soarelui', photos.sunflower],
      ['Orz', 'Orz de toamnă sau de primăvară?', photos.combine],
      ['Vânzare', 'Acte necesare la vânzarea cerealelor', photos.fleet],
      ['Rapiță', 'Când se seamănă rapița', null],
    ] as const
  ).map(([kicker, title, photo], i) => ({
    href: `#${i}`,
    kicker,
    title,
    summary: 'Pe scurt, ce verifici și când, cu un exemplu dintr-o fermă din sud-est.',
    date: `2026-11-0${9 - i}T09:00:00.000Z`,
    image: photo ? { src: photo.src, alt: photo.alt[locale] } : null,
  }))

export const Carousel: Story = {
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <div className="py-10">
        <StoryCarousel
          locale={locale}
          kicker="Ghiduri și noutăți"
          title="Ce merită știut în fermă, sezon de sezon"
          stories={stories(locale)}
          all={{ href: '#', label: 'Toate ghidurile' }}
          labels={{ read: 'Citește', prev: 'Articolele anterioare', next: 'Articolele următoare' }}
        />
      </div>
    )
  },
}
