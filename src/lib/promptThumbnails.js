import {
  MAX_ARTICLE_IMAGE_SIZE_BYTES,
  readImageMetadata,
  replaceStoredReference,
  validateArticleFileIdentity,
  validateArticleImage,
} from './articleAssets.js'
import {
  buildPromptThumbnailPath,
  isPromptThumbnailPath,
  PROMPT_ASSETS_BUCKET,
} from './promptThumbnailRules.js'
import { supabase } from './supabase.js'

export { buildPromptThumbnailPath, isPromptThumbnailPath, PROMPT_ASSETS_BUCKET } from './promptThumbnailRules.js'
export const MAX_PROMPT_THUMBNAIL_SIZE_BYTES = MAX_ARTICLE_IMAGE_SIZE_BYTES

const UUID_SOURCE = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}'
const UUID_PATTERN = new RegExp(`^${UUID_SOURCE}$`)

export async function readPromptThumbnailMetadata(file, dependencies) {
  return readImageMetadata(file, dependencies)
}

export function validatePromptThumbnail(metadata) {
  return validateArticleImage({ ...metadata, kind: 'cover', preferredAspectRatio: '16:9' })
}

export function getPromptThumbnailGenerationState({ promptId, dirty, generationBrief, busy }) {
  if (!promptId) return 'saveFirst'
  if (dirty) return 'saveChangesFirst'
  if (!String(generationBrief || '').trim()) return 'briefRequired'
  if (busy) return 'generating'
  return 'ready'
}

export async function generatePromptThumbnail(promptId, client = supabase, fetchImpl = fetch) {
  if (!UUID_PATTERN.test(promptId || '')) throw new TypeError('Invalid prompt UUID')
  const { data, error } = await client.auth.getSession()
  const accessToken = data?.session?.access_token
  if (error || !accessToken) throw new Error('unauthenticated')
  const response = await fetchImpl('/api/generate-prompt-thumbnail', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ promptId }),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const requestError = new Error(payload.error || 'generation_failed')
    requestError.code = payload.error || 'generation_failed'
    throw requestError
  }
  return payload
}

export { validateArticleFileIdentity as validatePromptThumbnailIdentity }

export async function createPromptThumbnailUrl(path, promptId, client = supabase, expiresIn = 3600) {
  if (!isPromptThumbnailPath(path, promptId)) return null
  const { data, error } = await client.storage.from(PROMPT_ASSETS_BUCKET).createSignedUrl(path, expiresIn)
  if (error) throw error
  return data?.signedUrl || null
}

export async function uploadPromptThumbnail(
  { promptId, oldPath, file, metadata },
  client = supabase,
  uniqueId = crypto.randomUUID(),
) {
  if (oldPath && !isPromptThumbnailPath(oldPath, promptId)) {
    throw new TypeError('Invalid existing prompt thumbnail path')
  }
  const newPath = buildPromptThumbnailPath(promptId, uniqueId, metadata.mimeType)
  return replaceStoredReference({
    newPath,
    oldPath,
    upload: async () => {
      const { error } = await client.storage.from(PROMPT_ASSETS_BUCKET).upload(newPath, file, {
        cacheControl: '3600', contentType: metadata.mimeType, upsert: false,
      })
      if (error) throw error
    },
    persist: async () => {
      let query = client.from('prompts').update({ thumbnail_path: newPath }).eq('id', promptId)
      query = oldPath ? query.eq('thumbnail_path', oldPath) : query.is('thumbnail_path', null)
      const { data, error } = await query.select('thumbnail_path').maybeSingle()
      if (error) throw error
      if (!data) throw new Error('assetChanged')
    },
    remove: (path) => removePromptThumbnailObject(path, promptId, client),
  })
}

export async function removePromptThumbnail({ promptId, path }, client = supabase) {
  if (!isPromptThumbnailPath(path, promptId)) throw new TypeError('Invalid prompt thumbnail path')
  const { data, error } = await client.from('prompts').update({ thumbnail_path: null })
    .eq('id', promptId).eq('thumbnail_path', path).select('id').maybeSingle()
  if (error) throw error
  if (!data) throw new Error('assetChanged')
  let cleanupFailed = false
  try {
    await removePromptThumbnailObject(path, promptId, client)
  } catch {
    cleanupFailed = true
  }
  return { cleanupFailed }
}

async function removePromptThumbnailObject(path, promptId, client) {
  if (!isPromptThumbnailPath(path, promptId)) throw new TypeError('Unsafe prompt thumbnail path')
  const { error } = await client.storage.from(PROMPT_ASSETS_BUCKET).remove([path])
  if (error) throw error
}
