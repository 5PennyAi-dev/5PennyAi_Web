const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])

export const MAX_THUMBNAIL_SIZE_BYTES = 5 * 1024 * 1024
export const THUMBNAIL_PERFORMANCE_WARNING_BYTES = 500 * 1024
export const TARGET_THUMBNAIL_RATIO = 16 / 9
export const THUMBNAIL_RATIO_TOLERANCE = 0.03

const THUMBNAIL_PREFIX = 'thumbnails/infographics'

export function isAllowedThumbnailMime(mimeType) {
  return ALLOWED_MIME_TYPES.has(mimeType)
}

export function isThumbnailSizeAllowed(sizeBytes) {
  return Number.isFinite(sizeBytes) && sizeBytes >= 0 && sizeBytes <= MAX_THUMBNAIL_SIZE_BYTES
}

export function isThumbnailRatioAccepted(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return false
  }

  const ratio = width / height
  return Math.abs(ratio - TARGET_THUMBNAIL_RATIO) / TARGET_THUMBNAIL_RATIO <= THUMBNAIL_RATIO_TOLERANCE
}

export function validateInfographicThumbnail({ mimeType, sizeBytes, width, height }) {
  if (!isAllowedThumbnailMime(mimeType)) return { valid: false, error: 'unsupportedType' }
  if (!isThumbnailSizeAllowed(sizeBytes)) return { valid: false, error: 'tooLarge' }
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return { valid: false, error: 'unreadable' }
  }
  if (!isThumbnailRatioAccepted(width, height)) return { valid: false, error: 'invalidRatio' }

  return {
    valid: true,
    warning: sizeBytes > THUMBNAIL_PERFORMANCE_WARNING_BYTES ? 'performance' : null,
  }
}

export function extensionForThumbnailMime(mimeType) {
  if (mimeType === 'image/png') return 'png'
  if (mimeType === 'image/jpeg') return 'jpg'
  if (mimeType === 'image/webp') return 'webp'
  return null
}

export function buildInfographicThumbnailPath(resourceId, uniqueId, mimeType) {
  const extension = extensionForThumbnailMime(mimeType)
  if (!isSafePathSegment(resourceId) || !isSafePathSegment(uniqueId) || !extension) {
    throw new TypeError('Invalid infographic thumbnail path input')
  }

  return `${THUMBNAIL_PREFIX}/${resourceId}/${uniqueId}.${extension}`
}

export function isInfographicThumbnailPathForResource(path, resourceId) {
  if (typeof path !== 'string' || !isSafePathSegment(resourceId)) return false

  const prefix = `${THUMBNAIL_PREFIX}/${resourceId}/`
  if (!path.startsWith(prefix)) return false

  const fileName = path.slice(prefix.length)
  return /^[^/]+\.(png|jpg|webp)$/.test(fileName)
}

export function getInfographicImageCandidates(resource) {
  if (!resource || typeof resource !== 'object') return []

  return [...new Set([resource.thumbnail_path, resource.image_path]
    .filter((path) => typeof path === 'string')
    .map((path) => path.trim())
    .filter(Boolean))]
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
