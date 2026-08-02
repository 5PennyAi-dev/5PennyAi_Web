import { isValidArticleSlug, slugifyArticle } from './articleSlug.js'

export class ArticlePublicationValidationError extends Error {
  constructor(code) {
    super(code)
    this.name = 'ArticlePublicationValidationError'
    this.code = code
  }
}

export function getPublishTransition(current, publishedAt = new Date()) {
  if (!current) throw new ArticlePublicationValidationError('notFound')
  if (current.status !== 'draft') throw new ArticlePublicationValidationError('draftOnly')
  if (typeof current.slug !== 'string' || !current.slug.trim()) {
    throw new ArticlePublicationValidationError('slugRequired')
  }
  const slug = slugifyArticle(current.slug)
  if (!slug) throw new ArticlePublicationValidationError('slugInvalid')
  if (!isValidArticleSlug(slug)) throw new ArticlePublicationValidationError('slugInvalid')
  return { slug, status: 'published', published_at: publishedAt.toISOString() }
}

export function getUnpublishTransition() {
  return { status: 'draft', published_at: null }
}
