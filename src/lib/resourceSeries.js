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

export function sortSeriesEpisodes(resources, seriesReference = '') {
  if (!Array.isArray(resources)) return []

  return [...resources].sort((left, right) => {
    const leftEpisode = getMembershipPosition(left, seriesReference)
    const rightEpisode = getMembershipPosition(right, seriesReference)

    if (leftEpisode !== null && rightEpisode === null) return -1
    if (leftEpisode === null && rightEpisode !== null) return 1
    if (leftEpisode !== null && rightEpisode !== null && leftEpisode !== rightEpisode) {
      return leftEpisode - rightEpisode
    }

    const dateComparison = compareDatesAscending(getPublishedAt(left), getPublishedAt(right))
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
    for (const membership of getMemberships(resource)) {
      if (!membership.seriesId || !membership.slug || !membership.name) continue
      const group = groups.get(membership.seriesId) || {
        id: membership.seriesId,
        slug: membership.slug,
        name: membership.name,
        resources: [],
      }
      group.resources.push(resource)
      groups.set(membership.seriesId, group)
    }
  })

  const series = Array.from(groups.values(), (group) => {
    const orderedResources = sortSeriesEpisodes(group.resources, group.id)

    return {
      id: group.id,
      name: group.name,
      slug: group.slug,
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

export function buildPublicSeries(seriesRows, resources) {
  const publishedResources = Array.isArray(resources) ? resources : []
  const rows = Array.isArray(seriesRows) ? seriesRows : []

  return sortSeriesByActivity(rows.flatMap((row) => {
    const id = cleanText(row?.id)
    const slug = cleanText(row?.slug)
    const name = cleanText(row?.name)
    if (!id || !slug || !name) return []

    const members = publishedResources.filter((resource) =>
      getMemberships(resource).some((membership) => membership.seriesId === id))
    if (members.length === 0) return []

    const orderedResources = sortSeriesEpisodes(members, id)
    return [{
      id,
      slug,
      name,
      description: cleanText(row.description),
      objective: cleanText(row.objective),
      thumbnailPath: cleanText(row.thumbnail_path) || null,
      resources: orderedResources,
      episodeCount: orderedResources.length,
      latestActivity: getLatestActivity(orderedResources),
      commonLevel: getCommonSeriesLevel(orderedResources),
      firstEpisode: orderedResources[0] || null,
      previews: orderedResources.slice(0, 3),
    }]
  }))
}

export function buildSeriesNavigationContexts(series, currentResource) {
  if (!Array.isArray(series)) return []

  return series.flatMap((item) => {
    const membership = getMemberships(currentResource)
      .find((candidate) => candidate.seriesId === item?.id)
    if (!membership) return []
    const hasCurrent = item.resources?.some((resource) => matchesCurrentResource(resource, currentResource))
    if (!hasCurrent) return []
    return [{
      series: item,
      membership,
      ...getAdjacentEpisodes(item.resources, currentResource),
    }]
  })
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

export function findSeriesBySlug(series, slug) {
  if (!Array.isArray(series) || typeof slug !== 'string') return null
  return series.find((item) => item?.slug === slug) || null
}

export function getAdjacentEpisodes(orderedEpisodes, currentResource) {
  if (!Array.isArray(orderedEpisodes) || orderedEpisodes.length === 0) {
    return { previous: null, next: null }
  }

  const currentIndex = orderedEpisodes.findIndex((episode) =>
    matchesCurrentResource(episode, currentResource))
  if (currentIndex === -1) return { previous: null, next: null }

  return {
    previous: currentIndex > 0 ? orderedEpisodes[currentIndex - 1] : null,
    next:
      currentIndex < orderedEpisodes.length - 1
        ? orderedEpisodes[currentIndex + 1]
        : null,
  }
}

function getPublishedAt(resource) {
  return resource?.publishedAt ?? resource?.published_at
}

function getTitle(resource) {
  return typeof resource?.title === 'string' ? resource.title.trim() : ''
}

function getMemberships(resource) {
  return Array.isArray(resource?.seriesMemberships) ? resource.seriesMemberships : []
}

function getMembershipPosition(resource, reference) {
  const membership = getMemberships(resource).find((item) => (
    reference ? item.seriesId === reference || item.slug === reference : true
  ))
  return Number.isInteger(membership?.position) && membership.position > 0
    ? membership.position
    : null
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : ''
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
    const publishedAt = getPublishedAt(resource)
    const timestamp = getDateTimestamp(publishedAt, Number.NEGATIVE_INFINITY)
    if (timestamp > latestTimestamp) {
      latestTimestamp = timestamp
      latestActivity = publishedAt
    }
  })

  return latestActivity
}

function matchesCurrentResource(resource, currentResource) {
  if (currentResource && typeof currentResource === 'object') {
    if (resource?.id !== currentResource.id) return false
    if (!currentResource.contentType) return true
    return resource?.contentType === currentResource.contentType
  }
  return resource?.id === currentResource
}
