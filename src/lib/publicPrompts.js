import { supabase } from './supabase.js'
import { isPromptSlug, normalizePromptSlug } from './promptSlug.js'
import { isPromptThumbnailPath, PROMPT_ASSETS_BUCKET } from './promptThumbnails.js'

const PUBLIC_COLUMNS = [
  'id',
  'slug',
  'language',
  'title',
  'summary',
  'category',
  'level',
  'contexts',
  'when_to_use',
  'prompt_template',
  'variables',
  'tip',
  'quick_template',
  'caution',
  'published_at',
  'thumbnail_path',
  'thumbnail',
  'seo',
].join(', ')

const PUBLIC_CATALOG_COLUMNS = [
  'id',
  'title',
  'summary',
  'category',
  'level',
  'contexts',
  'keywords',
  'published_at',
  'slug',
  'thumbnail_path',
].join(', ')

export const PUBLIC_PROMPT_COLUMNS = PUBLIC_COLUMNS
export const PUBLIC_PROMPT_CATALOG_COLUMNS = PUBLIC_CATALOG_COLUMNS

export async function fetchPublishedPromptsForCatalog(
  client = supabase,
  { expiresIn = 3600, logger = console } = {},
) {
  const { data, error } = await client
    .from('prompts')
    .select(PUBLIC_CATALOG_COLUMNS)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) throw error
  const rows = data || []
  const entries = await Promise.all(rows.map(async (row) => {
    if (!isPromptThumbnailPath(row?.thumbnail_path, row?.id)) return null
    try {
      const { data: signed, error: signError } = await client.storage
        .from(PROMPT_ASSETS_BUCKET)
        .createSignedUrl(row.thumbnail_path, expiresIn)
      if (signError || !signed?.signedUrl) throw signError || new Error('Missing signed URL')
      return [row.id, signed.signedUrl]
    } catch (signError) {
      logger?.warn?.('Unable to sign a published prompt thumbnail:', signError?.message)
      return null
    }
  }))

  return { rows, thumbnailUrls: Object.fromEntries(entries.filter(Boolean)) }
}

export async function loadPublishedPromptBySlug(
  requestedSlug,
  client = supabase,
  { expiresIn = 3600, logger = console } = {},
) {
  const slug = normalizePromptSlug(requestedSlug)
  if (!slug || !isPromptSlug(slug)) return { state: 'not-found' }

  const { data: row, error } = await client
    .from('prompts')
    .select(PUBLIC_COLUMNS)
    .eq('slug', slug)
    .eq('status', 'published')
    .limit(1)
    .maybeSingle()

  if (error) return { state: 'error', error }
  if (!row) return { state: 'not-found' }

  let thumbnailUrl = null
  if (isPromptThumbnailPath(row.thumbnail_path, row.id)) {
    try {
      const { data, error: signError } = await client.storage
        .from(PROMPT_ASSETS_BUCKET)
        .createSignedUrl(row.thumbnail_path, expiresIn)
      if (signError || !data?.signedUrl) throw signError || new Error('Missing signed URL')
      thumbnailUrl = data.signedUrl
    } catch (signError) {
      logger?.warn?.('Unable to sign a published prompt thumbnail:', signError?.message)
    }
  }

  return {
    state: 'found',
    prompt: sanitizePublishedPrompt(row),
    thumbnailUrl,
  }
}

export function sanitizePublishedPrompt(row = {}) {
  const thumbnail = isPlainObject(row.thumbnail) ? row.thumbnail : {}
  const seo = isPlainObject(row.seo) ? row.seo : {}

  return {
    id: row.id,
    slug: row.slug,
    language: text(row.language),
    title: text(row.title),
    summary: text(row.summary),
    category: text(row.category),
    level: text(row.level),
    contexts: stringArray(row.contexts),
    whenToUse: text(row.when_to_use),
    promptTemplate: text(row.prompt_template),
    variables: variableArray(row.variables),
    tip: text(row.tip),
    quickTemplate: text(row.quick_template),
    caution: text(row.caution),
    publishedAt: typeof row.published_at === 'string' ? row.published_at : null,
    hasThumbnail: isPromptThumbnailPath(row.thumbnail_path, row.id),
    thumbnailAltText: text(thumbnail.altText),
    seoTitle: text(seo.seoTitle),
    metaDescription: text(seo.metaDescription),
  }
}

function variableArray(value) {
  if (!Array.isArray(value)) return []
  return value.filter(isPlainObject).map((variable) => ({
    key: text(variable.key),
    label: text(variable.label),
    description: text(variable.description),
    example: text(variable.example),
  }))
}

function stringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : []
}

function text(value) {
  return typeof value === 'string' ? value : ''
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
