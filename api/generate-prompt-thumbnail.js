/* global process */
import { randomUUID } from 'node:crypto'
import OpenAI from 'openai'
import {
  RESOURCE_THUMBNAIL_MODEL,
  ResourceThumbnailError,
  validateResourceId,
} from './_lib/resourceThumbnail.js'
import {
  PROMPT_THUMBNAIL_SOURCE_SIZE,
  PROMPT_THUMBNAIL_PROMPT_VERSION,
  decodeGeneratedPromptThumbnail,
  generateAndStorePromptThumbnail,
  normalizePromptThumbnail,
} from './_lib/promptThumbnail.js'
import {
  authorizeResourcesAdminRequest,
  createResourcesServerClient,
  ResourcesAdminAuthError,
} from './_lib/resourcesAdminAuth.js'
import { ARTICLE_ASSETS_BUCKET } from '../src/lib/articleAssetRules.js'

export const config = { maxDuration: 300 }

const PROMPT_COLUMNS = [
  'id', 'status', 'published_at', 'thumbnail_path', 'title', 'summary', 'category',
  'editorial_objective', 'thumbnail',
].join(', ')

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  const startedAt = Date.now()
  let promptId = null
  let supabase
  try {
    supabase = createResourcesServerClient()
    await authorizeResourcesAdminRequest(req, supabase)
    const body = validatePromptThumbnailRequestBody(parseBody(req.body))
    promptId = body.promptId
    if (!process.env.OPENAI_API_KEY) throw new ResourceThumbnailError('server_not_configured', 500)

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const result = await generateAndStorePromptThumbnail({
      promptId: body.promptId,
      dependencies: createDependencies({ supabase, openai }),
    })
    console.info(`[prompt-thumbnail] success promptId=${promptId} version=${PROMPT_THUMBNAIL_PROMPT_VERSION} durationMs=${Date.now() - startedAt} cleanupWarning=${result.cleanupWarning}`)
    return res.status(200).json(result)
  } catch (error) {
    const normalized = normalizeError(error)
    console.error(`[prompt-thumbnail] ${normalized.code} promptId=${promptId || 'unavailable'} version=${PROMPT_THUMBNAIL_PROMPT_VERSION} durationMs=${Date.now() - startedAt}`, error?.message || '')
    return res.status(normalized.status).json({ error: normalized.code })
  }
}

export function validatePromptThumbnailRequestBody(body) {
  if (Object.keys(body).some((key) => key !== 'promptId') || !validateResourceId(body.promptId)) {
    throw new ResourceThumbnailError('invalid_prompt_id', 400)
  }
  return body
}

export function createDependencies({ supabase, openai }) {
  return {
    createUniqueId: () => randomUUID(),
    logger: console,
    async getPrompt(promptId) {
      const { data, error } = await supabase.from('prompts').select(PROMPT_COLUMNS)
        .eq('id', promptId).maybeSingle()
      if (error) throw error
      return data
    },
    async generateImage(prompt) {
      let response
      try {
        response = await openai.images.generate({
          model: RESOURCE_THUMBNAIL_MODEL,
          prompt,
          size: PROMPT_THUMBNAIL_SOURCE_SIZE,
          quality: 'medium',
          output_format: 'webp',
          output_compression: 85,
          background: 'opaque',
          n: 1,
        })
      } catch (error) {
        console.error('[prompt-thumbnail] OpenAI image generation failed:', error?.message || '')
        throw new ResourceThumbnailError('provider_failed', 502)
      }
      return decodeGeneratedPromptThumbnail(response)
    },
    normalizeImage: normalizePromptThumbnail,
    async uploadThumbnail(path, buffer, mimeType) {
      const { error } = await supabase.storage.from(ARTICLE_ASSETS_BUCKET).upload(path, buffer, {
        contentType: mimeType, cacheControl: '31536000', upsert: false,
      })
      if (error) throw error
    },
    async updateThumbnailPath(promptId, oldPath, thumbnailPath) {
      let query = supabase.from('prompts').update({ thumbnail_path: thumbnailPath }).eq('id', promptId)
      query = oldPath ? query.eq('thumbnail_path', oldPath) : query.is('thumbnail_path', null)
      const { data, error } = await query.select('id, status, published_at, thumbnail_path').maybeSingle()
      if (error) throw error
      if (!data) throw new ResourceThumbnailError('asset_changed', 409)
      return data
    },
    async removeThumbnail(path) {
      const { error } = await supabase.storage.from(ARTICLE_ASSETS_BUCKET).remove([path])
      if (error) throw error
    },
  }
}

function parseBody(body) {
  if (typeof body !== 'string') return body && typeof body === 'object' && !Array.isArray(body) ? body : {}
  try {
    const parsed = JSON.parse(body)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    throw new ResourceThumbnailError('invalid_request', 400)
  }
}

function normalizeError(error) {
  if (error instanceof ResourceThumbnailError || error instanceof ResourcesAdminAuthError) return error
  return new ResourceThumbnailError('generation_failed', 500)
}
