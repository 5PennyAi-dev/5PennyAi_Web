import { supabase } from './supabase.js'

const RESOURCE_FIELDS = {
  article: 'article_id',
  infographic: 'infographic_id',
}

const MEMBERSHIP_COLUMNS = `
  id,
  series_id,
  article_id,
  infographic_id,
  position,
  created_at,
  updated_at,
  series:resource_series!resource_series_memberships_series_id_fkey(id, name, slug)
`
const SERIES_COLUMNS = 'id, name, slug'

export class ResourceSeriesMembershipError extends Error {
  constructor(code, cause) {
    super(code)
    this.name = 'ResourceSeriesMembershipError'
    this.code = code
    this.cause = cause
  }
}

export async function listResourceMemberships(
  { resourceType, resourceId },
  client = supabase,
) {
  const resourceField = getResourceField(resourceType)
  const { data, error } = await client
    .from('resource_series_memberships')
    .select(MEMBERSHIP_COLUMNS)
    .eq(resourceField, resourceId)

  if (error) throw mapMembershipError(error, 'load')
  return sortResourceMemberships((data || []).map(normalizeResourceMembership))
}

export async function listAvailableSeries(memberships = [], client = supabase) {
  const { data, error } = await client
    .from('resource_series')
    .select(SERIES_COLUMNS)
    .order('name', { ascending: true })

  if (error) throw mapMembershipError(error, 'load')
  return excludeAssociatedSeries(data || [], memberships)
}

export async function createResourceMembership(
  { resourceType, resourceId, seriesId, position },
  client = supabase,
) {
  const resourceField = getResourceField(resourceType)
  const payload = {
    series_id: seriesId,
    article_id: null,
    infographic_id: null,
    position: normalizeMembershipPosition(position),
    [resourceField]: resourceId,
  }
  const { data, error } = await client
    .from('resource_series_memberships')
    .insert(payload)
    .select(MEMBERSHIP_COLUMNS)
    .single()

  if (error) throw mapMembershipError(error, 'create')
  return normalizeResourceMembership(data)
}

export async function updateMembershipPosition(
  { resourceType, resourceId, membershipId, position },
  client = supabase,
) {
  const resourceField = getResourceField(resourceType)
  const { data, error } = await client
    .from('resource_series_memberships')
    .update({ position: normalizeMembershipPosition(position) })
    .eq('id', membershipId)
    .eq(resourceField, resourceId)
    .select(MEMBERSHIP_COLUMNS)
    .maybeSingle()

  if (error) throw mapMembershipError(error, 'update')
  if (!data) throw new ResourceSeriesMembershipError('notFound')
  return normalizeResourceMembership(data)
}

export async function deleteMembership(
  { resourceType, resourceId, membershipId },
  client = supabase,
) {
  const resourceField = getResourceField(resourceType)
  const { data, error } = await client
    .from('resource_series_memberships')
    .delete()
    .eq('id', membershipId)
    .eq(resourceField, resourceId)
    .select('id')
    .maybeSingle()

  if (error) throw mapMembershipError(error, 'delete')
  if (!data) throw new ResourceSeriesMembershipError('notFound')
  return data
}

export async function listMembershipsForResources(
  { resourceType, resourceIds },
  client = supabase,
) {
  const resourceField = getResourceField(resourceType)
  if (!Array.isArray(resourceIds) || resourceIds.length === 0) return new Map()

  const { data, error } = await client
    .from('resource_series_memberships')
    .select(MEMBERSHIP_COLUMNS)
    .in(resourceField, resourceIds)

  if (error) throw mapMembershipError(error, 'load')
  const result = new Map(resourceIds.map((id) => [id, []]))
  for (const row of data || []) {
    const membership = normalizeResourceMembership(row)
    const resourceId = row[resourceField]
    result.set(resourceId, [...(result.get(resourceId) || []), membership])
  }
  for (const [resourceId, memberships] of result) {
    result.set(resourceId, sortResourceMemberships(memberships))
  }
  return result
}

export function excludeAssociatedSeries(series, memberships) {
  const associatedIds = new Set((memberships || []).map(({ seriesId, series_id }) => seriesId || series_id))
  return (series || []).filter(({ id }) => !associatedIds.has(id))
}

export function normalizeMembershipPosition(value) {
  if (value === '' || value === null || value === undefined) return null
  const position = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(position) || position <= 0) {
    throw new ResourceSeriesMembershipError('positionInvalid')
  }
  return position
}

export function sortResourceMemberships(memberships) {
  return [...memberships].sort((left, right) =>
    (left.seriesName || '').localeCompare(right.seriesName || '', undefined, {
      sensitivity: 'base',
    }),
  )
}

export function mapMembershipError(error, fallbackCode) {
  const details = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`
  if (error?.code === '23505' && /series_position|position/i.test(details)) {
    return new ResourceSeriesMembershipError('positionConflict', error)
  }
  if (error?.code === '23505') {
    return new ResourceSeriesMembershipError('alreadyAssociated', error)
  }
  if (error?.code === '42501' || /row-level security|permission denied/i.test(details)) {
    return new ResourceSeriesMembershipError('forbidden', error)
  }
  if (error?.code === '42P01' || error?.code === 'PGRST205' || /schema cache/i.test(details)) {
    return new ResourceSeriesMembershipError('migrationRequired', error)
  }
  return new ResourceSeriesMembershipError(fallbackCode, error)
}

function getResourceField(resourceType) {
  const field = RESOURCE_FIELDS[resourceType]
  if (!field) throw new ResourceSeriesMembershipError('invalidResourceType')
  return field
}

function normalizeResourceMembership(row) {
  return {
    ...row,
    seriesId: row.series?.id || row.series_id,
    seriesName: row.series?.name || '',
    seriesSlug: row.series?.slug || '',
  }
}
