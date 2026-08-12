import { getInfographicImageCandidates } from './infographicThumbnails.js'
import { createSeriesSlug, sortSeriesEpisodes } from './resourceSeries.js'
import { matchesResourceTopic } from './resourceTopics.js'

export const RESOURCE_FORMATS = Object.freeze({
  ALL: 'all',
  INFOGRAPHICS: 'infographies',
  ARTICLES: 'articles',
})

export const RESOURCE_LEVELS = Object.freeze([
  'beginner',
  'intermediate',
  'advanced',
])

const RESOURCE_LEVEL_SET = new Set(RESOURCE_LEVELS)

export function adaptInfographicToPublicResource(row = {}, { getImageUrl = () => null } = {}) {
  const thumbnailSources = getInfographicImageCandidates(row)
    .map((path, index) => ({
      path,
      url: getImageUrl(path),
      kind: index === 0 && path === cleanText(row.thumbnail_path) ? 'thumbnail' : 'fallback',
    }))
    .filter(({ url }) => Boolean(url))

  return {
    id: row.id,
    contentType: 'infographic',
    title: row.title,
    subtitle: cleanText(row.subtitle),
    summary: row.summary,
    theme: row.theme,
    level: row.level,
    keywords: cleanStringArray(row.keywords),
    seriesName: row.series_name,
    episodeNumber: row.episode_number,
    publishedAt: row.published_at,
    readingTimeMinutes: row.reading_time_minutes,
    thumbnailUrl: thumbnailSources[0]?.url || null,
    thumbnailSources,
    publicUrl: row.id ? `/ressources-ia/infographies/${row.id}` : '',
  }
}

export function adaptArticleToPublicResource(row = {}, { coverUrl = null, readingTime = () => null } = {}) {
  const thumbnailSources = coverUrl
    ? [{ path: row.cover_path || null, url: coverUrl, kind: 'cover' }]
    : []

  return {
    id: row.id,
    contentType: 'article',
    title: row.title,
    subtitle: cleanText(row.subtitle),
    summary: row.summary,
    theme: row.theme,
    level: row.level,
    keywords: cleanStringArray(row.keywords),
    seriesName: row.series_name,
    episodeNumber: row.episode_number,
    publishedAt: row.published_at,
    readingTimeMinutes: readingTime(row.content_markdown),
    thumbnailUrl: coverUrl || null,
    thumbnailSources,
    publicUrl: row.slug ? `/ressources-ia/articles/${row.slug}` : '',
  }
}

export function mergePublicResources({
  infographicRows = [],
  articleRows = [],
  articleCoverUrls = {},
  getInfographicImageUrl = () => null,
  calculateArticleReadingTime = () => null,
} = {}) {
  const infographics = publishedRows(infographicRows).map((row) =>
    adaptInfographicToPublicResource(row, { getImageUrl: getInfographicImageUrl }))
  const articles = publishedRows(articleRows).map((row) =>
    adaptArticleToPublicResource(row, {
      coverUrl: articleCoverUrls[row.id] || null,
      readingTime: calculateArticleReadingTime,
    }))

  return {
    resources: sortResourcesByPublishedAt([...infographics, ...articles]),
    infographics,
    articles,
  }
}

export function sortResourcesByPublishedAt(resources) {
  if (!Array.isArray(resources)) return []

  return resources
    .map((resource, index) => ({ resource, index }))
    .sort((left, right) => {
      const leftTime = validTimestamp(left.resource?.publishedAt)
      const rightTime = validTimestamp(right.resource?.publishedAt)
      if (leftTime !== rightTime) return rightTime - leftTime

      const titleComparison = cleanText(left.resource?.title).localeCompare(
        cleanText(right.resource?.title),
        undefined,
        { sensitivity: 'base' },
      )
      return titleComparison || left.index - right.index
    })
    .map(({ resource }) => resource)
}

export function normalizeResourceFormat(value, hasPublishedArticles = true) {
  if (value === RESOURCE_FORMATS.INFOGRAPHICS) return RESOURCE_FORMATS.INFOGRAPHICS
  if (value === RESOURCE_FORMATS.ARTICLES && hasPublishedArticles) return RESOURCE_FORMATS.ARTICLES
  return RESOURCE_FORMATS.ALL
}

