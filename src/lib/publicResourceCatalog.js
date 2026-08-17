import { getInfographicImageCandidates } from './infographicThumbnails.js'
import { buildPublicSeries, sortSeriesEpisodes } from './resourceSeries.js'
import { matchesResourceTopic } from './resourceTopics.js'
import { isPromptCategory } from './promptTaxonomies.js'

export const RESOURCE_FORMATS = Object.freeze({
  ALL: 'all',
  INFOGRAPHICS: 'infographies',
  ARTICLES: 'articles',
  PROMPTS: 'prompt',
})

export const RESOURCE_LEVELS = Object.freeze([
  'beginner',
  'intermediate',
  'advanced',
])

export const RESOURCE_PAGE_SIZE = 12

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
    level: row.level,
    keywords: cleanStringArray(row.keywords),
    seriesMemberships: [],
    topicMemberships: [],
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
    level: row.level,
    keywords: cleanStringArray(row.keywords),
    seriesMemberships: [],
    topicMemberships: [],
    publishedAt: row.published_at,
    readingTimeMinutes: readingTime(row.content_markdown),
    thumbnailUrl: coverUrl || null,
    thumbnailSources,
    publicUrl: row.slug ? `/ressources-ia/articles/${row.slug}` : '',
  }
}

export function adaptPromptToPublicResource(row = {}, { thumbnailUrl = null } = {}) {
  const thumbnailSources = thumbnailUrl
    ? [{ path: row.thumbnail_path || null, url: thumbnailUrl, kind: 'thumbnail' }]
    : []

  return {
    id: row.id,
    contentType: 'prompt',
    title: row.title,
    summary: row.summary,
    level: row.level,
    publishedAt: row.published_at,
    thumbnailUrl: thumbnailUrl || null,
    thumbnailSources,
    publicUrl: row.slug ? `/ressources-ia/prompts/${row.slug}` : '',
    category: cleanText(row.category),
    contexts: cleanStringArray(row.contexts),
    keywords: cleanStringArray(row.keywords),
    seriesMemberships: [],
    topicMemberships: [],
  }
}

export function mergePublicResources({
  infographicRows = [],
  articleRows = [],
  promptRows = [],
  articleCoverUrls = {},
  promptThumbnailUrls = {},
  getInfographicImageUrl = () => null,
  calculateArticleReadingTime = () => null,
  seriesRows = [],
  membershipRows = [],
  topicRows = [],
  topicMembershipRows = [],
} = {}) {
  const infographics = publishedRows(infographicRows).map((row) =>
    adaptInfographicToPublicResource(row, { getImageUrl: getInfographicImageUrl }))
  const articles = publishedRows(articleRows).map((row) =>
    adaptArticleToPublicResource(row, {
      coverUrl: articleCoverUrls[row.id] || null,
      readingTime: calculateArticleReadingTime,
    }))
  const prompts = publishedRows(promptRows).map((row) =>
    adaptPromptToPublicResource(row, {
      thumbnailUrl: promptThumbnailUrls[row.id] || null,
    }))

  const resourcesWithSeries = attachSeriesMemberships(
    [...infographics, ...articles, ...prompts],
    seriesRows,
    membershipRows,
  )
  const attachedResources = attachResourceTopicMemberships(
    resourcesWithSeries,
    topicRows,
    topicMembershipRows,
  )
  const byKey = new Map(attachedResources.map((resource) => [getPublicResourceKey(resource), resource]))
  const withMemberships = (items) => items.map((resource) => byKey.get(getPublicResourceKey(resource)))
  const resources = sortResourcesByPublishedAt(attachedResources)

  return {
    resources,
    infographics: withMemberships(infographics),
    articles: withMemberships(articles),
    prompts: withMemberships(prompts),
    series: buildPublicSeries(seriesRows, resources),
  }
}

export function attachSeriesMemberships(resources, seriesRows, membershipRows) {
  const seriesById = new Map((Array.isArray(seriesRows) ? seriesRows : [])
    .filter((series) => cleanText(series?.id) && cleanText(series?.slug) && cleanText(series?.name))
    .map((series) => [series.id, series]))
  const membershipsByResource = new Map()

  for (const row of Array.isArray(membershipRows) ? membershipRows : []) {
    const series = seriesById.get(row?.series_id)
    const resourceKey = membershipResourceKey(row)
    if (!series || !resourceKey) continue
    const memberships = membershipsByResource.get(resourceKey) || []
    memberships.push({
      membershipId: row.id,
      seriesId: series.id,
      slug: cleanText(series.slug),
      name: cleanText(series.name),
      position: normalizeMembershipPosition(row.position),
    })
    membershipsByResource.set(resourceKey, memberships)
  }

  return (Array.isArray(resources) ? resources : []).map((resource) => ({
    ...resource,
    seriesMemberships: resource?.contentType === 'prompt'
      ? []
      : sortMemberships(membershipsByResource.get(getPublicResourceKey(resource)) || []),
  }))
}

