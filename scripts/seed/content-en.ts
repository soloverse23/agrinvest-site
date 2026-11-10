/**
 * English page content: the same pages and the same blocks as the Romanian site
 * (content.ts), written in English for farmers, grain buyers and partners. Register facts
 * use `{{KEY}}` like the Romanian copy.
 */
import type { Page } from '@/payload-types'

import type { Ctx } from './content'
import { rt } from './richtext'

type Blocks = NonNullable<Page['layout']>
type Faq = NonNullable<Page['faq']>

const q = (question: string, answer: string) => ({ question, answer })

const figures = (keys: string[]) => ({
  blockType: 'figureStrip' as const,
  items: keys.map((figure) => ({ figure })),
})

const sellingSteps = {
  blockType: 'steps' as const,
  kicker: 'Step by step',
  heading: 'How selling grain to Agrinvest works',
  items: [
    {
      title: 'Tell us what you have',
      body: 'The crop, the quantity, where it is and when it is ready. By phone or through the form.',
    },
    {
      title: 'Get the price',
      body: 'The sales representative for your area gives you the price at the nearest base and the delivery terms.',
    },
    {
      title: 'Deliver, or we collect',
      body: 'Bring the grain to the base, or our own trucks collect it from the farm.',
    },
    {
      title: 'Reception and payment',
      body: 'The grain is weighed and analysed at reception, and payment is made {{C8}}.',
    },
  ],
}

const instalments = [
  { when: 'Instalment 1 · after the summer harvest', label: 'wheat, barley, rapeseed' },
  { when: 'Instalment 2 · after the autumn harvest', label: 'corn, sunflower' },
]

