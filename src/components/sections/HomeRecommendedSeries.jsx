import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SeriesArtwork from '@/components/resources/SeriesArtwork'

const SERIES_DIRECTORY_PATH = '/ressources-ia?vue=series'

export default function HomeRecommendedSeries({ series, status }) {
  const { t } = useTranslation()

  return (
    <section className="bg-lavender/20 py-20 sm:py-24 lg:py-28" aria-labelledby="home-starter-series-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-deep">
          {t('homeStarterSeries.eyebrow')}
        </p>
        <h2 id="home-starter-series-title" className="mt-3 font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl">
          {t('homeStarterSeries.title')}
        </h2>

        {status === 'loading' ? (
          <div className="mt-10 grid animate-pulse gap-8 lg:grid-cols-2 lg:items-center" aria-busy="true">
            <div className="aspect-video rounded-2xl bg-navy/10" />
            <div className="space-y-4"><div className="h-8 w-3/4 rounded bg-navy/10" /><div className="h-4 w-full rounded bg-navy/10" /><div className="h-4 w-2/3 rounded bg-navy/10" /></div>
          </div>
        ) : series ? (
          <div className="mt-10 grid gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-14">
            <div className="rounded-2xl border border-navy/10 bg-steel/[0.08] p-4 sm:p-6">
              <SeriesArtwork series={series} t={t} />
            </div>
            <div className="max-w-xl">
              {series.commonLevel && (
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-deep">
                  {t(`resourcesAi.levels.${series.commonLevel}`)}
                </p>
              )}
              <h3 className="mt-3 font-heading text-3xl font-bold leading-tight text-navy sm:text-4xl">{series.name}</h3>
              {series.description && <p className="mt-5 text-base leading-relaxed text-navy/70">{series.description}</p>}
              {!series.description && series.objective && <p className="mt-5 text-base leading-relaxed text-navy/70">{series.objective}</p>}
              <p className="mt-5 text-sm font-semibold text-navy/65">
                {t('resourcesAi.catalog.episodeCount', { count: series.episodeCount })}
              </p>
              <Link
                to={`/ressources-ia/series/${series.slug}`}
                className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-navy-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
              >
                {t('homeStarterSeries.action')}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 max-w-xl">
            <p className="text-base leading-relaxed text-navy/70">{t('homeStarterSeries.fallbackDescription')}</p>
            <Link to={SERIES_DIRECTORY_PATH} className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-accent-deep hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4">
              {t('homeStarterSeries.fallbackAction')}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
