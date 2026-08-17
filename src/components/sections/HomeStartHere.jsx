import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const SERIES_DIRECTORY_PATH = '/ressources-ia?vue=series'

export default function HomeStartHere({ starterSeries }) {
  const { t } = useTranslation()
  const starterPath = starterSeries
    ? `/ressources-ia/series/${starterSeries.slug}`
    : SERIES_DIRECTORY_PATH

  const intentions = [
    {
      number: '01',
      title: t('homeStart.discover.title'),
      description: t('homeStart.discover.description'),
      label: starterSeries ? t('homeStart.discover.action') : t('homeStart.seriesFallback'),
      to: starterPath,
    },
    {
      number: '02',
      title: t('homeStart.concept.title'),
      description: t('homeStart.concept.description'),
      label: t('homeStart.concept.action'),
      to: '#explorer-par-sujet',
    },
    {
      number: '03',
      title: t('homeStart.use.title'),
      description: t('homeStart.use.description'),
      label: t('homeStart.use.action'),
      to: '/ressources-ia?format=prompt',
    },
  ]

  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28" aria-labelledby="home-start-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-deep">
            {t('homeStart.eyebrow')}
          </p>
          <h2 id="home-start-title" className="mt-3 font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            {t('homeStart.title')}
          </h2>
        </div>
        <div className="mt-12 grid border-t border-navy/12 md:grid-cols-3">
          {intentions.map((intention) => (
            <article
              key={intention.number}
              className="flex min-w-0 flex-col border-b border-navy/12 py-7 md:border-b-0 md:px-7 md:py-1 md:first:pl-0 md:not-last:border-r md:last:pr-0"
            >
              <p className="font-heading text-5xl font-bold leading-none text-lavender sm:text-6xl" aria-hidden="true">
                {intention.number}
              </p>
              <h3 className="mt-6 font-heading text-xl font-bold text-navy">{intention.title}</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-navy/65">{intention.description}</p>
              {intention.to.startsWith('#') ? (
                <a
                  href={intention.to}
                  className="mt-6 inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-bold text-accent-deep transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
                >
                  {intention.label}
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              ) : (
                <Link
                  to={intention.to}
                  className="mt-6 inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-bold text-accent-deep transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
                >
                  {intention.label}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
