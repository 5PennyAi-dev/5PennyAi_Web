import { applyPromptImportPatch, hasPromptEditorialData } from './promptFormData.js'
import {
  isPromptCategory,
  isPromptContext,
  isPromptLanguage,
  isPromptLevel,
  isPromptResultType,
} from './promptTaxonomies.js'

const FORBIDDEN_PROPERTIES = new Set([
  'id', 'promptId', 'slug', 'status', 'thumbnailPath', 'thumbnailUrl',
  'thumbnailGeneratedAt', 'thumbnail_path', 'publishedAt', 'published_at',
  'createdAt', 'created_at', 'updatedAt', 'updated_at', 'deletedAt', 'authorId',
  'authorUrl', 'viewCount', 'copyCount', 'canonicalUrl', 'robots', 'ogImageUrl',
  'structuredData', 'sitemapPriority', 'hreflang', 'examplePrompt',
])

const ROOT_PROPERTIES = new Set([
  'schemaVersion', 'contentType', 'language', 'title', 'summary', 'category', 'level',
  'contexts', 'resultTypes', 'whenToUse', 'promptTemplate', 'variables', 'tip',
  'quickTemplate', 'caution', 'editorialObjective', 'thumbnail', 'keywords', 'seo',
])

const STRING_FIELDS = [
  'title', 'summary', 'whenToUse', 'promptTemplate', 'tip', 'quickTemplate',
  'caution', 'editorialObjective',
]

export function importPromptJson(jsonText, currentForm, { confirmed = true } = {}) {
  return applyAnalyzedPromptImport(analyzePromptJson(jsonText), currentForm, { confirmed })
}

export function applyAnalyzedPromptImport(analysis, currentForm, { confirmed = true } = {}) {
  if (!analysis.success) return { ...analysis, cancelled: false, nextForm: currentForm }
  if (hasPromptEditorialData(currentForm) && !confirmed) {
    return { ...analysis, cancelled: true, nextForm: currentForm }
  }
  return {
    ...analysis,
    cancelled: false,
    nextForm: applyPromptImportPatch(currentForm, analysis.patch),
  }
}

export function analyzePromptJson(jsonText) {
  let data
  try {
    data = JSON.parse(jsonText)
  } catch {
    return failed('invalidJson')
  }
  if (!isObject(data)) return failed('invalidRoot')

  const context = { patch: {}, imported: [], warnings: [], unknown: [], forbidden: [] }
  collectProperties(data, ROOT_PROPERTIES, '', context)
  analyzeSchemaVersion(data, context)
  analyzeControlledString(data, 'contentType', context, (value) => value === 'prompt', 'unexpectedContentType')
  analyzeControlledString(data, 'language', context, isPromptLanguage, 'unknownLanguage')
  analyzeControlledString(data, 'category', context, isPromptCategory, 'unknownCategory')
  analyzeControlledString(data, 'level', context, isPromptLevel, 'unknownLevel')

  STRING_FIELDS.forEach((field) => analyzeString(data, field, context.patch, context, field))
  if ('contexts' in data) analyzeStringArray(data.contexts, 'contexts', context.patch, 'contexts', context, isPromptContext, 'unknownContext')
  if ('resultTypes' in data) analyzeStringArray(data.resultTypes, 'resultTypes', context.patch, 'resultTypes', context, isPromptResultType, 'unknownResultType')
  if ('keywords' in data) analyzeStringArray(data.keywords, 'keywords', context.patch, 'keywords', context)
  if ('variables' in data) analyzeVariables(data.variables, context)
  if ('thumbnail' in data) analyzeThumbnail(data.thumbnail, context)
  if ('seo' in data) analyzeSeo(data.seo, context)

  return { success: true, error: null, ...context }
}

function analyzeSchemaVersion(data, context) {
  if (!('schemaVersion' in data)) return
  if (!Number.isInteger(data.schemaVersion)) {
    warn('schemaVersion', 'expectedInteger', context)
    return
  }
  context.patch.schemaVersion = String(data.schemaVersion)
  context.imported.push('schemaVersion')
  if (data.schemaVersion !== 1) warn('schemaVersion', 'unsupportedSchemaVersion', context)
}

function analyzeControlledString(data, field, context, validate, code) {
  if (!(field in data)) return
  if (typeof data[field] !== 'string') {
    warn(field, 'expectedString', context)
    return
  }
  context.patch[field] = data[field]
  context.imported.push(field)
  if (!validate(data[field])) warn(field, code, context)
}

function analyzeString(source, property, target, context, path) {
  if (!(property in source)) return false
  if (typeof source[property] !== 'string') {
    warn(path, 'expectedString', context)
    return false
  }
  target[property] = source[property]
  context.imported.push(path)
  return true
}

