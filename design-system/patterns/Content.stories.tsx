import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { Locale } from '@/i18n/config'

import { headerProps, heroProps } from '../fixtures/props'
import { photos } from '../fixtures/sample'
import { storyLocale } from '../fixtures/story'
import { Button } from '../primitives/Button'
import { BaseMap, type MapBase } from './BaseMap'
import { FactTable } from './FactTable'
import { Hero } from './Hero'
import {
  Accordion,
  Breadcrumbs,
  Callout,
  ContactCards,
  CtaBand,
  KeyFacts,
  PageHeader,
  SectionHeading,
  ServiceGrid,
  Steps,
  StorySection,
  Toc,
  Updated,
} from './Sections'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import { VideoEmbed } from './VideoEmbed'

const meta: Meta = { title: 'Patterns/Content', parameters: { layout: 'fullscreen' } }
export default meta
type Story = StoryObj

const Page = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto grid max-w-page gap-10 px-4 py-10 md:px-8">{children}</div>
)

const l = (locale: Locale, ro: string, en: string) => (locale === 'ro' ? ro : en)

/** Capacities from the figures register (S3), to confirm. */
const sampleBases: MapBase[] = [
  ['Pogoanele', 86_000],
  ['Crețești', 20_000],
  ['Sărățuica', 18_000],
  ['Vedea', 17_500],
  ['Mihăilești', 13_500],
  ['Fulga', 13_000],
].map(([name, capacity]) => ({
  name: name as string,
  capacity: capacity as number,
  href: `/baze/${String(name).toLowerCase()}`,
}))

/** Collection-point counties named on the old site (C4, to confirm). */
const sampleCounties = ['BZ', 'IL', 'PH', 'GR', 'TR', 'DJ', 'AG', 'GL', 'BR', 'VS', 'TL']

/** Mega menu: hover or focus a section with sub-pages (no JavaScript). */
export const HeaderMegaMenu: Story = {
  name: 'Header with mega menu',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <div className="min-h-96">
        <SiteHeader
          {...headerProps(locale)}
          ticker={undefined}
          phone="+40 786 222 238"
          labels={{
            ...headerProps(locale).labels,
            all: l(locale, 'Vezi tot', 'See all'),
            call: l(locale, 'Sună', 'Call'),
          }}
          nav={[
            {
              href: '/cereale',
              label: l(locale, 'Vinde cereale', 'Sell grain'),
              blurb: l(
                locale,
                'Cumpărăm cereale direct de la fermieri, cu recepție în bazele noastre.',
                'We buy grain directly from farmers, received at our own bases.',
              ),
              children: [
                {
                  href: '/cereale/grau',
                  label: l(locale, 'Grâu', 'Wheat'),
                  description: l(locale, 'Recoltă de vară', 'Summer harvest'),
                },
                {
                  href: '/cereale/porumb',
                  label: l(locale, 'Porumb', 'Corn'),
                  description: l(locale, 'Recoltă de toamnă', 'Autumn harvest'),
                },
                {
                  href: '/cereale/rapita',
                  label: l(locale, 'Rapiță', 'Rapeseed'),
                  description: l(locale, 'Recoltă de vară', 'Summer harvest'),
                },
              ],
            },
            { href: '/depozitare', label: l(locale, 'Depozitare', 'Storage') },
            { href: '/finantare', label: l(locale, 'Finanțare', 'Financing') },
          ]}
        />
      </div>
    )
  },
}

