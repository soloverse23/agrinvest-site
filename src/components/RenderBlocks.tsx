import type { SerializedTextNode } from '@payloadcms/richtext-lexical'
import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { FigureStrip, FinanceBand } from '@ds/patterns/Bands'
import { FactTable } from '@ds/patterns/FactTable'
import { Hero } from '@ds/patterns/Hero'
import { HeroSlider, type HeroRailPrices } from '@ds/patterns/HeroSlider'
import { CountyMap } from '@ds/patterns/CountyMap'
import { LeadFormLazy as LeadForm, VideoEmbedLazy as VideoEmbed } from '@ds/patterns/Lazy'
import { CropBadge } from '@ds/patterns/parts'
import { OpenOnHash } from '@ds/patterns/OpenOnHash'
import { Photo } from '@ds/patterns/Photo'
import {
  Callout,
  ContactCards,
  CtaBand,
  SectionHeading,
  ServiceGrid,
  Steps,
  StorySection,
} from '@ds/patterns/Sections'
import { ArrowRightIcon } from '@ds/icons/icons'
import { focusOf } from '@ds/lib/media'
import { localePath, type Locale } from '@/i18n/config'
import { basePath, cropPath } from '@/i18n/routes'
import { isGrainKey } from '@/lib/crops'
import { fixedUrl, sliderUi, ui } from '@/i18n/ui'
import { slugify } from '@/lib/slugify'
import { financeUi } from '@/i18n/finance'
import { innerUi } from '@/i18n/inner'
import { financeProductPath } from '@/i18n/routes'
import { byFinanceOrder, financeGroupIds, groupFor } from '@/lib/finance/groups'
import { listFinanceProducts } from '@/lib/content/finance'
import { getFigures, type Figures } from '@/lib/content/globals'
import { listBases, listCounties, listCrops } from '@/lib/content/locations'
import { submitLead } from '@/lib/leads/actions'
import { videoObject } from '@/lib/schema'
import type { Media, Page, Person } from '@/payload-types'

import { FactMark } from './Fact'
import { FactText } from './FactText'
import { JsonLd } from './JsonLd'
import { ToolWidget } from './ToolWidget'

type Block = NonNullable<Page['layout']>[number]
type BlockOf<T extends Block['blockType']> = Extract<Block, { blockType: T }>

const media = (m: Media | number | null | undefined): Media | null =>
  m && typeof m === 'object' && m.url ? m : null

/** Register keys shown with an icon in the figure strip. */
const figureIcon: Record<string, string> = { S1: 'bases', S2: 'capacity', L1: 'trucks' }

/** Page-width section; `narrow` keeps long text at reading width, left-aligned on the grid. */
const Section = ({
  children,
  narrow,
  id,
}: {
  children: ReactNode
  narrow?: boolean
  id?: string
}) => (
  <section id={id} className="mx-auto w-full max-w-page scroll-mt-24 px-4 md:px-8">
    {narrow ? <div className="max-w-text">{children}</div> : children}
  </section>
)

/** Today's prices for the home hero: each crop with its own page, plus diesel. */
type HeroPrices = HeroRailPrices
type Ctx = {
  locale: Locale
  path: string
  first: boolean
  figures: Figures
  heroPrices?: HeroPrices
}

/** Renders text with `{{KEY}}` register facts. */
const fact = (text: string | null | undefined, ctx: Pick<Ctx, 'figures' | 'locale'>) =>
  text ? <FactText text={text} figures={ctx.figures} locale={ctx.locale} /> : null

/** Anchor of an H2, shared with the contents list of long pages. */
export const headingId = (node: { children?: unknown[] }) =>
  slugify(
    (node.children ?? [])
      .map((c) => (c as { text?: string }).text ?? '')
      .join(' ')
      .slice(0, 80),
  )

