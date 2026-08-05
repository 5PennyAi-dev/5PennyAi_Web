import { useEffect, useState } from 'react'
import { ArrowRight, Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ResourcePreview } from '@/components/resources/ResourceCard'
import SeriesArtwork from '@/components/resources/SeriesArtwork'
import SectionHeader from '@/components/ui/SectionHeader'
import useScrollReveal from '@/hooks/useScrollReveal'
import {
  fetchHomeResourceShowcase,
  getSeriesFormatKey,
} from '@/lib/homeResourceShowcase'

const RESOURCES_PATH = '/ressources-ia'
const SERIES_PATH = RESOURCES_PATH + '/series'

export default function HomeResourcesShowcase() {
  const { t } = useTranslation()
  const ref = useScrollReveal()
  const [state, setState] = useState('loading')
  const [showcase, setShowcase] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetchHomeResourceShowcase()
      .then((result) => {
        if (!cancelled) {
          setShowcase(result)
          setState('ready')
        }
      })
      .catch((error) => {
        console.error('Unable to load homepage AI resources:', error.message)
        if (!cancelled) setState('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const hasResources = Boolean(showcase?.resources.length)

  return (
    <section
      ref={ref}
      aria-labelledby="home-resources-title"
      className="reveal relative overflow-hidden bg-lavender/20 py-24 md:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          overline={t('homeResources.overline')}
          title={t('homeResources.title')}
          subtitle={t('homeResources.introduction')}
          titleId="home-resources-title"
          className="text-center"
        />

        {state === 'loading' ? (
          <ShowcaseLoading t={t} />
        ) : hasResources ? (
          <ShowcaseComposition
            featuredSeries={showcase.featuredSeries}
            resources={showcase.secondaryResources}
            t={t}
          />
        ) : (
          <p
            role={state === 'error' ? 'alert' : 'status'}
            className="mx-auto max-w-xl rounded-2xl border border-navy/[0.08] bg-white/75 px-6 py-5 text-center text-sm leading-relaxed text-muted"
          >
            {t(state === 'error' ? 'homeResources.error' : 'homeResources.empty')}
          </p>
        )}

        <div className="mt-10 text-center md:mt-12">
          <Link
            to={RESOURCES_PATH}
            aria-label={t('homeResources.exploreAllLabel')}
            className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-6 py-3 text-sm font-bold text-navy transition-colors hover:border-navy/30 hover:bg-navy/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
          >
            {t('homeResources.exploreAll')}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function ShowcaseComposition({ featuredSeries, resources, t }) {
  if (!featuredSeries) {
    return (
      <div
        className={'mx-auto grid max-w-5xl gap-5 ' + (
          resources.length > 1 ? 'md:grid-cols-2' : 'max-w-xl'
        )}
      >
        {resources.map((resource) => (
          <CompactResourceCard
            key={[resource.contentType, resource.id].join(':')}
            resource={resource}
            t={t}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] lg:gap-8">
      <FeaturedSeriesCard series={featuredSeries} t={t} />
      <div
        className={'grid gap-5 md:grid-cols-2 lg:grid-cols-1 ' + (
          resources.length > 1 ? 'lg:grid-rows-2' : ''
        )}
      >
        {resources.map((resource) => (
          <CompactResourceCard
            key={[resource.contentType, resource.id].join(':')}
            resource={resource}
            t={t}
          />
        ))}
      </div>
    </div>
  )
}

function FeaturedSeriesCard({ series, t }) {
  const formatKey = getSeriesFormatKey(series)
  const metadata = [
    formatKey ? t('homeResources.formats.' + formatKey) : null,
    t('homeResources.resourceCount', { count: series.episodeCount }),
    series.commonLevel
      ? t('resourcesAi.levels.' + series.commonLevel, { defaultValue: series.commonLevel })
      : null,
  ].filter(Boolean)

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-navy/[0.09] bg-white shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-navy/15 hover:shadow-[var(--shadow-card-hover)] focus-within:border-accent">
      <div className="border-b border-navy/[0.06] bg-steel/[0.08] p-4 sm:p-6 lg:p-7">
        <SeriesArtwork series={series} t={t} />
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-8 lg:p-9">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
          {t('homeResources.featuredSeries')}
        </p>
        <h3 className="mt-3 max-w-2xl font-heading text-2xl font-bold leading-tight text-navy sm:text-3xl">
          {series.name}
        </h3>
        <p className="mt-4 text-sm font-medium leading-relaxed text-navy/65">
          {metadata.join(' · ')}
        </p>
        <Link
          to={SERIES_PATH + '/' + series.slug}
          aria-label={t('homeResources.discoverSeriesLabel', { series: series.name })}
          className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
        >
          {t('homeResources.discoverSeries')}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

function CompactResourceCard({ resource, t }) {
  const title = resource.title || t(
    resource.contentType === 'article'
      ? 'resourcesAi.article.fallbackTitle'
      : 'resourcesAi.type',
  )
  const typeLabel = t('homeResources.types.' + resource.contentType)

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-navy/[0.09] bg-white shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-navy/15 hover:shadow-[var(--shadow-card-hover)] focus-within:border-accent">
      <div className="aspect-video shrink-0 overflow-hidden border-b border-navy/[0.06] bg-surface">
        <ResourcePreview
          key={(resource.thumbnailSources || []).map(({ path, url }) => path || url).join('|')}
          contentType={resource.contentType}
          sources={resource.thumbnailSources}
          t={t}
        />
      </div>
      <div className="flex min-w-0 flex-col p-4 sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-accent">
          {typeLabel}
        </p>
        <h3 className="mt-2 line-clamp-3 font-heading text-base font-bold leading-snug text-navy sm:text-lg">
          {title}
        </h3>
        {(resource.level || resource.readingTimeMinutes > 0) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-navy/60">
            {resource.level && (
              <span>
                {t('resourcesAi.levels.' + resource.level, { defaultValue: resource.level })}
              </span>
            )}
            {resource.readingTimeMinutes > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={13} aria-hidden="true" />
                {t('resourcesAi.readingTime', { count: resource.readingTimeMinutes })}
              </span>
            )}
          </div>
        )}
        <Link
          to={resource.publicUrl}
          aria-label={t('homeResources.viewLabel', { type: typeLabel, title })}
          className="mt-auto inline-flex w-fit items-center gap-1.5 pt-4 text-sm font-bold text-accent-deep transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
        >
          {t('homeResources.view')}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

function ShowcaseLoading({ t }) {
  return (
    <div aria-live="polite" aria-busy="true">
      <p className="sr-only">{t('homeResources.loading')}</p>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] lg:gap-8">
        <div className="overflow-hidden rounded-3xl border border-navy/[0.07] bg-white">
          <div className="aspect-video animate-pulse bg-steel/10" />
          <div className="space-y-3 p-7">
            <div className="h-3 w-28 animate-pulse rounded bg-accent/15" />
            <div className="h-7 w-3/5 animate-pulse rounded bg-navy/10" />
            <div className="h-4 w-2/5 animate-pulse rounded bg-navy/[0.07]" />
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2">
          {[0, 1].map((item) => (
            <div key={item} className="flex flex-col overflow-hidden rounded-2xl border border-navy/[0.07] bg-white">
              <div className="aspect-video animate-pulse bg-steel/10" />
              <div className="space-y-3 p-5">
                <div className="h-3 w-20 animate-pulse rounded bg-accent/15" />
                <div className="h-5 w-full animate-pulse rounded bg-navy/10" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-navy/[0.07]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
