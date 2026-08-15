import { slugifyArticle } from './articleSlug.js'

export function createEmptyArticleForm() {
  return {
    schemaVersion: '',
    contentType: '',
    language: '',
    title: '',
    subtitle: '',
    summary: '',
    theme: '',
    level: '',
    slug: '',
    learningObjectives: [],
    prerequisites: [],
    takeaway: '',
    contentMarkdown: '',
    infographicAltText: '',
    media: [],
    cover: { altText: '', generationBrief: '', preferredAspectRatio: '' },
    keywords: [],
    sources: [],
    seo: {
      primaryQuery: '',
      secondaryQueries: [],
      searchIntent: '',
      seoTitle: '',
      metaDescription: '',
      suggestedSlug: '',
      internalLinkSuggestions: [],
    },
  }
}

export function articleRowToForm(row = {}) {
  const empty = createEmptyArticleForm()

  return {
    schemaVersion: optionalNumberText(row.schema_version),
    contentType: optionalText(row.content_type),
    language: optionalText(row.language),
    title: optionalText(row.title),
    subtitle: optionalText(row.subtitle),
    summary: optionalText(row.summary),
    theme: optionalText(row.theme),
    level: optionalText(row.level),
    slug: optionalText(row.slug),
    learningObjectives: stringArray(row.learning_objectives),
    prerequisites: stringArray(row.prerequisites),
    takeaway: optionalText(row.takeaway),
    contentMarkdown: optionalText(row.content_markdown),
    infographicAltText: optionalText(row.infographic_alt_text),
    media: objectArray(row.media),
    cover: objectWithDefaults(row.cover, empty.cover),
    keywords: stringArray(row.keywords),
    sources: objectArray(row.sources),
    seo: objectWithDefaults(row.seo, empty.seo, ['secondaryQueries', 'internalLinkSuggestions']),
  }
}

export function articleFormToDraftPayload(form) {
  return {
    schema_version: optionalInteger(form.schemaVersion),
    content_type: emptyStringToNull(form.contentType),
    language: emptyStringToNull(form.language),
    title: emptyStringToNull(form.title),
    subtitle: emptyStringToNull(form.subtitle),
    summary: emptyStringToNull(form.summary),
    theme: emptyStringToNull(form.theme),
    level: emptyStringToNull(form.level),
    learning_objectives: cloneArray(form.learningObjectives),
    prerequisites: cloneArray(form.prerequisites),
    takeaway: emptyStringToNull(form.takeaway),
    content_markdown: emptyStringToNull(form.contentMarkdown),
    infographic_alt_text: emptyStringToNull(form.infographicAltText),
    media: cloneArray(form.media),
    cover: cloneObject(form.cover),
    keywords: cloneArray(form.keywords),
    sources: cloneArray(form.sources),
    seo: cloneObject(form.seo),
    slug: emptyStringToNull(slugifyArticle(form.slug)),
    status: 'draft',
    published_at: null,
  }
}

export function applyArticleImportPatch(currentForm, patch) {
  return {
    ...currentForm,
    ...patch,
    cover: patch.cover ? { ...currentForm.cover, ...patch.cover } : currentForm.cover,
    seo: patch.seo ? { ...currentForm.seo, ...patch.seo } : currentForm.seo,
  }
}

export function hasArticleEditorialData(form) {
  if (!form || typeof form !== 'object') return false

  return Object.entries(form).some(([key, value]) => {
    if (key === 'slug') return false
    return hasMeaningfulValue(value)
  })
}

function hasMeaningfulValue(value) {
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return true
  if (Array.isArray(value)) return value.some(hasMeaningfulValue)
  if (value && typeof value === 'object') return Object.values(value).some(hasMeaningfulValue)
  return false
}

function optionalText(value) {
  return typeof value === 'string' ? value : ''
}

function optionalNumberText(value) {
  return Number.isInteger(value) ? String(value) : ''
}

function optionalInteger(value) {
  if (value === '' || value === null || value === undefined) return null
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isInteger(parsed) ? parsed : null
}

function emptyStringToNull(value) {
  return value === '' || value === undefined ? null : value
}

function stringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : []
}

function objectArray(value) {
  return Array.isArray(value)
    ? value.filter(isObject).map((item) => structuredClone(item))
    : []
}

function objectWithDefaults(value, defaults, arrayKeys = []) {
  const source = isObject(value) ? value : {}
  const result = { ...defaults, ...structuredClone(source) }
  for (const key of arrayKeys) {
    if (!Array.isArray(result[key])) result[key] = []
  }
  return result
}

function cloneArray(value) {
  return Array.isArray(value) ? structuredClone(value) : []
}

function cloneObject(value) {
  return isObject(value) ? structuredClone(value) : {}
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
