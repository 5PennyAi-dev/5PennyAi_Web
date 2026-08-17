import { applyArticleImportPatch, hasArticleEditorialData } from './articleFormData.js'

const FORBIDDEN_PROPERTIES = new Set([
  'id',
  'articleId',
  'slug',
  'status',
  'contentHtml',
  'thumbnailPath',
  'thumbnailUrl',
  'coverPath',
  'coverUrl',
  'infographicPath',
  'infographicUrl',
  'articleInfographicPath',
  'articleInfographicUrl',
  'companionInfographicPath',
  'infographic_path',
  'infographic_url',
  'article_infographic_path',
  'article_infographic_url',
  'companion_infographic_path',
  'mediaPath',
  'mediaUrl',
  'publishedAt',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'authorId',
  'authorUrl',
  'viewCount',
  'readingTimeMinutes',
  'canonicalUrl',
  'robots',
  'ogImageUrl',
  'structuredData',
  'sitemapPriority',
  'hreflang',
])

const ROOT_PROPERTIES = new Set([
  'schemaVersion',
  'contentType',
  'language',
  'title',
  'subtitle',
  'summary',
  'level',
  'series',
  'learningObjectives',
  'prerequisites',
  'takeaway',
  'contentMarkdown',
  'media',
  'cover',
  'keywords',
  'sources',
  'seo',
])

const STRING_ROOT_FIELDS = [
  'title',
  'subtitle',
  'summary',
  'takeaway',
  'contentMarkdown',
]

const LANGUAGES = new Set(['fr', 'en'])
const LEVELS = new Set(['beginner', 'intermediate', 'advanced'])
const MEDIA_KINDS = new Set(['diagram', 'illustration', 'infographic', 'chart', 'screenshot'])
const RATIOS = new Set(['16:9', '4:3', '1:1', '4:5'])
const SOURCE_TYPES = new Set([
  'official_documentation',
  'research_paper',
  'standard',
  'government',
  'book',
  'technical_article',
  'other',
])
const SEARCH_INTENTS = new Set(['informational', 'comparative', 'tutorial'])

export function importArticleJson(jsonText, currentForm, { confirmed = true } = {}) {
  return applyAnalyzedArticleImport(analyzeArticleJson(jsonText), currentForm, { confirmed })
}

export function applyAnalyzedArticleImport(analysis, currentForm, { confirmed = true } = {}) {
  if (!analysis.success) return { ...analysis, cancelled: false, nextForm: currentForm }

  if (hasArticleEditorialData(currentForm) && !confirmed) {
    return { ...analysis, cancelled: true, nextForm: currentForm }
  }

  return {
    ...analysis,
    cancelled: false,
    nextForm: applyArticleImportPatch(currentForm, analysis.patch),
  }
}

export function analyzeArticleJson(jsonText) {
  let data

  try {
    data = JSON.parse(jsonText)
  } catch {
    return failedAnalysis('invalidJson')
  }

  if (!isObject(data)) return failedAnalysis('invalidRoot')

  const context = {
    patch: {},
    imported: [],
    warnings: [],
    unknown: [],
    forbidden: [],
  }

  collectRootProperties(data, context)
  if ('theme' in data) context.warnings.push({ path: 'theme', code: 'legacyThemeIgnored' })
  analyzeSchemaVersion(data, context)
  analyzeControlledString(data, 'contentType', context, (value) => value === 'article', 'unexpectedContentType')
  analyzeControlledString(data, 'language', context, (value) => LANGUAGES.has(value), 'unknownLanguage')
  analyzeControlledString(data, 'level', context, (value) => LEVELS.has(value), 'unknownLevel')

  for (const field of STRING_ROOT_FIELDS) {
    if (analyzeStringField(data, field, context.patch, context, field)) {
      context.imported.push(field)
    }
  }

  if ('series' in data) analyzeSeries(data.series, context)
  if ('learningObjectives' in data) {
    analyzeStringArray(data.learningObjectives, 'learningObjectives', context.patch, context)
  }
  if ('prerequisites' in data) {
    analyzeStringArray(data.prerequisites, 'prerequisites', context.patch, context)
  }
  if ('media' in data) analyzeMedia(data.media, context)
  if ('cover' in data) analyzeCover(data.cover, context)
  if ('keywords' in data) analyzeStringArray(data.keywords, 'keywords', context.patch, context)
  if ('sources' in data) analyzeSources(data.sources, context)
  if ('seo' in data) analyzeSeo(data.seo, context)

  return { success: true, error: null, ...context }
}

function collectRootProperties(data, context) {
  for (const property of Object.keys(data)) {
    if (FORBIDDEN_PROPERTIES.has(property)) {
      addForbidden(property, context)
    } else if (!ROOT_PROPERTIES.has(property)) {
      addUnknown(property, context)
    }
  }
}