export function contentEn(
  key: string,
  { people, media }: Ctx,
): { blocks: Blocks; faq: Faq } | null {
  switch (key) {
    case 'home':
      return {
        blocks: [
          {
            blockType: 'hero',
            eyebrow: 'Grain · Storage · Financing · Logistics',
            title: 'We buy, store and finance your harvest.',
            accent: 'your harvest',
            lead: 'We buy grain directly from Romanian farmers, receive it at our own bases, move it with our own fleet and finance production through Agrinvest Credit IFN.',
            image: media['harvest-sunflower'],
            primary: { label: 'Grain', href: '/en/grain' },
            secondary: { label: 'Talk to us', href: '/en/contact' },
            needs: [
              { link: { label: 'Grain', href: '/en/grain' }, hint: 'Paid {{C8}}' },
              {
                link: { label: 'Storage', href: '/en/storage' },
                hint: 'Reception, drying, storage',
              },
              { link: { label: 'Financing', href: '/en/financing' }, hint: 'Repay after harvest' },
              { link: { label: 'Logistics', href: '/en/logistics' }, hint: 'Our own truck fleet' },
            ],
          },
          figures(['S1', 'S2', 'L1']),
          {
            blockType: 'serviceGrid',
            kicker: 'What we do',
            heading: 'Everything a farm needs, from one partner',
            lead: 'We work directly with farmers, from sowing to selling the harvest. Every service connects to the others, so you deal with a single team.',
            items: [
              {
                icon: 'wheat',
                title: 'Grain trading',
                body: 'We buy wheat, corn, sunflower, rapeseed, barley and other crops, at harvest or from stock.',
                link: { label: 'Grain', href: '/en/grain' },
              },
              {
                icon: 'silo',
                title: 'Storage and drying',
                body: 'Reception, weighing, cleaning and drying at our own bases, with direct access to sales.',
                link: { label: 'See the bases', href: '/en/storage' },
              },
              {
                icon: 'coins',
                title: 'Farm financing',
                body: 'Loans for production and investment through Agrinvest Credit IFN, repaid in line with the harvest.',
                link: { label: 'About financing', href: '/en/financing' },
              },
              {
                icon: 'truck',
                title: 'Transport and logistics',
                body: 'We collect grain from the farm and deliver seed, fertiliser and crop protection products.',
                link: { label: 'Logistics', href: '/en/logistics' },
              },
              {
                icon: 'leaf',
                title: 'Agronomic advice',
                body: 'Our agronomists help choose the right technology for each crop and each season.',
                link: { label: 'Talk to an agronomist', href: '/en/contact' },
              },
            ],
          },
          {
            blockType: 'baseList',
            kicker: 'Bases',
            heading: 'Deliver to the nearest base',
            lead: 'Our reception and storage bases are in the counties of southern and eastern Romania. Each base has its own page with its services and contacts.',
            showMap: true,
          },
          sellingSteps,
          {
            blockType: 'financeBand',
            kicker: 'Agrinvest Credit IFN',
            heading: 'Financing repaid after the harvest',
            lead: 'Loans in lei for production and investment, with a reply {{F4.reply}}. Repayments follow the farm: {{F5.term}}, {{F5.instalments}}.',
            primary: { label: 'About financing', href: '/en/financing' },
            secondary: { label: 'Apply', href: '/en/financing/apply' },
            instalments,
          },
          {
            blockType: 'ctaBand',
            tone: 'surface',
            heading: 'A question? The person responsible replies directly.',
            body: 'Tell us what you need: selling grain, storage, transport or financing. Your enquiry goes straight to the person who handles it.',
            primary: { label: 'Contact us', href: '/en/contact' },
          },
        ],
        faq: [
          q(
            'Which crops does Agrinvest buy?',
            'We buy {{C7}}, directly from farmers, at harvest or from stock.',
          ),
          q(
            'When are farmers paid for their grain?',
            'Payment is made {{C8}}, after weighing and quality analysis.',
          ),
          q(
            'Where are the Agrinvest bases?',
            'Our reception and storage bases are in the counties of southern and eastern Romania. The full list, with a page for each base, is on the Storage page.',
          ),
        ],
      }

    case 'despre':
      return {
        blocks: [
          {
            blockType: 'richText',
            content: rt(`## How it started

Agrinvest started in {{C1}}, as a company working directly with the farmers of the area. It has grown every year since: today the business is run from Bucharest, and our goal is to be active across the whole country.

We grew by investing steadily in people, in storage bases and silos, in farm machinery and in seed production.

## What we do today

- Distribution of farm inputs, organic and conventional
- [Grain trading](/en/grain): we buy the harvest directly from farmers
- Seed from our own production and from partners
- Agronomic advice for farmers
- [Financing](/en/financing) through Agrinvest Credit IFN
- [Transport](/en/logistics) with our own fleet
- [Storage](/en/storage) at our own bases
- Diesel

## Romanian capital

Agrinvest is {{C5}} owned. We believe Romanian agriculture grows fast only through the joint effort of its people, so we built every service around the farmers we work with.`),
          },
          {
            ...figures(['S1', 'S2', 'L1']),
            kicker: 'In figures',
            heading: 'Agrinvest at a glance',
          },
          {
            blockType: 'storySection',
            kicker: 'The team',
            heading: 'People who know the farms in their area',
            reverse: true,
            body: rt(
              'Our sales representatives, agronomists, drivers and base teams work in the same areas as the farmers they serve. They know the crops, the roads and the people.\n\nWhen you call Agrinvest, you talk to someone who can solve the problem, not to a call centre.',
            ),
            media: media.team,
          },
          {
            blockType: 'ctaBand',
            tone: 'surface',
            heading: 'Every figure, with its source',
            body: 'Bases, capacity, fleet and lending: every value has its source and its verification status.',
            primary: { label: 'Agrinvest in figures', href: '/en/about/figures' },
            secondary: { label: 'Contact', href: '/en/contact' },
          },
        ],
        faq: [
          q('When was Agrinvest founded?', 'Agrinvest started in {{C1}}.'),
          q('Who owns Agrinvest?', 'Agrinvest is {{C5}} owned.'),
          q(
            'What is Agrinvest Credit IFN?',
            "The group's non-bank financial institution, listed in the National Bank of Romania Special Register, lending to farmers since {{F3}}.",
          ),
        ],
      }

    case 'cifre':
      return {
        blocks: [
          {
            blockType: 'callout',
            tone: 'note',
            title: 'How to read the tables',
            body: 'Every value has its source. Values marked "to confirm" are being verified with the Agrinvest team and may be updated.',
          },
          {
            blockType: 'figureTable',
            kicker: 'Company',
            heading: 'About the company',
            keys: ['C1', 'C5', 'C4', 'C7', 'C8', 'C10'],
          },
          {
            blockType: 'figureTable',
            kicker: 'Storage',
            heading: 'Bases and capacity',
            keys: ['S1', 'S2'],
          },
          {
            blockType: 'figureTable',
            kicker: 'Logistics',
            heading: 'The fleet',
            keys: ['L1', 'L2'],
          },
          {
            blockType: 'figureTable',
            kicker: 'Financing',
            heading: 'Agrinvest Credit IFN',
            keys: [
              'F1',
              'F2.cui',
              'F2.reg',
              'F3',
              'F4.reply',
              'F4.money',
              'F5.term',
              'F5.instalments',
              'F6',
            ],
          },
        ],
        faq: [
          q(
            'Where do the figures on this page come from?',
            'From the Agrinvest figures register: every value has its source and its verification status. Values are updated as the team confirms them.',
          ),
        ],
      }

    case 'cereale':
      return {
        blocks: [
          sellingSteps,
          {
            blockType: 'cropList',
            kicker: 'Crops',
            heading: 'What we buy',
            lead: 'We buy {{C7}}. Choose a crop to see how reception works and how the price is set.',
          },
          {
            blockType: 'baseList',
            kicker: 'Bases',
            heading: 'The nearest base to the farm',
            showMap: true,
          },
          {
            blockType: 'leadForm',
            leadType: 'vanzare-cereale',
            extraFields: ['county', 'crop'],
            heading: 'Ask for a price',
            body: 'Tell us the crop, the quantity and the county. The sales representative for your area calls you back.',
          },
        ],
        faq: [
          q('Which crops does Agrinvest buy?', 'We buy {{C7}}.'),
          q(
            'When are farmers paid for their grain?',
            'Payment is made {{C8}}, after weighing and quality analysis.',
          ),
          q(
            'Can you collect the grain from the farm?',
            'Yes. On request, our own fleet moves the grain from the farm to the base.',
          ),
          q(
            'How is the price set?',
            'The price depends on the crop, its quality (moisture, impurities, hectolitre mass), the base and the market of the day. Call us or send the form for the price at the nearest base.',
          ),
        ],
      }

    case 'depozitare':
      return {
        blocks: [
          figures(['S1', 'S2']),
          {
            blockType: 'serviceGrid',
            kicker: 'Services',
            heading: 'What happens to your harvest at the base',
            columns: '3',
            items: [
              {
                icon: 'scale',
                title: 'Reception and weighing',
                body: 'The grain is weighed and analysed on arrival: moisture, impurities and hectolitre mass.',
              },
              {
                icon: 'leaf',
                title: 'Cleaning',
                body: 'We remove impurities before storage, so the grain keeps and sells better.',
              },
              {
                icon: 'drop',
                title: 'Drying',
                body: 'Grain that is too wet is dried down to storage moisture.',
                link: { label: 'About drying', href: '/en/storage/drying' },
              },
              {
                icon: 'silo',
                title: 'Storage',
                body: 'The harvest stays safe in our silos until you choose when to sell.',
              },
              {
                icon: 'wheat',
                title: 'Sale from stock',
                body: 'Sell straight from the base, with no extra transport, when the price suits you.',
                link: { label: 'Grain', href: '/en/grain' },
              },
              {
                icon: 'coins',
                title: 'Financing',
                body: 'Need cash before you sell? Talk to Agrinvest Credit IFN.',
                link: { label: 'Stock financing', href: '/en/financing/stock-financing' },
              },
            ],
          },
          {
            blockType: 'baseList',
            kicker: 'Bases',
            heading: 'Our storage bases',
            lead: 'Choose a base to see its capacity, its services and how to get there.',
            showMap: true,
          },
          {
            blockType: 'leadForm',
            leadType: 'depozitare',
            extraFields: ['crop', 'base'],
            heading: 'Book storage space',
            body: 'Tell us the crop, the quantity and the base you prefer. We reply with the terms.',
          },
        ],
        faq: [
          q(
            'What services do the Agrinvest bases offer?',
            'Reception and weighing, quality analysis, cleaning, drying and storage. The exact services of each base are on its own page.',
          ),
          q(
            'Can I keep grain at the base and sell it later?',
            'Yes. Storage gives you time to choose when to sell, and the sale is made straight from the base.',
          ),
          q(
            'What is the total storage capacity?',
            'The total capacity is {{S2}}, across {{S1}} silos and grain warehouses.',
          ),
        ],
      }

    case 'uscare':
      return {
        blocks: [
          {
            blockType: 'richText',
            content: rt(`## Why moisture matters

Grain harvested too wet heats up and spoils in storage. Moisture above the reception limit also lowers the price, because the grain has to be dried before it can be stored or sold.

## What we do at reception

When the grain arrives at the base we take a sample and measure its moisture and impurities. If it needs it, we clean it and dry it to storage moisture at the same base. No hunting for a free dryer at the height of the harvest, and no moving the grain back and forth.

## After drying

Dried grain goes into [storage](/en/storage) or can be [sold straight from the base](/en/grain).`),
          },
          {
            blockType: 'steps',
            heading: 'Drying in short',
            items: [
              { title: 'Sample at reception', body: 'We measure moisture and impurities.' },
              { title: 'Cleaning', body: 'We remove impurities before drying.' },
              { title: 'Drying', body: 'We bring the grain to storage moisture.' },
              { title: 'Storage or sale', body: 'You choose what happens to the harvest next.' },
            ],
          },
          {
            blockType: 'storySection',
            heading: 'Fast reception at the height of the harvest',
            body: rt(
              'At harvest peak every hour counts. Our bases receive the grain, analyse it and prepare it for storage, so you can get back to the field.',
            ),
            media: media['grain-reception'],
          },
          {
            blockType: 'leadForm',
            leadType: 'depozitare',
            extraFields: ['crop', 'base'],
            heading: 'Ask about drying and storage',
          },
        ],
        faq: [
          q(
            'Where is the grain dried?',
            'At the Agrinvest bases that have a dryer, at reception. The services of each base are on its own page.',
          ),
          q(
            'How is the drying cost set?',
            'It depends on how wet the grain is compared with storage moisture. You get it at reception or from the representative for your area.',
          ),
        ],
      }

    case 'finantare':
      return {
        blocks: [
          {
            blockType: 'richText',
            content: rt(`## Who we are

Agrinvest Credit IFN is the non-bank financial institution of the Agrinvest group, listed in the National Bank of Romania Special Register. We have been lending to farmers since {{F3}}.

## Who it is for

Our products are designed mainly for small and medium farmers who find it hard to get classic bank credit: authorised individuals, sole and family businesses, commercial companies and agricultural companies.

## What we finance

- Short-term loans for the production cycle: seed, fertiliser, crop protection, field work
- Investment loans: farm machinery, storage, irrigation, crop or livestock farms, farmland

## Terms

- Loans in lei, with simple paperwork
- A reply {{F4.reply}}
- Term and repayment: {{F5.term}}, {{F5.instalments}}
- Accepted guarantees: promissory notes, crops, farm machinery, APIA subsidies, grain sale contracts, real-estate mortgages`),
          },
          {
            blockType: 'financeBand',
            kicker: 'Repayment',
            heading: 'Pay when you sell the harvest',
            lead: 'Instalments are agreed with you, around the time you are paid for the harvest.',
            primary: { label: 'Ask for an offer', href: '/en/financing#cerere' },
            secondary: { label: 'Contact', href: '/en/contact' },
            instalments,
          },
          {
            blockType: 'figureTable',
            kicker: 'Identification',
            heading: 'Agrinvest Credit IFN details',
            keys: ['F1', 'F2.cui', 'F2.reg', 'F3', 'F8.phone', 'F8.email'],
          },
          {
            blockType: 'leadForm',
            leadType: 'finantare',
            extraFields: ['company', 'county'],
            heading: 'Ask for a financing offer',
            body: 'Tell us what you want to finance and the area you farm. The Agrinvest Credit IFN team will contact you.',
          },
        ],
        faq: [
          q('How quickly do I get a reply?', 'You get a reply {{F4.reply}}.'),
          q('For how long can I borrow?', '{{F5.term}}, {{F5.instalments}}.'),
          q(
            'Which guarantees do you accept?',
            'Promissory notes, crops, farm machinery, APIA subsidies, grain sale contracts or real-estate mortgages.',
          ),
          q('In which currency are the loans?', 'All loans are in lei.'),
        ],
      }

    case 'logistica':
      return {
        blocks: [
          {
            blockType: 'serviceGrid',
            kicker: 'Services',
            heading: 'What we move',
            columns: '3',
            items: [
              {
                icon: 'wheat',
                title: 'Grain from the farm to the base',
                body: 'We collect the harvest from the farm on request, so you do not have to find transport at harvest peak.',
              },
              {
                icon: 'truck',
                title: 'Inputs to the farm',
                body: 'We deliver seed, fertiliser and crop protection products.',
              },
              {
                icon: 'drop',
                title: 'Liquid fertiliser',
                body: 'Dedicated transport for liquid fertiliser.',
              },
            ],
          },
          {
            blockType: 'figureTable',
            kicker: 'Fleet',
            heading: 'Our own fleet',
            keys: ['L1', 'L2'],
          },
          {
            blockType: 'storySection',
            heading: 'Paid right after reception',
            body: rt(
              'We have large storage capacity and can take large quantities of grain and oilseeds. For the farmer the advantage is simple: payment is made {{C8}}.',
            ),
            media: media.fleet,
            reverse: true,
          },
          {
            blockType: 'contactCards',
            heading: 'Who to talk to',
            cards: [{ person: people.logistics, need: 'Transport and logistics' }],
          },
          {
            blockType: 'leadForm',
            leadType: 'logistica',
            extraFields: ['county'],
            heading: 'Ask for transport',
            body: 'Tell us what you need to move, from where and when. The logistics team will contact you.',
          },
        ],
        faq: [
          q(
            'Do you only transport grain?',
            'We move grain from the farm to the base and deliver inputs to the farm: seed, fertiliser and crop protection products.',
          ),
          q('How many trucks does Agrinvest have?', 'Our own fleet has {{L1}} trucks.'),
        ],
      }

    case 'parteneri':
      return {
        blocks: [
          {
            blockType: 'serviceGrid',
            kicker: 'Partnerships',
            heading: 'Who we work with',
            lead: 'Agrinvest connects farmers to the market. We look for partners who want to reach farmers or buy from them.',
            columns: '2',
            items: [
              {
                icon: 'leaf',
                title: 'Input makers',
                body: 'Seed, fertiliser and crop protection, distributed through our sales and agronomy network.',
              },
              {
                icon: 'wheat',
                title: 'Processors and grain buyers',
                body: 'Grain and oilseeds from our bases, with our own logistics.',
              },
              {
                icon: 'coins',
                title: 'Lenders',
                body: 'Banks and institutions that support farm lending through Agrinvest Credit IFN.',
              },
              {
                icon: 'handshake',
                title: 'Farmers',
                body: 'Long-term partnerships.',
              },
            ],
          },
          {
            blockType: 'leadForm',
            leadType: 'parteneri',
            extraFields: ['company'],
            heading: 'Propose a partnership',
            body: 'Tell us who you are and what you propose. We reply within a few working days.',
          },
        ],
        faq: [
          q(
            'How do I become an Agrinvest partner?',
            'Send the form on this page with your company and your proposal. We reply within a few working days.',
          ),
        ],
      }

    case 'cariere':
      return {
        blocks: [
          {
            blockType: 'serviceGrid',
            kicker: 'Teams',
            heading: 'Where you could work',
            lead: 'We look for people who know agriculture or want to learn it, in the field, at the bases and in the office.',
            columns: '3',
            items: [
              {
                icon: 'handshake',
                title: 'Sales',
                body: 'Representatives who work directly with the farmers in their area.',
              },
              {
                icon: 'leaf',
                title: 'Agronomy',
                body: 'Agronomists giving technical advice in the field.',
              },
              {
                icon: 'truck',
                title: 'Logistics',
                body: 'Drivers and dispatchers for our own fleet.',
              },
              { icon: 'silo', title: 'Bases', body: 'Reception, drying and storage operators.' },
              {
                icon: 'coins',
                title: 'Lending',
                body: 'Analysts and credit advisers at Agrinvest Credit IFN.',
              },
              {
                icon: 'document',
                title: 'Office',
                body: 'Procurement, accounting and administration.',
              },
            ],
          },
          {
            blockType: 'leadForm',
            leadType: 'cariere',
            extraFields: ['county'],
            heading: 'Send us your details',
            body: 'Tell us what you would like to do and where. We contact you when a suitable role opens.',
          },
        ],
        faq: [
          q(
            'How do I apply for a job at Agrinvest?',
            'Send the form on this page with the area and the field you want to work in. We contact you when a suitable role opens.',
          ),
        ],
      }

    case 'contact':
      return {
        blocks: [
          {
            blockType: 'contactCards',
            kicker: 'By need',
            heading: 'Who to talk to',
            cards: [
              { person: people.office, need: 'Grain, storage, inputs' },
              { person: people.ifn, need: 'Financing' },
              { person: people.logistics, need: 'Transport and logistics' },
            ],
          },
          {
            blockType: 'figureTable',
            kicker: 'Offices',
            heading: 'Where to find us',
            keys: ['C3', 'C9.email'],
          },
          {
            blockType: 'leadForm',
            leadType: 'general',
            extraFields: ['company', 'county'],
            heading: 'Write to us',
            body: 'Your enquiry goes straight to the person who handles it.',
          },
        ],
        faq: [
          q(
            'How quickly will you reply?',
            'We reply as soon as possible during office hours. Your enquiry goes straight to the person responsible for its subject.',
          ),
        ],
      }

    case 'confidentialitate':
      return {
        blocks: [
          {
            blockType: 'callout',
            tone: 'warning',
            title: 'Draft',
            body: 'This policy is a draft and will be approved by Agrinvest before the site launches.',
          },
          {
            blockType: 'richText',
            content: rt(`## What we collect

When you send a form on this site, we collect your name, phone number and email address and, if you add them, your company, county, crop and message.

## Why we use it

We use your details only to answer your enquiry: a price offer, storage, transport, financing, a partnership or a job. We do not sell them, and we do not use them for advertising without your consent.

## How long we keep it

We keep your details for as long as we need them to answer your enquiry and for the company's legal obligations.

## Your rights

You can ask at any time to see, correct or delete your data. Write to [dpo@agrinvest.ro](mailto:dpo@agrinvest.ro).`),
          },
        ],
        faq: [],
      }

    default:
      return null
  }
}

