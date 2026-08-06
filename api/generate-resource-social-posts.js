/* global process */
import OpenAI from 'openai'
import {
  authorizeResourcesAdminRequest,
  createResourcesServerClient,
  ResourcesAdminAuthError,
} from './_lib/resourcesAdminAuth.js'
import { loadResourceSocialContext } from './_lib/resourceSocialContext.js'
import {
  generateResourceSocialContent,
  RESOURCE_SOCIAL_MODEL,
  SOCIAL_POST_STYLE_VERSION,
} from './_lib/resourceSocialPrompt.js'
import {
  parseResourceSocialRequestBody,
  ResourceSocialError,
} from './_lib/resourceSocialValidation.js'

export const config = { maxDuration: 60 }

export async function handleResourceSocialPosts(req, res, overrides = {}) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  const environment = overrides.environment || process.env
  const logger = overrides.logger || console
  let input
  try {
    const supabase = overrides.supabase || createResourcesServerClient(environment)
    const authorize = overrides.authorize || authorizeResourcesAdminRequest
    await authorize(req, supabase)

    input = parseResourceSocialRequestBody(req.body)
    if (!environment.OPENAI_API_KEY && !overrides.openai) {
      throw new ResourceSocialError('server_not_configured', 500)
    }

    const loadContext = overrides.loadContext || loadResourceSocialContext
    const context = await loadContext(supabase, input.resourceType, input.resourceId)
    const openai = overrides.openai || new OpenAI({ apiKey: environment.OPENAI_API_KEY })
    const generate = overrides.generate || generateResourceSocialContent
    const content = await generate({
      openai,
      context,
      platform: input.platform,
      logger,
      now: overrides.now,
    })

    return res.status(200).json({
      schemaVersion: 1,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      language: context.language,
      ...content,
    })
  } catch (error) {
    const normalized = normalizeEndpointError(error)
    const log = typeof logger?.error === 'function' ? logger.error.bind(logger) : () => {}
    log('[resource-social-posts]', {
      resourceType: input?.resourceType,
      resourceId: input?.resourceId,
      platform: input?.platform || 'full',
      model: RESOURCE_SOCIAL_MODEL,
      promptVersion: SOCIAL_POST_STYLE_VERSION,
      outcome: normalized.code,
    })
    return res.status(normalized.status).json({ error: normalized.code })
  }
}

export default async function handler(req, res) {
  return handleResourceSocialPosts(req, res)
}

function normalizeEndpointError(error) {
  if (error instanceof ResourceSocialError || error instanceof ResourcesAdminAuthError) return error
  return new ResourceSocialError('generation_failed', 500)
}
