import { cleanMetaText } from '../../src/lib/articleSeo.js'
import { isValidArticleSlug } from '../../src/lib/articleSlug.js'
import { ResourceSocialError } from './resourceSocialValidation.js'

export const ARTICLE_SOCIAL_COLUMNS = [
  'id',
  'language',
  'title',
  'subtitle',
  'summary',
  'level',
  'learning_objectives',
  'takeaway',
  'content_markdown',
  'slug',
  'status',
  'cover_path',
].join(', ')

export const INFOGRAPHIC_SOCIAL_COLUMNS = [
  'id',
  'title',
  'subtitle',
  'summary',
  'introduction',
  'level',
  'key_points',
  'takeaway',
  'keywords',
  'status',
  'thumbnail_path',
].join(', ')

const MAX_CONTEXT_CHARACTERS = 1900

export async function loadResourceSocialContext(supabase, resourceType, resourceId) {
  const table = resourceType === 'article' ? 'articles' : 'infographics'
  const columns = resourceType === 'article' ? ARTICLE_SOCIAL_COLUMNS : INFOGRAPHIC_SOCIAL_COLUMNS
  const { data, error } = await supabase
    .from(table)
    .select(columns)
    .eq('id', resourceId)
    .maybeSingle()
  if (error) throw new ResourceSocialError('generation_failed', 500)
  if (!data) throw new ResourceSocialError('resource_not_found', 404)
  return resourceType === 'article'
    ? adaptArticleSocialContext(data)
    : adaptInfographicSocialContext(data)
}

export function adaptArticleSocialContext(article = {}) {
  const title = clean(article.title)
  if (!title) throw new ResourceSocialError('insufficient_content', 422)

  const slug = cleanPlain(article.slug)
  if (!slug || !isValidArticleSlug(slug)) {
    throw new ResourceSocialError('resource_not_ready', 422)
  }

  const summary = clean(article.summary)
  const takeaway = clean(article.takeaway)
  const objectives = cleanStringArray(article.learning_objectives).slice(0, 3)
  const content = clean(article.content_markdown)
  const mainIdea = takeaway || summary || objectives[0] || truncateUnicode(content, 600)
  if (!mainIdea) throw new ResourceSocialError('insufficient_content', 422)

  const supportingParts = uniqueParts([
    summary && summary !== mainIdea ? summary : '',
    ...objectives.filter((objective) => objective !== mainIdea),
  ])
  if (supportingParts.length < 2 && content && content !== mainIdea) {
    supportingParts.push(truncateUnicode(content, 750))
  }

  return limitContext({
    id: article.id,
    resourceType: 'article',
    language: article.language === 'en' ? 'en' : 'fr',
    title,
    subtitle: clean(article.subtitle),
    summary,
    level: clean(article.level),
    mainIdea,
    supportingContext: supportingParts.join(' | '),
  })
}

export function adaptInfographicSocialContext(infographic = {}) {
  const title = clean(infographic.title)
  if (!title) throw new ResourceSocialError('insufficient_content', 422)

  const summary = clean(infographic.summary)
  const introduction = clean(infographic.introduction)
  const takeaway = clean(infographic.takeaway)
  const keyPoints = extractInfographicKeyPoints(infographic.key_points).slice(0, 3)
  const keywords = cleanStringArray(infographic.keywords).slice(0, 5)
  const mainIdea = takeaway || summary || introduction || keyPoints[0]
  if (!mainIdea) throw new ResourceSocialError('insufficient_content', 422)

  const baseContext = summary || introduction
  const supportingParts = uniqueParts([
    baseContext && baseContext !== mainIdea ? baseContext : '',
    ...keyPoints.filter((point) => point !== mainIdea),
    keywords.length ? `Mots-clés : ${keywords.join(', ')}` : '',
  ])

  return limitContext({
    id: infographic.id,
    resourceType: 'infographic',
    language: 'fr',
    title,
    subtitle: clean(infographic.subtitle),
    summary,
    level: clean(infographic.level),
    mainIdea,
    supportingContext: supportingParts.join(' | '),
  })
}

export function extractInfographicKeyPoints(value) {
  if (!Array.isArray(value)) return []
  return uniqueParts(value.map((point) => {
    if (typeof point === 'string') return clean(point)
    if (!point || typeof point !== 'object') return ''
    return uniqueParts([clean(point.title), clean(point.description), clean(point.text)]).join(' — ')
  }))
}

export function countContextCharacters(context) {
  return Array.from([
    context.title,
    context.subtitle,
    context.level,
    context.mainIdea,
    context.supportingContext,
  ].filter(Boolean).join('\n')).length
}

export function truncateUnicode(value, maxCharacters) {
  const characters = Array.from(typeof value === 'string' ? value : '')
  if (characters.length <= maxCharacters) return characters.join('')
  const truncated = characters.slice(0, Math.max(0, maxCharacters - 1)).join('').trimEnd()
  return `${truncated}…`
}

function limitContext(context) {
  const result = {
    ...context,
    title: truncateUnicode(context.title, 240),
    subtitle: truncateUnicode(context.subtitle, 300),
    level: truncateUnicode(context.level, 50),
    mainIdea: truncateUnicode(context.mainIdea, 600),
  }
  const withoutSupporting = { ...result, supportingContext: '' }
  const remaining = Math.max(0, MAX_CONTEXT_CHARACTERS - countContextCharacters(withoutSupporting))
  result.supportingContext = truncateUnicode(result.supportingContext, remaining)
  return result
}

function clean(value) {
  return cleanMetaText(value)
}

function cleanPlain(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function cleanStringArray(value) {
  if (!Array.isArray(value)) return []
  return uniqueParts(value.map(clean))
}

function uniqueParts(values) {
  const seen = new Set()
  return values.filter((value) => {
    if (!value) return false
    const key = value.replace(/\s+/g, ' ').toLocaleLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export { MAX_CONTEXT_CHARACTERS }
