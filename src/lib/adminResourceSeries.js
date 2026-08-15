import { createSeriesSlug } from './resourceSeries.js'
import { isSeriesThumbnailPathForSlug } from './seriesThumbnails.js'
import { supabase } from './supabase.js'

const SERIES_COLUMNS =
  'id, slug, name, description, objective, thumbnail_path, thumbnail_generated_at, created_at, updated_at'
const MEMBERSHIP_COLUMNS = `
  id,
  series_id,
  article_id,
  infographic_id,
  position,
  created_at,
  updated_at,
  article:articles!resource_series_memberships_article_id_fkey(id, title, slug, status, published_at),
  infographic:infographics!resource_series_memberships_infographic_id_fkey(id, title, status, published_at)
`

export const SERIES_THUMBNAIL_BUCKET = 'infographics'

export class ResourceSeriesAdminError extends Error {
  constructor(code, cause) {
    super(code)
    this.name = 'ResourceSeriesAdminError'
    this.code = code
    this.cause = cause
  }
}

export async function fetchAdminResourceSeries(client = supabase) {
  const [{ data: seriesRows, error: seriesError }, { data: membershipRows, error: membershipError }] =
    await Promise.all([
      client.from('resource_series').select(SERIES_COLUMNS).order('name', { ascending: true }),
      client.from('resource_series_memberships').select(MEMBERSHIP_COLUMNS),
    ])

  if (seriesError) throw mapResourceSeriesError(seriesError, 'load')
  if (membershipError) throw mapResourceSeriesError(membershipError, 'load')

  return attachResourceSeriesCounts(seriesRows || [], membershipRows || [])
}

export async function fetchAdminResourceSeriesById(id, client = supabase) {
  const { data, error } = await client
    .from('resource_series')
    .select(SERIES_COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (error) throw mapResourceSeriesError(error, 'load')
  if (!data) throw new ResourceSeriesAdminError('notFound')
  return data
}

export async function createAdminResourceSeries(payload, client = supabase) {
  const cleanPayload = normalizeResourceSeriesPayload(payload)
  const { data, error } = await client
    .from('resource_series')
    .insert(cleanPayload)
    .select(SERIES_COLUMNS)
    .single()

  if (error) throw mapResourceSeriesError(error, 'save')
  return data
}

export async function updateAdminResourceSeries(id, payload, client = supabase) {
  const cleanPayload = normalizeResourceSeriesPayload(payload)
  const { data, error } = await client
    .from('resource_series')
    .update(cleanPayload)
    .eq('id', id)
    .select(SERIES_COLUMNS)
    .maybeSingle()

  if (error) throw mapResourceSeriesError(error, 'save')
  if (!data) throw new ResourceSeriesAdminError('notFound')
  return data
}

export async function deleteAdminResourceSeries(series, client = supabase) {
  const { data, error } = await client
    .from('resource_series')
    .delete()
    .eq('id', series.id)
    .select('id')
    .maybeSingle()

  if (error) throw mapResourceSeriesError(error, 'delete')
  if (!data) throw new ResourceSeriesAdminError('notFound')

  let cleanupFailed = false
  const thumbnailPath = cleanOptionalText(series.thumbnail_path)
  if (thumbnailPath) {
    if (isSeriesThumbnailPathForSlug(thumbnailPath, series.slug)) {
      const { error: cleanupError } = await client.storage
        .from(SERIES_THUMBNAIL_BUCKET)
        .remove([thumbnailPath])
      cleanupFailed = Boolean(cleanupError)
    } else {
      cleanupFailed = true
    }
  }

  return { id: data.id, cleanupFailed }
}

export async function fetchAdminSeriesMemberships(seriesId, client = supabase) {
  const { data, error } = await client
    .from('resource_series_memberships')
    .select(MEMBERSHIP_COLUMNS)
    .eq('series_id', seriesId)

  if (error) throw mapResourceSeriesError(error, 'membershipsLoad')
  return sortAdminSeriesMemberships((data || []).map(normalizeMembership))
}

export async function updateAdminSeriesMembershipPosition(
  { membershipId, seriesId, position },
  client = supabase,
) {
  const cleanPosition = normalizePosition(position)
  const { data, error } = await client
    .from('resource_series_memberships')
    .update({ position: cleanPosition })
    .eq('id', membershipId)
    .eq('series_id', seriesId)
    .select(MEMBERSHIP_COLUMNS)
    .maybeSingle()

  if (error) throw mapResourceSeriesError(error, 'positionSave')
  if (!data) throw new ResourceSeriesAdminError('membershipNotFound')
  return normalizeMembership(data)
}

export async function deleteAdminSeriesMembership(
  { membershipId, seriesId },
  client = supabase,
) {
  const { data, error } = await client
    .from('resource_series_memberships')
    .delete()
    .eq('id', membershipId)
    .eq('series_id', seriesId)
    .select('id')
    .maybeSingle()

  if (error) throw mapResourceSeriesError(error, 'membershipDelete')
  if (!data) throw new ResourceSeriesAdminError('membershipNotFound')
  return data
}

export function attachResourceSeriesCounts(seriesRows, membershipRows) {
  const counts = new Map()
  for (const membership of membershipRows) {
    const current = counts.get(membership.series_id) || { resourceCount: 0, publishedCount: 0 }
    current.resourceCount += 1
    const resource = membership.article || membership.infographic
    if (resource?.status === 'published') current.publishedCount += 1
    counts.set(membership.series_id, current)
  }

  return seriesRows.map((series) => ({
    ...series,
    ...(counts.get(series.id) || { resourceCount: 0, publishedCount: 0 }),
  }))
}

export function sortAdminSeriesMemberships(memberships) {
  return [...memberships].sort((left, right) => {
    const leftPosition = normalizePositionForSort(left.position)
    const rightPosition = normalizePositionForSort(right.position)
    if (leftPosition !== rightPosition) return leftPosition - rightPosition

    const dateDifference = dateForSort(left.publishedAt) - dateForSort(right.publishedAt)
    if (dateDifference !== 0) return dateDifference
    return left.title.localeCompare(right.title, undefined, { sensitivity: 'base' })
  })
}

export function proposeResourceSeriesSlug(name) {
  return createSeriesSlug(name)
}

export function normalizeResourceSeriesPayload(payload) {
  const name = typeof payload?.name === 'string' ? payload.name.trim() : ''
  const slug = createSeriesSlug(payload?.slug || '')
  if (!name) throw new ResourceSeriesAdminError('nameRequired')
  if (!slug) throw new ResourceSeriesAdminError('slugRequired')

  return {
    name,
    slug,
    description: cleanOptionalText(payload.description),
    objective: cleanOptionalText(payload.objective),
  }
}

export function normalizePosition(value) {
  if (value === null || value === undefined || value === '') return null
  const position = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(position) || position <= 0) {
    throw new ResourceSeriesAdminError('positionInvalid')
  }
  return position
}