/** Before prices exist (Phase 5) the rail carries the entry points by need. */
export const HeroNeeds: Story = {
  name: 'Hero with needs rail',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <Hero
        {...heroProps(locale)}
        prices={undefined}
        needs={[
          {
            href: '/cereale',
            label: l(locale, 'Vinde cereale', 'Sell grain'),
            hint: l(locale, 'Plata după recepție', 'Paid after reception'),
          },
          {
            href: '/depozitare',
            label: l(locale, 'Depozitare', 'Storage'),
            hint: l(locale, 'Recepție, uscare, păstrare', 'Reception, drying, storage'),
          },
          {
            href: '/finantare',
            label: l(locale, 'Finanțare', 'Financing'),
            hint: l(locale, 'Rate după recoltă', 'Repay after harvest'),
          },
          {
            href: '/logistica',
            label: l(locale, 'Logistică', 'Logistics'),
            hint: l(locale, 'Flota proprie', 'Own fleet'),
          },
        ]}
      />
    )
  },
}

/** Content page header: breadcrumbs, the only H1, the answer summary, key facts. */
export const ContentHeader: Story = {
  name: 'Page header',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <PageHeader
        breadcrumbs={
          <Breadcrumbs
            label={l(locale, 'Ești aici', 'You are here')}
            items={[
              { name: l(locale, 'Acasă', 'Home'), url: '/' },
              { name: l(locale, 'Depozitare', 'Storage'), url: '/depozitare' },
              { name: 'Baza Pogoanele', url: '/baze/pogoanele' },
            ]}
          />
        }
        kicker={l(locale, 'Bază de recepție și depozitare', 'Reception and storage base')}
        title="Baza Agrinvest Pogoanele"
        summary={l(
          locale,
          'Recepție, cântărire și depozitare de cereale. Vezi capacitatea bazei și cum ne contactezi.',
          'Grain reception, weighing and storage. See the base capacity and how to reach us.',
        )}
        actions={
          <Button href="#cerere">{l(locale, 'Programează o livrare', 'Book a delivery')}</Button>
        }
        updated={
          <Updated
            locale={locale}
            label={l(locale, 'Actualizat la', 'Updated on')}
            date="2026-11-03"
          />
        }
        aside={
          <KeyFacts
            items={[
              { icon: 'silo', label: l(locale, 'Capacitate', 'Capacity'), value: '86.000 t' },
              { icon: 'pin', label: l(locale, 'Județ', 'County'), value: 'Buzău' },
              {
                icon: 'scale',
                label: l(locale, 'Servicii', 'Services'),
                value: l(locale, 'Recepție, uscare', 'Reception, drying'),
              },
            ]}
          />
        }
      />
    )
  },
}

/** Counties tinted, the list carries the bases while their positions are unconfirmed. */
export const Map: Story = {
  name: 'Base map',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <Page>
        <SectionHeading
          kicker={l(locale, 'Baze', 'Bases')}
          title={l(locale, 'Livrezi la baza cea mai apropiată', 'Deliver to the nearest base')}
        />
        <BaseMap
          locale={locale}
          bases={sampleBases}
          counties={sampleCounties}
          current="/baze/pogoanele"
          pendingNote={l(
            locale,
            'Pozițiile bazelor sunt în curs de confirmare.',
            'Base positions are being confirmed.',
          )}
        />
      </Page>
    )
  },
}

/** Example data: bases placed at their county centre, as the map does without GPS. */
export const MapWithPoints: Story = {
  name: 'Base map, with positions (example data)',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    const counties = ['BZ', 'IL', 'BZ', 'TR', 'GR', 'BR']
    return (
      <Page>
        <BaseMap
          locale={locale}
          counties={sampleCounties}
          current="/baze/pogoanele"
          bases={sampleBases.map((b, i) => ({ ...b, county: counties[i] }))}
        />
      </Page>
    )
  },
}

