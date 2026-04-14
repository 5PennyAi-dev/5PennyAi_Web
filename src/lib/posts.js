import { supabase } from '@/lib/supabase'

const LIST_COLUMNS =
  'id, slug, title_fr, title_en, excerpt_fr, excerpt_en, cover_image, tags, published_at, reading_time_minutes'

export async function fetchAllPublishedPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select(LIST_COLUMNS)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function fetchPublishedPosts({ limit = 10, offset = 0 } = {}) {
  const { data, error } = await supabase
    .from('posts')
    .select(LIST_COLUMNS)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data || []
}

export async function fetchPostBySlug(slug) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) throw error
  return data
}

export async function fetchAdjacentPosts(publishedAt) {
  if (!publishedAt) return { previous: null, next: null }

  const [{ data: previousData }, { data: nextData }] = await Promise.all([
    supabase
      .from('posts')
      .select('slug, title_fr, title_en')
      .eq('status', 'published')
      .lt('published_at', publishedAt)
      .order('published_at', { ascending: false })
      .limit(1),
    supabase
      .from('posts')
      .select('slug, title_fr, title_en')
      .eq('status', 'published')
      .gt('published_at', publishedAt)
      .order('published_at', { ascending: true })
      .limit(1),
  ])

  return {
    previous: previousData?.[0] || null,
    next: nextData?.[0] || null,
  }
}

export async function fetchAllPostsAdmin() {
  const { data, error } = await supabase
    .from('posts')
    .select('id, slug, title_fr, status, published_at, updated_at, linkedin_fr')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function fetchPostById(id) {
  const { data, error } = await supabase.from('posts').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function upsertPost(payload) {
  const { data, error } = await supabase.from('posts').upsert(payload).select().single()
  if (error) throw error
  return data
}

export async function deletePost(id) {
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw error
}

export async function updatePostStatus(id, status) {
  const patch = { status }
  if (status === 'published') patch.published_at = new Date().toISOString()
  const { error } = await supabase.from('posts').update(patch).eq('id', id)
  if (error) throw error
}

export async function isSlugTaken(slug, excludeId = null) {
  let query = supabase.from('posts').select('id').eq('slug', slug)
  if (excludeId) query = query.neq('id', excludeId)
  const { data, error } = await query.maybeSingle()
  if (error && error.code !== 'PGRST116') throw error
  return Boolean(data)
}

export function slugify(input) {
  if (!input) return ''
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
