import { createSeriesSlug } from './resourceSeries.js'

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

export async function loadPublishedCatalog({ client, fetchInfographics, logger = console }) {
  const infographics = await fetchInfographics(client)
  const seriesSlugs = infographics
    .map((resource) => createSeriesSlug(resource.series_name))
    .filter(Boolean)

  try {
    return {
      infographics,
      seriesThumbnailRows: await querySeriesThumbnailRows(seriesSlugs, client),
    }
  } catch (error) {
    logger?.warn?.('Unable to load series thumbnails; using catalog fallbacks:', error?.message)
    return { infographics, seriesThumbnailRows: [] }
  }
}
