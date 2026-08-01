import { supabase } from './supabase.js'
import {
  ARTICLE_ASSETS_BUCKET,
  buildArticleCoverPath,
  buildArticleMediaPath,
  isArticleCoverPath,
  isArticleMediaPath,
  replaceStoredReference,
} from './articleAssetRules.js'

export * from './articleAssetRules.js'

export async function fetchArticleAssets(articleId) {
  const { data, error } = await supabase.from('article_media_assets').select('*')
    .eq('article_id', articleId).order('created_at')
  if (error) throw error
  return data || []
}

export async function createArticleAssetUrls({ assets = [], coverPath } = {}, articleId, expiresIn = 3600) {
  const paths = [
    ...(isArticleCoverPath(coverPath, articleId) ? [coverPath] : []),
    ...assets
      .filter((asset) => isArticleMediaPath(asset?.storage_path, articleId, asset?.media_key))
      .map((asset) => asset.storage_path),
  ]
  const uniquePaths = [...new Set(paths)]
  const entries = await Promise.all(uniquePaths.map(async (path) => {
    const { data, error } = await supabase.storage.from(ARTICLE_ASSETS_BUCKET).createSignedUrl(path, expiresIn)
    if (error) throw error
    return [path, data.signedUrl]
  }))
  return Object.fromEntries(entries)
}

export async function uploadArticleCover({ articleId, oldPath, file, metadata }) {
  const newPath = buildArticleCoverPath(articleId, crypto.randomUUID(), metadata.mimeType)
  return replaceStoredReference({
    newPath, oldPath,
    upload: () => uploadObject(newPath, file),
    persist: async () => {
      const { data, error } = await supabase.from('articles').update({ cover_path: newPath })
        .eq('id', articleId).eq('status', 'draft').select('cover_path').maybeSingle()
      if (error) throw error
      if (!data) throw new Error('draftOnly')
    },
    remove: (path) => removeValidatedCoverObject(path, articleId),
  })
}

export async function removeArticleCover({ articleId, path }) {
  if (!isArticleCoverPath(path, articleId)) throw new TypeError('Invalid article cover path')
  const { data, error } = await supabase.from('articles').update({ cover_path: null })
    .eq('id', articleId).eq('status', 'draft').eq('cover_path', path).select('id').maybeSingle()
  if (error) throw error
  if (!data) throw new Error('draftOnly')
  return { cleanupFailed: !(await safelyRemoveArticleCoverObject(path, articleId)) }
}

export async function uploadArticleMedia({ articleId, mediaKey, oldPath, file, metadata }) {
  const newPath = buildArticleMediaPath(articleId, mediaKey, crypto.randomUUID(), metadata.mimeType)
  return replaceStoredReference({
    newPath, oldPath,
    upload: () => uploadObject(newPath, file),
    persist: async () => {
      const { error } = await supabase.from('article_media_assets').upsert({
        article_id: articleId, media_key: mediaKey, storage_path: newPath, file_metadata: metadata,
      }, { onConflict: 'article_id,media_key' })
      if (error) throw error
    },
    remove: (path) => removeValidatedMediaObject(path, articleId, mediaKey),
  })
}

export async function removeArticleMedia({ articleId, mediaKey, path }) {
  if (!isArticleMediaPath(path, articleId, mediaKey)) throw new TypeError('Invalid article media path')
  const { data, error } = await supabase.from('article_media_assets').delete()
    .eq('article_id', articleId).eq('media_key', mediaKey).eq('storage_path', path)
    .select('id').maybeSingle()
  if (error) throw error
  if (!data) throw new Error('assetChanged')
  return { cleanupFailed: !(await safelyRemoveArticleMediaObject(path, articleId, mediaKey)) }
}

async function safelyRemoveArticleCoverObject(path, articleId) {
  if (!isArticleCoverPath(path, articleId)) return false
  try { await removeObject(path); return true } catch { return false }
}

async function safelyRemoveArticleMediaObject(path, articleId, mediaKey) {
  if (!isArticleMediaPath(path, articleId, mediaKey)) return false
  try { await removeObject(path); return true } catch { return false }
}

export async function readImageMetadata(file) {
  const dimensions = await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => { resolve({ width: image.naturalWidth, height: image.naturalHeight }); URL.revokeObjectURL(url) }
    image.onerror = () => { reject(new Error('unreadable')); URL.revokeObjectURL(url) }
    image.src = url
  })
  return { originalName: file.name, mimeType: file.type, sizeBytes: file.size, ...dimensions }
}

async function uploadObject(path, file) {
  const { error } = await supabase.storage.from(ARTICLE_ASSETS_BUCKET).upload(path, file, {
    cacheControl: '3600', contentType: file.type, upsert: false,
  })
  if (error) throw error
}

async function removeObject(path) {
  const { error } = await supabase.storage.from(ARTICLE_ASSETS_BUCKET).remove([path])
  if (error) throw error
}

async function removeValidatedCoverObject(path, articleId) {
  if (!isArticleCoverPath(path, articleId)) throw new TypeError('Refusing to remove an unsafe article cover path')
  return removeObject(path)
}

async function removeValidatedMediaObject(path, articleId, mediaKey) {
  if (!isArticleMediaPath(path, articleId, mediaKey)) throw new TypeError('Refusing to remove an unsafe article media path')
  return removeObject(path)
}
