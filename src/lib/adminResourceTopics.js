import { createSeriesSlug } from './resourceSeries.js'
import { supabase } from './supabase.js'

const TOPIC_COLUMNS = 'id, slug, name_fr, name_en, description_fr, description_en, created_at, updated_at'
const MEMBERSHIP_COLUMNS = `
  id,
  topic_id,
  article_id,
  infographic_id,
  article:articles!resource_topic_memberships_article_id_fkey(id, title, slug, status, published_at),
  infographic:infographics!resource_topic_memberships_infographic_id_fkey(id, title, status, published_at)
`

export class ResourceTopicAdminError extends Error {
  constructor(code, cause) {
    super(code)
    this.name = 'ResourceTopicAdminError'
    this.code = code
    this.cause = cause
  }
}

export async function fetchAdminResourceTopics(client = supabase) {
  const [{ data: topics, error: topicError }, { data: memberships, error: membershipError }] = await Promise.all([
    client.from('resource_topics').select(TOPIC_COLUMNS).order('name_fr', { ascending: true }),
    client.from('resource_topic_memberships').select(MEMBERSHIP_COLUMNS),
  ])
  if (topicError) throw mapResourceTopicError(topicError, 'load')
  if (membershipError) throw mapResourceTopicError(membershipError, 'load')
  return attachResourceTopicCounts(topics || [], memberships || [])
}

export async function fetchAdminResourceTopicById(id, client = supabase) {
  const { data, error } = await client.from('resource_topics').select(TOPIC_COLUMNS).eq('id', id).maybeSingle()
  if (error) throw mapResourceTopicError(error, 'load')
  if (!data) throw new ResourceTopicAdminError('notFound')
  return data
}

export async function fetchAdminResourceTopicMemberships(topicId, client = supabase) {
  const { data, error } = await client
    .from('resource_topic_memberships')
    .select(MEMBERSHIP_COLUMNS)
    .eq('topic_id', topicId)
  if (error) throw mapResourceTopicError(error, 'membershipsLoad')
  return sortAdminResourceTopicMemberships((data || []).map(normalizeTopicMembership))
}

export async function createAdminResourceTopic(payload, client = supabase) {
  const { data, error } = await client
    .from('resource_topics')
    .insert(normalizeResourceTopicPayload(payload))
    .select(TOPIC_COLUMNS)
    .single()
  if (error) throw mapResourceTopicError(error, 'save')
  return data
}

export async function updateAdminResourceTopic(id, payload, client = supabase) {
  const { data, error } = await client
    .from('resource_topics')
    .update(normalizeResourceTopicPayload(payload))
    .eq('id', id)
    .select(TOPIC_COLUMNS)
    .maybeSingle()
  if (error) throw mapResourceTopicError(error, 'save')
  if (!data) throw new ResourceTopicAdminError('notFound')
  return data
}

export async function deleteAdminResourceTopic(topic, client = supabase) {
  const { data, error } = await client.from('resource_topics').delete().eq('id', topic.id).select('id').maybeSingle()
  if (error) throw mapResourceTopicError(error, 'delete')
  if (!data) throw new ResourceTopicAdminError('notFound')
  return data
}

export async function deleteAdminResourceTopicMembership({ membershipId, topicId }, client = supabase) {
  const { data, error } = await client
    .from('resource_topic_memberships')
    .delete()
    .eq('id', membershipId)
    .eq('topic_id', topicId)
    .select('id')
    .maybeSingle()
  if (error) throw mapResourceTopicError(error, 'membershipDelete')
  if (!data) throw new ResourceTopicAdminError('membershipNotFound')
  return data
}

export function attachResourceTopicCounts(topics, memberships) {
  const counts = new Map()
  for (const membership of memberships) {
    const count = counts.get(membership.topic_id) || { resourceCount: 0, publishedCount: 0 }
    count.resourceCount += 1
    if ((membership.article || membership.infographic)?.status === 'published') count.publishedCount += 1
    counts.set(membership.topic_id, count)
  }
  return topics.map((topic) => ({ ...topic, ...(counts.get(topic.id) || { resourceCount: 0, publishedCount: 0 }) }))
}

export function normalizeResourceTopicPayload(payload) {
  const name_fr = cleanRequired(payload?.name_fr, 'nameFrRequired')
  const name_en = cleanRequired(payload?.name_en, 'nameEnRequired')
  const slug = createSeriesSlug(payload?.slug || '')
  if (!slug) throw new ResourceTopicAdminError('slugRequired')
  return {
    name_fr,
    name_en,
    slug,
    description_fr: cleanOptionalText(payload?.description_fr),
    description_en: cleanOptionalText(payload?.description_en),
  }
}

export function proposeResourceTopicSlug(name) {
  return createSeriesSlug(name)
}

export function sortAdminResourceTopicMemberships(memberships) {
  return [...memberships].sort((left, right) => left.title.localeCompare(right.title, undefined, { sensitivity: 'base' }))
}

export function mapResourceTopicError(error, fallbackCode) {
  const details = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`
  if (error?.code === '23505' && /slug|resource_topics_slug_key/i.test(details)) return new ResourceTopicAdminError('slugConflict', error)
  if (error?.code === '42501' || /row-level security|permission denied/i.test(details)) return new ResourceTopicAdminError('forbidden', error)
  if (error?.code === '42P01' || error?.code === 'PGRST205' || /schema cache/i.test(details)) return new ResourceTopicAdminError('migrationRequired', error)
  return new ResourceTopicAdminError(fallbackCode, error)
}

function normalizeTopicMembership(row) {
  const article = row.article || null
  const infographic = row.infographic || null
  const resource = article || infographic || {}
  return {
    ...row,
    format: article ? 'article' : 'infographic',
    resourceId: article?.id || infographic?.id || row.article_id || row.infographic_id,
    title: cleanOptionalText(resource.title) || '',
    status: resource.status || 'draft',
  }
}

function cleanRequired(value, code) {
  const cleanValue = typeof value === 'string' ? value.trim() : ''
  if (!cleanValue) throw new ResourceTopicAdminError(code)
  return cleanValue
}

function cleanOptionalText(value) {
  const cleanValue = typeof value === 'string' ? value.trim() : ''
  return cleanValue || null
}
