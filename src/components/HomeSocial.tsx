import { SocialPostCard } from '@ds/patterns/SocialPosts'
import { SectionHeading } from '@ds/patterns/Sections'
import type { Locale } from '@/i18n/config'
import { socialUi } from '@/i18n/social'
import { getSeoDefaults } from '@/lib/content/globals'
import { listSocialPosts } from '@/lib/content/social'

/**
 * The newest important LinkedIn posts on the home page (Phase 7). Renders nothing until staff
 * add a post. The "follow" link is the LinkedIn profile from the organization's `sameAs`.
 */
export async function HomeSocial({ locale }: { locale: Locale }) {
  const [posts, seo] = await Promise.all([listSocialPosts(3), getSeoDefaults(locale)])
  if (posts.length === 0) return null
  const t = socialUi[locale]
  const profile = seo.organization?.sameAs?.find((s) => s.url.includes('linkedin'))?.url
  return (
    <section
      aria-labelledby="linkedin"
      className="mx-auto mt-16 grid w-full max-w-page gap-8 px-4 md:mt-24 md:px-8"
    >
      <SectionHeading
        id="linkedin"
        kicker={t.kicker}
        title={t.title}
        action={profile ? { href: profile, label: t.follow } : null}
      />
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((p) => (
          <SocialPostCard
            key={p.id}
            url={p.url}
            text={p.text}
            date={p.date}
            image={p.image}
            locale={locale}
            labels={{ network: t.network, view: t.view }}
          />
        ))}
      </div>
    </section>
  )
}
