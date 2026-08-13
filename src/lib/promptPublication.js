import { isValidPromptSlug, slugifyPrompt } from './promptSlug.js'

export class PromptPublicationValidationError extends Error {
  constructor(code) {
    super(code)
    this.name = 'PromptPublicationValidationError'
    this.code = code
  }
}

export function getPromptPublishTransition(current, publishedAt = new Date()) {
  if (!current) throw new PromptPublicationValidationError('notFound')
  if (current.status !== 'draft') throw new PromptPublicationValidationError('draftOnly')
  if (typeof current.slug !== 'string' || !current.slug.trim()) {
    throw new PromptPublicationValidationError('slugRequired')
  }

  const slug = slugifyPrompt(current.slug)
  if (!slug || !isValidPromptSlug(slug)) {
    throw new PromptPublicationValidationError('slugInvalid')
  }

  return { slug, status: 'published', published_at: publishedAt.toISOString() }
}

export function getPromptUnpublishTransition() {
  return { status: 'draft', published_at: null }
}

export function canEnablePromptPublish({
  dirty = false,
  savedPromptId,
  saving = false,
  thumbnailBusy = false,
  transitioning = false,
} = {}) {
  return Boolean(savedPromptId) && !dirty && !saving && !thumbnailBusy && !transitioning
}
