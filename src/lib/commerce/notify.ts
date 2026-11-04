import type { Order } from '@/payload-types'

/**
 * Tells staff and the buyer about an order. Intentionally empty: the channel is the owner's
 * decision. Orders are stored and routed either way, and appear in the admin under Orders.
 * This must be solved before real orders are accepted (Phase 8 blocker).
 */
export async function notifyOrder(_order: Order): Promise<void> {}