function analyzeStringArray(value, path, target, property, context, validate, unknownCode) {
  if (!Array.isArray(value)) {
    warn(path, 'expectedArray', context)
    return
  }
  const usable = []
  value.forEach((item, index) => {
    if (typeof item !== 'string') {
      warn(`${path}[${index}]`, 'expectedString', context)
      return
    }
    usable.push(item)
    if (validate && !validate(item)) warn(`${path}[${index}]`, unknownCode, context)
  })
  if (value.length === 0 || usable.length > 0) {
    target[property] = usable
    context.imported.push(path)
  }
}

function analyzeVariables(value, context) {
  if (!Array.isArray(value)) {
    warn('variables', 'expectedArray', context)
    return
  }
  const variables = []
  value.forEach((item, index) => {
    const path = `variables[${index}]`
    if (!isObject(item)) {
      warn(path, 'expectedObject', context)
      return
    }
    collectProperties(item, new Set(['key', 'label', 'description', 'example']), path, context)
    const result = {}
    for (const field of ['key', 'label', 'description', 'example']) {
      if (!(field in item)) continue
      if (typeof item[field] !== 'string') warn(`${path}.${field}`, 'expectedString', context)
      else result[field] = item[field]
    }
    if (Object.keys(result).length > 0 || Object.keys(item).length === 0) variables.push(result)
    else warn(path, 'unusableItem', context)
  })
  if (value.length === 0 || variables.length > 0) {
    context.patch.variables = variables
    context.imported.push('variables')
  }
}

function analyzeThumbnail(value, context) {
  if (!isObject(value)) {
    warn('thumbnail', 'expectedObject', context)
    return
  }
  collectProperties(value, new Set(['altText', 'generationBrief', 'preferredAspectRatio']), 'thumbnail', context)
  const result = {}
  for (const field of ['altText', 'generationBrief', 'preferredAspectRatio']) {
    if (!(field in value)) continue
    if (typeof value[field] !== 'string') warn(`thumbnail.${field}`, 'expectedString', context)
    else result[field] = value[field]
  }
  context.patch.thumbnail = result
  context.imported.push('thumbnail')
}

function analyzeSeo(value, context) {
  if (!isObject(value)) {
    warn('seo', 'expectedObject', context)
    return
  }
  const allowed = new Set([
    'primaryQuery', 'secondaryQueries', 'seoTitle', 'metaDescription',
    'suggestedSlug', 'internalLinkSuggestions',
  ])
  collectProperties(value, allowed, 'seo', context)
  const result = {}
  for (const field of ['primaryQuery', 'seoTitle', 'metaDescription', 'suggestedSlug']) {
    if (field in value) analyzeNestedString(value, field, result, `seo.${field}`, context)
  }
  if ('secondaryQueries' in value) {
    analyzeStringArray(value.secondaryQueries, 'seo.secondaryQueries', result, 'secondaryQueries', context)
  }
  if ('internalLinkSuggestions' in value) {
    result.internalLinkSuggestions = analyzeInternalLinks(value.internalLinkSuggestions, context)
  }
  context.patch.seo = result
  context.imported.push('seo')
}

function analyzeInternalLinks(value, context) {
  if (!Array.isArray(value)) {
    warn('seo.internalLinkSuggestions', 'expectedArray', context)
    return []
  }
  const result = []
  value.forEach((item, index) => {
    const path = `seo.internalLinkSuggestions[${index}]`
    if (!isObject(item)) {
      warn(path, 'expectedObject', context)
      return
    }
    collectProperties(item, new Set(['targetTopic', 'suggestedAnchor', 'placementHint']), path, context)
    const suggestion = {}
    for (const field of ['targetTopic', 'suggestedAnchor', 'placementHint']) {
      if (field in item) analyzeNestedString(item, field, suggestion, `${path}.${field}`, context)
    }
    if (Object.keys(suggestion).length > 0 || Object.keys(item).length === 0) result.push(suggestion)
  })
  return result
}

function analyzeNestedString(source, property, target, path, context) {
  if (typeof source[property] !== 'string') warn(path, 'expectedString', context)
  else target[property] = source[property]
}

function collectProperties(value, allowed, prefix, context) {
  for (const property of Object.keys(value)) {
    if (allowed.has(property)) continue
    const path = prefix ? `${prefix}.${property}` : property
    if (FORBIDDEN_PROPERTIES.has(property)) {
      context.forbidden.push(path)
      warn(path, 'forbiddenProperty', context)
    } else {
      context.unknown.push(path)
      warn(path, 'unknownProperty', context)
    }
  }
}

function warn(path, code, context) {
  context.warnings.push({ path, code })
}

function failed(error) {
  return { success: false, error, patch: {}, imported: [], warnings: [], unknown: [], forbidden: [] }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
