/**
 * Demo farmer guides (Phase 6), on top of `npm run seed:demo`: one or two published guides in
 * every pillar, with cover, tools, shop products, FAQ and an English version, plus covers on the
 * demo news. EVERYTHING HERE IS INVENTED, marked "demonstrativ", local databases only.
 * The 20 real briefs are left untouched: demo guides have their own `demo-` slugs.
 * Recorded in the demo manifest, so `npm run unseed:demo` removes them.
 * Run with `npm run seed:demo:guides` after `npm run seed:demo`.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { rt } from '@/lib/richtext'

import { assertLocal, clearNextCache, Demo, loadManifest, monday, rng, saveManifest } from './kit'

assertLocal()
const manifest = loadManifest()
if (!manifest) {
  console.error('Run `npm run seed:demo` first: the demo guides join its manifest.')
  process.exit(1)
}
const payload = await getPayload({ config })
const applied = await payload.find({
  collection: 'guides',
  where: { key: { equals: 'ghid-demo-umiditate-grau' } },
  limit: 1,
  draft: true,
})
// Each part checks its own state, so the step can run again after this file grows.
const guidesDone = applied.docs.length > 0
const demo = new Demo(payload, manifest)
process.on('uncaughtException', (e) => {
  saveManifest(demo.m)
  console.error(e)
  process.exit(1)
})

const find = async (collection: string, where: Record<string, unknown>) =>
  (
    await payload.find({
      collection: collection as never,
      where: where as never,
      limit: 20,
      depth: 0,
      draft: true,
    })
  ).docs as unknown as { id: number; [k: string]: unknown }[]

const author = (await find('people', { isAuthor: { equals: true } }))[0]
const reviewer = (await find('people', { name: { equals: 'Toma Ion' } }))[0] ?? author
const media = async (name: string) => (await find('media', { filename: { equals: name } }))[0]?.id
const crop = async (key: string) => (await find('crops', { key: { equals: key } }))[0]?.id
const products = async (slugs: string[]) =>
  (await find('products', { slug: { in: slugs } })).map((p) => p.id)

type G = {
  pillar: string
  slug: string
  ro: [string, string]
  en: [string, string]
  headings: [string, string][]
  cover?: string
  tool?: { widget: 'grainPrices' | 'netPrice' | 'diesel'; crop?: string }
  shop?: string[]
  days: number
}

const guides: G[] = [
  {
    pillar: 'grau',
    slug: 'demo-umiditate-grau',
    ro: [
      'Umiditatea grâului la recepție',
      'Ce înseamnă umiditatea de bază din contract și cum se scade din greutate.',
    ],
    en: [
      'Wheat moisture at intake',
      'What the contract’s base moisture means and how it is deducted.',
    ],
    headings: [
      ['Ce este umiditatea de bază', 'What base moisture is'],
      ['Cum se calculează scăzământul', 'How the deduction works'],
      ['Când merită uscarea', 'When drying pays'],
    ],
    cover: 'grain-reception-1.webp',
    tool: { widget: 'netPrice', crop: 'wheat' },
    days: 2,
  },
  {
    pillar: 'grau',
    slug: 'demo-fertilizare-grau',
    ro: [
      'Fertilizarea grâului primăvara',
      'Momentele de aplicare a azotului și cum alegi îngrășământul.',
    ],
    en: ['Spring wheat fertilisation', 'When to apply nitrogen and how to choose the fertiliser.'],
    headings: [
      ['Fertilizarea de bază', 'Base fertilisation'],
      ['Azotul în primăvară', 'Nitrogen in spring'],
      ['Ce produse folosești', 'Which products to use'],
    ],
    cover: 'harvest-sunflower-2.webp',
    tool: { widget: 'grainPrices', crop: 'wheat' },
    shop: ['azotat-de-amoniu', 'uree'],
    days: 9,
  },
  {
    pillar: 'porumb',
    slug: 'demo-hibrid-porumb',
    ro: [
      'Cum alegi hibridul de porumb',
      'Grupa FAO, zona și costul uscării decid hibridul potrivit.',
    ],
    en: ['Choosing a corn hybrid', 'FAO group, region and drying cost decide the right hybrid.'],
    headings: [
      ['Grupa FAO și zona', 'FAO group and region'],
      ['Toleranța la secetă', 'Drought tolerance'],
      ['Umiditatea la recoltare', 'Moisture at harvest'],
    ],
    cover: 'combine-1.webp',
    tool: { widget: 'grainPrices', crop: 'maize' },
    days: 5,
  },
  {
    pillar: 'porumb',
    slug: 'demo-densitate-porumb',
    ro: [
      'Densitatea la semănat la porumb',
      'Câte boabe pe hectar, după hibrid și apa disponibilă.',
    ],
    en: ['Corn planting density', 'Seeds per hectare by hybrid and available water.'],
    headings: [
      ['De ce contează densitatea', 'Why density matters'],
      ['Calculul sămânței', 'Working out the seed'],
      ['Greșeli frecvente', 'Common mistakes'],
    ],
    days: 16,
  },
  {
    pillar: 'floarea-soarelui',
    slug: 'demo-recoltare-floarea-soarelui',
    ro: [
      'Când se recoltează floarea-soarelui',
      'Semnele de maturitate și umiditatea la care pierzi cel mai puțin.',
    ],
    en: ['When to harvest sunflower', 'Signs of maturity and the moisture with the least loss.'],
    headings: [
      ['Semnele de maturitate', 'Signs of maturity'],
      ['Pierderi la recoltare', 'Harvest losses'],
      ['Recepția la bază', 'Intake at the base'],
    ],
    cover: 'harvest-sunflower-1.webp',
    tool: { widget: 'netPrice', crop: 'sunflower' },
    days: 12,
  },
  {
    pillar: 'rapita',
    slug: 'demo-semanat-rapita',
    ro: ['Când se seamănă rapița', 'Fereastra de semănat și ce faci când toamna e secetoasă.'],
    en: ['When to sow rapeseed', 'The sowing window and what to do in a dry autumn.'],
    headings: [
      ['Fereastra de semănat', 'The sowing window'],
      ['Răsărirea în secetă', 'Emergence in drought'],
      ['Iernarea', 'Winter survival'],
    ],
    days: 20,
  },
  {
    pillar: 'orz',
    slug: 'demo-orz-toamna-primavara',
    ro: [
      'Orz de toamnă sau de primăvară?',
      'Producție, risc și vânzare: cum alegi între cele două.',
    ],
    en: ['Winter or spring barley?', 'Yield, risk and sale: how to choose between them.'],
    headings: [
      ['Producție și risc', 'Yield and risk'],
      ['Orzoaica pentru bere', 'Malting barley'],
      ['Vânzarea', 'Selling'],
    ],
    cover: 'combine-2.webp',
    shop: ['samanta-orz-zanzibar-c1-600kg'],
    days: 25,
  },
  {
    pillar: 'vanzare',
    slug: 'demo-acte-vanzare-cereale',
    ro: [
      'Acte necesare la vânzarea cerealelor',
      'Ce documente aduci la bază, pe forme de organizare.',
    ],
    en: ['Documents to sell grain', 'What to bring to the base, by type of farm business.'],
    headings: [
      ['Persoană fizică', 'Private individuals'],
      ['PFA și firme', 'Sole traders and companies'],
      ['Ce aduci la bază', 'What to bring to the base'],
    ],
    cover: 'fleet-1.webp',
    tool: { widget: 'grainPrices' },
    days: 4,
  },
  {
    pillar: 'depozitare',
    slug: 'demo-umiditate-depozitare',
    ro: [
      'La ce umiditate se depozitează cerealele',
      'Umiditate, temperatură și ventilare pentru o păstrare fără pierderi.',
    ],
    en: [
      'Safe moisture for storing grain',
      'Moisture, temperature and aeration for storage without losses.',
    ],
    headings: [
      ['Pe culturi', 'By crop'],
      ['Temperatura și ventilarea', 'Temperature and aeration'],
      ['Depozitarea la Agrinvest', 'Storage at Agrinvest'],
    ],
    cover: 'grain-reception-2.webp',
    days: 14,
  },
  {
    pillar: 'fertilizare',
    slug: 'demo-azotat-sau-uree',
    ro: [
      'Azotat de amoniu sau uree?',
      'Conținutul de azot, prețul pe kg de azot și momentul aplicării.',
    ],
    en: ['Ammonium nitrate or urea?', 'Nitrogen content, price per kg of nitrogen and timing.'],
    headings: [
      ['Conținut și preț pe kg N', 'Content and price per kg N'],
      ['Pierderi și momentul aplicării', 'Losses and timing'],
      ['Prețuri actuale', 'Current prices'],
    ],
    shop: ['azotat-de-amoniu', 'uree'],
    days: 7,
  },
  {
    pillar: 'protectia-plantelor',
    slug: 'demo-erbicidare-porumb',
    ro: ['Erbicidarea porumbului', 'Preemergent sau postemergent: când și cu ce intervii.'],
    en: ['Corn weed control', 'Pre or post-emergence: when and with what.'],
    headings: [
      ['Preemergent', 'Pre-emergence'],
      ['Postemergent', 'Post-emergence'],
      ['Produse din magazin', 'Products in the shop'],
    ],
    cover: 'combine-3.webp',
    shop: ['adengo', 'frontier-forte'],
    days: 18,
  },
  {
    pillar: 'subventii-apia',
    slug: 'demo-calendar-apia',
    ro: [
      'Calendarul APIA: cereri și plăți',
      'Campania de cereri, avansul și plata finală, pe scurt.',
    ],
    en: ['The APIA calendar', 'Applications, the advance and the final payment, in short.'],
    headings: [
      ['Campania de cereri', 'The application campaign'],
      ['Avansul și plata finală', 'Advance and final payment'],
      ['Credit pe adeverință', 'Credit on the APIA certificate'],
    ],
    tool: { widget: 'diesel' },
    days: 30,
  },
]

const body = (headings: [string, string][], locale: 0 | 1, link: string) =>
  rt(
    headings
      .map(([ro, en], i) =>
        locale === 0
          ? `## ${ro}\n\nText demonstrativ pentru verificarea paginii. Paragraful explică pe scurt subiectul, cu un exemplu din practica unei ferme din sud-estul țării.${i === 1 ? `\n\n- Primul lucru de verificat\n- Al doilea lucru de verificat\n- Al treilea lucru de verificat\n\nVezi și [pagina despre acest subiect](${link}).` : ''}`
          : `## ${en}\n\nDemo text to check the page layout. The paragraph explains the topic briefly, with an example from a farm in south-east Romania.${i === 1 ? `\n\n- First thing to check\n- Second thing to check\n- Third thing to check` : ''}`,
      )
      .join('\n\n'),
  )

const now = Date.now()
let n = 0
for (const g of guidesDone ? [] : guides) {
  const [roTitle, roSummary] = g.ro
  const [enTitle, enSummary] = g.en
  const cover = g.cover ? await media(g.cover) : undefined
  const cropId = g.tool?.crop ? await crop(g.tool.crop) : undefined
  const shop = g.shop ? await products(g.shop) : []
  const doc = await demo.create(
    'guides',
    {
      key: `ghid-${g.slug}`,
      section: 'ghid',
      pillar: g.pillar,
      title: roTitle,
      slug: g.slug,
      generateSlug: false,
      summary: `${roSummary} (Text demonstrativ.)`,
      body: body(g.headings, 0, '/preturi/calculator-pret-net') as never,
      publishedAt: new Date(now - g.days * 86_400_000).toISOString(),
      author: author.id,
      reviewer: reviewer.id,
      cover,
      tools: g.tool ? [{ blockType: 'toolWidget', widget: g.tool.widget, crop: cropId }] : [],
      shopProducts: shop,
      faq: [
        {
          question: `${roTitle}: ce trebuie să știu întâi?`,
          answer: 'Răspuns demonstrativ, scurt, care trimite la textul de mai sus.',
        },
      ],
      sources: [
        {
          title: 'Sursă demonstrativă',
          url: 'https://www.insse.ro/',
          retrieved: '2026-11-09T00:00:00.000Z',
        },
      ],
      brief: { status: 'publicat', primaryKeyword: roTitle.toLowerCase() },
      _status: 'published',
    },
    { locale: 'ro' },
  )
  await demo.changeEn('guides', doc.id, {
    title: enTitle,
    slug: g.slug,
    generateSlug: false,
    summary: `${enSummary} (Demo text.)`,
    body: body(g.headings, 1, '/en/prices/net-price-calculator') as never,
    faq: [{ question: `${enTitle}: what should I know first?`, answer: 'A short demo answer.' }],
    _status: 'published',
  })
  n++
}

// Photos on the demo news, so the news page shows its lead story with an image.
const covers = ['grain-reception-3.webp', 'fleet-2.webp', 'team-1.webp']
const news = await find('guides', { key: { like: 'stiri-demo-' } })
for (const [i, doc] of guidesDone ? [] : news.entries())
  await payload.update({
    collection: 'guides',
    id: doc.id,
    locale: 'ro',
    data: {
      cover: await media(covers[i % covers.length]),
      publishedAt: new Date(now - i * 2 * 86_400_000).toISOString(),
      tools: [{ blockType: 'toolWidget', widget: 'grainPrices' }],
    } as never,
  })

// EU oilseed series (the oilseed endpoint was never live): 53 weeks, so the sunflower and
// rapeseed price pages show a chart like the cereals.
{
  const have = await payload.count({
    collection: 'market-prices',
    where: { series: { in: ['sunflower-seed', 'rapeseed'] } },
  })
  const rand = rng(6)
  const day = (d: Date) => d.toISOString()
  const today = new Date(now)
  let rows = 0
  for (const [series, base] of [
    ['sunflower-seed', 420],
    ['rapeseed', 460],
  ] as const) {
    if (have.totalDocs) break
    let p = base
    for (let w = 52; w >= 0; w--) {
      p = Math.round(p * (1 + (rand() - 0.5) * 0.024) * 10) / 10
      const period = monday(today, w)
      await demo.create('market-prices', {
        key: `eu-agrifood|${series}|Constanta / FOB|${day(period).slice(0, 10)}`,
        source: 'eu-agrifood',
        series,
        market: 'Constanta / FOB',
        price: p,
        currency: 'EUR',
        unit: 't',
        period: day(period),
        fetchedAt: day(today),
      })
      rows++
    }
  }
  console.log(`EU oilseeds: ${rows} weekly rows`)
}

// Figures: the demo marks every register row confirmed; rows written again since then
// (apply:finance) are confirmed again. The manifest already holds the original rows.
{
  const fig = await payload.findGlobal({ slug: 'figures', locale: 'ro', depth: 0 })
  const open = (fig.rows ?? []).filter((r) => r.status !== 'confirmed').length
  if (open)
    await payload.updateGlobal({
      slug: 'figures',
      locale: 'ro',
      context: { skipChildren: true },
      data: {
        rows: (fig.rows ?? []).map((r) => ({
          ...r,
          status: 'confirmed',
          confirmedBy: r.confirmedBy ?? 'demo',
          confirmedAt: r.confirmedAt ?? '2026-11-09T00:00:00.000Z',
        })),
      } as never,
    })
  console.log(`figures: ${open} rows confirmed again`)
}

// The author gets a photo for the byline and the author page.
const team = await media('team-2.webp')
if (author && team && !guidesDone)
  await demo.change('people', author.id, ['photo'], { photo: team })

demo.save()
clearNextCache()
console.log(
  `demo guides: ${n} published in ${new Set(guides.map((g) => g.pillar)).size} pillars; ${news.length} news covers`,
)
process.exit(0)