/** The H2s of a rich text, for an in-page contents list. */
export function headingsOf(data: unknown) {
  const root = (data as { root?: { children?: { type: string; tag?: string }[] } })?.root
  return (root?.children ?? [])
    .filter((n) => n.type === 'heading' && n.tag === 'h2')
    .map((n) => {
      const node = n as unknown as { children?: { text?: string }[] }
      return {
        id: headingId(node),
        title: (node.children ?? []).map((c) => c.text ?? '').join(''),
      }
    })
}

/** Rich text with register facts inside text nodes, in the long-form style. */
export function Prose({
  data,
  ctx,
  className,
}: {
  data: Parameters<typeof RichText>[0]['data']
  ctx: Pick<Ctx, 'figures' | 'locale'>
  className?: string
}) {
  const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
    ...defaultConverters,
    heading: (args) => {
      const render = defaultConverters.heading
      const rendered = typeof render === 'function' ? render(args) : null
      const node = args.node as { tag: string; children: unknown[] }
      if (node.tag !== 'h2') return rendered
      const Tag = 'h2'
      return (
        <Tag id={headingId(node)} className="scroll-mt-24">
          {args.nodesToJSX({ nodes: args.node.children })}
        </Tag>
      )
    },
    text: (args) => {
      const node = args.node as SerializedTextNode
      if (!node.text.includes('{{')) {
        const render = defaultConverters.text
        return typeof render === 'function' ? render(args) : node.text
      }
      const content = fact(node.text, ctx)
      return node.format & 1 ? <strong>{content}</strong> : content
    },
  })
  // Our own wrapper: Payload's container adds its own class names, and without the container
  // the className is dropped.
  return (
    <div className={className ?? 'prose-agr'}>
      <RichText data={data} converters={converters} disableContainer />
    </div>
  )
}

/**
 * Renders a page's blocks with the design-system patterns. When the first block is a hero,
 * the hero carries the page's H1; otherwise the template renders the title as H1 and blocks
 * start at H2.
 */
export async function RenderBlocks({
  blocks,
  locale,
  path,
  heroPrices,
}: {
  blocks: Page['layout']
  locale: Locale
  /** Locale-relative path of the page, stored with leads. */
  path: string
  /** Today's Agrinvest prices on the rail of the opening hero (home page, Phase 5). */
  heroPrices?: HeroPrices
}) {
  if (!blocks?.length) return null
  const figures = await getFigures(locale)
  const rendered = await Promise.all(
    blocks.map((block, i) =>
      renderBlock(block, {
        locale,
        path,
        first: i === 0,
        figures,
        heroPrices: i === 0 ? heroPrices : undefined,
      }),
    ),
  )
  return <div className="grid gap-20 md:gap-28">{rendered}</div>
}

