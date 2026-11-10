import { ArrowRightIcon } from '../../icons/icons'
import { Button } from '../../primitives/Button'
import { SelectField, TextField } from '../../primitives/Field'
import { WidgetFrame } from './WidgetFrame'
import type { WidgetBaseProps } from './types'

export type NetPriceMiniProps = Omit<WidgetBaseProps, 'state'> & {
  /** The calculator page; the form sends its fields there as a GET request. */
  action: string
  crops: { value: string; label: string }[]
  /** Pre-selected crop, e.g. on a crop page. */
  crop?: string
  labels: {
    crop: string
    choose: string
    quantity: string
    price: string
    moisture: string
    impurities: string
    submit: string
  }
}

/**
 * A short form into the net-price calculator: crop, quantity, price, moisture and impurities.
 * A plain GET form, so it needs no script; the calculator fills in the limits and shows the
 * result.
 */
export function NetPriceMini({ action, crops, crop, labels, ...frame }: NetPriceMiniProps) {
  return (
    <WidgetFrame {...frame} state="ready">
      <form method="get" action={`${action}#rezultat`} className="grid gap-4">
        <SelectField
          name="cultura"
          label={labels.crop}
          defaultValue={crop ?? ''}
          options={[{ value: '', label: labels.choose }, ...crops]}
        />
        <div className="grid grid-cols-2 gap-4">
          <TextField name="cantitate" label={labels.quantity} inputMode="decimal" suffix="t" />
          <TextField name="pret" label={labels.price} inputMode="decimal" suffix="lei/t" />
          <TextField name="umiditate" label={labels.moisture} inputMode="decimal" suffix="%" />
          <TextField name="impuritati" label={labels.impurities} inputMode="decimal" suffix="%" />
        </div>
        <div>
          <Button type="submit" variant="secondary" icon={<ArrowRightIcon />}>
            {labels.submit}
          </Button>
        </div>
      </form>
    </WidgetFrame>
  )
}
