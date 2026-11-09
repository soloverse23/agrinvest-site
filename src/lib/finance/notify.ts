import type { FinanceApplication } from '@/payload-types'

/**
 * Tells the IFN about a new credit application. Intentionally empty, like `notifyLead`: the
 * channel is the owner's decision, still open. Applications are stored and routed either way,
 * and `ifn` users see them in the admin under Credit applications.
 */
export async function notifyApplication(_application: FinanceApplication): Promise<void> {}
