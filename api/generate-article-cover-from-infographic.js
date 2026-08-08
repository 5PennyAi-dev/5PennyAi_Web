/* global process */
import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import OpenAI from 'openai'
import { createResourcesServerClient, authorizeResourcesAdminRequest } from './_lib/resourcesAdminAuth.js'
import { editImageFromReference } from './_lib/articleImageEdit.js'
import {
  ARTICLE_COVER_MIME_TYPE,
  ARTICLE_COVER_MODEL,
  ARTICLE_COVER_PROMPT_VERSION,
  ARTICLE_COVER_SIZE,
  ArticleCoverGenerationError,
  generateAndStoreArticleCover,
  normalizeArticleCover,
  validateArticleId,
} from './_lib/articleCoverFromInfographic.js'

export const config = { maxDuration: 300 }
const BUCKET = 'article-assets'
const ARTICLE_COLUMNS = 'id, status, title, subtitle, summary, theme, level, takeaway, infographic_path, cover_path'

export default async function handler(req, res) {
  const startedAt = Date.now()
  let articleId = null
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      return res.status(405).json({ error: 'method_not_allowed' })
    }
    const supabase = createResourcesServerClient()
    await authorizeResourcesAdminRequest(req, supabase)
    const body = parseBody(req.body)
    articleId = body.articleId
    if (!validateArticleId(articleId)) {
      throw new ArticleCoverGenerationError('invalid_article_id', 400, 'validate_input')
    }
    if (!process.env.OPENAI_API_KEY) {
      throw new ArticleCoverGenerationError('server_not_configured', 500, 'configure_provider')
    }
    const result = await generateAndStoreArticleCover({
      articleId,
      dependencies: createDependencies({ supabase, openAiKey: process.env.OPENAI_API_KEY }),
    })
    logGeneration({ articleId, success: true, durationMs: Date.now() - startedAt })
    return res.status(200).json(result)
  } catch (error) {
    const normalized = normalizeError(error)
    logGeneration({ articleId, success: false, failureStep: normalized.failureStep, durationMs: Date.now() - startedAt })
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
      if (error || !data || typeof data.arrayBuffer !== 'function') {
        throw new ArticleCoverGenerationError('infographic_download_failed', 422, 'download_source')
      }
      try {
        const buffer = Buffer.from(await data.arrayBuffer())
        return { buffer, mimeType: data.type }
      } catch {
        throw new ArticleCoverGenerationError('infographic_download_failed', 422, 'download_source')
      }
    },
    generateImage: (prompt, reference) => editArticleCover({ openai, prompt, reference }),
    normalizeImage: normalizeArticleCover,
    async uploadCover(path, buffer, mimeType) {
      const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
        contentType: mimeType, cacheControl: '31536000', upsert: false,
      })
      if (error) throw error
    },
    async updateCoverPath(articleId, oldPath, newPath) {
      let query = supabase.from('articles').update({ cover_path: newPath }).eq('id', articleId).eq('status', 'draft')
      query = oldPath ? query.eq('cover_path', oldPath) : query.is('cover_path', null)
      const { data, error } = await query.select('id').maybeSingle()
      if (error) throw error
      if (!data) throw new ArticleCoverGenerationError('article_changed', 409, 'update_article')
    },
    async removeCover(path) {
      const { error } = await supabase.storage.from(BUCKET).remove([path])
      if (error) throw error
    },
  }
}

export async function editArticleCover({ openai, prompt, reference, toFileImpl }) {
  return editImageFromReference({
    openai,
    prompt,
    reference,
    model: ARTICLE_COVER_MODEL,
    size: ARTICLE_COVER_SIZE,
    createError: (code, status, failureStep) => new ArticleCoverGenerationError(code, status, failureStep),
    ...(toFileImpl ? { toFileImpl } : {}),
  })
}

function parseBody(body) {
  if (typeof body !== 'string') return body && typeof body === 'object' ? body : {}
  try { return JSON.parse(body) } catch { throw new ArticleCoverGenerationError('invalid_request', 400, 'validate_input') }
}

function normalizeError(error) {
  if (Number.isInteger(error?.status) && typeof error?.code === 'string') return error
  return new ArticleCoverGenerationError('generation_failed', 500, error?.failureStep || 'unknown')
}

function logGeneration({ articleId, success, failureStep = null, durationMs }) {
  const entry = {
    articleId,
    action: 'cover_from_infographic',
    promptVersion: ARTICLE_COVER_PROMPT_VERSION,
    model: ARTICLE_COVER_MODEL,
    success,
    failureStep,
    durationMs,
  }
  const method = success ? 'info' : 'error'
  console[method]('[article-cover-from-infographic]', entry)
}
