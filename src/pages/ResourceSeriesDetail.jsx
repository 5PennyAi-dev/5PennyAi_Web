import { useEffect, useState } from 'react'
import { ArrowLeft, BookOpen, Layers3, RotateCw } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import InfographicCard from '@/components/resources/InfographicCard'
import { fetchPublishedInfographics } from '@/lib/publicInfographics'
import { findSeriesBySlug, groupResourcesBySeries } from '@/lib/resourceSeries'

const RESOURCES_PATH = '/ressources-ia'
const SERIES_VIEW_PATH = '/ressources-ia?vue=series'
const DETAIL_PATH = '/ressources-ia/infographies'

export default function ResourceSeriesDetail() {
  const { seriesSlug } = useParams()
  const [reloadKey, setReloadKey] = useState(0)

  return (
    <ResourceSeriesBySlug
      key={`${seriesSlug}-${reloadKey}`}
      onRetry={() => setReloadKey((value) => value + 1)}
      seriesSlug={seriesSlug}
    />
  )
}

function ResourceSeriesBySlug({ onRetry, seriesSlug }) {
  const { t } = useTranslation()
  const [series, setSeries] = useState(null)
  const [state, setState] = useState('loading')

  useEffect(() => {
    let cancelled = false

    fetchPublishedInfographics()
      .then((resources) => {
        if (cancelled) return
        const resolvedSeries = findSeriesBySlug(
          groupResourcesBySeries(resources),
          seriesSlug,
        )
        setSeries(resolvedSeries)
        setState(resolvedSeries ? 'ready' : 'missing')
      })
      .catch((error) => {
        console.error('Unable to load published resource series:', error.message)
        if (!cancelled) setState('error')
      })

    return () => {
      cancelled = true
    }
  }, [seriesSlug])

  if (state === 'loading') return <SeriesLoading t={t} />
  if (state === 'error') {
    return <SeriesError onRetry={onRetry} t={t} />
  }
  if (state === 'missing') return <SeriesUnavailable t={t} />

  return <SeriesContent series={series} t={t} />
}

