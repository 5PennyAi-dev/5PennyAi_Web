import { supabase } from './supabase.js'

const LIST_COLUMNS =
  'id, status, title, language, level, series_name, episode_number, updated_at, published_at'

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

export async function deleteArticleDraft(id) {
  const { data, error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id)
    .eq('status', 'draft')
    .select('id')
    .maybeSingle()

  if (error) throw mapArticleError(error, 'delete')
  if (!data) throw new ArticleAdminError('draftOnly')
  return data.id
}

function mapArticleError(error, fallbackCode) {
  if (error?.code === '23505' && `${error.message} ${error.details}`.includes('slug')) {
    return new ArticleAdminError('slugConflict', error)
  }

  if (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    /(?:relation ["']?articles["']? does not exist|articles.*schema cache)/i.test(error?.message || '')
  ) {
    return new ArticleAdminError('migrationRequired', error)
  }

  return new ArticleAdminError(fallbackCode, error)
}
