import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SeriesArtwork from '@/components/resources/SeriesArtwork'
import { selectFeaturedSeries } from '@/lib/homepageCuration'

export default function HomeSeries({ series, status }) {
  const { t } = useTranslation()
  const featuredSeries = selectFeaturedSeries(series)

  if (status === 'ready' && featuredSeries.length === 0) return null

  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28" aria-labelledby="home-series-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-deep">
            {t('homeSeries.eyebrow')}
          </p>
          <h2 id="home-series-title" className="mt-3 font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            {t('homeSeries.title')}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-navy/70">{t('homeSeries.description')}</p>
        </div>

        {status === 'loading' ? <SeriesLoading t={t} /> : (
          <div className="mt-10 grid gap-x-7 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
            {featuredSeries.map((item) => <SeriesItem key={item.id} series={item} t={t} />)}
          </div>
        )}
      </div>
    </section>
  )
}

function SeriesItem({ series, t }) {
  return (
    <article className="group min-w-0">
      <div className="overflow-hidden rounded-2xl bg-steel/[0.08] p-3 sm:p-4">
        <SeriesArtwork series={series} t={t} />
      </div>
      <div className="pt-5">
        {series.commonLevel && (
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-deep">
            {t(`resourcesAi.levels.${series.commonLevel}`, { defaultValue: series.commonLevel })}
          </p>
        )}
        <h3 className="mt-2 font-heading text-2xl font-bold leading-tight text-navy">{series.name}</h3>
        {series.description && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-navy/65">{series.description}</p>}
        <p className="mt-3 text-sm font-semibold text-navy/65">
          {t('resourcesAi.catalog.episodeCount', { count: series.episodeCount })}
        </p>
        <Link
          to={`/ressources-ia/series/${series.slug}`}
          aria-label={t('homeSeries.viewLabel', { series: series.name })}
          className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-accent-deep transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
        >
          {t('homeSeries.view')}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

function SeriesLoading({ t }) {
  return (
    <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
      <p className="sr-only">{t('homeSeries.loading')}</p>
      {[0, 1, 2].map((item) => (
        <div key={item} className="space-y-4">
          <div className="aspect-video animate-pulse rounded-2xl bg-steel/15" />
          <div className="h-3 w-20 animate-pulse rounded bg-accent/15" />
          <div className="h-7 w-4/5 animate-pulse rounded bg-navy/10" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-navy/[0.07]" />
        </div>
      ))}
    </div>
  )
}