async function renderBlock(block: Block, ctx: Ctx): Promise<ReactNode> {
  const head = (b: { kicker?: string | null; heading?: string | null; lead?: string | null }) =>
    b.heading ? (
      <SectionHeading
        kicker={b.kicker}
        title={b.heading}
        lead={fact(b.lead, ctx)}
        className="mb-10 md:mb-12"
      />
    ) : null

  switch (block.blockType) {
    case 'hero':
      return <HeroBlock key={block.id} block={block} {...ctx} />
    case 'richText':
      return (
        <Section key={block.id} narrow>
          <Prose data={block.content} ctx={ctx} />
        </Section>
      )
    case 'figureStrip':
      return <FigureStripBlock key={block.id} block={block} ctx={ctx} head={head(block)} />
    case 'figureTable': {
      const keys = block.keys?.length ? block.keys : Object.keys(ctx.figures)
      const t = ui[ctx.locale]
      return (
        <Section key={block.id}>
          {head(block)}
          <FactTable
            caption={block.heading ?? undefined}
            labels={{ label: t.figure, value: t.value, source: t.source }}
            rows={keys.flatMap((key) => {
              const figure = ctx.figures[key]
              if (!figure) return []
              return [
                {
                  key,
                  label: figure.label,
                  value: (
                    <>
                      {figure.value}
                      <FactMark figure={figure} locale={ctx.locale} />
                    </>
                  ),
                  source: figure.source,
                },
              ]
            })}
          />
        </Section>
      )
    }
    case 'serviceGrid':
      return (
        <Section key={block.id}>
          {head(block)}
          <ServiceGrid
            columns={Number(block.columns ?? 3) as 2 | 3 | 4}
            items={(block.items ?? []).map((item) => ({
              id: item.id,
              icon: item.icon,
              title: item.title,
              body: item.body,
              href: item.link?.href,
              linkLabel: item.link?.label,
            }))}
          />
        </Section>
      )
    case 'steps':
      return (
        <Section key={block.id}>
          {head(block)}
          <Steps
            items={(block.items ?? []).map((item) => ({
              id: item.id,
              title: item.title,
              body: fact(item.body, ctx),
            }))}
          />
        </Section>
      )
    case 'financeBand':
      return (
        <Section key={block.id}>
          <FinanceBand
            kicker={block.kicker}
            title={block.heading}
            body={fact(block.lead, ctx)}
            cta={block.primary}
            secondary={
              block.secondary?.href && block.secondary.label
                ? { href: block.secondary.href, label: block.secondary.label }
                : null
            }
            instalments={block.instalments ?? []}
          />
        </Section>
      )
    case 'storySection': {
      const image = media(block.media)
      const person = typeof block.person === 'object' ? block.person : null
      return (
        <Section key={block.id}>
          <StorySection
            kicker={block.kicker}
            title={block.heading}
            reverse={Boolean(block.reverse)}
            quote={
              block.quote ? { text: block.quote, name: person?.name, role: person?.role } : null
            }
            image={
              image
                ? {
                    src: image.url as string,
                    alt: image.alt,
                    focus: focusOf(image),
                    width: image.width ?? 1600,
                    height: image.height ?? 900,
                  }
                : null
            }
          >
            {block.body && <Prose data={block.body} ctx={ctx} className="prose-agr text-muted" />}
          </StorySection>
        </Section>
      )
    }
    case 'baseList':
      return <BaseListBlock key={block.id} block={block} ctx={ctx} head={head(block)} />
    case 'cropList':
      return <CropListBlock key={block.id} block={block} ctx={ctx} head={head(block)} />
    case 'ctaBand':
      return (
        <Section key={block.id}>
          <CtaBand
            tone={block.tone ?? 'forest'}
            kicker={block.kicker}
            title={block.heading}
            body={block.body}
            primary={block.primary}
            secondary={
              block.secondary?.href && block.secondary.label
                ? { href: block.secondary.href, label: block.secondary.label }
                : null
            }
          />
        </Section>
      )
    case 'financeProducts':
      return (
        <FinanceProductsSection
          key={block.id}
          block={block}
          locale={ctx.locale}
          figures={ctx.figures}
        />
      )
    case 'leadForm':
      return <LeadFormBlock key={block.id} block={block} locale={ctx.locale} path={ctx.path} />
    case 'contactCards': {
      const t = ui[ctx.locale]
      return (
        <Section key={block.id}>
          {head(block)}
          <ContactCards
            labels={{ call: t.call, write: t.write }}
            people={(block.cards ?? []).flatMap((card) => {
              const p = card.person as Person | number
              if (typeof p !== 'object') return []
              return [
                {
                  id: card.id ?? p.id,
                  name: p.name,
                  role: p.role,
                  need: card.need,
                  phone: p.phone,
                  email: p.email,
                },
              ]
            })}
          />
        </Section>
      )
    }
    case 'videoEmbed': {
      const poster = media(block.poster)
      return (
        <Section key={block.id}>
          {head(block)}
          <JsonLd
            data={[
              videoObject({
                youtubeId: block.youtubeId,
                title: block.title,
                description: block.description,
                uploadDate: block.uploadDate,
                duration: block.duration,
              }),
            ]}
          />
          <div className="max-w-4xl">
            <VideoEmbed
              youtubeId={block.youtubeId}
              title={block.title}
              caption={block.description}
              poster={
                poster && (
                  <Photo
                    src={poster.url as string}
                    alt={poster.alt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                )
              }
              labels={{ play: ui[ctx.locale].play, watch: ui[ctx.locale].watch }}
            />
          </div>
        </Section>
      )
    }
    case 'callout':
      return (
        <Section key={block.id} narrow>
          <Callout tone={block.tone ?? 'info'} title={block.title}>
            {fact(block.body, ctx)}
          </Callout>
        </Section>
      )
    case 'toolWidget':
      return <ToolWidget key={block.id} block={block} locale={ctx.locale} />
    default:
      return null
  }
}

function HeroBlock({
  block,
  first,
  figures,
  locale,
  heroPrices,
}: { block: BlockOf<'hero'> } & Ctx) {
  const image = media(block.image)
  const needs = (block.needs ?? []).map((n) => ({
    href: n.link.href,
    label: n.link.label,
    hint: fact(n.hint, { figures, locale }),
  }))
  const linkOf = (l?: { href?: string | null; label?: string | null } | null) =>
    l?.href && l.label ? { href: l.href, label: l.label } : null
  if (block.slides?.length) {
    return (
      <HeroSlider
        locale={locale}
        labels={sliderUi[locale]}
        prices={heroPrices}
        needs={needs}
        as={first ? 'h1' : 'h2'}
        slides={block.slides.map((slide) => {
          const poster = media(slide.poster)
          return {
            eyebrow: slide.eyebrow,
            title: slide.title,
            accent: slide.accent ?? undefined,
            lead: fact(slide.lead, { figures, locale }),
            primary: linkOf(slide.primary),
            secondary: linkOf(slide.secondary),
            poster: poster ? { src: poster.url as string, alt: poster.alt } : null,
            clip: slide.clip,
          }
        })}
      />
    )
  }
  return (
    <Hero
      locale={locale}
      as={first ? 'h1' : 'h2'}
      eyebrow={block.eyebrow ?? ''}
      title={block.title}
      accent={block.accent ?? undefined}
      lead={fact(block.lead, { figures, locale })}
      photo={image ? { src: image.url as string, alt: image.alt, focus: focusOf(image) } : null}
      primary={
        block.primary?.href && block.primary.label
          ? { href: block.primary.href, label: block.primary.label }
          : null
      }
      secondary={
        block.secondary?.href && block.secondary.label
          ? { href: block.secondary.href, label: block.secondary.label }
          : null
      }
      prices={heroPrices}
      needs={needs}
    />
  )
}

function FigureStripBlock({
  block,
  ctx,
  head,
}: {
  block: BlockOf<'figureStrip'>
  ctx: Ctx
  head: ReactNode
}) {
  const items = (block.items ?? []).flatMap((item) => {
    const figure = ctx.figures[item.figure]
    if (!figure || figure.number == null) return []
    return [
      {
        key: figureIcon[item.figure] ?? item.figure,
        value: figure.number,
        unit: figure.unit ?? undefined,
        label: item.label || figure.label,
        note: <FactMark figure={figure} locale={ctx.locale} />,
      },
    ]
  })
  if (!items.length) return null
  return (
    <Section>
      {head}
      <FigureStrip locale={ctx.locale} items={items} />
    </Section>
  )
}

/**
 * Bases: the county map shaded by storage capacity (when `showMap`), then a link to every base
 * page. Server-rendered, no script; on a base page its county is outlined and its link marked.
 */
export async function BaseListBlock({
  block,
  ctx,
  head,
  current,
}: {
  block: Pick<BlockOf<'baseList'>, 'counties' | 'showMap'>
  ctx: Pick<Ctx, 'locale'>
  head?: ReactNode
  current?: string
}) {
  const only = new Set((block.counties ?? []).map((c) => (typeof c === 'object' ? c.id : c)))
  const bases = await listBases(ctx.locale)
  const rows = bases.flatMap((b) => {
    const county = typeof b.county === 'object' && b.county ? b.county : null
    if (only.size && (!county || !only.has(county.id))) return []
    return [{ base: b, href: basePath(b.slug, ctx.locale), county: county?.code ?? null }]
  })
  const totals = new Map<string, number>()
  for (const r of rows)
    if (r.county) totals.set(r.county, (totals.get(r.county) ?? 0) + (r.base.capacity ?? 0))
  // One shared marker when every capacity has the same status.
  const statuses = new Set(rows.map((r) => r.base.capacityStatus))
  const shared = statuses.size === 1 ? rows[0]?.base.capacityStatus : undefined
  const mark = shared && (
    <FactMark
      figure={{ key: 'bases:capacity', label: '', value: '', status: shared }}
      locale={ctx.locale}
    />
  )
  const sorted = [...rows].sort((a, b) => (b.base.capacity ?? 0) - (a.base.capacity ?? 0))
  const t = ui[ctx.locale]
  return (
    <Section id="baze">
      {head}
      <div className="mx-auto grid w-full max-w-3xl gap-5">
        {block.showMap !== false && (
          <CountyMap
            locale={ctx.locale}
            counties={[...totals].map(([code, capacity]) => ({ code, capacity }))}
            current={rows.find((r) => r.href === current)?.county}
            note={mark}
          />
        )}
        <nav
          aria-label={t.bases}
          className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5 border-t border-line pt-4"
        >
          <span className="flex items-center gap-1 text-small font-semibold text-ink">
            {t.bases}
            {block.showMap === false && mark}
          </span>
          {sorted.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              prefetch={false}
              aria-current={r.href === current ? 'page' : undefined}
              className={
                r.href === current
                  ? 'text-small font-semibold text-accent no-underline hover:underline'
                  : 'text-small text-muted no-underline hover:text-ink hover:underline'
              }
            >
              {r.base.name}
            </Link>
          ))}
        </nav>
      </div>
    </Section>
  )
}

