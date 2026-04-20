import { supabase } from '@/lib/supabase'

export async function saveSearch({ query, raw_research, trends, raw_questions, content_gaps }) {
  const { data, error } = await supabase
    .from('topic_searches')
    .insert({ query, raw_research, trends, raw_questions, content_gaps })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function saveTopic(topic, searchId) {
  const { data, error } = await supabase
    .from('topics')
    .insert({
      search_id: searchId,
      title: topic.title,
      article_type: topic.article_type,
      problem: topic.problem,
      audience: topic.audience,
      angle: topic.angle,
      difficulty: topic.difficulty,
      keywords: topic.keywords,
      keywords_en: topic.keywords_en || [],
      sources: topic.sources,
      blog_precisions: topic.blog_precisions,
      seo_data: topic.seo_data || {},
      business_relevance: topic.business_relevance || null,
      specificity: topic.specificity || null,
      status: 'saved',
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function loadTopics(status = null) {
  let query = supabase
    .from('topics_with_search')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function updateTopicStatus(id, status, postId = null) {
  const updates = { status }
  if (postId) updates.post_id = postId

  const { error } = await supabase.from('topics').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteTopic(id) {
  const { error } = await supabase.from('topics').delete().eq('id', id)
  if (error) throw error
}

export async function loadSearchHistory(limit = 20) {
  const { data, error } = await supabase
    .from('topic_searches')
    .select('id, query, topics_count, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function getTopicStats() {
  const { data, error } = await supabase.rpc('get_topic_stats')
  if (error) throw error
  return data
}
