import { isLocale, type Locale } from '@/i18n/config'

const copy: Record<Locale, { title: string; body: string }> = {
  ro: {
    title: 'Agrinvest — site în construcție',
    body: 'Noul site Agrinvest este în lucru.',
  },
  en: {
    title: 'Agrinvest — site under construction',
    body: 'The new Agrinvest website is being built.',
  },
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = copy[isLocale(locale) ? locale : 'ro']

  return (
    <main className="mx-auto max-w-text px-4 py-24">
      <h1 className="text-h1 font-semibold">{t.title}</h1>
      <p className="mt-4 text-lead text-muted">{t.body}</p>
    </main>
  )
}
