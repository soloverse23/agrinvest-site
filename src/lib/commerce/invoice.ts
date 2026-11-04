import type { Order } from '@/payload-types'

/** Issues the invoice. Intentionally empty until the owner chooses an invoicing system. */
export async function issueInvoice(_order: Order): Promise<void> {}
