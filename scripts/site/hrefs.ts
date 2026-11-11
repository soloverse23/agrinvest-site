/**
 * Whether a menu already links an address, in a top-level item or in any panel link. The
 * entry-point helpers of earlier phases ask this before they add an item, so a menu that
 * moved the same links into a panel (Phase 7b) is left as it is.
 */
type Node = {
  link?: { href?: string | null } | null
  children?: Node[] | null
}

export function menuHasHref(items: Node[], href: string): boolean {
  return items.some((i) => i.link?.href === href || menuHasHref(i.children ?? [], href))
}