export const Sections: Story = {
  name: 'Sections',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <Page>
        <SectionHeading
          kicker={l(locale, 'Ce facem', 'What we do')}
          title={l(locale, 'Tot ce are nevoie ferma', 'Everything the farm needs')}
          lead={l(locale, 'Lucrăm direct cu fermierii.', 'We work directly with farmers.')}
          action={{ href: '/despre', label: l(locale, 'Despre noi', 'About us') }}
        />
        <ServiceGrid
          items={[
            {
              icon: 'wheat',
              title: l(locale, 'Comerț cu cereale', 'Grain trading'),
              body: l(locale, 'La recoltă sau din stoc.', 'At harvest or from stock.'),
              href: '/cereale',
              linkLabel: l(locale, 'Vinde cereale', 'Sell grain'),
            },
            {
              icon: 'silo',
              title: l(locale, 'Depozitare', 'Storage'),
              body: l(locale, 'Recepție, uscare, păstrare.', 'Reception, drying, storage.'),
            },
            {
              icon: 'coins',
              title: l(locale, 'Finanțare', 'Financing'),
              body: l(locale, 'Rate după recoltă.', 'Repay after harvest.'),
              href: '/finantare',
              linkLabel: l(locale, 'Detalii', 'Details'),
            },
          ]}
        />
        <Steps
          items={[
            {
              title: l(locale, 'Ne spui ce ai', 'Tell us what you have'),
              body: l(locale, 'Cultura și cantitatea.', 'Crop and quantity.'),
            },
            {
              title: l(locale, 'Primești prețul', 'Get the price'),
              body: l(locale, 'Pentru baza cea mai apropiată.', 'For the nearest base.'),
            },
            {
              title: l(locale, 'Livrezi', 'Deliver'),
              body: l(locale, 'Sau ridicăm noi.', 'Or we collect.'),
            },
            {
              title: l(locale, 'Plata', 'Payment'),
              body: l(locale, 'După recepție.', 'After reception.'),
            },
          ]}
        />
        <Callout tone="note" title={l(locale, 'Bine de știut', 'Good to know')}>
          {l(
            locale,
            'Valorile marcate sunt în curs de confirmare.',
            'Marked values are being confirmed.',
          )}
        </Callout>
        <CtaBand
          kicker="Agrinvest Credit IFN"
          title={l(locale, 'Finanțare cu rate după recoltă', 'Financing repaid after harvest')}
          body={l(
            locale,
            'Credite în lei pentru producție și investiții.',
            'Lei loans for production and investment.',
          )}
          primary={{ href: '/finantare', label: l(locale, 'Despre finanțare', 'About financing') }}
          secondary={{ href: '/contact', label: 'Contact' }}
        />
        <CtaBand
          tone="surface"
          title={l(locale, 'Ai o întrebare?', 'A question?')}
          primary={{ href: '/contact', label: 'Contact' }}
        />
      </Page>
    )
  },
}

export const Story_: Story = {
  name: 'Story section',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <Page>
        <StorySection
          kicker="Golden Relationship"
          title={l(
            locale,
            'Când un an greu nu e sfârșitul fermei',
            'When a hard year is not the end of the farm',
          )}
          image={{ src: photos.combine.src, alt: '', width: 1600, height: 900 }}
        >
          <p>
            {l(
              locale,
              'O echipă de specialiști face împreună cu fermierul un plan de redresare.',
              'A team of specialists builds a recovery plan with the farmer.',
            )}
          </p>
        </StorySection>
      </Page>
    )
  },
}

export const People: Story = {
  name: 'Contact cards',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <Page>
        <ContactCards
          labels={{ call: l(locale, 'Sună', 'Call'), write: l(locale, 'Scrie', 'Email') }}
          people={[
            {
              id: 1,
              name: 'Agrinvest',
              role: l(locale, 'Birou comercial', 'Commercial office'),
              need: l(locale, 'Cereale, depozitare', 'Grain, storage'),
              phone: '+40 786 222 238',
              email: 'office@agrinvest.ro',
            },
            {
              id: 2,
              name: 'Agrinvest Credit IFN',
              role: l(locale, 'Finanțare', 'Financing'),
              need: l(locale, 'Finanțare', 'Financing'),
            },
          ]}
        />
      </Page>
    )
  },
}