export function normalizeResourceLevel(value) {
  return RESOURCE_LEVEL_SET.has(value) ? value : ''
}

export function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function buildResourceSearchText(resource = {}) {
  return normalizeSearchText([
    resource?.title,
    resource?.subtitle,
    resource?.summary,
    resource?.theme,
    resource?.seriesName,
    ...cleanStringArray(resource?.keywords),
  ].filter(Boolean).join(' '))
}

export function matchesResourceSearch(resource, query) {
  const terms = normalizeSearchText(query).split(' ').filter(Boolean)
  if (terms.length === 0) return true

  const searchText = buildResourceSearchText(resource)
  return terms.every((term) => searchText.includes(term))
}

export function filterPublicResources(
  resources,
  { format = RESOURCE_FORMATS.ALL, level = '', query = '', seriesSlug = '', topic = '' } = {},
) {
  if (!Array.isArray(resources)) return []

  const selectedLevel = normalizeResourceLevel(level)

  const filtered = resources.filter((resource) => {
    if (!matchesResourceSearch(resource, query)) return false
    if (seriesSlug && createSeriesSlug(resource?.seriesName) !== seriesSlug) return false
    if (selectedLevel && resource?.level !== selectedLevel) return false
    if (!matchesResourceTopic(resource, topic)) return false
    if (format === RESOURCE_FORMATS.INFOGRAPHICS) return resource?.contentType === 'infographic'
    if (format === RESOURCE_FORMATS.ARTICLES) return resource?.contentType === 'article'
    return true
  })

  return seriesSlug ? sortSeriesEpisodes(filtered) : filtered
}

export function getPublicResourceKey(resource) {
  if (!resource || resource.id == null) return ''
  return `${resource.contentType || 'resource'}:${resource.id}`
}

export async function querySeriesThumbnailRows(slugs, client) {
  const uniqueSlugs = [...new Set(
    (Array.isArray(slugs) ? slugs : [])
      .filter((slug) => typeof slug === 'string')
      .map((slug) => slug.trim())
      .filter(Boolean),
  )]
  if (uniqueSlugs.length === 0) return []

  const { data, error } = await client
    .from('resource_series')
    .select('slug, thumbnail_path')
    .in('slug', uniqueSlugs)
  if (error) throw error
  return data || []
}

export async function loadPublishedCatalog({
  client,
  fetchInfographics,
  fetchArticles = async () => ({ rows: [], coverUrls: {} }),
  getInfographicImageUrl,
  calculateArticleReadingTime,
  logger = console,
}) {
  const [infographicRows, articleResult] = await Promise.all([
    fetchInfographics(client),
    fetchArticles(client, { logger }),
  ])
  const articleRows = Array.isArray(articleResult) ? articleResult : articleResult?.rows || []
  const articleCoverUrls = Array.isArray(articleResult) ? {} : articleResult?.coverUrls || {}
  const catalog = mergePublicResources({
    infographicRows,
    articleRows,
    articleCoverUrls,
    getInfographicImageUrl,
    calculateArticleReadingTime,
  })
  const seriesSlugs = catalog.resources
    .map((resource) => createSeriesSlug(resource.seriesName))
    .filter(Boolean)

  try {
    const seriesCovers = await querySeriesThumbnailRows(seriesSlugs, client)
    return { ...catalog, seriesCovers, seriesThumbnailRows: seriesCovers }
  } catch (error) {
    logger?.warn?.('Unable to load series thumbnails; using catalog fallbacks:', error?.message)
    return { ...catalog, seriesCovers: [], seriesThumbnailRows: [] }
  }
}

function publishedRows(rows) {
  return (Array.isArray(rows) ? rows : []).filter(
    (row) => !row?.status || row.status === 'published',
  )
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function cleanStringArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
    : []
}

function validTimestamp(value) {
  const timestamp = typeof value === 'string' ? Date.parse(value) : Number.NaN
  return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY
}
