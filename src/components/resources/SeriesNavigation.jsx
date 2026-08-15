import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const SERIES_PATH = '/ressources-ia/series'

export default function SeriesNavigation({ contexts, t, placement = 'footer' }) {
  const validContexts = (Array.isArray(contexts) ? contexts : []).filter((context) => context?.series)
  if (validContexts.length === 0) return null

  if (placement === 'sides') {
    if (validContexts.length !== 1) return null
    const [{ next, previous, series }] = validContexts
    if (!previous && !next) return null

    return (
      <nav
        aria-label={t('resourcesAi.detail.seriesNavigationLabel', { series: series.name })}
        className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 items-center justify-between px-1 sm:px-3"
      >
        {previous ? <SideEpisodeLink direction="previous" resource={previous} seriesId={series.id} t={t} /> : <span />}
        {next ? <SideEpisodeLink direction="next" resource={next} seriesId={series.id} t={t} /> : <span />}
      </nav>
    )
  }

  return (
    <section className="mx-auto mt-16 max-w-4xl space-y-8 border-t border-navy/[0.1] pt-8">
      {validContexts.map((context) => (
        <SeriesNavigationBlock context={context} key={context.series.id} t={t} />
      ))}
    </section>
  )
}

function SeriesNavigationBlock({ context, t }) {
  const { membership, next, previous, series } = context
  const episodeNumber = formatEpisodeNumber(membership?.position)

  return (
    <nav aria-label={t('resourcesAi.detail.seriesNavigationLabel', { series: series.name })}>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
        {t('resourcesAi.detail.inSeries', {
          series: series.name,
          episode: episodeNumber ? ` — ${t('resourcesAi.episode', { number: episodeNumber })}` : '',
        })}
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
        {previous ? <EpisodeLink direction="previous" resource={previous} seriesId={series.id} t={t} /> : <span aria-hidden="true" className="hidden md:block" />}
        <Link
          to={`${SERIES_PATH}/${series.slug}`}
          className="inline-flex items-center justify-center rounded-2xl border border-navy/15 bg-white px-5 py-4 text-center text-sm font-bold text-accent-deep hover:border-accent hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {t('resourcesAi.detail.allSeriesEpisodes')}
        </Link>
        {next ? <EpisodeLink direction="next" resource={next} seriesId={series.id} t={t} /> : <span aria-hidden="true" className="hidden md:block" />}
      </div>
    </nav>
  )
}

function SideEpisodeLink({ direction, resource, seriesId, t }) {
  const isPrevious = direction === 'previous'
  const title = resource.title || t(`resourcesAi.formats.${resource.contentType}`)
  const episodeNumber = formatEpisodeNumber(getMembershipPosition(resource, seriesId))
  const episode = episodeNumber
    ? t('resourcesAi.episode', { number: episodeNumber })
    : t('resourcesAi.detail.unnumberedEpisode')
  const label = t(
    isPrevious ? 'resourcesAi.detail.previousEpisodeLabel' : 'resourcesAi.detail.nextEpisodeLabel',
    { episode, title },
  )
  const Icon = isPrevious ? ArrowLeft : ArrowRight

  return (
    <Link
      to={resource.publicUrl}
      aria-label={label}
      title={label}
      className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-navy text-white shadow-lg transition hover:scale-105 hover:bg-navy-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:h-12 sm:w-12"
    >
      <Icon size={22} aria-hidden="true" />
    </Link>
  )
}

function EpisodeLink({ direction, resource, seriesId, t }) {
  const isPrevious = direction === 'previous'
  const title = resource.title || t(`resourcesAi.formats.${resource.contentType}`)
  const episodeNumber = formatEpisodeNumber(getMembershipPosition(resource, seriesId))
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

function getMembershipPosition(resource, seriesId) {
  return resource?.seriesMemberships?.find((membership) => membership.seriesId === seriesId)?.position
}