export function attachResourceTopicMemberships(resources, topicRows, membershipRows) {
  const topicsById = new Map((Array.isArray(topicRows) ? topicRows : [])
    .filter((topic) => cleanText(topic?.id) && cleanText(topic?.slug))
    .map((topic) => [topic.id, topic]))
  const membershipsByResource = new Map()

  for (const row of Array.isArray(membershipRows) ? membershipRows : []) {
    const topic = topicsById.get(row?.topic_id)
    const resourceKey = membershipResourceKey(row)
    if (!topic || !resourceKey) continue
    const memberships = membershipsByResource.get(resourceKey) || []
    if (!memberships.some(({ topicId }) => topicId === topic.id)) {
      memberships.push({
        membershipId: row.id,
        topicId: topic.id,
        slug: cleanText(topic.slug),
        nameFr: cleanText(topic.name_fr),
        nameEn: cleanText(topic.name_en),
      })
    }
    membershipsByResource.set(resourceKey, memberships)
  }

  return (Array.isArray(resources) ? resources : []).map((resource) => ({
    ...resource,
    topicMemberships: resource?.contentType === 'prompt'
      ? []
      : sortTopicMemberships(membershipsByResource.get(getPublicResourceKey(resource)) || []),
  }))
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

export function normalizeResourceFormat(
  value,
  hasPublishedArticles = true,
  hasPublishedPrompts = false,
) {
  if (value === RESOURCE_FORMATS.INFOGRAPHICS) return RESOURCE_FORMATS.INFOGRAPHICS
  if (value === RESOURCE_FORMATS.ARTICLES && hasPublishedArticles) return RESOURCE_FORMATS.ARTICLES
  if (value === RESOURCE_FORMATS.PROMPTS && hasPublishedPrompts) return RESOURCE_FORMATS.PROMPTS
  return RESOURCE_FORMATS.ALL
}

export function normalizeResourceLevel(value) {
  return RESOURCE_LEVEL_SET.has(value) ? value : ''
}

export function normalizeCatalogSearchParams(
  searchParams,
  {
    hasPublishedArticles = false,
    hasPublishedPrompts = false,
    hasValidTopic = false,
    isSeriesView = false,
    totalPages = null,
  } = {},
) {
  const nextParams = new URLSearchParams(searchParams)
  let hasChanges = false
  const remove = (parameter) => {
    if (!nextParams.has(parameter)) return
    nextParams.delete(parameter)
    hasChanges = true
  }

  if (isSeriesView) {
    ['serie', 'format', 'q', 'niveau', 'sujet', 'categorie', 'page'].forEach(remove)
    return { hasChanges, nextParams }
  }

  const rawFormat = nextParams.get('format') || ''
  const isValidFormat = rawFormat === RESOURCE_FORMATS.INFOGRAPHICS
    || (rawFormat === RESOURCE_FORMATS.ARTICLES && hasPublishedArticles)
    || (rawFormat === RESOURCE_FORMATS.PROMPTS && hasPublishedPrompts)
  if (rawFormat && !isValidFormat) remove('format')
  if (nextParams.has('niveau') && !normalizeResourceLevel(nextParams.get('niveau'))) remove('niveau')

  if (rawFormat === RESOURCE_FORMATS.PROMPTS && hasPublishedPrompts) {
    remove('sujet')
    remove('serie')
    if (nextParams.has('categorie') && !isPromptCategory(nextParams.get('categorie'))) {
      remove('categorie')
    }
  } else {
    if (nextParams.has('sujet') && !hasValidTopic) remove('sujet')
    remove('categorie')
  }

  if (nextParams.has('page')) {
    const rawPage = nextParams.get('page')
    const page = parseCatalogPage(rawPage)
    const hasKnownPageCount = Number.isInteger(totalPages) && totalPages >= 0

    if (page === 1 || (hasKnownPageCount && totalPages <= 1)) {
      remove('page')
    } else if (hasKnownPageCount && page > totalPages) {
      nextParams.set('page', String(totalPages))
      hasChanges = true
    } else if (rawPage !== String(page)) {
      nextParams.set('page', String(page))
      hasChanges = true
    }
  }

  return { hasChanges, nextParams }
}

export function parseCatalogPage(value) {
  const rawValue = String(value ?? '')
  if (!/^\d+$/.test(rawValue)) return 1

  const page = Number(rawValue)
  return Number.isSafeInteger(page) && page >= 1 ? page : 1
}

export function paginatePublicResources(
  resources,
  requestedPage,
  pageSize = RESOURCE_PAGE_SIZE,
) {
  const items = Array.isArray(resources) ? resources : []
  const safePageSize = Number.isSafeInteger(pageSize) && pageSize > 0
    ? pageSize
    : RESOURCE_PAGE_SIZE
  const totalResults = items.length
  const totalPages = Math.ceil(totalResults / safePageSize)
  const currentPage = totalPages > 0
    ? Math.min(parseCatalogPage(requestedPage), totalPages)
    : 1
  const start = (currentPage - 1) * safePageSize

  return {
    currentPage,
    resources: items.slice(start, start + safePageSize),
    totalPages,
    totalResults,
  }
}

export function updateCatalogCriteria(searchParams, updates = {}) {
  const nextParams = new URLSearchParams(searchParams)

  for (const [parameter, value] of Object.entries(updates)) {
    if (value == null || value === '') nextParams.delete(parameter)
    else nextParams.set(parameter, String(value))
  }
  nextParams.delete('page')
  return nextParams
}

export function getCatalogPaginationItems(currentPage, totalPages) {
  if (!Number.isSafeInteger(totalPages) || totalPages <= 1) return []
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1])
  if (currentPage <= 4) [2, 3, 4, 5].forEach((page) => pages.add(page))
  if (currentPage >= totalPages - 3) {
    [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1]
      .forEach((page) => pages.add(page))
  }

  const visiblePages = [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right)
  const items = []
  visiblePages.forEach((page, index) => {
    if (index > 0 && page - visiblePages[index - 1] > 1) {
      items.push(`ellipsis-${visiblePages[index - 1]}`)
    }
    items.push(page)
  })
  return items
}

