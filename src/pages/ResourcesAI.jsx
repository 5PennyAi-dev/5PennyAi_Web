import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, Clock3, Image as ImageIcon, RotateCw } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  fetchPublishedInfographics,
  getInfographicImageUrl,
} from '@/lib/publicInfographics'

const DETAIL_PATH = '/ressources-ia/infographies'

export default function ResourcesAI() {
  const { t } = useTranslation()
  const [infographics, setInfographics] = useState([])
  const [state, setState] = useState('loading')

  const loadInfographics = useCallback(async () => {
    setState('loading')
    try {
      setInfographics(await fetchPublishedInfographics())
      setState('ready')
    } catch (error) {
      console.error('Unable to load published infographics:', error.message)
      setState('error')
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    fetchPublishedInfographics()
      .then((data) => {
        if (!cancelled) {
          setInfographics(data)
          setState('ready')
        }
      })
      .catch((error) => {
        console.error('Unable to load published infographics:', error.message)
        if (!cancelled) setState('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <Helmet>
        <title>{t('resourcesAi.seo.listTitle')}</title>
        <meta name="description" content={t('resourcesAi.seo.listDescription')} />
      </Helmet>

      <section className="min-h-[75vh] bg-warm-gray pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <header className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
              {t('resourcesAi.eyebrow')}
            </p>
            <h1 className="text-display text-4xl font-bold text-navy md:text-5xl">
              {t('resourcesAi.title')}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
              {t('resourcesAi.subtitle')}
            </p>
          </header>

          {state === 'loading' ? (
            <LoadingGrid t={t} />
          ) : state === 'error' ? (
            <ErrorState onRetry={loadInfographics} t={t} />
          ) : infographics.length === 0 ? (
            <EmptyState t={t} />
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
              {infographics.map((infographic) => (
                <li key={infographic.id}>
                  <InfographicCard infographic={infographic} t={t} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}

function InfographicCard({ infographic, t }) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageUrl = getInfographicImageUrl(infographic.image_path)
  const title = infographic.title || t('resourcesAi.type')
  const seriesName =
    typeof infographic.series_name === 'string' ? infographic.series_name.trim() : ''
  const episodeNumber = formatEpisodeNumber(infographic.episode_number)
  const episodeLabel =
    seriesName && episodeNumber
      ? t('resourcesAi.episode', { number: episodeNumber })
      : ''
  const typeLabel = infographic.theme
    ? t('resourcesAi.typeWithTheme', { theme: infographic.theme })
    : t('resourcesAi.type')

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-navy/[0.09] bg-white shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-navy/15 hover:shadow-[var(--shadow-card-hover)]">
      <div className="aspect-[4/3] overflow-hidden border-b border-navy/[0.06] bg-surface">
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover object-top"
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl bg-navy/[0.025] text-center text-navy/35">
            <ImageIcon size={32} strokeWidth={1.4} aria-hidden="true" />
            <span className="text-xs font-medium">{t('resourcesAi.imageUnavailable')}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {seriesName ? (
          <div className="flex flex-wrap items-center gap-2">
            <p className="min-w-0 text-xs font-bold leading-snug text-navy/70">
              {seriesName}
            </p>
            {episodeLabel && (
              <span className="shrink-0 rounded-full bg-steel/18 px-2.5 py-1 text-[11px] font-bold tracking-wide text-navy">
                {episodeLabel}
              </span>
            )}
          </div>
        ) : (
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
            {typeLabel}
          </p>
        )}

        <h2 className="mt-3 line-clamp-3 font-heading text-xl font-bold leading-snug text-navy">
          {title}
        </h2>
        {infographic.summary && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
            {infographic.summary}
          </p>
        )}

        {seriesName && (
          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
            {typeLabel}
          </p>
        )}

        {(infographic.level || infographic.reading_time_minutes != null) && (
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-navy/65">
            {infographic.level && (
              <span className="rounded-full bg-lavender/35 px-3 py-1">
                {t(`resourcesAi.levels.${infographic.level}`, {
                  defaultValue: infographic.level,
                })}
              </span>
            )}
            {infographic.reading_time_minutes != null && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-steel/15 px-3 py-1">
                <Clock3 size={13} aria-hidden="true" />
                {t('resourcesAi.readingTime', {
                  count: infographic.reading_time_minutes,
                })}
              </span>
            )}
          </div>
        )}

        <Link
          to={`${DETAIL_PATH}/${infographic.id}`}
          aria-label={t('resourcesAi.viewLabel', { title })}
          className="mt-auto inline-flex w-fit items-center gap-2 pt-6 text-sm font-bold text-accent-deep transition-colors hover:text-navy"
        >
          {t('resourcesAi.view')}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

function LoadingGrid({ t }) {
  return (
    <div aria-live="polite" aria-busy="true">
      <p className="sr-only">{t('resourcesAi.loading')}</p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="overflow-hidden rounded-2xl border border-navy/[0.07] bg-white"
          >
            <div className="aspect-[4/3] animate-pulse bg-gray-200" />
            <div className="space-y-3 p-6">
              <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
              <div className="h-6 w-4/5 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ErrorState({ onRetry, t }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-8 text-center">
      <h2 className="text-xl font-bold text-navy">{t('resourcesAi.errorTitle')}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">{t('resourcesAi.errorDescription')}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep"
      >
        <RotateCw size={15} aria-hidden="true" />
        {t('resourcesAi.retry')}
      </button>
    </div>
  )
}

function EmptyState({ t }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-navy/[0.08] bg-white p-10 text-center shadow-sm">
      <ImageIcon className="mx-auto text-steel" size={36} strokeWidth={1.4} aria-hidden="true" />
      <h2 className="mt-5 text-xl font-bold text-navy">{t('resourcesAi.emptyTitle')}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">{t('resourcesAi.emptyDescription')}</p>
    </div>
  )
}

function formatEpisodeNumber(value) {
  if (!Number.isInteger(value) || value <= 0) return null
  return String(value).padStart(2, '0')
}
