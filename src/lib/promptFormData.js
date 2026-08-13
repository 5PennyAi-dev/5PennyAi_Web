import { slugifyPrompt } from './promptSlug.js'

export function createEmptyPromptForm() {
  return {
    schemaVersion: '',
    contentType: '',
    language: '',
    title: '',
    summary: '',
    category: '',
    level: '',
    contexts: [],
    resultTypes: [],
    whenToUse: '',
    promptTemplate: '',
    variables: [],
    tip: '',
    quickTemplate: '',
    caution: '',
    editorialObjective: '',
    thumbnail: { altText: '', generationBrief: '', preferredAspectRatio: '' },
    keywords: [],
    seo: {
      primaryQuery: '',
      secondaryQueries: [],
      seoTitle: '',
      metaDescription: '',
      suggestedSlug: '',
      internalLinkSuggestions: [],
    },
    slug: '',
  }
}

export function promptRowToForm(row = {}) {
  const empty = createEmptyPromptForm()
  return {
    schemaVersion: integerText(row.schema_version),
    contentType: text(row.content_type),
    language: text(row.language),
    title: text(row.title),
    summary: text(row.summary),
    category: text(row.category),
    level: text(row.level),
    contexts: stringArray(row.contexts),
    resultTypes: stringArray(row.result_types),
    whenToUse: text(row.when_to_use),
    promptTemplate: text(row.prompt_template),
    variables: objectArray(row.variables),
    tip: text(row.tip),
    quickTemplate: text(row.quick_template),
    caution: text(row.caution),
    editorialObjective: text(row.editorial_objective),
    thumbnail: objectWithDefaults(row.thumbnail, empty.thumbnail),
    keywords: stringArray(row.keywords),
    seo: objectWithDefaults(row.seo, empty.seo, ['secondaryQueries', 'internalLinkSuggestions']),
    slug: text(row.slug),
  }
}

export function promptFormToDraftPayload(form) {
  return {
    schema_version: optionalInteger(form.schemaVersion),
    content_type: nullableText(form.contentType),
    language: nullableText(form.language),
    title: nullableText(form.title),
    summary: nullableText(form.summary),
    category: nullableText(form.category),
    level: nullableText(form.level),
    contexts: cloneArray(form.contexts),
    result_types: cloneArray(form.resultTypes),
    when_to_use: nullableText(form.whenToUse),
    prompt_template: nullableText(form.promptTemplate),
    variables: cloneArray(form.variables),
    tip: nullableText(form.tip),
    quick_template: nullableText(form.quickTemplate),
    caution: nullableText(form.caution),
    editorial_objective: nullableText(form.editorialObjective),
    thumbnail: cloneObject(form.thumbnail),
    keywords: cloneArray(form.keywords),
    seo: cloneObject(form.seo),
    slug: nullableText(slugifyPrompt(form.slug)),
    status: 'draft',
    published_at: null,
  }
}

export function applyPromptImportPatch(currentForm, patch) {
  return {
    ...currentForm,
    ...patch,
    slug: currentForm.slug,
    thumbnail: patch.thumbnail
      ? { ...currentForm.thumbnail, ...patch.thumbnail }
      : currentForm.thumbnail,
    seo: patch.seo ? { ...currentForm.seo, ...patch.seo } : currentForm.seo,
  }
}

export function hasPromptEditorialData(form) {
  if (!form || typeof form !== 'object') return false
  return Object.entries(form).some(([key, value]) => key !== 'slug' && hasValue(value))
}

function hasValue(value) {
  if (typeof value === 'string') return Boolean(value.trim())
  if (Array.isArray(value)) return value.some(hasValue)
  if (value && typeof value === 'object') return Object.values(value).some(hasValue)
  return false
}

function text(value) {
  return typeof value === 'string' ? value : ''
}

function integerText(value) {
  return Number.isInteger(value) ? String(value) : ''
}

function optionalInteger(value) {
  if (value === '' || value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isInteger(parsed) ? parsed : null
}

function nullableText(value) {
  return typeof value === 'string' && value !== '' ? value : null
}

function stringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : []
}

function objectArray(value) {
  return Array.isArray(value) ? value.filter(isObject).map((item) => structuredClone(item)) : []
}

function objectWithDefaults(value, defaults, arrayKeys = []) {
  const result = { ...defaults, ...(isObject(value) ? structuredClone(value) : {}) }
  arrayKeys.forEach((key) => {
    if (!Array.isArray(result[key])) result[key] = []
  })
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
