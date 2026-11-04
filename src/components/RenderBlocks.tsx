import type { SerializedTextNode } from '@payloadcms/richtext-lexical'
import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { BaseMap } from '@ds/patterns/BaseMap'
import { FigureStrip, FinanceBand } from '@ds/patterns/Bands'
import { FactTable } from '@ds/patterns/FactTable'
import { Hero } from '@ds/patterns/Hero'
import { LeadFormLazy as LeadForm } from '@ds/patterns/LeadFormLazy'
import { CropBadge } from '@ds/patterns/parts'
import {
  Callout,
  ContactCards,
  CtaBand,
  SectionHeading,
  ServiceGrid,
  Steps,
  StorySection,
} from '@ds/patterns/Sections'
import { VideoEmbed } from '@ds/patterns/VideoEmbed'
import { ArrowRightIcon } from '@ds/icons/icons'
import { localePath, type Locale } from '@/i18n/config'
import { basePath, cropPath } from '@/i18n/routes'
import { fixedUrl, ui } from '@/i18n/ui'
import { getFigures, type Figures } from '@/lib/content/globals'
import { listBases, listCounties, listCrops } from '@/lib/content/locations'
import { submitLead } from '@/lib/leads/actions'
import { videoObject } from '@/lib/schema'
import type { Media, Page, Person } from '@/payload-types'

import { FactMark } from './Fact'
import { FactText } from './FactText'
import { JsonLd } from './JsonLd'

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

type Ctx = { locale: Locale; path: string; first: boolean; figures: Figures }

/** Renders text with `{{KEY}}` register facts. */
const fact = (text: string | null | undefined, ctx: Pick<Ctx, 'figures' | 'locale'>) =>
  text ? <FactText text={text} figures={ctx.figures} locale={ctx.locale} /> : null

/** Rich text with register facts inside text nodes, in the long-form style. */
function Prose({
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
}: {
  blocks: Page['layout']
  locale: Locale
  /** Locale-relative path of the page, stored with leads. */
  path: string
}) {
  if (!blocks?.length) return null
  const figures = await getFigures(locale)
  const rendered = await Promise.all(
    blocks.map((block, i) => renderBlock(block, { locale, path, first: i === 0, figures })),
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
              poster={poster ? { src: poster.url as string, alt: poster.alt } : null}
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
    default:
      return null
  }
}

function HeroBlock({ block, first, figures, locale }: { block: BlockOf<'hero'> } & Ctx) {
  const image = media(block.image)
  return (
    <Hero
      locale={locale}
      as={first ? 'h1' : 'h2'}
      eyebrow={block.eyebrow ?? ''}
      title={block.title}
      accent={block.accent ?? undefined}
      lead={fact(block.lead, { figures, locale })}
      photo={image ? { src: image.url as string, alt: image.alt } : null}
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
      needs={(block.needs ?? []).map((n) => ({
        href: n.link.href,
        label: n.link.label,
        hint: fact(n.hint, { figures, locale }),
      }))}
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

/** Bases on the county map, with links to every base page. */
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
  const [bases, counties] = await Promise.all([listBases(ctx.locale), listCounties()])
  const shown = bases.filter((b) => {
    const county = typeof b.county === 'object' && b.county ? b.county.id : b.county
    return !only.size || (county != null && only.has(county))
  })
  // The base links carry one shared marker when every capacity has the same status.
  const statuses = new Set(shown.map((b) => b.capacityStatus))
  const shared = statuses.size === 1 ? shown[0]?.capacityStatus : undefined
  return (
    <Section id="baze">
      {head}
      <BaseMap
        locale={ctx.locale}
        current={current}
        counties={counties.map((c) => c.code)}
        pendingNote={ui[ctx.locale].pendingMap}
        listNote={
          shared && (
            <FactMark
              figure={{ key: 'bases:capacity', label: '', value: '', status: shared }}
              locale={ctx.locale}
            />
          )
        }
        bases={shown.map((b) => {
          const county = typeof b.county === 'object' && b.county ? b.county : null
          return {
            name: b.name,
            href: basePath(b.slug, ctx.locale),
            capacity: b.capacity,
            county: county?.code,
            geo: b.geo,
          }
        })}
      />
    </Section>
  )
}

const cropKeys = ['wheat', 'maize', 'sunflower', 'rapeseed', 'barley'] as const

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
              {cropKeys.includes(c.key) && <CropBadge crop={c.key} />}
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
}: {
  block: Pick<BlockOf<'leadForm'>, 'leadType' | 'extraFields' | 'heading' | 'body'>
  locale: Locale
  path: string
  /** Pre-selected values, e.g. the base on its own page. */
  preset?: { base?: string; crop?: string }
}) {
  const extra = block.extraFields ?? []
  const [counties, crops, bases] = await Promise.all([
    extra.includes('county') ? listCounties() : [],
    extra.includes('crop') ? listCrops(locale) : [],
    extra.includes('base') ? listBases(locale) : [],
  ])
  return (
    <Section id="cerere">
      <div className="mx-auto max-w-3xl rounded-xl bg-raised p-6 shadow-raised ring-1 ring-line md:p-10">
        <LeadForm
          locale={locale}
          type={block.leadType}
          action={submitLead}
          heading={block.heading}
          body={block.body}
          extra={extra}
          defaults={preset}
          options={{
            county: counties.map((c) => ({ value: String(c.id), label: c.name })),
            crop: crops.map((c) => ({ value: String(c.id), label: c.name })),
            base: bases.map((b) => ({ value: String(b.id), label: b.name })),
          }}
          sourcePath={localePath(path, locale)}
          privacyHref={fixedUrl('privacy', locale)}
        />
      </div>
    </Section>
  )
}
