import { supabase } from './supabase.js'
import { calculateArticleReadingTime } from './articleMarkdown.js'
import { getInfographicImageCandidates } from './infographicThumbnails.js'
import { fetchPublishedArticlesForCatalog } from './publicArticles.js'
import { applyPublishedFilter } from './publicInfographicQuery.js'
import {
  loadPublishedCatalog,
  mergePublicResources,
  querySeriesThumbnailRows,
} from './publicResourceCatalog.js'

const BUCKET = 'infographics'
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PUBLIC_COLUMNS =
  'id, published_at, image_path, thumbnail_path, title, subtitle, summary, introduction, image_alt, theme, level, reading_time_minutes, series_name, episode_number, key_points, takeaway, sources'
const PUBLIC_SHOWCASE_COLUMNS =
  'id, published_at, image_path, thumbnail_path, title, summary, theme, level, reading_time_minutes, series_name, episode_number'

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

export async function fetchPublishedInfographicsBySeries(seriesName, client = supabase) {
  const cleanSeriesName = typeof seriesName === 'string' ? seriesName.trim() : ''
  if (!cleanSeriesName) return []

  const query = client.from('infographics').select(PUBLIC_COLUMNS)
  const { data, error } = await applyPublishedFilter(query)
    .eq('series_name', cleanSeriesName)
    .order('published_at', { ascending: false })

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
    getInfographicImageUrl: (path) => getInfographicImageUrl(path, client),
    calculateArticleReadingTime,
    logger,
  })
}

export async function fetchPublishedSeriesResources(
  seriesName,
  client = supabase,
  logger = console,
) {
  const cleanSeriesName = typeof seriesName === 'string' ? seriesName.trim() : ''
  if (!cleanSeriesName) return []

  const [infographicRows, articleResult] = await Promise.all([
    fetchPublishedInfographicsBySeries(cleanSeriesName, client),
    fetchPublishedArticlesForCatalog(client, { seriesName: cleanSeriesName, logger }),
  ])

  return mergePublicResources({
    infographicRows,
    articleRows: articleResult.rows,
    articleCoverUrls: articleResult.coverUrls,
    getInfographicImageUrl: (path) => getInfographicImageUrl(path, client),
    calculateArticleReadingTime,
  }).resources
}

export function getInfographicImageUrl(imagePath, client = supabase) {
  if (!imagePath) return null
  return client.storage.from(BUCKET).getPublicUrl(imagePath).data.publicUrl
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
