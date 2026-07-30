export function applyPublishedFilter(query) {
  return query.eq('status', 'published')
}
