/** Header link styles, shared by the server header (mobile menu) and the desktop mega menu. */
export const linkBase =
  'inline-flex h-10 items-center rounded-md px-3.5 text-small font-medium no-underline transition-colors duration-150'

export const linkState = (active: boolean, overlay = false) =>
  overlay
    ? active
      ? 'bg-on-forest/15 text-on-forest'
      : 'text-on-forest/85 hover:bg-on-forest/10 hover:text-on-forest'
    : active
      ? 'bg-accent-soft text-accent'
      : 'text-muted hover:bg-surface hover:text-ink'
