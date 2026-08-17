import { supabase } from './supabase.js'

const RESOURCE_FIELDS = { article: 'article_id', infographic: 'infographic_id' }
const TOPIC_COLUMNS = 'id, slug, name_fr, name_en'
const MEMBERSHIP_COLUMNS = `
  id,
  topic_id,
  article_id,
  infographic_id,
  topic:resource_topics!resource_topic_memberships_topic_id_fkey(id, slug, name_fr, name_en)
`

export class ResourceTopicMembershipError extends Error {
  constructor(code, cause) {
    super(code)
    this.name = 'ResourceTopicMembershipError'
    this.code = code
    this.cause = cause
  }
}

export async function listResourceTopicMemberships({ resourceType, resourceId }, client = supabase) {
  const resourceField = getResourceField(resourceType)
  const { data, error } = await client.from('resource_topic_memberships').select(MEMBERSHIP_COLUMNS).eq(resourceField, resourceId)
  if (error) throw mapResourceTopicMembershipError(error, 'load')
  return sortResourceTopicMemberships((data || []).map(normalizeMembership))
}

export async function listAvailableResourceTopics(memberships = [], client = supabase) {
  const { data, error } = await client.from('resource_topics').select(TOPIC_COLUMNS).order('name_fr', { ascending: true })
  if (error) throw mapResourceTopicMembershipError(error, 'load')
  return excludeAssociatedResourceTopics(data || [], memberships)
}

export async function createResourceTopicMembership({ resourceType, resourceId, topicId }, client = supabase) {
  const resourceField = getResourceField(resourceType)
  const { data, error } = await client
    .from('resource_topic_memberships')
    .insert({ topic_id: topicId, article_id: null, infographic_id: null, [resourceField]: resourceId })
    .select(MEMBERSHIP_COLUMNS)
    .single()
  if (error) throw mapResourceTopicMembershipError(error, 'create')
  return normalizeMembership(data)
}

export async function deleteResourceTopicMembership({ resourceType, resourceId, membershipId }, client = supabase) {
  const resourceField = getResourceField(resourceType)
  const { data, error } = await client
    .from('resource_topic_memberships')
    .delete()
    .eq('id', membershipId)
    .eq(resourceField, resourceId)
    .select('id')
    .maybeSingle()
  if (error) throw mapResourceTopicMembershipError(error, 'delete')
  if (!data) throw new ResourceTopicMembershipError('notFound')
  return data
}

export function excludeAssociatedResourceTopics(topics, memberships) {
  const associatedIds = new Set((memberships || []).map(({ topicId, topic_id }) => topicId || topic_id))
  return (topics || []).filter(({ id }) => !associatedIds.has(id))
}

export function sortResourceTopicMemberships(memberships) {
  return [...memberships].sort((left, right) => left.topicName.localeCompare(right.topicName, undefined, { sensitivity: 'base' }))
}

export function mapResourceTopicMembershipError(error, fallbackCode) {
  const details = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`
  if (error?.code === '23505') return new ResourceTopicMembershipError('alreadyAssociated', error)
  if (error?.code === '42501' || /row-level security|permission denied/i.test(details)) return new ResourceTopicMembershipError('forbidden', error)
  if (error?.code === '42P01' || error?.code === 'PGRST205' || /schema cache/i.test(details)) return new ResourceTopicMembershipError('migrationRequired', error)
  return new ResourceTopicMembershipError(fallbackCode, error)
}

function getResourceField(resourceType) {
  const field = RESOURCE_FIELDS[resourceType]
  if (!field) throw new ResourceTopicMembershipError('invalidResourceType')
  return field
}

function normalizeMembership(row) {
  return {
    ...row,
    topicId: row.topic?.id || row.topic_id,
    topicName: row.topic?.name_fr || '',
    topicSlug: row.topic?.slug || '',
  }
}
