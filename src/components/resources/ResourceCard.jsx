import { useState } from 'react'
import { ArrowRight, BookOpenText, Clock3, Image as ImageIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ResourceCard({ resource, showSeriesName = true, t }) {
  const title = resource.title || formatFallbackTitle(resource, t)
  const seriesName = cleanText(resource.seriesName)
  const episodeNumber = formatEpisodeNumber(resource.episodeNumber)
  const episodeLabel = seriesName && episodeNumber
    ? t('resourcesAi.episode', { number: episodeNumber })
    : ''
  const hasSeriesHeader = Boolean((showSeriesName && seriesName) || episodeLabel)
  const formatLabel = t(`resourcesAi.formats.${resource.contentType}`)
  const typeLabel = resource.theme
    ? t('resourcesAi.catalog.formatWithTheme', { format: formatLabel, theme: resource.theme })
    : formatLabel

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-navy/[0.09] bg-white shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-navy/15 hover:shadow-[var(--shadow-card-hover)] focus-within:border-accent focus-within:shadow-[var(--shadow-card-hover)]">
      <div className="aspect-video overflow-hidden border-b border-navy/[0.06] bg-surface">
        <ResourcePreview
          key={(resource.thumbnailSources || []).map(({ path, url }) => path || url).join('|')}
          contentType={resource.contentType}
          sources={resource.thumbnailSources}
          t={t}
        />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {hasSeriesHeader ? (
          <div className="flex flex-wrap items-center gap-2">
            {showSeriesName && seriesName && (
              <p className="min-w-0 text-xs font-bold leading-snug text-navy/70">{seriesName}</p>
            )}
            {episodeLabel && (
              <span className="shrink-0 rounded-full bg-steel/18 px-2.5 py-1 text-[11px] font-bold tracking-wide text-navy">
                {episodeLabel}
              </span>
            )}
          </div>
        ) : (
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">{typeLabel}</p>
        )}

        <h2 className="mt-3 line-clamp-3 font-heading text-xl font-bold leading-snug text-navy">{title}</h2>
        {resource.summary && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{resource.summary}</p>
        )}

        {hasSeriesHeader && (
          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-accent">{typeLabel}</p>
        )}

        {(resource.level || resource.readingTimeMinutes != null) && (
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-navy/65">
            {resource.level && (
              <span className="rounded-full bg-lavender/35 px-3 py-1">
                {t(`resourcesAi.levels.${resource.level}`, { defaultValue: resource.level })}
              </span>
            )}
            {resource.readingTimeMinutes != null && resource.readingTimeMinutes > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-steel/15 px-3 py-1">
                <Clock3 size={13} aria-hidden="true" />
                {t('resourcesAi.readingTime', { count: resource.readingTimeMinutes })}
              </span>
            )}
          </div>
        )}

        {resource.publicUrl && (
          <Link
            to={resource.publicUrl}
            aria-label={t('resourcesAi.viewLabel', { title })}
            className="mt-auto inline-flex w-fit items-center gap-2 pt-6 text-sm font-bold text-accent-deep transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
          >
            {t('resourcesAi.view')}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        )}
      </div>
    </article>
  )
}

function ResourcePreview({ contentType, sources, t }) {
  const [sourceIndex, setSourceIndex] = useState(0)
  const source = Array.isArray(sources) ? sources[sourceIndex] : null

  if (!source?.url) {
    const FallbackIcon = contentType === 'article' ? BookOpenText : ImageIcon
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-navy/[0.025] text-center text-navy/35">
        <FallbackIcon size={32} strokeWidth={1.4} aria-hidden="true" />
        <span className="text-xs font-medium">
          {contentType === 'article'
            ? t('resourcesAi.article.coverUnavailable')
            : t('resourcesAi.imageUnavailable')}
        </span>
      </div>
    )
  }

  return (
    <img
      src={source.url}
      alt=""
      className={`h-full w-full ${source.kind === 'thumbnail' ? 'object-contain object-center' : 'object-cover object-center'}`}
      loading="lazy"
      decoding="async"
      onError={() => setSourceIndex((index) => index + 1)}
    />
  )
}

function formatFallbackTitle(resource, t) {
  return resource.contentType === 'article'
    ? t('resourcesAi.article.fallbackTitle')
    : t('resourcesAi.type')
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function formatEpisodeNumber(value) {
  if (!Number.isInteger(value) || value <= 0) return null
  return String(value).padStart(2, '0')
}
