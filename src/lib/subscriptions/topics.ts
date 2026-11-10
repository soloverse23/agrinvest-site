import type { Locale } from '@/i18n/config'

/** What a visitor can subscribe to. No dependencies, so the form can import it too. */
export const subscriptionTopics = ['price-alert', 'newsletter', 'frost-alert'] as const
export type SubscriptionTopic = (typeof subscriptionTopics)[number]

export const topicLabels: Record<SubscriptionTopic, Record<Locale, string>> = {
  'price-alert': { ro: 'Alertă de preț', en: 'Price alert' },
  newsletter: { ro: 'Buletinul săptămânal', en: 'Weekly newsletter' },
  'frost-alert': { ro: 'Alertă de îngheț', en: 'Frost alert' },
}

/** `any`: every change; `above` / `below`: when the price crosses the threshold. */
export const alertRules = ['any', 'above', 'below'] as const
export type AlertRule = (typeof alertRules)[number]
