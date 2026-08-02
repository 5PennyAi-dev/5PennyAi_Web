import { supabase } from './supabase.js'
import { isArticleCoverPath, isArticleMediaPath } from './articleAssetRules.js'
import { slugifyArticle } from './articleSlug.js'

const ARTICLE_ASSETS_BUCKET = 'article-assets'
const PUBLIC_CATALOG_COLUMNS = [
  'id',
  'slug',
  'title',
  'language',
  'summary',
  'theme',
  'level',
  'series_name',
  'episode_number',
  'content_markdown',
  'cover_path',
  'published_at',
  'updated_at',
].join(', ')
const PUBLIC_COLUMNS = [
  'id',
  'slug',
  'title',
  'language',
  'subtitle',
  'summary',
  'theme',
  'level',
  'series_name',
  'episode_number',
  'learning_objectives',
  'prerequisites',
  'takeaway',
  'content_markdown',
  'media',
  'cover',
  'sources',
  'seo',
  'cover_path',
  'published_at',
  'updated_at',
].join(', ')

export const PUBLIC_ARTICLE_COLUMNS = PUBLIC_COLUMNS
export const PUBLIC_ARTICLE_CATALOG_COLUMNS = PUBLIC_CATALOG_COLUMNS

export function normalizePublicArticleSlug(value) {
  if (typeof value !== 'string' || !value.trim()) return ''
  return slugifyArticle(value)
}

export async function fetchPublishedArticlesForCatalog(
  client = supabase,
  { expiresIn = 3600, logger = console, seriesName = '' } = {},
) {
  let query = client
    .from('articles')
    .select(PUBLIC_CATALOG_COLUMNS)
    .eq('status', 'published')

  const cleanSeriesName = typeof seriesName === 'string' ? seriesName.trim() : ''
  if (cleanSeriesName) query = query.eq('series_name', cleanSeriesName)

  const { data, error } = await query.order('published_at', { ascending: false })
  if (error) throw error

  const rows = data || []
  const coverEntries = await Promise.all(rows.map(async (row) => {
    if (!isArticleCoverPath(row?.cover_path, row?.id)) return null
    try {
      const { data: signed, error: signError } = await client.storage
        .from(ARTICLE_ASSETS_BUCKET)
        .createSignedUrl(row.cover_path, expiresIn)
      if (signError || !signed?.signedUrl) throw signError || new Error('Missing signed URL')
      return [row.id, signed.signedUrl]
    } catch (signError) {
      logger?.warn?.('Unable to sign a published article cover:', signError?.message)
      return null
    }
  }))

  return {
    rows,
    coverUrls: Object.fromEntries(coverEntries.filter(Boolean)),
  }
}

export async function loadPublishedArticleBySlug(
  requestedSlug,
  client = supabase,
  { expiresIn = 3600, logger = console } = {},
) {
  const slug = normalizePublicArticleSlug(requestedSlug)
  if (!slug) return { state: 'not-found' }

  const { data: row, error } = await client
    .from('articles')
    .select(PUBLIC_COLUMNS)
    .eq('slug', slug)
    .eq('status', 'published')
    .limit(1)
    .maybeSingle()

  if (error) return { state: 'error', error }
  if (!row) return { state: 'not-found' }

  let assets = []
  try {
    const result = await client
      .from('article_media_assets')
      .select('media_key, storage_path')
      .eq('article_id', row.id)
      .order('created_at')
    if (result.error) throw result.error
    assets = (result.data || []).filter((asset) =>
      isArticleMediaPath(asset?.storage_path, row.id, asset?.media_key),
    )
  } catch (assetError) {
    logger.warn('Unable to load published article media assets:', assetError.message)
  }

  const assetUrls = {}
  const signable = [
    ...(isArticleCoverPath(row.cover_path, row.id) ? [row.cover_path] : []),
    ...assets.map((asset) => asset.storage_path),
  ]

  await Promise.all([...new Set(signable)].map(async (path) => {
    try {
      const { data, error: signError } = await client.storage
        .from(ARTICLE_ASSETS_BUCKET)
        .createSignedUrl(path, expiresIn)
      if (signError || !data?.signedUrl) throw signError || new Error('Missing signed URL')
      assetUrls[path] = data.signedUrl
    } catch (signError) {
      logger.warn('Unable to sign a published article asset:', signError?.message)
    }
  }))

  const article = sanitizePublishedArticle(row)
  const coverPath = isArticleCoverPath(row.cover_path, row.id) ? row.cover_path : null
  return {
    state: 'found',
    article,
    assets,
    assetUrls,
    coverUrl: coverPath ? assetUrls[coverPath] || null : null,
  }
}

export function sanitizePublishedArticle(row = {}) {
  const media = Array.isArray(row.media)
    ? row.media.map((item) => ({
        key: item?.key,
        kind: item?.kind,
        title: item?.title,
        caption: item?.caption,
        altText: item?.altText,
      }))
    : []
  const seo = row.seo && typeof row.seo === 'object'
    ? { seoTitle: row.seo.seoTitle, metaDescription: row.seo.metaDescription }
    : {}
  const cover = row.cover && typeof row.cover === 'object'
    ? { altText: row.cover.altText }
    : {}

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    language: row.language,
    subtitle: row.subtitle,
    summary: row.summary,
    theme: row.theme,
    level: row.level,
    series: { name: row.series_name, episodeNumber: row.episode_number },
    learningObjectives: Array.isArray(row.learning_objectives) ? row.learning_objectives : [],
    prerequisites: Array.isArray(row.prerequisites) ? row.prerequisites : [],
    takeaway: row.takeaway,
    contentMarkdown: row.content_markdown,
    media,
    cover,
    hasCover: isArticleCoverPath(row.cover_path, row.id),
    sources: Array.isArray(row.sources)
      ? row.sources.filter((source) => source && typeof source === 'object').map((source) => ({
          key: source.key,
          title: source.title,
          authors: Array.isArray(source.authors) ? source.authors : [],
          organization: source.organization,
          publicationDate: source.publicationDate,
          url: source.url,
          accessDate: source.accessDate,
        }))
      : [],
    seo,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  }
}
