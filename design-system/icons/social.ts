import { FacebookIcon, InstagramIcon, LinkedinIcon, TiktokIcon, YoutubeIcon } from './icons'

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
