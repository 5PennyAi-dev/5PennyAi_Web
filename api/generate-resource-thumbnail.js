/* global process */
import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import OpenAI, { toFile } from 'openai'
import { createClient } from '@supabase/supabase-js'
import {
  RESOURCE_THUMBNAIL_MIME_TYPE,
  RESOURCE_THUMBNAIL_MODEL,
  RESOURCE_THUMBNAIL_SIZE,
  ResourceThumbnailError,
  generateAndStoreResourceThumbnail,
  normalizeResourceThumbnail,
  validateResourceId,
} from './_lib/resourceThumbnail.js'

export const config = { maxDuration: 300 }

const ADMIN_EMAIL = 'christian.couillard@5pennyai.com'
const BUCKET = 'infographics'
const RESOURCE_COLUMNS =
  'id, image_path, thumbnail_path, title, subtitle, summary, theme, key_points, takeaway'

export async function authorizeResourceThumbnailRequest(req, supabase, adminEmail = ADMIN_EMAIL) {
  const header = req.headers?.authorization || req.headers?.Authorization || ''
  const match = /^Bearer\s+(.+)$/i.exec(header)
  if (!match) throw new ResourceThumbnailError('unauthenticated', 401)

  const { data, error } = await supabase.auth.getUser(match[1])
  if (error || !data?.user) throw new ResourceThumbnailError('unauthenticated', 401)
  if (data.user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
    throw new ResourceThumbnailError('forbidden', 403)
  }

  return data.user
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[resource-thumbnail] Supabase server configuration is missing')
    return res.status(500).json({ error: 'server_not_configured' })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  try {
    await authorizeResourceThumbnailRequest(req, supabase)

    const body = parseBody(req.body)
    if (!validateResourceId(body.resourceId)) {
      throw new ResourceThumbnailError('invalid_resource_id', 400)
    }

    const openAiKey = process.env.OPENAI_API_KEY
    if (!openAiKey) {
      console.error('[resource-thumbnail] OPENAI_API_KEY is missing')
      throw new ResourceThumbnailError('server_not_configured', 500)
    }

    const result = await generateAndStoreResourceThumbnail({
      resourceId: body.resourceId,
      dependencies: createDependencies({ supabase, openAiKey }),
    })

    return res.status(200).json(result)
  } catch (error) {
    const normalized = normalizeError(error)
    console.error(`[resource-thumbnail] ${normalized.code}`, error?.message || '')
    return res.status(normalized.status).json({ error: normalized.code })
  }
}

function createDependencies({ supabase, openAiKey }) {
  const openai = new OpenAI({ apiKey: openAiKey })

  return {
    createUniqueId: () => randomUUID(),
    logger: console,
    async getResource(resourceId) {
      const { data, error } = await supabase
        .from('infographics')
        .select(RESOURCE_COLUMNS)
        .eq('id', resourceId)
        .maybeSingle()
      if (error) throw error
      return data
    },
    async downloadReference(imagePath) {
      const { data, error } = await supabase.storage.from(BUCKET).download(imagePath)
      if (error || !data || typeof data.arrayBuffer !== 'function') {
        throw new ResourceThumbnailError('reference_download_failed', 422)
      }
      try {
        return {
          buffer: Buffer.from(await data.arrayBuffer()),
          mimeType: data.type,
        }
      } catch {
        throw new ResourceThumbnailError('reference_download_failed', 422)
      }
    },
    async generateImage(prompt, reference) {
      return editResourceThumbnail({ openai, prompt, reference })
    },
    normalizeImage: normalizeResourceThumbnail,
    async uploadThumbnail(path, buffer, mimeType) {
      const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
        contentType: mimeType,
        cacheControl: '31536000',
        upsert: false,
      })
      if (error) throw error
    },
    async updateThumbnailPath(resourceId, thumbnailPath) {
      const { data, error } = await supabase
        .from('infographics')
        .update({ thumbnail_path: thumbnailPath })
        .eq('id', resourceId)
        .select('id')
        .maybeSingle()
      if (error) throw error
      if (!data) throw new ResourceThumbnailError('resource_not_found', 404)
    },
    async removeThumbnail(path) {
      const { error } = await supabase.storage.from(BUCKET).remove([path])
      if (error) throw error
    },
  }
}

export async function editResourceThumbnail({ openai, prompt, reference, toFileImpl = toFile }) {
  let response
  try {
    const fileName = reference.path.split('/').at(-1) || 'infographic-reference'
    const referenceImage = await toFileImpl(reference.buffer, fileName, {
      type: reference.mimeType,
    })
    response = await openai.images.edit({
      model: RESOURCE_THUMBNAIL_MODEL,
      image: referenceImage,
      prompt,
      size: RESOURCE_THUMBNAIL_SIZE,
      quality: 'medium',
      output_format: 'webp',
      output_compression: 85,
      background: 'opaque',
      n: 1,
    })
  } catch (error) {
    if (error instanceof ResourceThumbnailError) throw error
    console.error('[resource-thumbnail] OpenAI image edit failed:', error?.message || '')
    throw new ResourceThumbnailError('provider_failed', 502)
  }

  if (!Array.isArray(response?.data) || response.data.length !== 1) {
    throw new ResourceThumbnailError('provider_invalid_image_count', 502)
  }
  const base64 = response.data[0]?.b64_json
  if (typeof base64 !== 'string' || !base64) {
    throw new ResourceThumbnailError('provider_no_image', 502)
  }

  return {
    buffer: Buffer.from(base64, 'base64'),
    mimeType: RESOURCE_THUMBNAIL_MIME_TYPE,
  }
}

function parseBody(body) {
  if (typeof body !== 'string') return body && typeof body === 'object' ? body : {}
  try {
    return JSON.parse(body)
  } catch {
    throw new ResourceThumbnailError('invalid_request', 400)
  }
}

function normalizeError(error) {
  if (error instanceof ResourceThumbnailError) return error
  return new ResourceThumbnailError('generation_failed', 500)
}