export function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function buildResourceSearchText(resource = {}, promptTaxonomyLabels = []) {
  return normalizeSearchText([
    resource?.title,
    resource?.subtitle,
    resource?.summary,
    ...(resource?.seriesMemberships || []).map((membership) => membership.name),
    ...(resource?.topicMemberships || []).flatMap((membership) => [membership.nameFr, membership.nameEn]),
    resource?.category,
    ...cleanStringArray(resource?.contexts),
    ...cleanStringArray(resource?.keywords),
    ...(resource?.contentType === 'prompt' ? cleanStringArray(promptTaxonomyLabels) : []),
  ].filter(Boolean).join(' '))
}

export function matchesResourceSearch(resource, query, promptTaxonomyLabels = []) {
  const terms = normalizeSearchText(query).split(' ').filter(Boolean)
  if (terms.length === 0) return true

  const searchText = buildResourceSearchText(resource, promptTaxonomyLabels)
  return terms.every((term) => searchText.includes(term))
}

export function filterPublicResources(
  resources,
  {
    format = RESOURCE_FORMATS.ALL,
    level = '',
    query = '',
    seriesSlug = '',
    topic = '',
    category = '',
    getPromptTaxonomyLabels = () => [],
  } = {},
) {
  if (!Array.isArray(resources)) return []

  const selectedLevel = normalizeResourceLevel(level)

  const filtered = resources.filter((resource) => {
    if (!matchesResourceSearch(resource, query, getPromptTaxonomyLabels(resource))) return false
    if (seriesSlug && !getSeriesMembership(resource, seriesSlug)) return false
    if (selectedLevel && resource?.level !== selectedLevel) return false
    if (category && resource?.category !== category) return false
    if (!matchesResourceTopic(resource, topic)) return false
    if (format === RESOURCE_FORMATS.INFOGRAPHICS) return resource?.contentType === 'infographic'
    if (format === RESOURCE_FORMATS.ARTICLES) return resource?.contentType === 'article'
    if (format === RESOURCE_FORMATS.PROMPTS) return resource?.contentType === 'prompt'
    return true
  })

  return seriesSlug ? sortSeriesEpisodes(filtered, seriesSlug) : filtered
}

export function getPublicResourceKey(resource) {
  if (!resource || resource.id == null) return ''
  return `${resource.contentType || 'resource'}:${resource.id}`
}

