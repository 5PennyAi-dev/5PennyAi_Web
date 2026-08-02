import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const SERIES_PATH = '/ressources-ia/series'

export default function SeriesNavigation({ context, t }) {
  if (!context?.series) return null
  const { next, previous, series } = context

  return (
    <nav
      aria-label={t('resourcesAi.detail.seriesNavigationLabel', { series: series.name })}
      className="mx-auto mt-16 max-w-4xl border-t border-navy/[0.1] pt-8"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
        {t('resourcesAi.detail.continueSeries')}
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
        {previous ? <EpisodeLink direction="previous" resource={previous} t={t} /> : <span aria-hidden="true" className="hidden md:block" />}
        <Link
          to={`${SERIES_PATH}/${series.slug}`}
          className="inline-flex items-center justify-center rounded-2xl border border-navy/15 bg-white px-5 py-4 text-center text-sm font-bold text-accent-deep hover:border-accent hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {t('resourcesAi.detail.allSeriesEpisodes')}
        </Link>
        {next ? <EpisodeLink direction="next" resource={next} t={t} /> : <span aria-hidden="true" className="hidden md:block" />}
      </div>
    </nav>
  )
}

function EpisodeLink({ direction, resource, t }) {
  const isPrevious = direction === 'previous'
  const title = resource.title || t(`resourcesAi.formats.${resource.contentType}`)
  const episodeNumber = formatEpisodeNumber(resource.episodeNumber)
  const episode = episodeNumber
    ? t('resourcesAi.episode', { number: episodeNumber })
    : t('resourcesAi.detail.unnumberedEpisode')

  return (
    <Link
      to={resource.publicUrl}
      aria-label={t(isPrevious ? 'resourcesAi.detail.previousEpisodeLabel' : 'resourcesAi.detail.nextEpisodeLabel', { episode, title })}
      className={`flex min-w-0 items-center gap-3 rounded-2xl bg-navy px-5 py-4 text-white hover:bg-navy-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${isPrevious ? '' : 'md:justify-end md:text-right'}`}
    >
      {isPrevious && <ArrowLeft className="shrink-0" size={18} aria-hidden="true" />}
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase tracking-wide text-white/65">
          {t(isPrevious ? 'resourcesAi.detail.previousEpisode' : 'resourcesAi.detail.nextEpisode')}
        </span>
        <span className="mt-1 block text-sm font-bold leading-snug">{episode} · {title}</span>
      </span>
      {!isPrevious && <ArrowRight className="shrink-0" size={18} aria-hidden="true" />}
    </Link>
  )
}

function formatEpisodeNumber(value) {
  if (!Number.isInteger(value) || value <= 0) return null
  return String(value).padStart(2, '0')
}
