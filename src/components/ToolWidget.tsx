import type { ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import type { ToolWidgetBlock } from '@/payload-types'

type Props = { block: ToolWidgetBlock; locale: Locale }

/**
 * Renders a `toolWidget` page block by name. Each widget is added here in the sub-phase that
 * builds it (grain prices and net price in 5.2, diesel 5.4, weather 5.5, news 5.6). Until
 * then a name renders nothing at all, so an editor who places a block early publishes no
 * broken link and no empty card.
 */
const widgets: Partial<Record<ToolWidgetBlock['widget'], (props: Props) => ReactNode>> = {}

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
