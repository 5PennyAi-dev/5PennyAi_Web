import { supabase } from './supabase.js'
import {
  fetchPublishedArticlesForShowcase,
  fetchPublicArticleCoverUrls,
} from './publicArticles.js'
import {
  fetchPublishedInfographicsForShowcase,
  getInfographicImageUrl,
} from './publicInfographics.js'
import {
  fetchPublicSeriesMembershipRows,
  fetchPublicSeriesRows,
  mergePublicResources,
  sortResourcesByPublishedAt,
} from './publicResourceCatalog.js'
import { selectFeaturedSeries } from './resourceSeries.js'

export async function fetchHomeResourceShowcase(client = supabase, logger = console) {
  return loadHomeResourceShowcase({
    client,
    fetchInfographics: fetchPublishedInfographicsForShowcase,
    fetchArticles: fetchPublishedArticlesForShowcase,
    fetchArticleCovers: fetchPublicArticleCoverUrls,
    fetchSeries: fetchPublicSeriesRows,
    fetchMemberships: fetchPublicSeriesMembershipRows,
    getInfographicImageUrl: (path) => getInfographicImageUrl(path, client),
    logger,
  })
}

export async function loadHomeResourceShowcase({
  client,
  fetchInfographics,
  fetchArticles,
  fetchArticleCovers,
  fetchSeries,
  fetchMemberships,
  getInfographicImageUrl = () => null,
  logger = console,
} = {}) {
  const [infographicResult, articleResult, seriesResult, membershipResult] = await Promise.allSettled([
    fetchInfographics(client),
    fetchArticles(client),
    fetchSeries(client),
    fetchMemberships(client),
  ])

  if (infographicResult.status === 'rejected' && articleResult.status === 'rejected') {
    throw new Error('Unable to load public resources')
  }

  if (infographicResult.status === 'rejected') {
    logger?.warn?.('Unable to load homepage infographics:', infographicResult.reason?.message)
  }
  if (articleResult.status === 'rejected') {
    logger?.warn?.('Unable to load homepage articles:', articleResult.reason?.message)
  }
  if (seriesResult.status === 'rejected') {
    logger?.warn?.('Unable to load homepage series:', seriesResult.reason?.message)
  }
  if (membershipResult.status === 'rejected') {
    logger?.warn?.('Unable to load homepage series memberships:', membershipResult.reason?.message)
  }

  const infographicRows =
    infographicResult.status === 'fulfilled' ? infographicResult.value : []
  const articleRows = articleResult.status === 'fulfilled' ? articleResult.value : []
  const seriesRows = seriesResult.status === 'fulfilled' ? seriesResult.value : []
  const membershipRows = membershipResult.status === 'fulfilled' ? membershipResult.value : []
  const initialCatalog = createCatalog({
    infographicRows,
    articleRows,
    getInfographicImageUrl,
    seriesRows,
    membershipRows,
  })
  const initialFeaturedSeries = selectFeaturedSeries(initialCatalog.series)
  const initialSecondaryResources = selectHomeSecondaryResources(initialCatalog.resources)
  const articleIdsNeedingCovers = new Set(
    [
      ...initialSecondaryResources,
      ...(initialFeaturedSeries?.previews || []),
    ]
      .filter(({ contentType }) => contentType === 'article')
      .map(({ id }) => id),
  )

  let articleCoverUrls = {}
  if (articleIdsNeedingCovers.size > 0) {
    try {
      articleCoverUrls = await fetchArticleCovers(
        articleRows.filter(({ id }) => articleIdsNeedingCovers.has(id)),
        client,
        { logger },
      )
    } catch (error) {
      logger?.warn?.('Unable to load homepage article covers:', error?.message)
    }
  }

  const catalog = createCatalog({
    infographicRows,
    articleRows,
    articleCoverUrls,
    getInfographicImageUrl,
    seriesRows,
    membershipRows,
  })

  return {
    resources: catalog.resources,
    featuredSeries: selectFeaturedSeries(catalog.series),
    secondaryResources: selectHomeSecondaryResources(catalog.resources),
    partial:
      [infographicResult, articleResult, seriesResult, membershipResult]
        .some((result) => result.status === 'rejected'),
  }
}

export function selectHomeSecondaryResources(resources) {
  const sorted = sortResourcesByPublishedAt(resources)
  const selected = []

  for (const contentType of ['article', 'infographic']) {
    const resource = sorted.find((item) => item?.contentType === contentType)
    if (resource) selected.push(resource)
  }

  for (const resource of sorted) {
    if (selected.length >= 2) break
    if (!selected.includes(resource)) selected.push(resource)
  }

  return selected
}

export function getSeriesFormatKey(series) {
  const formats = new Set(
    (Array.isArray(series?.resources) ? series.resources : [])
      .map(({ contentType }) => contentType)
      .filter(Boolean),
  )

  if (formats.has('article') && formats.has('infographic')) return 'mixed'
  if (formats.has('article')) return 'articles'
  if (formats.has('infographic')) return 'infographics'
  return ''
}

function createCatalog({
  infographicRows,
  articleRows,
  articleCoverUrls = {},
  getInfographicImageUrl,
  seriesRows = [],
  membershipRows = [],
}) {
  return mergePublicResources({
    infographicRows,
    articleRows,
    articleCoverUrls,
    getInfographicImageUrl,
    calculateArticleReadingTime: () => null,
    seriesRows,
    membershipRows,
  })
}
