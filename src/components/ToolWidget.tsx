import type { ReactNode } from 'react'

import { DieselCard } from '@ds/patterns/widgets/DieselCard'
import { GrainPrices } from '@ds/patterns/widgets/GrainPrices'
import { NewsList } from '@ds/patterns/widgets/NewsList'
import { NetPriceMini } from '@ds/patterns/widgets/NetPriceMini'
import { grainPricesProps, netPriceMiniProps } from '@/components/templates/PricePage'
import { dieselCardProps, newsListProps } from '@/components/TodayStrip'
import type { Locale } from '@/i18n/config'
import { grainItems } from '@/lib/prices/overview'
import type { ToolWidgetBlock } from '@/payload-types'

type Props = { block: ToolWidgetBlock; locale: Locale }

/**
 * Renders a `toolWidget` page block by name. Each widget is added here in the sub-phase that
 * builds it (grain prices and net price in 5.2, diesel and news in 5.4 and 5.6). Weather was
 * dropped from the roadmap, so `weather` renders nothing at all, so an editor who places a block early publishes no
 * broken link and no empty card.
 */
const widgets: Partial<Record<ToolWidgetBlock['widget'], (props: Props) => ReactNode>> = {
  // All grain crops, or only the block's crop.
  grainPrices: async ({ block, locale }) => {
    const { overview, props } = await grainPricesProps(locale, block.heading ?? undefined)
    const cropId = typeof block.crop === 'object' ? block.crop?.id : block.crop
    const items = cropId ? grainItems(overview.filter((c) => c.id === cropId)) : props.items
    return <GrainPrices {...props} items={items} />
  },
  netPrice: async ({ block, locale }) => {
    const crop = typeof block.crop === 'object' ? block.crop?.key : undefined
    const props = await netPriceMiniProps(locale, crop)
    return <NetPriceMini {...props} title={block.heading || props.title} />
  },
  diesel: async ({ block, locale }) => (
    <DieselCard {...await dieselCardProps(locale, block.heading ?? undefined)} />
  ),
  news: async ({ block, locale }) => (
    <NewsList {...await newsListProps(locale, block.heading ?? undefined, 5)} />
  ),
}

/** The widget alone, for article sidebars. */
export function ToolWidgetCard({ block, locale }: Props) {
  const Widget = widgets[block.widget]
  return Widget ? <Widget block={block} locale={locale} /> : null
}

export function ToolWidget({ block, locale }: Props) {
  const Widget = widgets[block.widget]
  if (!Widget) return null
  return (
    <section className="mx-auto w-full max-w-page px-4 md:px-8">
      <div className="max-w-text">
        <Widget block={block} locale={locale} />
      </div>
    </section>
  )
}