function analyzeSchemaVersion(data, context) {
  if (!('schemaVersion' in data)) return
  if (!Number.isInteger(data.schemaVersion)) {
    addWarning('schemaVersion', 'expectedInteger', context)
    return
  }

  context.patch.schemaVersion = String(data.schemaVersion)
  context.imported.push('schemaVersion')
  if (data.schemaVersion !== 1) addWarning('schemaVersion', 'unsupportedSchemaVersion', context)
}

function analyzeControlledString(data, field, context, validate, warningCode) {
  if (!(field in data)) return
  if (typeof data[field] !== 'string') {
    addWarning(field, 'expectedString', context)
    return
  }

  context.patch[field] = data[field]
  context.imported.push(field)
  if (!validate(data[field])) addWarning(field, warningCode, context)
}

function analyzeStringField(source, property, target, context, path) {
  if (!(property in source)) return false
  if (typeof source[property] !== 'string') {
    addWarning(path, 'expectedString', context)
    return false
  }

  target[property] = source[property]
  return true
}

function analyzeSeries(series, context) {
  if (!isObject(series)) {
    addWarning('series', 'legacySeriesIgnored', context)
    return
  }

  collectNestedProperties(series, ['name', 'episodeNumber'], 'series', context)
  addWarning('series', 'legacySeriesIgnored', context)
}

function analyzeStringArray(value, path, target, context) {
  if (!Array.isArray(value)) {
    addWarning(path, 'expectedArray', context)
    return false
  }

  const usable = []
  value.forEach((item, index) => {
    if (typeof item === 'string') usable.push(item)
    else addWarning(`${path}[${index}]`, 'expectedString', context)
  })

  if (value.length === 0 || usable.length > 0) {
    target[path] = usable
    context.imported.push(path)
    return true
  }
  return false
}

function analyzeMedia(media, context) {
  if (!Array.isArray(media)) {
    addWarning('media', 'expectedArray', context)
    return
  }

  const usable = []
  media.forEach((item, index) => {
    const path = `media[${index}]`
    if (!isObject(item)) {
      addWarning(path, 'expectedObject', context)
      return
    }

    const result = {}
    collectNestedProperties(
      item,
      ['key', 'kind', 'title', 'caption', 'altText', 'generationBrief', 'preferredAspectRatio', 'required', 'sourceKeys'],
      path,
      context,
    )

    for (const field of ['key', 'kind', 'title', 'caption', 'altText', 'generationBrief', 'preferredAspectRatio']) {
      analyzeStringField(item, field, result, context, `${path}.${field}`)
    }

    if (typeof result.kind === 'string' && !MEDIA_KINDS.has(result.kind)) {
      addWarning(`${path}.kind`, 'unknownMediaKind', context)
    }
    if (typeof result.preferredAspectRatio === 'string' && !RATIOS.has(result.preferredAspectRatio)) {
      addWarning(`${path}.preferredAspectRatio`, 'unknownAspectRatio', context)
    }

    if ('required' in item) {
      if (typeof item.required === 'boolean') result.required = item.required
      else addWarning(`${path}.required`, 'expectedBoolean', context)
    }

    if ('sourceKeys' in item) {
      analyzeNestedStringArray(item.sourceKeys, `${path}.sourceKeys`, result, 'sourceKeys', context)
    }

    if (Object.keys(result).length > 0) usable.push(result)
    else if (Object.keys(item).length > 0) addWarning(path, 'unusableItem', context)
  })

  if (media.length === 0 || usable.length > 0) {
    context.patch.media = usable
    context.imported.push('media')
  }
}

function analyzeCover(cover, context) {
  if (!isObject(cover)) {
    addWarning('cover', 'expectedObject', context)
    return
  }

  collectNestedProperties(cover, ['altText', 'generationBrief', 'preferredAspectRatio'], 'cover', context)
  const result = {}
  for (const field of ['altText', 'generationBrief', 'preferredAspectRatio']) {
    analyzeStringField(cover, field, result, context, `cover.${field}`)
  }

  if (typeof result.preferredAspectRatio === 'string' && !RATIOS.has(result.preferredAspectRatio)) {
    addWarning('cover.preferredAspectRatio', 'unknownAspectRatio', context)
  }

  if (Object.keys(result).length > 0 || Object.keys(cover).length === 0) {
    context.patch.cover = result
    context.imported.push('cover')
  }
}