async function CropListBlock({
  block,
  ctx,
  head,
}: {
  block: BlockOf<'cropList'>
  ctx: Ctx
  head: ReactNode
}) {
  const chosen = new Set((block.crops ?? []).map((c) => (typeof c === 'object' ? c.id : c)))
  const crops = (await listCrops(ctx.locale)).filter((c) => !chosen.size || chosen.has(c.id))
  return (
    <Section>
      {head}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {crops.map((c) => (
          <li key={c.id}>
            <Link
              href={cropPath(c.slug, ctx.locale)}
              className="group flex h-full items-center gap-4 rounded-lg bg-raised p-4 text-ink no-underline shadow-soft ring-1 ring-line transition duration-150 ease-move hover:-translate-y-0.5 hover:shadow-raised lg:flex-col lg:items-start lg:p-5"
            >
              {isGrainKey(c.key) && <CropBadge crop={c.key} />}
              <span className="flex flex-1 items-center justify-between gap-2 self-stretch font-semibold">
                {c.name}
                <ArrowRightIcon className="size-4 text-accent transition-transform duration-150 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}

export async function LeadFormBlock({
  block,
  locale,
  path,
  preset,
  products,
}: {
  block: Pick<BlockOf<'leadForm'>, 'leadType' | 'extraFields' | 'heading' | 'body'>
  locale: Locale
  path: string
  /** Pre-selected values, e.g. the base on its own page. */
  preset?: { base?: string; crop?: string }
  /** Products a quote request is about. */
  products?: number[]
}) {
  const extra = block.extraFields ?? []
  const [counties, crops, bases] = await Promise.all([
    extra.includes('county') ? listCounties() : [],
    extra.includes('crop') ? listCrops(locale) : [],
    extra.includes('base') ? listBases(locale) : [],
  ])
  const form = (
    <LeadForm
      locale={locale}
      type={block.leadType}
      action={submitLead}
      heading={block.heading}
      body={block.body}
      extra={extra}
      defaults={preset}
      products={products}
      options={{
        county: counties.map((c) => ({ value: String(c.id), label: c.name })),
        crop: crops.map((c) => ({ value: String(c.id), label: c.name })),
        base: bases.map((b) => ({ value: String(b.id), label: b.name })),
      }}
      sourcePath={localePath(path, locale)}
      privacyHref={fixedUrl('privacy', locale)}
    />
  )
  // The contact page is the form. Everywhere else the long form stays closed until asked for,
  // so it no longer splits the page; a link to `#cerere` opens it.
  const isContact =
    `/${path}`
      .replace(/^\/+/, '/')
      .replace(/^\/en(?=\/|$)/, '')
      .replace(/\/$/, '') === '/contact'
  const t = innerUi[locale].request
  return (
    <Section>
      {isContact ? (
        <div
          id="cerere"
          className="mx-auto max-w-3xl rounded-xl bg-raised p-6 shadow-raised ring-1 ring-line md:p-10"
        >
          {form}
        </div>
      ) : (
        <details
          id="cerere"
          className="group mx-auto max-w-3xl scroll-mt-24 rounded-xl bg-raised shadow-raised ring-1 ring-line"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 md:px-10 [&::-webkit-details-marker]:hidden">
            <span className="text-h4 font-semibold text-ink">{t.prompt}</span>
            <span className="inline-flex h-12 items-center rounded-md bg-accent px-6 font-semibold text-on-accent group-open:hidden">
              {t.open}
            </span>
          </summary>
          <div className="p-6 pt-0 md:p-10 md:pt-0">{form}</div>
          <OpenOnHash />
        </details>
      )}
    </Section>
  )
}

/** The credit products on the finance hub, in three groups by need. Nested pages sit under their parent. */
async function FinanceProductsSection({
  block,
  locale,
  figures,
}: {
  block: BlockOf<'financeProducts'>
  locale: Locale
  figures: Figures
}) {
  const products = await listFinanceProducts(locale)
  const top = byFinanceOrder(products.filter((p) => !p.parentSlug))
  const groupsUi = financeUi[locale].groups
  return (
    <Section id="produse">
      <SectionHeading kicker={block.kicker} title={block.heading} lead={block.lead} />
      <div className="mt-8 grid gap-10">
        {financeGroupIds.map((id) => {
          const inGroup = top.filter((p) => groupFor(p.slug) === id)
          if (!inGroup.length) return null
          return (
            <div key={id} id={`grupa-${id}`} className="grid gap-4">
              <div>
                <h3 className="text-h3 font-semibold">{groupsUi[id].title}</h3>
                <p className="mt-1 text-small text-muted">{groupsUi[id].lead}</p>
              </div>
              <ul className="grid gap-4 md:grid-cols-2">
                {inGroup.map((p) => {
                  const children = products.filter((c) => c.parentSlug === p.slug)
                  return (
                    <li
                      key={p.id}
                      className="grid content-start gap-3 rounded-lg bg-raised p-6 ring-1 ring-line"
                    >
                      <h4 className="text-h4 font-semibold">
                        <Link href={financeProductPath(p.slug, locale)} className="text-ink">
                          {p.title}
                        </Link>
                      </h4>
                      <p className="text-small text-muted">{fact(p.answer, { figures, locale })}</p>
                      {children.length > 0 && (
                        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-small">
                          {children.map((c) => (
                            <li key={c.id}>
                              <Link
                                href={financeProductPath(c.slug, locale, p.slug)}
                                className="text-accent underline underline-offset-2"
                              >
                                {c.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
