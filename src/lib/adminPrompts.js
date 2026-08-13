import { supabase } from './supabase.js'
import { isPromptThumbnailPath } from './promptThumbnails.js'
import { PROMPT_ASSETS_BUCKET } from './promptThumbnails.js'
import {
  getPromptPublishTransition,
  getPromptUnpublishTransition,
  PromptPublicationValidationError,
} from './promptPublication.js'

const LIST_COLUMNS = [
  'id', 'status', 'slug', 'title', 'category', 'level', 'language',
  'thumbnail_path', 'updated_at', 'published_at',
].join(', ')

export class PromptAdminError extends Error {
  constructor(code, cause) {
    super(code)
    this.name = 'PromptAdminError'
    this.code = code
    this.cause = cause
  }
}

export async function fetchAdminPrompts(client = supabase) {
  const { data, error } = await client.from('prompts').select(LIST_COLUMNS).order('updated_at', { ascending: false })
  if (error) throw mapPromptError(error, 'load')
  return data || []
}

export async function fetchAdminPrompt(id, client = supabase) {
  const { data, error } = await client.from('prompts').select('*').eq('id', id).maybeSingle()
  if (error) throw mapPromptError(error, 'load')
  if (!data) throw new PromptAdminError('notFound')
  return data
}

export async function createPromptDraft(payload, client = supabase) {
  const { data, error } = await client.from('prompts')
    .insert({ ...payload, status: 'draft', published_at: null })
    .select('*').single()
  if (error) throw mapPromptError(error, 'save')
  return data
}

export async function updatePromptDraft(id, payload, client = supabase) {
  const { data, error } = await client.from('prompts')
    .update({ ...payload, status: 'draft', published_at: null })
    .eq('id', id).eq('status', 'draft').select('*').maybeSingle()
  if (error) throw mapPromptError(error, 'save')
  if (!data) throw new PromptAdminError('draftOnly')
  return data
}

export async function publishPrompt(id, client = supabase, publishedAt = new Date()) {
  const { data: current, error: loadError } = await client.from('prompts')
    .select('id, slug, status').eq('id', id).maybeSingle()
  if (loadError) throw mapPromptError(loadError, 'publish')
  if (!current) throw new PromptAdminError('notFound')

  let transition
  try {
    transition = getPromptPublishTransition(current, publishedAt)
  } catch (error) {
    if (error instanceof PromptPublicationValidationError) {
      throw new PromptAdminError(error.code, error)
    }
    throw error
  }

  const { data, error } = await client.from('prompts').update(transition)
    .eq('id', id).eq('status', 'draft').select('*').maybeSingle()
  if (error) throw mapPromptError(error, 'publish')
  if (!data) throw new PromptAdminError('draftOnly')
  return data
}

export async function unpublishPrompt(id, client = supabase) {
  const { data, error } = await client.from('prompts').update(getPromptUnpublishTransition())
    .eq('id', id).eq('status', 'published').select('*').maybeSingle()
  if (error) throw mapPromptError(error, 'unpublish')
  if (!data) throw new PromptAdminError('publishedOnly')
  return data
}

export async function deletePromptDraft(id, client = supabase) {
  const { data: prompt, error: loadError } = await client.from('prompts')
    .select('id, status, thumbnail_path').eq('id', id).maybeSingle()
  if (loadError) throw mapPromptError(loadError, 'delete')
  if (!prompt || prompt.status !== 'draft') throw new PromptAdminError('draftOnly')

  const { data, error } = await client.from('prompts').delete()
    .eq('id', id).eq('status', 'draft').select('id').maybeSingle()
  if (error) throw mapPromptError(error, 'delete')
  if (!data) throw new PromptAdminError('draftOnly')

  let cleanupFailed = false
  if (isPromptThumbnailPath(prompt.thumbnail_path, id)) {
    const { error: cleanupError } = await client.storage.from(PROMPT_ASSETS_BUCKET).remove([prompt.thumbnail_path])
    cleanupFailed = Boolean(cleanupError)
  }
  return { id: data.id, cleanupFailed }
}

export function mapPromptError(error, fallbackCode) {
  if (error?.code === '23505' && `${error.message} ${error.details}`.includes('slug')) {
    return new PromptAdminError('slugConflict', error)
  }
  if (error?.code === '42P01' || error?.code === 'PGRST205' || /prompts.*(?:does not exist|schema cache)/i.test(error?.message || '')) {
    return new PromptAdminError('migrationRequired', error)
  }
  return new PromptAdminError(fallbackCode, error)
}
