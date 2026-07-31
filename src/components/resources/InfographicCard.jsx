import { useState } from 'react'
import { ArrowRight, Clock3, Image as ImageIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getInfographicPreviewSources } from '@/lib/publicInfographics'

const DETAIL_PATH = '/ressources-ia/infographies'

export default function InfographicCard({ infographic, showSeriesName = true, t }) {
  const previewSources = getInfographicPreviewSources(infographic)
  const title = infographic.title || t('resourcesAi.type')
  const seriesName =
    typeof infographic.series_name === 'string' ? infographic.series_name.trim() : ''
  const episodeNumber = formatEpisodeNumber(infographic.episode_number)
  const episodeLabel =
    seriesName && episodeNumber ? t('resourcesAi.episode', { number: episodeNumber }) : ''
  const hasSeriesHeader = Boolean((showSeriesName && seriesName) || episodeLabel)
  const typeLabel = infographic.theme
    ? t('resourcesAi.typeWithTheme', { theme: infographic.theme })
    : t('resourcesAi.type')

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-navy/[0.09] bg-white shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-navy/15 hover:shadow-[var(--shadow-card-hover)]">
      <div className="aspect-video overflow-hidden border-b border-navy/[0.06] bg-surface">
        <InfographicPreview
          key={previewSources.map(({ path }) => path).join('|')}
          sources={previewSources}
          t={t}
        />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {hasSeriesHeader ? (
          <div className="flex flex-wrap items-center gap-2">
            {showSeriesName && seriesName && (
              <p className="min-w-0 text-xs font-bold leading-snug text-navy/70">
                {seriesName}
              </p>
            )}
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

        {hasSeriesHeader && (
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
          className="mt-auto inline-flex w-fit items-center gap-2 pt-6 text-sm font-bold text-accent-deep transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
        >
          {t('resourcesAi.view')}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

function InfographicPreview({ sources, t }) {
  const [sourceIndex, setSourceIndex] = useState(0)
  const source = sources[sourceIndex]

  if (!source?.url) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl bg-navy/[0.025] text-center text-navy/35">
        <ImageIcon size={32} strokeWidth={1.4} aria-hidden="true" />
        <span className="text-xs font-medium">{t('resourcesAi.imageUnavailable')}</span>
      </div>
    )
  }

  return (
    <img
      src={source.url}
      alt=""
      className={`h-full w-full object-cover ${source.kind === 'thumbnail' ? 'object-center' : 'object-top'}`}
      loading="lazy"
      decoding="async"
      onError={() => setSourceIndex((index) => index + 1)}
    />
  )
}

function formatEpisodeNumber(value) {
  if (!Number.isInteger(value) || value <= 0) return null
  return String(value).padStart(2, '0')
}