export function getResourceSeriesDisplay(resource, selectedSeriesSlug = '') {
  const memberships = Array.isArray(resource?.seriesMemberships) ? resource.seriesMemberships : []
  const membership = selectedSeriesSlug
    ? memberships.find((item) => item.slug === selectedSeriesSlug) || null
    : memberships[0] || null
  const multipleInGeneralView = !selectedSeriesSlug && memberships.length > 1

  return {
    membership,
    additionalCount: multipleInGeneralView ? memberships.length - 1 : 0,
    position: multipleInGeneralView ? null : normalizeMembershipPosition(membership?.position),
  }
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

export async function fetchPublicSeriesRows(client, { ids = [], slug = '' } = {}) {
  let query = client
    .from('resource_series')
    .select('id, slug, name, description, objective, thumbnail_path')
  if (slug) query = query.eq('slug', slug)
  if (ids.length > 0) query = query.in('id', ids)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function fetchPublicSeriesMembershipRows(
  client,
  { resourceId = '', resourceType = '', seriesIds = [] } = {},
) {
  let query = client
    .from('resource_series_memberships')
    .select('id, series_id, article_id, infographic_id, position')
  if (seriesIds.length > 0) query = query.in('series_id', seriesIds)
  if (resourceId && resourceType === 'article') query = query.eq('article_id', resourceId)
  if (resourceId && resourceType === 'infographic') query = query.eq('infographic_id', resourceId)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function fetchPublicResourceTopicRows(client) {
  const { data, error } = await client
    .from('resource_topics')
    .select('id, slug, name_fr, name_en')
  if (error) throw error
  return data || []
}

export async function fetchPublicResourceTopicMembershipRows(
  client,
  { resourceId = '', resourceType = '' } = {},
) {
  let query = client
    .from('resource_topic_memberships')
    .select('id, topic_id, article_id, infographic_id')
  if (resourceId && resourceType === 'article') query = query.eq('article_id', resourceId)
  if (resourceId && resourceType === 'infographic') query = query.eq('infographic_id', resourceId)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function loadPublishedCatalog({
  client,
  fetchInfographics,
  fetchArticles = async () => ({ rows: [], coverUrls: {} }),
  fetchPrompts = async () => ({ rows: [], thumbnailUrls: {} }),
  getInfographicImageUrl,
  calculateArticleReadingTime,
  fetchSeries = fetchPublicSeriesRows,
  fetchMemberships = fetchPublicSeriesMembershipRows,
  fetchTopics = fetchPublicResourceTopicRows,
  fetchTopicMemberships = fetchPublicResourceTopicMembershipRows,
  logger = console,
}) {
  const [infographicRows, articleResult, promptResult, seriesRows, membershipRows, topicRows, topicMembershipRows] = await Promise.all([
    fetchInfographics(client),
    fetchArticles(client, { logger }),
    fetchPrompts(client, { logger }),
    fetchSeries(client),
    fetchMemberships(client),
    fetchTopics(client),
    fetchTopicMemberships(client),
  ])
  const articleRows = Array.isArray(articleResult) ? articleResult : articleResult?.rows || []
  const articleCoverUrls = Array.isArray(articleResult) ? {} : articleResult?.coverUrls || {}
  const promptRows = Array.isArray(promptResult) ? promptResult : promptResult?.rows || []
  const promptThumbnailUrls = Array.isArray(promptResult) ? {} : promptResult?.thumbnailUrls || {}
  const catalog = mergePublicResources({
    infographicRows,
    articleRows,
    articleCoverUrls,
    promptRows,
    promptThumbnailUrls,
    getInfographicImageUrl,
    calculateArticleReadingTime,
    seriesRows,
    membershipRows,
    topicRows,
    topicMembershipRows,
  })
  return { ...catalog, seriesRows, membershipRows, topicRows, topicMembershipRows }
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

function membershipResourceKey(row) {
  const hasArticle = cleanText(row?.article_id)
  const hasInfographic = cleanText(row?.infographic_id)
  if (Boolean(hasArticle) === Boolean(hasInfographic)) return ''
  return hasArticle ? `article:${hasArticle}` : `infographic:${hasInfographic}`
}

function normalizeMembershipPosition(value) {
  return Number.isInteger(value) && value > 0 ? value : null
}

function sortMemberships(memberships) {
  return [...memberships].sort((left, right) => (
    left.name.localeCompare(right.name, undefined, { sensitivity: 'base' })
    || left.slug.localeCompare(right.slug)
    || String(left.membershipId).localeCompare(String(right.membershipId))
  ))
}

function sortTopicMemberships(memberships) {
  return [...memberships].sort((left, right) => (
    left.nameFr.localeCompare(right.nameFr, 'fr', { sensitivity: 'base' })
    || left.nameEn.localeCompare(right.nameEn, 'en', { sensitivity: 'base' })
    || left.slug.localeCompare(right.slug)
    || String(left.membershipId).localeCompare(String(right.membershipId))
  ))
}

function getSeriesMembership(resource, slug) {
  return (Array.isArray(resource?.seriesMemberships) ? resource.seriesMemberships : [])
    .find((membership) => membership.slug === slug)
}
