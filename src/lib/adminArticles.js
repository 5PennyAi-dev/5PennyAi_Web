import { supabase } from './supabase.js'
import {
  ARTICLE_ASSETS_BUCKET,
  collectArticleObjectPaths,
  fetchArticleAssets,
} from './articleAssets.js'
import {
  ArticlePublicationValidationError,
  getPublishTransition,
  getUnpublishTransition,
} from './articlePublication.js'

const LIST_COLUMNS =
  'id, status, slug, title, language, level, series_name, episode_number, updated_at, published_at'

export class ArticleAdminError extends Error {
  constructor(code, cause) {
    super(code)
    this.name = 'ArticleAdminError'
    this.code = code
    this.cause = cause
  }
}

export async function fetchAdminArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select(LIST_COLUMNS)
    .order('updated_at', { ascending: false })

  if (error) throw mapArticleError(error, 'load')
  return data || []
}

export async function fetchAdminArticle(id) {
  const { data, error } = await supabase.from('articles').select('*').eq('id', id).maybeSingle()

  if (error) throw mapArticleError(error, 'load')
  if (!data) throw new ArticleAdminError('notFound')
  return data
}

export async function createArticleDraft(payload) {
  const { data, error } = await supabase
    .from('articles')
    .insert({ ...payload, status: 'draft', published_at: null })
    .select('*')
    .single()

  if (error) throw mapArticleError(error, 'save')
  return data
}

export async function updateArticleDraft(id, payload) {
  const { data, error } = await supabase
    .from('articles')
    .update({ ...payload, status: 'draft', published_at: null })
    .eq('id', id)
    .eq('status', 'draft')
    .select('*')
    .maybeSingle()

  if (error) throw mapArticleError(error, 'save')
  if (!data) throw new ArticleAdminError('draftOnly')
  return data
}

export async function publishArticle(articleId, client = supabase, publishedAt = new Date()) {
  const { data: current, error: loadError } = await client
    .from('articles')
    .select('id, slug, status')
    .eq('id', articleId)
    .maybeSingle()

  if (loadError) throw mapArticleError(loadError, 'publish')
  if (!current) throw new ArticleAdminError('notFound')
  if (current.status !== 'draft') throw new ArticleAdminError('draftOnly')

  let transition
  try {
    transition = getPublishTransition(current, publishedAt)
  } catch (error) {
    if (error instanceof ArticlePublicationValidationError) throw new ArticleAdminError(error.code, error)
    throw error
  }

  const { data, error } = await client
    .from('articles')
    .update(transition)
    .eq('id', articleId)
    .eq('status', 'draft')
    .select('*')
    .maybeSingle()

  if (error) throw mapArticleError(error, 'publish')
  if (!data) throw new ArticleAdminError('draftOnly')
  return data
}

export async function unpublishArticle(articleId, client = supabase) {
  const { data, error } = await client
    .from('articles')
    .update(getUnpublishTransition())
    .eq('id', articleId)
    .eq('status', 'published')
    .select('*')
    .maybeSingle()

  if (error) throw mapArticleError(error, 'unpublish')
  if (!data) throw new ArticleAdminError('publishedOnly')
  return data
}

export async function deleteArticleDraft(id, client = supabase) {
  const { data: article, error: loadError } = await client
    .from('articles')
    .select('id, cover_path, infographic_path, status')
    .eq('id', id)
    .maybeSingle()
  if (loadError) throw mapArticleError(loadError, 'delete')
  if (!article || article.status !== 'draft') throw new ArticleAdminError('draftOnly')

  let assets
  try {
    assets = await fetchArticleAssets(id, client)
  } catch (error) {
    throw mapArticleError(error, 'delete')
  }

  const { data, error } = await client
    .from('articles')
    .delete()
    .eq('id', id)
    .eq('status', 'draft')
    .select('id')
    .maybeSingle()

  if (error) throw mapArticleError(error, 'delete')
  if (!data) throw new ArticleAdminError('draftOnly')

  const paths = collectArticleObjectPaths({ ...article, assets })
  let cleanupFailed = false
  if (paths.length) {
    const { error: cleanupError } = await client.storage.from(ARTICLE_ASSETS_BUCKET).remove(paths)
    cleanupFailed = Boolean(cleanupError)
  }
  return { id: data.id, cleanupFailed, paths }
}

export function mapArticleError(error, fallbackCode) {
  if (error?.code === '23505' && `${error.message} ${error.details}`.includes('slug')) {
    return new ArticleAdminError('slugConflict', error)
  }

  if (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    /(?:relation ["']?(?:articles|article_media_assets)["']? does not exist|(?:articles|article_media_assets).*schema cache)/i.test(error?.message || '')
  ) {
    return new ArticleAdminError('migrationRequired', error)
  }

  return new ArticleAdminError(fallbackCode, error)
}
