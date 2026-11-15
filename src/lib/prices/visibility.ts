/**
 * Agrinvest's own prices (grain buy prices, the diesel sale price and the shop's fertiliser
 * price table on `/preturi/ingrasaminte`) are hidden from every public surface while this is
 * false (Phase 7f, owner decision 2026-11-15). The rows stay in the admin; the loaders return
 * nothing and the jobs that read the collections directly (alerts, newsletter, market note)
 * skip them, so turning this back on restores every place at once.
 */
export const showOwnPrices = false
