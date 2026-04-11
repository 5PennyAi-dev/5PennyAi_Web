export function localizedField(post, field, lang) {
  if (!post) return ''
  const key = `${field}_${lang}`
  const value = post[key]
  if (value && value.trim()) return value
  return post[`${field}_fr`] || ''
}
