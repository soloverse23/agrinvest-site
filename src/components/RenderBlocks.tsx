import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { FigureStrip } from '@ds/patterns/Bands'
import { LeadForm } from '@ds/patterns/LeadForm'
import { Button } from '@ds/primitives/Button'
import { localePath, type Locale } from '@/i18n/config'
import { fixedUrl, ui } from '@/i18n/ui'
import { getFigures } from '@/lib/content/globals'
import { listBases, listCounties, listCrops } from '@/lib/content/locations'
import { submitLead } from '@/lib/leads/actions'
import type { Media, Page, Person } from '@/payload-types'

import { FactMark } from './Fact'

type Block = NonNullable<Page['layout']>[number]
type BlockOf<T extends Block['blockType']> = Extract<Block, { blockType: T }>

const media = (m: Media | number | null | undefined): Media | null =>
  m && typeof m === 'object' && m.url ? m : null

/** Register keys shown with an icon in the figure strip. */
const figureIcon: Record<string, string> = { S1: 'bases', S2: 'capacity', L1: 'trucks' }

const Section = ({ children, wide }: { children: ReactNode; wide?: boolean }) => (
  <section className={wide ? 'mx-auto max-w-page px-4 md:px-8' : 'mx-auto max-w-text px-4'}>
    {children}
  </section>
)