function SeriesContent({ series, t }) {
  const firstEpisodeTitle = series.firstEpisode?.title || t('resourcesAi.type')

  return (
    <>
      <Helmet>
        <title>{t('resourcesAi.seriesPage.seoTitle', { series: series.name })}</title>
        <meta
          name="description"
          content={t('resourcesAi.seriesPage.seoDescription', {
            series: series.name,
            count: series.episodeCount,
          })}
        />
      </Helmet>

      <article className="min-h-[75vh] bg-warm-gray pt-24 pb-20 md:pt-28 md:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav
            aria-label={t('resourcesAi.detail.breadcrumbLabel')}
            className="mb-8 flex flex-wrap items-center gap-2 text-sm text-navy/55"
          >
            <Link to={RESOURCES_PATH} className="font-medium hover:text-accent-deep">
              {t('resourcesAi.title')}
            </Link>
            <span aria-hidden="true">/</span>
            <Link to={SERIES_VIEW_PATH} className="font-medium hover:text-accent-deep">
              {t('resourcesAi.catalog.series')}
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="max-w-full truncate text-navy/75">
              {series.name}
            </span>
          </nav>

          <header className="rounded-3xl bg-navy px-6 py-9 text-white shadow-[var(--shadow-card-hover)] sm:px-9 sm:py-11 lg:flex lg:items-end lg:justify-between lg:gap-10 lg:px-12">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-light">
                {t('resourcesAi.seriesPage.eyebrow')}
              </p>
              <h1 className="mt-4 max-w-4xl font-heading text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
                {series.name}
              </h1>
              <div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold text-white/80">
                <span className="rounded-full bg-white/10 px-3.5 py-1.5">
                  {t('resourcesAi.catalog.episodeCount', { count: series.episodeCount })}
                </span>
                {series.commonLevel && (
                  <span className="rounded-full bg-white/10 px-3.5 py-1.5">
                    {t(`resourcesAi.levels.${series.commonLevel}`)}
                  </span>
                )}
              </div>
            </div>

            {series.firstEpisode && (
              <Link
                to={`${DETAIL_PATH}/${series.firstEpisode.id}`}
                aria-label={t('resourcesAi.catalog.startSeriesLabel', {
                  series: series.name,
                  title: firstEpisodeTitle,
                })}
                className="mt-8 inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy lg:mt-0"
              >
                <BookOpen size={16} aria-hidden="true" />
                {t('resourcesAi.catalog.startSeries')}
              </Link>
            )}
          </header>

          <section className="mt-12 md:mt-16" aria-labelledby="series-episodes-title">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
                  {t('resourcesAi.seriesPage.listEyebrow')}
                </p>
                <h2 id="series-episodes-title" className="mt-2 font-heading text-2xl font-bold text-navy md:text-3xl">
                  {t('resourcesAi.seriesPage.episodesTitle')}
                </h2>
              </div>
              <Link
                to={SERIES_VIEW_PATH}
                className="text-sm font-bold text-accent-deep underline decoration-accent/35 underline-offset-4 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
              >
                {t('resourcesAi.seriesPage.allSeries')}
              </Link>
            </div>

            <ul
              aria-label={t('resourcesAi.seriesPage.episodeListLabel', { series: series.name })}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7"
            >
              {series.resources.map((resource) => (
                <li key={resource.id}>
                  <InfographicCard infographic={resource} showSeriesName={false} t={t} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </article>
    </>
  )
}

function SeriesLoading({ t }) {
  return (
    <section className="min-h-[75vh] bg-warm-gray pt-32 pb-24" aria-live="polite" aria-busy="true">
      <p className="sr-only">{t('resourcesAi.seriesPage.loading')}</p>
      <div className="mx-auto max-w-7xl animate-pulse px-4 sm:px-6">
        <div className="h-64 rounded-3xl bg-navy/15" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="aspect-[4/3] rounded-2xl bg-gray-200" />
          ))}
        </div>
      </div>
    </section>
  )
}

function SeriesError({ onRetry, t }) {
  return (
    <SeriesStateShell
      icon={<RotateCw size={38} strokeWidth={1.4} aria-hidden="true" />}
      title={t('resourcesAi.seriesPage.errorTitle')}
      description={t('resourcesAi.seriesPage.errorDescription')}
      t={t}
    >
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <RotateCw size={15} aria-hidden="true" />
        {t('resourcesAi.retry')}
      </button>
    </SeriesStateShell>
  )
}

function SeriesUnavailable({ t }) {
  return (
    <>
      <Helmet>
        <title>{t('resourcesAi.seriesPage.unavailableSeoTitle')}</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <SeriesStateShell
        icon={<Layers3 size={38} strokeWidth={1.4} aria-hidden="true" />}
        title={t('resourcesAi.seriesPage.unavailableTitle')}
        description={t('resourcesAi.seriesPage.unavailableDescription')}
        t={t}
      />
    </>
  )
}

function SeriesStateShell({ children, description, icon, title, t }) {
  return (
    <section className="flex min-h-[75vh] items-center bg-warm-gray pt-24 pb-20">
      <div className="mx-auto max-w-xl px-4 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-steel shadow-sm">
          {icon}
        </div>
        <h1 className="mt-6 text-3xl font-bold text-navy">{title}</h1>
        <p className="mt-4 leading-relaxed text-muted">{description}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {children}
          <Link
            to={RESOURCES_PATH}
            className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-5 py-2.5 text-sm font-bold text-navy hover:border-accent hover:text-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {t('resourcesAi.detail.back')}
          </Link>
          <Link
            to={SERIES_VIEW_PATH}
            className="text-sm font-bold text-accent-deep underline decoration-accent/35 underline-offset-4 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
          >
            {t('resourcesAi.seriesPage.allSeries')}
          </Link>
        </div>
      </div>
    </section>
  )
}
