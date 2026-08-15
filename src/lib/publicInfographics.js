import { supabase } from './supabase.js'
import { calculateArticleReadingTime } from './articleMarkdown.js'
import { getInfographicImageCandidates } from './infographicThumbnails.js'
import { fetchPublishedArticlesForCatalog } from './publicArticles.js'
import { fetchPublishedPromptsForCatalog } from './publicPrompts.js'
import { applyPublishedFilter } from './publicInfographicQuery.js'
import { buildSeriesNavigationContexts, createSeriesSlug } from './resourceSeries.js'
import {
  fetchPublicSeriesMembershipRows,
  fetchPublicSeriesRows,
  loadPublishedCatalog,
  mergePublicResources,
  querySeriesThumbnailRows,
} from './publicResourceCatalog.js'

const BUCKET = 'infographics'
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PUBLIC_COLUMNS =
  'id, published_at, image_path, thumbnail_path, title, subtitle, summary, introduction, image_alt, theme, level, reading_time_minutes, key_points, takeaway, keywords, sources'
const PUBLIC_SHOWCASE_COLUMNS =
  'id, published_at, image_path, thumbnail_path, title, summary, theme, level, reading_time_minutes'
const DOWNLOADABLE_IMAGE_EXTENSIONS = new Set(['avif', 'gif', 'jpeg', 'jpg', 'png', 'webp'])

export async function fetchPublishedInfographics(client = supabase) {
  const query = client.from('infographics').select(PUBLIC_COLUMNS)
  const { data, error } = await applyPublishedFilter(query).order('published_at', {
    ascending: false,
  })

  if (error) throw error
  return data || []
}

export async function fetchPublishedInfographicsForShowcase(client = supabase) {
  const query = client.from('infographics').select(PUBLIC_SHOWCASE_COLUMNS)
  const { data, error } = await applyPublishedFilter(query).order('published_at', {
    ascending: false,
  })

  if (error) throw error
  return data || []
}

export async function fetchPublishedInfographicsByIds(ids, client = supabase) {
  const cleanIds = [...new Set((Array.isArray(ids) ? ids : []).filter(Boolean))]
  if (cleanIds.length === 0) return []
  const query = client.from('infographics').select(PUBLIC_COLUMNS).in('id', cleanIds)
  const { data, error } = await applyPublishedFilter(query).order('published_at', {
    ascending: false,
  })
  if (error) throw error
  return data || []
}

export async function fetchPublishedInfographic(id, client = supabase) {
  if (typeof id !== 'string' || !UUID_PATTERN.test(id)) return null

  const query = client.from('infographics').select(PUBLIC_COLUMNS).eq('id', id)
  const { data, error } = await applyPublishedFilter(query).maybeSingle()

  if (error) throw error
  return data || null
}

export async function fetchSeriesThumbnailRows(slugs, client = supabase) {
  return querySeriesThumbnailRows(slugs, client)
}

export async function fetchPublishedCatalog(client = supabase, logger = console) {
  return loadPublishedCatalog({
    client,
    fetchInfographics: fetchPublishedInfographics,
    fetchArticles: fetchPublishedArticlesForCatalog,
    fetchPrompts: fetchPublishedPromptsForCatalog,
    getInfographicImageUrl: (path) => getInfographicImageUrl(path, client),
    calculateArticleReadingTime,
    logger,
  })
}

export async function fetchPublishedSeriesResources(
  seriesSlug,
  client = supabase,
  logger = console,
) {
  const cleanSlug = typeof seriesSlug === 'string' ? seriesSlug.trim() : ''
  if (!cleanSlug) return []
  const catalog = await fetchPublishedCatalog(client, logger)
  return catalog.series.find((series) => series.slug === cleanSlug)?.resources || []
}

export async function loadPublishedSeriesBySlug(
  requestedSlug,
  client = supabase,
  logger = console,
) {
  const slug = typeof requestedSlug === 'string' ? requestedSlug.trim() : ''
  if (!slug) return null
  const seriesRows = await fetchPublicSeriesRows(client, { slug })
  const series = seriesRows.find((row) => row.slug === slug)
  if (!series) return null

  const membershipRows = await fetchPublicSeriesMembershipRows(client, {
    seriesIds: [series.id],
  })
  const { articleIds, infographicIds } = collectResourceIds(membershipRows)
  const [infographicRows, articleResult] = await Promise.all([
    fetchPublishedInfographicsByIds(infographicIds, client),
    fetchPublishedArticlesForCatalog(client, { ids: articleIds, logger }),
  ])
  return mergePublicResources({
    infographicRows,
    articleRows: articleResult.rows,
    articleCoverUrls: articleResult.coverUrls,
    getInfographicImageUrl: (path) => getInfographicImageUrl(path, client),
    calculateArticleReadingTime,
    seriesRows: [series],
    membershipRows,
  }).series[0] || null
}

export async function loadPublishedSeriesNavigation(
  { contentType, id },
  client = supabase,
  logger = console,
) {
  if (!id || !['article', 'infographic'].includes(contentType)) return []
  const currentMemberships = await fetchPublicSeriesMembershipRows(client, {
    resourceId: id,
    resourceType: contentType,
  })
  const seriesIds = [...new Set(currentMemberships.map((row) => row.series_id).filter(Boolean))]
  if (seriesIds.length === 0) return []

  const [seriesRows, membershipRows] = await Promise.all([
    fetchPublicSeriesRows(client, { ids: seriesIds }),
    fetchPublicSeriesMembershipRows(client, { seriesIds }),
  ])
  const { articleIds, infographicIds } = collectResourceIds(membershipRows)
  const [infographicRows, articleResult] = await Promise.all([
    fetchPublishedInfographicsByIds(infographicIds, client),
    fetchPublishedArticlesForCatalog(client, { ids: articleIds, logger }),
  ])
  const catalog = mergePublicResources({
    infographicRows,
    articleRows: articleResult.rows,
    articleCoverUrls: articleResult.coverUrls,
    getInfographicImageUrl: (path) => getInfographicImageUrl(path, client),
    calculateArticleReadingTime,
    seriesRows,
    membershipRows,
  })
  const current = catalog.resources.find((resource) => (
    resource.id === id && resource.contentType === contentType
  ))
  return current ? buildSeriesNavigationContexts(catalog.series, current) : []
}

export function getInfographicImageUrl(imagePath, client = supabase) {
  if (!imagePath) return null
  return client.storage.from(BUCKET).getPublicUrl(imagePath).data.publicUrl
}

export function getInfographicDownloadFileName(title, imagePath) {
  if (typeof imagePath !== 'string') return null

  const extension = imagePath.split(/[?#]/, 1)[0].match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase()
  if (!extension || !DOWNLOADABLE_IMAGE_EXTENSIONS.has(extension)) return null

  return `${createSeriesSlug(title) || 'infographie'}.${extension}`
}

export function getInfographicPreviewSources(resource, client = supabase) {
  const thumbnailPath =
    typeof resource?.thumbnail_path === 'string' ? resource.thumbnail_path.trim() : ''

  return getInfographicImageCandidates(resource).map((path) => ({
    path,
    url: getInfographicImageUrl(path, client),
    kind: path === thumbnailPath ? 'thumbnail' : 'fallback',
  }))
}

function collectResourceIds(membershipRows) {
  return {
    articleIds: [...new Set(membershipRows.map((row) => row.article_id).filter(Boolean))],
    infographicIds: [...new Set(membershipRows.map((row) => row.infographic_id).filter(Boolean))],
  }
}