export const Faq: Story = {
  name: 'Accordion (FAQ) and contents',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <Page>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <Toc
              label={l(locale, 'Pe această pagină', 'On this page')}
              items={[
                { id: 'a', title: l(locale, 'Cine suntem', 'Who we are') },
                { id: 'b', title: l(locale, 'Pentru cine', 'Who it is for') },
                { id: 'c', title: l(locale, 'Condiții', 'Terms') },
              ]}
            />
          </div>
          <div className="lg:col-span-9">
            <Accordion
              items={[
                {
                  question: l(locale, 'Când primesc banii?', 'When am I paid?'),
                  answer: l(locale, 'Imediat după recepție.', 'Right after reception.'),
                },
                {
                  question: l(
                    locale,
                    'Ridicați marfa de la fermă?',
                    'Do you collect from the farm?',
                  ),
                  answer: l(locale, 'Da, cu flota proprie.', 'Yes, with our own fleet.'),
                },
              ]}
            />
          </div>
        </div>
      </Page>
    )
  },
}

export const Facts: Story = {
  name: 'Fact table',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <Page>
        <FactTable
          labels={{
            label: l(locale, 'Indicator', 'Figure'),
            value: l(locale, 'Valoare', 'Value'),
            source: l(locale, 'Sursă', 'Source'),
          }}
          rows={[
            {
              key: 'S1',
              label: l(locale, 'Baze de depozitare', 'Storage bases'),
              value: '17',
              source: 'silozuri',
            },
            {
              key: 'S2',
              label: l(locale, 'Capacitate totală', 'Total capacity'),
              value: '238.000 t',
              source: 'silozuri',
            },
            {
              key: 'L1',
              label: l(locale, 'Camioane proprii', 'Own trucks'),
              value: '55',
              source: 'flota-proprie',
            },
          ]}
        />
      </Page>
    )
  },
}

/** Loads YouTube only on click; the poster links to the video without JavaScript. */
export const Video: Story = {
  name: 'Video embed',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <Page>
        <div className="max-w-4xl">
          <VideoEmbed
            youtubeId="JOzMUJPyy40"
            title="Agrinvest Golden Relationship – Constanța"
            poster={{ src: photos.combine.src, alt: '' }}
            labels={{
              play: l(locale, 'Pornește video', 'Play video'),
              watch: l(locale, 'Vezi pe YouTube', 'Watch on YouTube'),
            }}
          />
        </div>
      </Page>
    )
  },
}

export const Footer: Story = {
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <SiteFooter
        homeHref="/"
        about={l(
          locale,
          'Companie agricolă cu capital românesc.',
          'A Romanian-owned agribusiness.',
        )}
        labels={{ contact: 'Contact', social: 'Social', footer: l(locale, 'Subsol', 'Footer') }}
        contact={[
          {
            label: l(locale, 'Telefon', 'Phone'),
            value: '+40 786 222 238',
            href: 'tel:+40786222238',
          },
          { label: 'E-mail', value: 'office@agrinvest.ro', href: 'mailto:office@agrinvest.ro' },
        ]}
        columns={[
          {
            title: l(locale, 'Pentru fermieri', 'For farmers'),
            links: [
              { href: '/cereale', label: l(locale, 'Vinde cereale', 'Sell grain') },
              { href: '/depozitare', label: l(locale, 'Depozitare', 'Storage') },
            ],
          },
          {
            title: l(locale, 'Companie', 'Company'),
            links: [{ href: '/despre', label: l(locale, 'Despre', 'About') }],
          },
        ]}
        social={[{ href: 'https://www.linkedin.com/company/sc-agrinvest-srl', label: 'LinkedIn' }]}
        legal="Agrinvest SRL · Agrinvest Credit IFN SA"
        bottomLinks={[
          { href: '/confidentialitate', label: l(locale, 'Confidențialitate', 'Privacy') },
        ]}
      />
    )
  },
}
