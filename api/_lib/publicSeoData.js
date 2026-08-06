import { isArticleCoverPath } from '../../src/lib/articleAssetRules.js'
import { slugifyArticle } from '../../src/lib/articleSlug.js'
import { isValidInfographicId } from '../../src/lib/infographicSeo.js'

export function getPublicSupabaseConfig(env = globalThis.process?.env || {}) {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL
  const key = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Public content service is not configured')
  return { key, url: url.replace(/\/+$/, '') }
}
export async function fetchPublishedArticleSeo(
  requestedSlug,
  { env, fetchImpl = fetch } = {},
) {
  const slug = slugifyArticle(typeof requestedSlug === 'string' ? requestedSlug : '')
  if (!slug) return null
  const config = getPublicSupabaseConfig(env)
  const url = new URL('/rest/v1/articles', `${config.url}/`)
  url.searchParams.set('slug', `eq.${slug}`)
  url.searchParams.set('status', 'eq.published')
  url.searchParams.set(
    'select',
    'id,slug,title,summary,language,seo,cover,cover_path,published_at,updated_at,status',
  )
  url.searchParams.set('limit', '1')
  const rows = await fetchSupabaseJson(url, config, fetchImpl)
  const row = rows?.[0]
  if (!row) return null
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    language: row.language,
    seo: row.seo && typeof row.seo === 'object' ? row.seo : {},
    cover: row.cover && typeof row.cover === 'object' ? { altText: row.cover.altText } : {},
    coverPath: isArticleCoverPath(row.cover_path, row.id) ? row.cover_path : '',
    hasCover: isArticleCoverPath(row.cover_path, row.id),
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  }
}

export async function fetchPublishedInfographicSeo(
  requestedId,
  { env, fetchImpl = fetch } = {},
) {
  if (!isValidInfographicId(requestedId)) return null
  const config = getPublicSupabaseConfig(env)
  const url = new URL('/rest/v1/infographics', `${config.url}/`)
  url.searchParams.set('id', `eq.${requestedId}`)
  url.searchParams.set('status', 'eq.published')
  url.searchParams.set(
    'select',
    'id,title,summary,introduction,image_alt,thumbnail_path,status',
  )
  url.searchParams.set('limit', '1')
  const rows = await fetchSupabaseJson(url, config, fetchImpl)
  const row = rows?.[0]
  if (
    !row
    || row.status !== 'published'
    || String(row.id).toLocaleLowerCase() !== requestedId.toLocaleLowerCase()
  ) return null
  return {
    id: row.id,
    imageAlt: row.image_alt,
    introduction: row.introduction,
    summary: row.summary,
    thumbnailPath: row.thumbnail_path,
    title: row.title,
  }
}

export async function fetchPublishedSitemapRows({ env, fetchImpl = fetch } = {}) {
  const config = getPublicSupabaseConfig(env)
  const articleUrl = createPublishedRowsUrl(
    config.url,
    'articles',
    'slug,series_name,published_at,updated_at,status',
  )
  const infographicUrl = createPublishedRowsUrl(
    config.url,
    'infographics',
    'id,series_name,published_at,updated_at,status',
  )
  const [articleRows, infographicRows] = await Promise.all([
    fetchSupabaseJson(articleUrl, config, fetchImpl),
    fetchSupabaseJson(infographicUrl, config, fetchImpl),
  ])
  return { articleRows: articleRows || [], infographicRows: infographicRows || [] }
}

export async function createSignedArticleCoverUrl(
  article,
  { env, expiresIn = 600, fetchImpl = fetch } = {},
) {
  if (!article?.coverPath || !isArticleCoverPath(article.coverPath, article.id)) return ''
  const config = getPublicSupabaseConfig(env)
  const encodedPath = article.coverPath.split('/').map(encodeURIComponent).join('/')
  const url = `${config.url}/storage/v1/object/sign/article-assets/${encodedPath}`
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: supabaseHeaders(config, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ expiresIn }),
  })
  if (!response.ok) throw new Error(`Unable to sign article cover (${response.status})`)
  const result = await response.json()
  const signedPath = result?.signedURL || result?.signedUrl || result?.signed_url
  if (!signedPath) throw new Error('Article cover signature is missing')
  return resolveSupabaseStorageUrl(signedPath, config.url)
}

function resolveSupabaseStorageUrl(signedPath, supabaseUrl) {
  if (/^https?:\/\//i.test(signedPath)) return new URL(signedPath).toString()

  // The raw Storage API returns `/object/sign/...`, whereas supabase-js
  // normally exposes a URL prefixed with `/storage/v1`. Both forms are valid.
  const normalizedPath = /^\/?object\//.test(signedPath)
    ? `/storage/v1/${signedPath.replace(/^\/+/, '')}`
    : signedPath
  return new URL(normalizedPath, `${supabaseUrl}/`).toString()
}

async function fetchSupabaseJson(url, config, fetchImpl) {
  const response = await fetchImpl(url, { headers: supabaseHeaders(config) })
  if (!response.ok) throw new Error(`Public content query failed (${response.status})`)
  return response.json()
}

function createPublishedRowsUrl(baseUrl, table, select) {
  const url = new URL(`/rest/v1/${table}`, `${baseUrl}/`)
  url.searchParams.set('status', 'eq.published')
  url.searchParams.set('select', select)
  return url
}

function supabaseHeaders(config, extra = {}) {
  return {
    apikey: config.key,
    Authorization: `Bearer ${config.key}`,
    ...extra,
  }
}
