export function slugifyPrompt(value) {
  if (typeof value !== 'string') return ''
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function isValidPromptSlug(value) {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

export const isPromptSlug = isValidPromptSlug

export function normalizePromptSlug(value) {
  if (typeof value !== 'string' || !value.trim()) return ''
  return slugifyPrompt(value)
}

export function proposePromptSlug({ suggestedSlug, title } = {}) {
  return slugifyPrompt(suggestedSlug) || slugifyPrompt(title)
}