/**
 * Renders a page's blocks. When the first block is a hero, the hero carries the page's H1;
 * otherwise the template renders the title as H1 and blocks start at H2.
 * These are the 2.1 renderers: semantic and token-styled; 2.2 swaps in the final patterns.
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
  const rendered = await Promise.all(
    blocks.map((block, i) => renderBlock(block, { locale, path, first: i === 0 })),
  )
  return <div className="grid gap-16 md:gap-24">{rendered}</div>
}

type Ctx = { locale: Locale; path: string; first: boolean }

async function renderBlock(block: Block, ctx: Ctx): Promise<ReactNode> {
  switch (block.blockType) {
    case 'hero':
      return <HeroBlock key={block.id} block={block} {...ctx} />
    case 'richText':
      return (
        <Section key={block.id}>
          <RichText data={block.content} className="grid gap-4" />
        </Section>
      )
    case 'figureStrip':
      return <FigureStripBlock key={block.id} block={block} locale={ctx.locale} />
    case 'serviceGrid':
      return (
        <Section key={block.id} wide>
          {block.heading && <h2 className="mb-8 text-h2 font-semibold">{block.heading}</h2>}
          <ul className="grid gap-6 md:grid-cols-3">
            {(block.items ?? []).map((item) => (
              <li
                key={item.id}
                className="grid content-start gap-2 rounded-lg bg-raised p-6 shadow-soft"
              >
                <h3 className="text-h4 font-semibold">{item.title}</h3>
                {item.body && <p className="text-muted">{item.body}</p>}
                {item.link?.href && item.link.label && (
                  <Link href={item.link.href}>{item.link.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )
    case 'storySection': {
      const image = media(block.media)
      const person = typeof block.person === 'object' ? block.person : null
      return (
        <Section key={block.id} wide>
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div className="grid gap-4">
              <h2 className="text-h2 font-semibold">{block.heading}</h2>
              {block.body && <RichText data={block.body} />}
              {block.quote && (
                <blockquote className="border-l-4 border-lime pl-4 text-lead">
                  {block.quote}
                  {person && <footer className="mt-2 text-small text-muted">{person.name}</footer>}
                </blockquote>
              )}
            </div>
            {image && (
              <Image
                src={image.url as string}
                alt={image.alt}
                width={image.width ?? 1200}
                height={image.height ?? 800}
                className="rounded-lg"
              />
            )}
          </div>
        </Section>
      )
    }
    case 'baseList':
      return <BaseListBlock key={block.id} block={block} locale={ctx.locale} />
    case 'cropList':
      return <CropListBlock key={block.id} block={block} locale={ctx.locale} />
    case 'ctaBand':
      return (
        <Section key={block.id} wide>
          <div
            className={
              block.tone === 'surface'
                ? 'grid gap-4 rounded-xl bg-surface px-6 py-10 md:px-12'
                : 'grid gap-4 rounded-xl bg-forest px-6 py-10 text-on-forest md:px-12'
            }
          >
            <h2 className="text-h2 font-semibold">{block.heading}</h2>
            {block.body && (
              <p className={block.tone === 'surface' ? 'text-muted' : 'text-on-forest-muted'}>
                {block.body}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button
                href={block.primary.href}
                variant={block.tone === 'surface' ? 'primary' : 'lime'}
              >
                {block.primary.label}
              </Button>
              {block.secondary?.href && block.secondary.label && (
                <Button
                  href={block.secondary.href}
                  variant={block.tone === 'surface' ? 'secondary' : 'on-dark'}
                >
                  {block.secondary.label}
                </Button>
              )}
            </div>
          </div>
        </Section>
      )
    case 'leadForm':
      return <LeadFormBlock key={block.id} block={block} locale={ctx.locale} path={ctx.path} />
    case 'contactCards':
      return (
        <Section key={block.id} wide>
          {block.heading && <h2 className="mb-8 text-h2 font-semibold">{block.heading}</h2>}
          <ul className="grid gap-6 md:grid-cols-3">
            {block.people
              .filter((p): p is Person => typeof p === 'object')
              .map((p) => (
                <li key={p.id} className="grid gap-1 rounded-lg bg-raised p-6 shadow-soft">
                  <p className="text-h4 font-semibold">{p.name}</p>
                  {p.role && <p className="text-small text-muted">{p.role}</p>}
                  {p.phone && <a href={`tel:${p.phone.replace(/\s/g, '')}`}>{p.phone}</a>}
                  {p.email && <a href={`mailto:${p.email}`}>{p.email}</a>}
                </li>
              ))}
          </ul>
        </Section>
      )
    case 'videoEmbed': {
      const poster = media(block.poster)
      return (
        <Section key={block.id}>
          <figure className="grid gap-3">
            <a
              href={`https://www.youtube.com/watch?v=${block.youtubeId}`}
              className="relative block aspect-video overflow-hidden rounded-lg bg-ink"
            >
              {poster && (
                <Image src={poster.url as string} alt={poster.alt} fill className="object-cover" />
              )}
              <span className="absolute bottom-4 left-4 rounded-md bg-paper px-3 py-1.5 text-small font-semibold text-ink">
                {ui[ctx.locale].watch}
              </span>
            </a>
            <figcaption className="text-small text-muted">{block.title}</figcaption>
          </figure>
        </Section>
      )
    }
    case 'callout':
      return (
        <Section key={block.id}>
          <aside
            className={
              block.tone === 'warning'
                ? 'rounded-lg bg-warning-soft p-6'
                : block.tone === 'note'
                  ? 'rounded-lg bg-lime-soft p-6'
                  : 'rounded-lg bg-info-soft p-6'
            }
          >
            {block.title && <p className="mb-1 font-semibold">{block.title}</p>}
            <p>{block.body}</p>
          </aside>
        </Section>
      )
    default:
      return null
  }
}

function HeroBlock({ block, first }: { block: BlockOf<'hero'> } & Ctx) {
  const Heading = first ? 'h1' : 'h2'
  const [before, after] =
    block.accent && block.title.includes(block.accent)
      ? block.title.split(block.accent)
      : [block.title, '']
  const image = media(block.image)
  return (
    <section className="relative isolate overflow-hidden bg-forest text-on-forest">
      {image && (
        <Image
          src={image.url as string}
          alt={image.alt}
          fill
          priority={first}
          sizes="100vw"
          className="-z-10 object-cover opacity-40"
        />
      )}
      <div className="mx-auto grid max-w-page gap-6 px-4 py-20 md:px-8 md:py-28">
        {block.eyebrow && <p className="text-small font-medium text-lime">{block.eyebrow}</p>}
        <Heading className="max-w-4xl text-hero font-semibold text-balance">
          {before}
          {block.accent && <span className="text-lime">{block.accent}</span>}
          {after}
        </Heading>
        {block.lead && <p className="max-w-2xl text-lead text-on-forest-muted">{block.lead}</p>}
        <div className="flex flex-wrap gap-3">
          {block.primary?.href && block.primary.label && (
            <Button href={block.primary.href} variant="lime" size="lg">
              {block.primary.label}
            </Button>
          )}
          {block.secondary?.href && block.secondary.label && (
            <Button href={block.secondary.href} variant="on-dark" size="lg">
              {block.secondary.label}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

async function FigureStripBlock({
  block,
  locale,
}: {
  block: BlockOf<'figureStrip'>
  locale: Locale
}) {
  const figures = await getFigures(locale)
  const items = (block.items ?? []).flatMap((item) => {
    const figure = figures[item.figure]
    if (!figure || figure.number == null) return []
    return [
      {
        key: figureIcon[item.figure] ?? item.figure,
        value: figure.number,
        unit: figure.unit ?? undefined,
        label: item.label || figure.label,
        note: <FactMark figure={figure} locale={locale} />,
      },
    ]
  })
  if (!items.length) return null
  return (
    <Section wide>
      {block.heading && <h2 className="mb-6 text-h2 font-semibold">{block.heading}</h2>}
      <FigureStrip locale={locale} items={items} />
    </Section>
  )
}

async function BaseListBlock({ block, locale }: { block: BlockOf<'baseList'>; locale: Locale }) {
  const counties = new Set((block.counties ?? []).map((c) => (typeof c === 'object' ? c.id : c)))
  const bases = (await listBases(locale)).filter((b) => {
    const county = typeof b.county === 'object' && b.county ? b.county.id : b.county
    return !counties.size || (county != null && counties.has(county))
  })
  return (
    <Section wide>
      <h2 className="mb-6 text-h2 font-semibold">{block.heading || ui[locale].bases}</h2>
      <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2 md:grid-cols-4">
        {bases.map((b) => (
          <li key={b.id}>
            <Link href={localePath(`/baze/${b.slug}`, 'ro')}>{b.name}</Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}

async function CropListBlock({ block, locale }: { block: BlockOf<'cropList'>; locale: Locale }) {
  const chosen = new Set((block.crops ?? []).map((c) => (typeof c === 'object' ? c.id : c)))
  const crops = (await listCrops(locale)).filter((c) => !chosen.size || chosen.has(c.id))
  return (
    <Section wide>
      <h2 className="mb-6 text-h2 font-semibold">{block.heading || ui[locale].crops}</h2>
      <ul className="flex flex-wrap gap-3">
        {crops.map((c) => (
          <li key={c.id}>
            <Link href={localePath(`/cereale/${c.slug}`, 'ro')}>{c.name}</Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}

async function LeadFormBlock({
  block,
  locale,
  path,
}: {
  block: BlockOf<'leadForm'>
  locale: Locale
  path: string
}) {
  const extra = block.extraFields ?? []
  const [counties, crops, bases] = await Promise.all([
    extra.includes('county') ? listCounties() : [],
    extra.includes('crop') ? listCrops(locale) : [],
    extra.includes('base') ? listBases(locale) : [],
  ])
  return (
    <Section>
      <LeadForm
        locale={locale}
        type={block.leadType}
        action={submitLead}
        heading={block.heading}
        body={block.body}
        extra={extra}
        options={{
          county: counties.map((c) => ({ value: String(c.id), label: c.name })),
          crop: crops.map((c) => ({ value: String(c.id), label: c.name })),
          base: bases.map((b) => ({ value: String(b.id), label: b.name })),
        }}
        sourcePath={localePath(path, locale)}
        privacyHref={fixedUrl('privacy', locale)}
      />
    </Section>
  )
}
