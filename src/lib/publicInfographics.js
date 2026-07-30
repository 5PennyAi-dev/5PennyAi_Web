import { supabase } from './supabase.js'
import { applyPublishedFilter } from './publicInfographicQuery.js'

const BUCKET = 'infographics'
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PUBLIC_COLUMNS =
  'id, published_at, image_path, title, subtitle, summary, introduction, image_alt, theme, level, reading_time_minutes, series_name, episode_number, key_points, takeaway, sources'

export async function fetchPublishedInfographics(client = supabase) {
  const query = client.from('infographics').select(PUBLIC_COLUMNS)
  const { data, error } = await applyPublishedFilter(query).order('published_at', {
    ascending: false,
  })

  if (error) throw error
  return data || []
}

export async function fetchPublishedInfographic(id, client = supabase) {
  if (typeof id !== 'string' || !UUID_PATTERN.test(id)) return null

  const query = client.from('infographics').select(PUBLIC_COLUMNS).eq('id', id)
  const { data, error } = await applyPublishedFilter(query).maybeSingle()

  if (error) throw error
  return data || null
}

export function getInfographicImageUrl(imagePath, client = supabase) {
  if (!imagePath) return null
  return client.storage.from(BUCKET).getPublicUrl(imagePath).data.publicUrl
}
