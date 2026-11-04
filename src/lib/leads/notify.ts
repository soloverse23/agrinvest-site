import type { Lead } from '@/payload-types'

/**
 * Tells the assigned person about a new lead. Intentionally empty: the channel (email, SMS,
 * WhatsApp…) is the owner's decision, still open. Leads are stored and routed either way,
 * and staff see them in the admin under Leads.
 */
export async function notifyLead(_lead: Lead): Promise<void> {}
