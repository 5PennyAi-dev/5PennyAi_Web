export const ARTICLE_ASSETS_BUCKET = 'article-assets'
export const MAX_ARTICLE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
export const ARTICLE_IMAGE_WEIGHT_WARNING_BYTES = 1024 * 1024
export const COVER_RATIO = 16 / 9
export const COVER_RATIO_TOLERANCE = 0.03
export const MEDIA_RATIO_WARNING_TOLERANCE = 0.12

const MIME_EXTENSIONS = new Map([['image/png', 'png'], ['image/jpeg', 'jpg'], ['image/webp', 'webp']])
const UUID_SOURCE = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}'
const UUID_PATTERN = new RegExp(`^${UUID_SOURCE}$`)
export const ARTICLE_MEDIA_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function validateArticleImage({ kind, mimeType, sizeBytes, width, height, preferredAspectRatio }) {
  if (!MIME_EXTENSIONS.has(mimeType)) return { valid: false, error: 'unsupportedType' }
  if (!Number.isFinite(sizeBytes) || sizeBytes < 0 || sizeBytes > MAX_ARTICLE_IMAGE_SIZE_BYTES) return { valid: false, error: 'tooLarge' }
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return { valid: false, error: 'unreadable' }
  const ratio = width / height
  if (kind === 'cover' && relativeRatioDifference(ratio, COVER_RATIO) > COVER_RATIO_TOLERANCE) return { valid: false, error: 'invalidCoverRatio' }
  const preferredRatio = parseAspectRatio(preferredAspectRatio)
  return {
    valid: true,
    warnings: [
      ...(sizeBytes > ARTICLE_IMAGE_WEIGHT_WARNING_BYTES ? ['heavyFile'] : []),
      ...(kind === 'media' && preferredRatio && relativeRatioDifference(ratio, preferredRatio) > MEDIA_RATIO_WARNING_TOLERANCE ? ['ratioMismatch'] : []),
    ],
  }
}

export function buildArticleCoverPath(articleId, uniqueId, mimeType) {
  assertUuid(articleId)
  assertUuid(uniqueId)
  return `articles/${articleId}/cover/${uniqueId}.${extensionForMime(mimeType)}`
}

export function buildArticleMediaPath(articleId, mediaKey, uniqueId, mimeType) {
  assertUuid(articleId)
  assertUuid(uniqueId)
  if (!ARTICLE_MEDIA_KEY_PATTERN.test(mediaKey || '')) throw new TypeError('Invalid article media key')
  return `articles/${articleId}/media/${mediaKey}/${uniqueId}.${extensionForMime(mimeType)}`
}

export function isArticleAssetPath(path, articleId) {
  return isArticleCoverPath(path, articleId) || isArticleMediaPath(path, articleId)
}

export function isArticleCoverPath(path, articleId) {
  if (typeof path !== 'string' || !UUID_PATTERN.test(articleId || '')) return false
  const escapedId = articleId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^articles/${escapedId}/cover/${UUID_SOURCE}\\.(?:png|jpg|webp)$`).test(path)
}

export function isArticleMediaPath(path, articleId, mediaKey) {
  if (typeof path !== 'string' || !UUID_PATTERN.test(articleId || '')) return false
  if (mediaKey !== undefined && !ARTICLE_MEDIA_KEY_PATTERN.test(mediaKey || '')) return false
  const escapedId = articleId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const keyPattern = mediaKey === undefined
    ? '[a-z0-9]+(?:-[a-z0-9]+)*'
    : mediaKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^articles/${escapedId}/media/${keyPattern}/${UUID_SOURCE}\\.(?:png|jpg|webp)$`).test(path)
}

export function resolveArticleAssets(media, assets) {
  const manifest = Array.isArray(media) ? media : []
  const persisted = Array.isArray(assets) ? assets : []
  const manifestKeys = new Set(manifest.map(({ key }) => key).filter((key) => ARTICLE_MEDIA_KEY_PATTERN.test(key || '')))
  const byKey = new Map(persisted.map((asset) => [asset.media_key, asset]))
  return {
    media: manifest.map((item) => ({ ...item, asset: byKey.get(item.key) || null })),
    orphans: persisted.filter((asset) => !manifestKeys.has(asset.media_key)),
  }
}

export function collectArticleObjectPaths(article) {
  const paths = []
  if (isArticleCoverPath(article?.cover_path, article?.id)) paths.push(article.cover_path)
  for (const asset of article?.assets || []) {
    if (isArticleMediaPath(asset?.storage_path, article?.id, asset?.media_key)) paths.push(asset.storage_path)
  }
  return [...new Set(paths)]
}

export async function replaceStoredReference({ newPath, oldPath, upload, persist, remove }) {
  await upload()
  try {
    await persist()
  } catch (error) {
    const failure = error instanceof Error ? error : new Error('Unable to persist stored reference', { cause: error })
    try { await remove(newPath) } catch { failure.assetCleanupFailed = true }
    throw failure
  }
  let cleanupFailed = false
  if (oldPath && oldPath !== newPath) {
    try { await remove(oldPath) } catch { cleanupFailed = true }
  }
  return { path: newPath, cleanupFailed }
}

function parseAspectRatio(value) {
  const match = /^(\d+):(\d+)$/.exec(value || '')
  return match && Number(match[2]) > 0 ? Number(match[1]) / Number(match[2]) : null
}

function relativeRatioDifference(actual, expected) {
  return Math.abs(actual - expected) / expected
}

function extensionForMime(mimeType) {
  const extension = MIME_EXTENSIONS.get(mimeType)
  if (!extension) throw new TypeError('Unsupported article image type')
  return extension
}

function assertUuid(value) {
  if (!UUID_PATTERN.test(value || '')) throw new TypeError('Invalid UUID path segment')
}
