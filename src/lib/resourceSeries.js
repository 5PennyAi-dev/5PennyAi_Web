const VALID_LEVELS = new Set(['beginner', 'intermediate', 'advanced'])

export function createSeriesSlug(value) {
  if (typeof value !== 'string') return ''

  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function sortSeriesEpisodes(resources) {
  if (!Array.isArray(resources)) return []

  return [...resources].sort((left, right) => {
    const leftEpisode = getValidEpisodeNumber(left?.episode_number)
    const rightEpisode = getValidEpisodeNumber(right?.episode_number)

    if (leftEpisode !== null && rightEpisode === null) return -1
    if (leftEpisode === null && rightEpisode !== null) return 1
    if (leftEpisode !== null && rightEpisode !== null && leftEpisode !== rightEpisode) {
      return leftEpisode - rightEpisode
    }

    const dateComparison = compareDatesAscending(left?.published_at, right?.published_at)
    if (dateComparison !== 0) return dateComparison

    return getTitle(left).localeCompare(getTitle(right), undefined, {
      sensitivity: 'base',
    })
  })
}

export function getCommonSeriesLevel(resources) {
  if (!Array.isArray(resources) || resources.length === 0) return null

  const levels = resources.map((resource) => resource?.level)
  const firstLevel = levels[0]

  if (!VALID_LEVELS.has(firstLevel)) return null
  return levels.every((level) => level === firstLevel) ? firstLevel : null
}

export function groupResourcesBySeries(resources) {
  if (!Array.isArray(resources)) return []

  const groups = new Map()

  resources.forEach((resource) => {
    const name = getSeriesName(resource?.series_name)
    if (!name) return

    const groupedResources = groups.get(name) || []
    groupedResources.push(resource)
    groups.set(name, groupedResources)
  })

  const series = Array.from(groups, ([name, groupedResources]) => {
    const orderedResources = sortSeriesEpisodes(groupedResources)

    return {
      name,
      slug: createSeriesSlug(name),
      resources: orderedResources,
      episodeCount: orderedResources.length,
      latestActivity: getLatestActivity(orderedResources),
      commonLevel: getCommonSeriesLevel(orderedResources),
      firstEpisode: orderedResources[0] || null,
      previews: orderedResources.slice(0, 3),
    }
  })

  return sortSeriesByActivity(series)
}

export function sortSeriesByActivity(series) {
  if (!Array.isArray(series)) return []

  return [...series].sort((left, right) => {
    const leftActivity = getDateTimestamp(left?.latestActivity, Number.NEGATIVE_INFINITY)
    const rightActivity = getDateTimestamp(right?.latestActivity, Number.NEGATIVE_INFINITY)

    if (leftActivity !== rightActivity) return rightActivity - leftActivity

    return getTitle({ title: left?.name }).localeCompare(
      getTitle({ title: right?.name }),
      undefined,
      { sensitivity: 'base' },
    )
  })
}

export function selectFeaturedSeries(series) {
  return sortSeriesByActivity(series)[0] || null
}

function getSeriesName(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function getValidEpisodeNumber(value) {
  return Number.isInteger(value) && value > 0 ? value : null
}

function getTitle(resource) {
  return typeof resource?.title === 'string' ? resource.title.trim() : ''
}

function compareDatesAscending(left, right) {
  const leftTimestamp = getDateTimestamp(left, Number.POSITIVE_INFINITY)
  const rightTimestamp = getDateTimestamp(right, Number.POSITIVE_INFINITY)

  if (leftTimestamp === rightTimestamp) return 0
  return leftTimestamp - rightTimestamp
}

function getDateTimestamp(value, fallback) {
  const timestamp = typeof value === 'string' ? Date.parse(value) : Number.NaN
  return Number.isFinite(timestamp) ? timestamp : fallback
}

function getLatestActivity(resources) {
  let latestActivity = null
  let latestTimestamp = Number.NEGATIVE_INFINITY

  resources.forEach((resource) => {
    const timestamp = getDateTimestamp(resource?.published_at, Number.NEGATIVE_INFINITY)
    if (timestamp > latestTimestamp) {
      latestTimestamp = timestamp
      latestActivity = resource.published_at
    }
  })

  return latestActivity
}
