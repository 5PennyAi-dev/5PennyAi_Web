export function slugifyArticle(value) {
  if (typeof value !== 'string') return ''

  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function proposeArticleSlug({ suggestedSlug, title }) {
  return slugifyArticle(suggestedSlug) || slugifyArticle(title)
}

export function resolveArticleSlugProposal({ currentSlug, manuallyEdited, suggestedSlug, title }) {
  if (manuallyEdited) return currentSlug
  return proposeArticleSlug({ suggestedSlug, title })
}
