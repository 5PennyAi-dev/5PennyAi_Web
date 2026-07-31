import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Clock3, ExternalLink, Maximize2, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  fetchPublishedInfographic,
  fetchPublishedInfographics,
  getInfographicImageUrl,
} from '@/lib/publicInfographics'
import {
  createSeriesSlug,
  findSeriesBySlug,
  getAdjacentEpisodes,
  groupResourcesBySeries,
} from '@/lib/resourceSeries'

const RESOURCES_PATH = '/ressources-ia'
const SERIES_PATH = '/ressources-ia/series'
const DETAIL_PATH = '/ressources-ia/infographies'

export default function InfographicDetail() {
  const { id } = useParams()

  return <InfographicDetailById key={id} id={id} />
}

function InfographicDetailById({ id }) {
  const { t } = useTranslation()
  const [infographic, setInfographic] = useState(null)
  const [seriesContext, setSeriesContext] = useState(null)
  const [state, setState] = useState('loading')

  useEffect(() => {
    let cancelled = false

    fetchPublishedInfographic(id)
      .then((data) => {
        if (cancelled) return
        setInfographic(data)
        setState(data ? 'ready' : 'missing')

        if (!data?.series_name) return

        fetchPublishedInfographics()
          .then((resources) => {
            if (cancelled) return
            const series = findSeriesBySlug(
              groupResourcesBySeries(resources),
              createSeriesSlug(data.series_name),
            )
            if (!series || !series.resources.some((resource) => resource.id === data.id)) return

            setSeriesContext({
              series,
              ...getAdjacentEpisodes(series.resources, data.id),
            })
          })
          .catch((error) => {
            console.warn('Unable to load infographic series navigation:', error.message)
          })
      })
      .catch((error) => {
        console.error('Unable to load published infographic:', error.message)
        if (!cancelled) setState('error')
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (state === 'loading') return <DetailLoading t={t} />
  if (state === 'missing') return <UnavailableState t={t} />
  if (state === 'error') return <UnavailableState isError t={t} />

  return (
    <InfographicContent
      key={infographic.id}
      infographic={infographic}
      seriesContext={seriesContext}
      t={t}
    />
  )
}

function InfographicContent({ infographic, seriesContext, t }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const imageUrl = getInfographicImageUrl(infographic.image_path)
  const hasImage = Boolean(imageUrl && !imageFailed)
  const title = infographic.title || t('resourcesAi.type')
  const series = formatSeries(infographic, t)
  const keyPoints = usableKeyPoints(infographic.key_points)
  const sources = usableSources(infographic.sources)

  return (
    <>
      <Helmet>
        <title>{t('resourcesAi.seo.detailTitle', { title })}</title>
        {infographic.summary && <meta name="description" content={infographic.summary} />}
      </Helmet>

      <article className="min-h-[75vh] bg-warm-gray pt-24 pb-20 md:pt-28 md:pb-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav
            aria-label={t('resourcesAi.detail.breadcrumbLabel')}
            className="mb-8 flex flex-wrap items-center gap-2 text-sm text-navy/55"
          >
            <Link to={RESOURCES_PATH} className="font-medium hover:text-accent-deep">
              {t('resourcesAi.title')}
            </Link>
            <span aria-hidden="true">/</span>
            {seriesContext && (
              <>
                <Link
                  to={`${SERIES_PATH}/${seriesContext.series.slug}`}
                  className="max-w-full truncate font-medium hover:text-accent-deep"
                >
                  {seriesContext.series.name}
                </Link>
                <span aria-hidden="true">/</span>
              </>
            )}
            <span aria-current="page" className="max-w-full truncate text-navy/75">
              {title}
            </span>
          </nav>

          <header className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
              {infographic.theme
                ? t('resourcesAi.typeWithTheme', { theme: infographic.theme })
                : t('resourcesAi.type')}
            </p>
            <h1 className="text-display mt-4 text-4xl font-bold text-navy md:text-5xl">{title}</h1>
            {infographic.subtitle && (
              <p className="mt-5 text-lg leading-relaxed text-muted md:text-xl">
                {infographic.subtitle}
              </p>
            )}
            {(series || infographic.level || infographic.reading_time_minutes != null) && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-navy/65">
                {series && <span className="rounded-full bg-white px-3.5 py-1.5">{series}</span>}
                {infographic.level && (
                  <span className="rounded-full bg-lavender/35 px-3.5 py-1.5">
                    {t(`resourcesAi.levels.${infographic.level}`, {
                      defaultValue: infographic.level,
                    })}
                  </span>
                )}
                {infographic.reading_time_minutes != null && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-steel/15 px-3.5 py-1.5">
                    <Clock3 size={14} aria-hidden="true" />
                    {t('resourcesAi.readingTime', {
                      count: infographic.reading_time_minutes,
                    })}
                  </span>
                )}
              </div>
            )}
          </header>

          {infographic.introduction && (
            <p className="mx-auto mt-10 max-w-3xl whitespace-pre-line text-base leading-8 text-navy/80 md:text-lg">
              {infographic.introduction}
            </p>
          )}

          {hasImage && (
            <section className="mt-12" aria-label={t('resourcesAi.detail.imageSection')}>
              <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-navy/[0.08] bg-white p-3 shadow-sm sm:p-5">
                <img
                  src={imageUrl}
                  alt={infographic.image_alt || t('resourcesAi.imageAlt')}
                  className="h-auto max-w-full object-contain"
                  onError={() => setImageFailed(true)}
                />
              </div>
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:border-accent hover:text-accent-deep"
                >
                  <Maximize2 size={15} aria-hidden="true" />
                  {t('resourcesAi.detail.enlarge')}
                </button>
              </div>
            </section>
          )}

          {keyPoints.length > 0 && (
            <section className="mx-auto mt-16 max-w-4xl">
              <h2 className="text-2xl font-bold text-navy md:text-3xl">
                {t('resourcesAi.detail.keyPoints')}
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {keyPoints.map((point, index) => (
                  <div
                    key={`${point.title || point.description}-${index}`}
                    className="rounded-2xl border border-navy/[0.08] bg-white p-5 shadow-sm"
                  >
                    {point.title && <h3 className="text-lg font-bold text-navy">{point.title}</h3>}
                    {point.description && (
                      <p className={`${point.title ? 'mt-2' : ''} whitespace-pre-line text-sm leading-relaxed text-muted`}>
                        {point.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {infographic.takeaway && (
            <aside className="mx-auto mt-14 max-w-4xl rounded-2xl border-l-4 border-accent bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-bold text-navy">{t('resourcesAi.detail.takeaway')}</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-navy/75">
                {infographic.takeaway}
              </p>
            </aside>
          )}

          {sources.length > 0 && (
            <section className="mx-auto mt-14 max-w-4xl">
              <h2 className="text-2xl font-bold text-navy">{t('resourcesAi.detail.sources')}</h2>
              <ul className="mt-5 space-y-3">
                {sources.map((source, index) => {
                  const safeUrl = toSafeExternalUrl(source.url)
                  const label = source.title || source.url
                  return (
                    <li
                      key={`${source.title || source.url}-${index}`}
                      className="rounded-xl border border-navy/[0.08] bg-white px-5 py-4 text-sm text-navy/75"
                    >
                      {safeUrl ? (
                        <a
                          href={safeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex max-w-full items-center gap-2 font-medium text-accent-deep underline decoration-accent/30 underline-offset-4 hover:text-navy"
                        >
                          <span className="break-all">{label}</span>
                          <ExternalLink className="shrink-0" size={14} aria-hidden="true" />
                        </a>
                      ) : (
                        <span className="break-all">{label}</span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {seriesContext && (
            <SeriesNavigation context={seriesContext} t={t} />
          )}

          <div className="mx-auto mt-16 max-w-4xl border-t border-navy/[0.1] pt-8">
            <Link
              to={RESOURCES_PATH}
              className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              {t('resourcesAi.detail.back')}
            </Link>
          </div>
        </div>
      </article>

      {dialogOpen && hasImage && (
        <ImageDialog
          alt={infographic.image_alt || t('resourcesAi.imageAlt')}
          closeLabel={t('resourcesAi.detail.close')}
          onClose={() => setDialogOpen(false)}
          src={imageUrl}
        />
      )}
    </>
  )
}

function SeriesNavigation({ context, t }) {
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
        {previous ? (
          <EpisodeNavigationLink direction="previous" resource={previous} t={t} />
        ) : (
          <span aria-hidden="true" className="hidden md:block" />
        )}

        <Link
          to={`${SERIES_PATH}/${series.slug}`}
          className="inline-flex items-center justify-center rounded-2xl border border-navy/15 bg-white px-5 py-4 text-center text-sm font-bold text-accent-deep hover:border-accent hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {t('resourcesAi.detail.allSeriesEpisodes')}
        </Link>

        {next ? (
          <EpisodeNavigationLink direction="next" resource={next} t={t} />
        ) : (
          <span aria-hidden="true" className="hidden md:block" />
        )}
      </div>
    </nav>
  )
}

function EpisodeNavigationLink({ direction, resource, t }) {
  const isPrevious = direction === 'previous'
  const title = resource.title || t('resourcesAi.type')
  const episodeNumber = formatEpisodeNumber(resource.episode_number)
  const episode = episodeNumber
    ? t('resourcesAi.episode', { number: episodeNumber })
    : t('resourcesAi.detail.unnumberedEpisode')

  return (
    <Link
      to={`${DETAIL_PATH}/${resource.id}`}
      aria-label={t(
        isPrevious
          ? 'resourcesAi.detail.previousEpisodeLabel'
          : 'resourcesAi.detail.nextEpisodeLabel',
        { episode, title },
      )}
      className={`flex min-w-0 items-center gap-3 rounded-2xl bg-navy px-5 py-4 text-white hover:bg-navy-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
        isPrevious ? '' : 'md:justify-end md:text-right'
      }`}
    >
      {isPrevious && <ArrowLeft className="shrink-0" size={18} aria-hidden="true" />}
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase tracking-wide text-white/65">
          {t(
            isPrevious
              ? 'resourcesAi.detail.previousEpisode'
              : 'resourcesAi.detail.nextEpisode',
          )}
        </span>
        <span className="mt-1 block text-sm font-bold leading-snug">
          {episode} · {title}
        </span>
      </span>
      {!isPrevious && <ArrowRight className="shrink-0" size={18} aria-hidden="true" />}
    </Link>
  )
}

function ImageDialog({ alt, closeLabel, onClose, src }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previouslyFocused = document.activeElement
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [onClose])

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-[9999] overflow-y-auto overflow-x-hidden bg-navy/95"
      onClick={onClose}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        className="fixed top-4 right-4 z-10 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy shadow-lg hover:bg-warm-gray"
      >
        <X size={17} aria-hidden="true" />
        {closeLabel}
      </button>
      <div className="flex min-h-full w-full items-start justify-center px-3 py-20 sm:px-6">
        <img
          src={src}
          alt={alt}
          className="h-auto max-w-full rounded-xl bg-white object-contain shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        />
      </div>
    </div>,
    document.body,
  )
}

function DetailLoading({ t }) {
  return (
    <section className="min-h-[75vh] bg-warm-gray pt-32 pb-24" aria-live="polite" aria-busy="true">
      <p className="sr-only">{t('resourcesAi.detail.loading')}</p>
      <div className="mx-auto max-w-3xl animate-pulse px-4 text-center sm:px-6">
        <div className="mx-auto h-3 w-28 rounded bg-gray-200" />
        <div className="mx-auto mt-6 h-11 w-4/5 rounded bg-gray-200" />
        <div className="mx-auto mt-4 h-5 w-2/3 rounded bg-gray-100" />
        <div className="mt-12 aspect-[4/5] rounded-2xl bg-gray-200" />
      </div>
    </section>
  )
}

function UnavailableState({ isError = false, t }) {
  return (
    <>
      <Helmet>
        <title>{t('resourcesAi.detail.unavailableSeoTitle')}</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <section className="flex min-h-[75vh] items-center bg-warm-gray pt-24 pb-20">
        <div className="mx-auto max-w-xl px-4 text-center sm:px-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
            {t('resourcesAi.eyebrow')}
          </p>
          <h1 className="mt-4 text-3xl font-bold text-navy">
            {isError
              ? t('resourcesAi.detail.errorTitle')
              : t('resourcesAi.detail.unavailableTitle')}
          </h1>
          <p className="mt-4 leading-relaxed text-muted">
            {isError
              ? t('resourcesAi.detail.errorDescription')
              : t('resourcesAi.detail.unavailableDescription')}
          </p>
          <Link
            to={RESOURCES_PATH}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {t('resourcesAi.detail.back')}
          </Link>
        </div>
      </section>
    </>
  )
}

function formatSeries(infographic, t) {
  const episodeNumber = formatEpisodeNumber(infographic.episode_number)
  const episode = episodeNumber
    ? t('resourcesAi.episode', { number: episodeNumber })
    : ''
  if (infographic.series_name && episode) return `${infographic.series_name} · ${episode}`
  return infographic.series_name || episode
}

function formatEpisodeNumber(value) {
  if (!Number.isInteger(value) || value <= 0) return null
  return String(value).padStart(2, '0')
}

function usableKeyPoints(points) {
  if (!Array.isArray(points)) return []
  return points.filter(
    (point) =>
      point &&
      typeof point === 'object' &&
      (typeof point.title === 'string' || typeof point.description === 'string') &&
      (point.title?.trim() || point.description?.trim()),
  )
}

function usableSources(sources) {
  if (!Array.isArray(sources)) return []
  return sources.filter(
    (source) =>
      source &&
      typeof source === 'object' &&
      (typeof source.title === 'string' || typeof source.url === 'string') &&
      (source.title?.trim() || source.url?.trim()),
  )
}

function toSafeExternalUrl(url) {
  if (!url) return null
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null
  } catch {
    return null
  }
}