export function mapResourceSeriesError(error, fallbackCode) {
  const details = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`
  if (error?.code === '23505' && /series_position|position/i.test(details)) {
    return new ResourceSeriesAdminError('positionConflict', error)
  }
  if (error?.code === '23505' && /slug|resource_series_slug_key/i.test(details)) {
    return new ResourceSeriesAdminError('slugConflict', error)
  }
  if (error?.code === '42501' || /row-level security|permission denied/i.test(details)) {
    return new ResourceSeriesAdminError('forbidden', error)
  }
  if (error?.code === '42P01' || error?.code === 'PGRST205' || /schema cache/i.test(details)) {
    return new ResourceSeriesAdminError('migrationRequired', error)
  }
  return new ResourceSeriesAdminError(fallbackCode, error)
}

function normalizeMembership(row) {
  const article = row.article || null
  const infographic = row.infographic || null
  const resource = article || infographic || {}
  return {
    ...row,
    format: article ? 'article' : 'infographic',
    resourceId: article?.id || infographic?.id || row.article_id || row.infographic_id,
    title: cleanOptionalText(resource.title) || '',
    status: resource.status || 'draft',
    slug: article?.slug || null,
    publishedAt: resource.published_at || null,
  }
}

function normalizePositionForSort(value) {
  return Number.isInteger(value) && value > 0 ? value : Number.POSITIVE_INFINITY
}

function dateForSort(value) {
  const timestamp = typeof value === 'string' ? Date.parse(value) : Number.NaN
  return Number.isFinite(timestamp) ? timestamp : Number.POSITIVE_INFINITY
}

function cleanOptionalText(value) {
  if (typeof value !== 'string') return null
  const cleanValue = value.trim()
  return cleanValue || null
}
