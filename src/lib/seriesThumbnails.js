import { extensionForThumbnailMime } from './infographicThumbnails.js'

const SERIES_THUMBNAIL_PREFIX = 'thumbnails/series'

export function buildSeriesThumbnailPath(seriesSlug, uniqueId, mimeType) {
  const extension = extensionForThumbnailMime(mimeType)
  if (!isSafePathSegment(seriesSlug) || !isSafePathSegment(uniqueId) || !extension) {
    throw new TypeError('Invalid series thumbnail path input')
  }

  return `${SERIES_THUMBNAIL_PREFIX}/${seriesSlug}/${uniqueId}.${extension}`
}

export function isSeriesThumbnailPathForSlug(path, seriesSlug) {
  if (typeof path !== 'string' || !isSafePathSegment(seriesSlug)) return false

  const prefix = `${SERIES_THUMBNAIL_PREFIX}/${seriesSlug}/`
  if (!path.startsWith(prefix)) return false

  return /^[^/\\]+\.(png|jpg|webp)$/.test(path.slice(prefix.length))
}

export function attachSeriesThumbnails(series, rows) {
  if (!Array.isArray(series)) return []

  const thumbnailsBySlug = new Map(
    (Array.isArray(rows) ? rows : [])
      .filter((row) => row && typeof row.slug === 'string')
      .map((row) => [row.slug, cleanPath(row.thumbnail_path)]),
  )

  return series.map((item) => {
    const thumbnailPath = thumbnailsBySlug.get(item.slug) || null
    return {
      ...item,
      thumbnailPath:
        thumbnailPath && isSeriesThumbnailPathForSlug(thumbnailPath, item.slug)
          ? thumbnailPath
          : null,
    }
  })
}

export function isPersistedSeriesName(currentName, persistedName) {
  const current = cleanName(currentName)
  const persisted = cleanName(persistedName)
  return Boolean(current && persisted && current === persisted)
}

function cleanName(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function cleanPath(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function isSafePathSegment(value) {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value !== '.' &&
    value !== '..' &&
    !value.includes('/') &&
    !value.includes('\\')
  )
}
