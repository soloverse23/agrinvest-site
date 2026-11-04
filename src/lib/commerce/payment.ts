import type { Order } from '@/payload-types'

/**
 * How an order is paid. No money is taken online yet (decision 0006): a consultant confirms
 * first. A card provider plugs in here once the owner chooses one.
 */
export const paymentMethods = ['consultant', 'proforma'] as const
export type PaymentMethod = (typeof paymentMethods)[number]

export async function startPayment(_order: Order): Promise<{ status: 'pending' }> {
  return { status: 'pending' }
}