/** Crop pages in English: intro per crop and the shared FAQ. */
export const cropContentEn: Record<string, { season: string; intro: string }> = {
  wheat: {
    season: 'July',
    intro:
      'Agrinvest buys wheat directly from Romanian farmers, at harvest or from stock. We receive it at our own bases, analyse it at reception and pay {{C8}}.',
  },
  maize: {
    season: 'September to November',
    intro:
      'Agrinvest buys corn directly from Romanian farmers, at harvest or from stock. Wet corn can be dried at the bases with a dryer, and payment is made {{C8}}.',
  },
  sunflower: {
    season: 'August to September',
    intro:
      'Agrinvest buys sunflower seed directly from Romanian farmers, at harvest or from stock, with reception at our own bases and payment {{C8}}.',
  },
  rapeseed: {
    season: 'June to July',
    intro:
      'Agrinvest buys rapeseed directly from Romanian farmers, straight after harvest or from stock, with reception at our own bases and payment {{C8}}.',
  },
  barley: {
    season: 'June to July',
    intro:
      'Agrinvest buys barley directly from Romanian farmers, at harvest or from stock, with reception at our own bases and payment {{C8}}.',
  },
}

export const cropFaqEn = (lower: string, season: string): Faq => [
  q(
    `When does Agrinvest buy ${lower}?`,
    `All year: at harvest (usually ${season}) and from stock, at our bases or from the farm.`,
  ),
  q(
    `How is the price of ${lower} set?`,
    'The price depends on quality (moisture, impurities, hectolitre mass), the base and the market of the day. Call us or send the form for today’s price.',
  ),
  q(
    `Where can ${lower} be delivered?`,
    'To any Agrinvest base. Choose the nearest one on the map.',
  ),
  q(`When are farmers paid for ${lower}?`, 'Payment is made {{C8}}.'),
]