function analyzeSources(sources, context) {
  if (!Array.isArray(sources)) {
    addWarning('sources', 'expectedArray', context)
    return
  }

  const usable = []
  sources.forEach((item, index) => {
    const path = `sources[${index}]`
    if (!isObject(item)) {
      addWarning(path, 'expectedObject', context)
      return
    }

    const result = {}
    collectNestedProperties(
      item,
      ['key', 'title', 'authors', 'organization', 'sourceType', 'publicationDate', 'url', 'accessDate'],
      path,
      context,
    )
    for (const field of ['key', 'title', 'organization', 'sourceType', 'publicationDate', 'url', 'accessDate']) {
      analyzeStringField(item, field, result, context, `${path}.${field}`)
    }
    if ('authors' in item) {
      analyzeNestedStringArray(item.authors, `${path}.authors`, result, 'authors', context)
    }
    if (typeof result.sourceType === 'string' && !SOURCE_TYPES.has(result.sourceType)) {
      addWarning(`${path}.sourceType`, 'unknownSourceType', context)
    }

    if (Object.keys(result).length > 0) usable.push(result)
    else if (Object.keys(item).length > 0) addWarning(path, 'unusableItem', context)
  })

  if (sources.length === 0 || usable.length > 0) {
    context.patch.sources = usable
    context.imported.push('sources')
  }
}

function analyzeSeo(seo, context) {
  if (!isObject(seo)) {
    addWarning('seo', 'expectedObject', context)
    return
  }

  collectNestedProperties(
    seo,
    ['primaryQuery', 'secondaryQueries', 'searchIntent', 'seoTitle', 'metaDescription', 'suggestedSlug', 'internalLinkSuggestions'],
    'seo',
    context,
  )
  const result = {}
  for (const field of ['primaryQuery', 'searchIntent', 'seoTitle', 'metaDescription', 'suggestedSlug']) {
    analyzeStringField(seo, field, result, context, `seo.${field}`)
  }
  if (typeof result.searchIntent === 'string' && !SEARCH_INTENTS.has(result.searchIntent)) {
    addWarning('seo.searchIntent', 'unknownSearchIntent', context)
  }
  if ('secondaryQueries' in seo) {
    analyzeNestedStringArray(seo.secondaryQueries, 'seo.secondaryQueries', result, 'secondaryQueries', context)
  }
  if ('internalLinkSuggestions' in seo) {
    const suggestions = analyzeInternalLinks(seo.internalLinkSuggestions, context)
    if (suggestions !== null) result.internalLinkSuggestions = suggestions
  }

  if (Object.keys(result).length > 0 || Object.keys(seo).length === 0) {
    context.patch.seo = result
    context.imported.push('seo')
  }
}

function analyzeInternalLinks(value, context) {
  if (!Array.isArray(value)) {
    addWarning('seo.internalLinkSuggestions', 'expectedArray', context)
    return null
  }

  const usable = []
  value.forEach((item, index) => {
    const path = `seo.internalLinkSuggestions[${index}]`
    if (!isObject(item)) {
      addWarning(path, 'expectedObject', context)
      return
    }

    const result = {}
    collectNestedProperties(item, ['targetTopic', 'suggestedAnchor', 'placementHint'], path, context)
    for (const field of ['targetTopic', 'suggestedAnchor', 'placementHint']) {
      analyzeStringField(item, field, result, context, `${path}.${field}`)
    }
    if (Object.keys(result).length > 0) usable.push(result)
    else if (Object.keys(item).length > 0) addWarning(path, 'unusableItem', context)
  })
  return usable
}

function analyzeNestedStringArray(value, path, target, property, context) {
  if (!Array.isArray(value)) {
    addWarning(path, 'expectedArray', context)
    return false
  }
  const usable = []
  value.forEach((item, index) => {
    if (typeof item === 'string') usable.push(item)
    else addWarning(`${path}[${index}]`, 'expectedString', context)
  })
  if (value.length === 0 || usable.length > 0) {
    target[property] = usable
    return true
  }
  return false
}

function collectNestedProperties(value, knownProperties, prefix, context) {
  const known = new Set(knownProperties)
  for (const property of Object.keys(value)) {
    if (known.has(property)) continue
    const path = `${prefix}.${property}`
    if (FORBIDDEN_PROPERTIES.has(property)) addForbidden(path, context)
    else addUnknown(path, context)
  }
}

function addUnknown(path, context) {
  context.unknown.push(path)
  addWarning(path, 'unknownProperty', context)
}

function addForbidden(path, context) {
  context.forbidden.push(path)
  addWarning(path, 'forbiddenProperty', context)
}

function addWarning(path, code, context) {
  context.warnings.push({ path, code })
}

function failedAnalysis(error) {
  return {
    success: false,
    error,
    patch: {},
    imported: [],
    warnings: [],
    unknown: [],
    forbidden: [],
  }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
