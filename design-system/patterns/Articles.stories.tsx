import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { photos } from '../fixtures/sample'
import { storyLocale } from '../fixtures/story'
import { ArticleByline, ArticleCard, AuthorCard, NextSteps, PillarCard } from './Articles'

const meta: Meta = { title: 'Patterns/Articles', parameters: { layout: 'fullscreen' } }
export default meta
type Story = StoryObj

const Page = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto grid max-w-page gap-10 px-4 py-10 md:px-8">{children}</div>
)

const author = { name: 'Dan N. Săvoiu', role: 'Agronom', href: '#' }

export const Cards: Story = {
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    const image = { src: photos.harvest.src, alt: photos.harvest.alt[locale] }
    return (
      <Page>
        <ArticleCard
          variant="feature"
          locale={locale}
          href="#"
          kicker="Știri Agrinvest"
          date="2026-11-09T09:00:00.000Z"
          title="Recepția de porumb se deschide la toate bazele"
          summary="Programul bazelor, condițiile de recepție și cum programezi descărcarea."
          image={image}
          level={2}
        />
        <div className="grid gap-6 md:grid-cols-3">
          <ArticleCard
            locale={locale}
            href="#"
            kicker="Grâu"
            date="2026-10-20T09:00:00.000Z"
            title="Umiditatea grâului la recepție"
            summary="Ce înseamnă umiditatea standard și cum se calculează scăzământul."
            image={image}
          />
          <ArticleCard
            locale={locale}
            href="#"
            kicker="Porumb"
            title="Densitatea la semănat la porumb"
            summary="Câte boabe pe hectar, după hibrid și apă disponibilă."
          />
          <div className="divide-y divide-line">
            <ArticleCard variant="compact" locale={locale} href="#" title="Acte la vânzare" />
            <ArticleCard
              variant="compact"
              locale={locale}
              href="#"
              title="Greutatea hectolitrică"
            />
          </div>
        </div>
      </Page>
    )
  },
}

export const Byline: Story = {
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <Page>
        <ArticleByline
          locale={locale}
          author={author}
          reviewer={{ name: 'Andra Pârvan' }}
          published="2026-10-01T09:00:00.000Z"
          updated="2026-11-08T09:00:00.000Z"
          minutes={6}
          labels={{
            by: 'Scris de',
            reviewedBy: 'Verificat de',
            updated: 'Actualizat',
            minutes: (n) => `${n} min de citit`,
          }}
        />
        <AuthorCard
          person={author}
          credentials="Inginer agronom"
          bio="Lucrează cu fermierii din sud-estul țării la tehnologia culturilor de câmp."
          link={{ href: '#', label: 'Toate ghidurile lui' }}
        />
      </Page>
    )
  },
}

export const Pillars: Story = {
  render: () => (
    <Page>
      <div className="grid gap-6 md:grid-cols-3">
        <PillarCard
          href="#"
          title="Grâu"
          intro="Semănat, fertilizare, calitate."
          count="6 ghiduri"
        />
        <PillarCard href="#" title="Porumb" intro="Hibrizi, densitate, uscare." count="3 ghiduri" />
        <NextSteps
          title="Pașii următori"
          links={[
            { href: '#', label: 'Prețul la grâu' },
            { href: '#', label: 'Calculator preț net' },
          ]}
        />
      </div>
    </Page>
  ),
}
