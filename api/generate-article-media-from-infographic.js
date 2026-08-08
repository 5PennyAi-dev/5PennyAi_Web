/* global process */
import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import OpenAI from 'openai'
import { createResourcesServerClient, authorizeResourcesAdminRequest } from './_lib/resourcesAdminAuth.js'
import { editImageFromReference } from './_lib/articleImageEdit.js'
import {
  ARTICLE_MEDIA_MODEL,
  ARTICLE_MEDIA_PROMPT_VERSION,
  ArticleMediaGenerationError,
  generateAndStoreArticleMedia,
  normalizeArticleMedia,
  validateArticleMediaKey,
} from './_lib/articleMediaFromInfographic.js'
import { validateArticleId } from './_lib/articleCoverFromInfographic.js'

export const config = { maxDuration: 300 }
const BUCKET = 'article-assets'
const ARTICLE_COLUMNS = 'id, status, title, summary, level, media, infographic_path'

export default async function handler(req, res) {
  const startedAt = Date.now()
  let articleId = null
  let mediaKey = null
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      return res.status(405).json({ error: 'method_not_allowed' })
    }
    const supabase = createResourcesServerClient()
    await authorizeResourcesAdminRequest(req, supabase)
    const body = parseBody(req.body)
    articleId = body.articleId
    mediaKey = body.mediaKey
    if (!validateArticleId(articleId)) throw new ArticleMediaGenerationError('invalid_article_id', 400, 'validate_input')
    if (!validateArticleMediaKey(mediaKey)) throw new ArticleMediaGenerationError('invalid_media_key', 400, 'validate_input')
    if (!process.env.OPENAI_API_KEY) throw new ArticleMediaGenerationError('server_not_configured', 500, 'configure_provider')
    const result = await generateAndStoreArticleMedia({
      articleId,
      mediaKey,
      dependencies: createDependencies({ supabase, openAiKey: process.env.OPENAI_API_KEY }),
    })
    logGeneration({ articleId, mediaKey, success: true, durationMs: Date.now() - startedAt, ...result })
    return res.status(200).json(result)
  } catch (error) {
    const normalized = normalizeError(error)
    logGeneration({ articleId, mediaKey, success: false, failureStep: normalized.failureStep, durationMs: Date.now() - startedAt })
    return res.status(normalized.status).json({ error: normalized.code })
  }
}

function createDependencies({ supabase, openAiKey }) {
  const openai = new OpenAI({ apiKey: openAiKey })
  return {
    createUniqueId: randomUUID,
    logger: console,
    async getArticle(articleId) {
      const { data, error } = await supabase.from('articles').select(ARTICLE_COLUMNS).eq('id', articleId).maybeSingle()
      if (error) throw error
      return data
    },
    async downloadInfographic(path) {
      const { data, error } = await supabase.storage.from(BUCKET).download(path)
      if (error || !data || typeof data.arrayBuffer !== 'function') throw new ArticleMediaGenerationError('infographic_download_failed', 422, 'download_source')
      try { return { buffer: Buffer.from(await data.arrayBuffer()), mimeType: data.type } } catch {
        throw new ArticleMediaGenerationError('infographic_download_failed', 422, 'download_source')
      }
    },
    async getMediaAsset(articleId, mediaKey) {
      const { data, error } = await supabase.from('article_media_assets').select('id, storage_path').eq('article_id', articleId).eq('media_key', mediaKey).maybeSingle()
      if (error) throw error
      return data
    },
    generateImage: (prompt, reference, ratioSpec) => editArticleMedia({ openai, prompt, reference, size: ratioSpec.size }),
    normalizeImage: normalizeArticleMedia,
    async uploadMedia(path, buffer, mimeType) {
      const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, { contentType: mimeType, cacheControl: '31536000', upsert: false })
      if (error) throw error
    },
    async replaceMediaAsset({ articleId, mediaKey, oldPath, newPath, metadata }) {
      if (oldPath) {
        const { data, error } = await supabase.from('article_media_assets')
          .update({ storage_path: newPath, file_metadata: metadata })
          .eq('article_id', articleId).eq('media_key', mediaKey).eq('storage_path', oldPath)
          .select('id').maybeSingle()
        if (error) throw error
        if (!data) throw new ArticleMediaGenerationError('media_asset_changed', 409, 'update_asset')
        return
      }
      const { error } = await supabase.from('article_media_assets').insert({ article_id: articleId, media_key: mediaKey, storage_path: newPath, file_metadata: metadata })
      if (error?.code === '23505') throw new ArticleMediaGenerationError('media_asset_changed', 409, 'update_asset')
      if (error) throw error
    },
    async removeMedia(path) {
      const { error } = await supabase.storage.from(BUCKET).remove([path])
      if (error) throw error
    },
  }
}

export async function editArticleMedia({ openai, prompt, reference, size, toFileImpl }) {
  return editImageFromReference({
    openai,
    prompt,
    reference,
    model: ARTICLE_MEDIA_MODEL,
    size,
    createError: (code, status, failureStep) => new ArticleMediaGenerationError(code, status, failureStep),
    ...(toFileImpl ? { toFileImpl } : {}),
  })
}

function parseBody(body) {
  if (typeof body !== 'string') return body && typeof body === 'object' ? body : {}
  try { return JSON.parse(body) } catch { throw new ArticleMediaGenerationError('invalid_request', 400, 'validate_input') }
}

function normalizeError(error) {
  if (Number.isInteger(error?.status) && typeof error?.code === 'string') return error
  return new ArticleMediaGenerationError('generation_failed', 500, error?.failureStep || 'unknown')
}

function logGeneration({ articleId, mediaKey, kind = null, requestedRatio = null, promptVersion = ARTICLE_MEDIA_PROMPT_VERSION, profileVersion = null, model = ARTICLE_MEDIA_MODEL, cleanupWarning = false, success, failureStep = null, durationMs }) {
  const entry = { articleId, mediaKey, kind, action: 'media_from_infographic', promptVersion, profileVersion, model, requestedRatio, success, failureStep, durationMs, cleanupWarning }
  console[success ? 'info' : 'error']('[article-media-from-infographic]', entry)
}
