/** Delivery cost. "To be confirmed" until Agrinvest sets delivery zones. */
export type DeliveryQuote = { status: 'to-confirm' } | { status: 'quoted'; price: number }

export async function quoteDelivery(_input: {
  method: 'delivery' | 'pickup'
  county?: number
}): Promise<DeliveryQuote> {
  return { status: 'to-confirm' }
}
