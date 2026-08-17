import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { buildFormatDestination } from '@/lib/homepageCuration'

const FORMATS = [
  { key: 'article', value: 'articles' },
  { key: 'infographic', value: 'infographies' },
  { key: 'prompt', value: 'prompt' },
]

export default function HomeFormats() {
  const { t } = useTranslation()
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28" aria-labelledby="home-formats-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-deep">{t('homeFormats.eyebrow')}</p>
          <h2 id="home-formats-title" className="mt-3 font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl">{t('homeFormats.title')}</h2>
          <p className="mt-4 text-base leading-relaxed text-navy/70">{t('homeFormats.description')}</p>
        </div>
        <div className="mt-12 grid border-t border-navy/12 md:grid-cols-3">
          {FORMATS.map(({ key, value }, index) => (
            <article key={key} className="flex min-w-0 flex-col border-b border-navy/12 py-7 md:border-b-0 md:px-7 md:py-1 md:first:pl-0 md:not-last:border-r md:last:pr-0">
              <p className="text-[11px] font-bold tracking-[0.16em] text-accent-deep">{String(index + 1).padStart(2, '0')} {t(`resourcesAi.formats.${key}`).toUpperCase()}</p>
              <h3 className="mt-5 font-heading text-2xl font-bold text-navy">{t(`homeFormats.items.${key}.title`)}</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-navy/65">{t(`homeFormats.items.${key}.description`)}</p>
              <Link to={buildFormatDestination(value)} className="mt-6 inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-bold text-accent-deep transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4">
                {t(`homeFormats.items.${key}.action`)} <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
