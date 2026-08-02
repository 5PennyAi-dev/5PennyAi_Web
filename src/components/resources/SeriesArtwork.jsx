import { useState } from 'react'
import { BookOpenText, Image as ImageIcon } from 'lucide-react'
import { getInfographicImageUrl } from '@/lib/publicInfographics'

export default function SeriesArtwork({ series, t }) {
  const [failedPath, setFailedPath] = useState(null)
  const thumbnailUrl = series.thumbnailPath ? getInfographicImageUrl(series.thumbnailPath) : null

  if (thumbnailUrl && failedPath !== series.thumbnailPath) {
    return (
      <div className="aspect-video overflow-hidden rounded-xl border border-white/15 bg-surface shadow-sm">
        <img
          src={thumbnailUrl}
          alt=""
          className="h-full w-full object-contain object-center"
          loading="lazy"
          decoding="async"
          onError={() => setFailedPath(series.thumbnailPath)}
        />
      </div>
    )
  }

  return <SeriesPreviewGrid resources={series.previews} t={t} />
}

function SeriesPreviewGrid({ resources, t }) {
  const previews = Array.isArray(resources) ? resources : []
  const columnClass = previews.length === 1
    ? 'grid-cols-1'
    : previews.length === 2
      ? 'grid-cols-2'
      : 'grid-cols-3'

  return (
    <div className={`grid gap-2 sm:gap-3 ${columnClass}`} aria-hidden="true">
      {previews.map((resource) => (
        <SeriesPreview key={`${resource.contentType}:${resource.id}`} resource={resource} t={t} />
      ))}
    </div>
  )
}

function SeriesPreview({ resource, t }) {
  const [sourceIndex, setSourceIndex] = useState(0)
  const source = resource.thumbnailSources?.[sourceIndex]

  return (
    <div className="aspect-video min-w-0 overflow-hidden rounded-xl border border-white/15 bg-surface shadow-sm">
      {source?.url ? (
        <img
          src={source.url}
          alt=""
          className={`h-full w-full ${source.kind === 'thumbnail' ? 'object-contain object-center' : 'object-cover object-center'}`}
          loading="lazy"
          decoding="async"
          onError={() => setSourceIndex((index) => index + 1)}
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-navy/[0.035] text-navy/30">
          {resource.contentType === 'article'
            ? <BookOpenText size={28} strokeWidth={1.4} aria-label={t('resourcesAi.article.coverUnavailable')} />
            : <ImageIcon size={28} strokeWidth={1.4} aria-label={t('resourcesAi.imageUnavailable')} />}
        </div>
      )}
    </div>
  )
}
