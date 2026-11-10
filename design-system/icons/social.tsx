import { icon } from './factory'

/* Social networks, drawn on the same line grid so they sit quietly next to the other icons. */
export const FacebookIcon = icon(
  'FacebookIcon',
  <path d="M7 10v4h3v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3V3h-3a5 5 0 0 0-5 5v2z" />,
)
export const InstagramIcon = icon(
  'InstagramIcon',
  <>
    <rect x="4" y="4" width="16" height="16" rx="4.5" />
    <circle cx="12" cy="12" r="3.5" />
    <path d="M16.6 7.4v.01" />
  </>,
)
export const LinkedinIcon = icon(
  'LinkedinIcon',
  <>
    <rect x="4" y="4" width="16" height="16" rx="2.5" />
    <path d="M8 11v5M8 8v.01M12 16v-5M12 13.5a2.5 2.5 0 0 1 5 0V16" />
  </>,
)
export const TiktokIcon = icon(
  'TiktokIcon',
  <path d="M20 7.9v3.9a9.5 9.5 0 0 1-4.8-1.9v4.4a6.2 6.2 0 1 1-7.7-6v4.2a2.3 2.3 0 1 0 3.8 1.8V3.5h3.9A5.7 5.7 0 0 0 20 7.9z" />,
)
export const YoutubeIcon = icon(
  'YoutubeIcon',
  <>
    <rect x="3" y="5.5" width="18" height="13" rx="4" />
    <path d="m10 9.2 5 2.8-5 2.8z" />
  </>,
)
export const ExternalLinkIcon = icon(
  'ExternalLinkIcon',
  <path d="M14 4h6v6M20 4l-9 9M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />,
)

export const socialIcons = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  tiktok: TiktokIcon,
  youtube: YoutubeIcon,
} as const
export type SocialNetwork = keyof typeof socialIcons

/** Which network a profile URL belongs to, or null for an unknown host. */
export const socialNetworkOf = (url: string): SocialNetwork | null =>
  (Object.keys(socialIcons) as SocialNetwork[]).find((n) => url.includes(n)) ?? null
