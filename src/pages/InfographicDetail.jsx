import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Clock3, ExternalLink, Maximize2, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SeriesNavigation from '@/components/resources/SeriesNavigation'
import {
  fetchPublishedInfographic,
  fetchPublishedSeriesResources,
  getInfographicImageUrl,
} from '@/lib/publicInfographics'
import { buildInfographicSeoData } from '@/lib/infographicSeo'
import {
  createSeriesSlug,
  findSeriesBySlug,
  getAdjacentEpisodes,
  groupResourcesBySeries,
} from '@/lib/resourceSeries'

const RESOURCES_PATH = '/ressources-ia'
const SERIES_PATH = '/ressources-ia/series'

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

        fetchPublishedSeriesResources(data.series_name)
          .then((resources) => {
            if (cancelled) return
            const series = findSeriesBySlug(
              groupResourcesBySeries(resources),
              createSeriesSlug(data.series_name),
            )
            const current = { contentType: 'infographic', id: data.id }
            if (!series || !series.resources.some((resource) =>
              resource.id === current.id && resource.contentType === current.contentType)) return

            setSeriesContext({
              series,
              ...getAdjacentEpisodes(series.resources, current),
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
  const seo = buildInfographicSeoData(infographic)
  const series = formatSeries(infographic, t)
  const keyPoints = usableKeyPoints(infographic.key_points)
  const sources = usableSources(infographic.sources)

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={seo.canonicalUrl} />
        <meta property="og:type" content={seo.ogType} />
        <meta property="og:title" content={seo.socialTitle} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={seo.canonicalUrl} />
        <meta property="og:image" content={seo.socialImageUrl} />
        <meta property="og:image:alt" content={seo.socialImageAlt} />
        <meta property="og:site_name" content={seo.siteName} />
        <meta property="og:locale" content={seo.locale} />
        <meta name="twitter:card" content={seo.twitterCard} />
        <meta name="twitter:title" content={seo.socialTitle} />
        <meta name="twitter:description" content={seo.description} />
        <meta name="twitter:image" content={seo.socialImageUrl} />
        <meta name="twitter:image:alt" content={seo.socialImageAlt} />
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
