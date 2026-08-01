const KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SLUG_PATTERN = KEY_PATTERN
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

export function getArticleWarnings(form) {
  const warnings = []
  const add = (path, code, details, severity = 'warning') => {
    warnings.push({ path, code, severity, ...(details ? { details } : {}) })
  }

  if (!hasText(form.title)) add('title', 'missingTitle')
  if (!hasText(form.summary)) add('summary', 'missingSummary')
  if (!hasText(form.theme)) add('theme', 'missingTheme')
  if (hasText(form.language) && !LANGUAGES.has(form.language)) {
    add('language', 'unknownLanguage', { value: form.language })
  }
  if (hasText(form.level) && !LEVELS.has(form.level)) {
    add('level', 'unknownLevel', { value: form.level })
  }
  if (hasText(form.contentType) && form.contentType !== 'article') {
    add('contentType', 'unexpectedContentType', { value: form.contentType })
  }
  if (hasText(form.series?.episodeNumber) && !isPositiveIntegerText(form.series.episodeNumber)) {
    add('series.episodeNumber', 'invalidEpisodeNumber')
  }

  const suggestedSlug = form.seo?.suggestedSlug
  if (hasText(suggestedSlug) && suggestedSlug !== suggestedSlug.toLowerCase()) {
    add('seo.suggestedSlug', 'unusualSuggestedSlug')
  }
  if (
    hasText(form.cover?.preferredAspectRatio) &&
    !RATIOS.has(form.cover.preferredAspectRatio)
  ) {
    add('cover.preferredAspectRatio', 'unknownAspectRatio', {
      value: form.cover.preferredAspectRatio,
    })
  }

  const media = Array.isArray(form.media) ? form.media : []
  const sources = Array.isArray(form.sources) ? form.sources : []
  const mediaKeys = collectKeys(media, 'media', 'Media', add)
  const sourceKeys = collectKeys(sources, 'sources', 'Source', add)

  const markdownAnalysis = analyzeMarkdown(form.contentMarkdown)
  const citationKeys = collectMarkers(markdownAnalysis.outsideCode, 'cite')
  const mediaMarkerKeys = collectMarkers(markdownAnalysis.outsideCode, 'media')

  for (const key of citationKeys) {
    if (!sourceKeys.has(key)) add('contentMarkdown', 'unresolvedCitation', { key })
  }
  for (const key of mediaMarkerKeys) {
    if (!mediaKeys.has(key)) add('contentMarkdown', 'unresolvedMedia', { key })
  }

  media.forEach((item, index) => {
    const path = `media[${index}]`
    if (!isObject(item)) return
    if (hasText(item.key) && !mediaMarkerKeys.has(item.key)) {
      add(`${path}.key`, 'unusedMedia', { key: item.key })
    }
    if (item.required === true) add(`${path}.required`, 'requiredMediaDeclared', null, 'strong')
    if (!hasText(item.altText)) add(`${path}.altText`, 'missingMediaAltText')
    if (hasText(item.preferredAspectRatio) && !RATIOS.has(item.preferredAspectRatio)) {
      add(`${path}.preferredAspectRatio`, 'unknownAspectRatio', { value: item.preferredAspectRatio })
    }
    if (hasText(item.kind) && !MEDIA_KINDS.has(item.kind)) {
      add(`${path}.kind`, 'unknownMediaKind', { value: item.kind })
    }
    if (Array.isArray(item.sourceKeys)) {
      item.sourceKeys.forEach((key, keyIndex) => {
        if (typeof key === 'string' && !sourceKeys.has(key)) {
          add(`${path}.sourceKeys[${keyIndex}]`, 'unknownMediaSourceKey', { key })
        }
      })
    }
  })

  sources.forEach((source, index) => {
    const path = `sources[${index}]`
    if (!isObject(source)) return
    if (hasText(source.key) && !citationKeys.has(source.key)) {
      add(`${path}.key`, 'unusedSource', { key: source.key })
    }
    if (hasText(source.url) && !isHttpUrl(source.url)) add(`${path}.url`, 'invalidSourceUrl')
    if (hasText(source.publicationDate) && !isPublicationDate(source.publicationDate)) {
      add(`${path}.publicationDate`, 'invalidPublicationDate')
    }
    if (hasText(source.accessDate) && !isFullDate(source.accessDate)) {
      add(`${path}.accessDate`, 'invalidAccessDate')
    }
    if (hasText(source.sourceType) && !SOURCE_TYPES.has(source.sourceType)) {
      add(`${path}.sourceType`, 'unknownSourceType', { value: source.sourceType })
    }
  })

  if (!hasText(form.contentMarkdown)) add('contentMarkdown', 'emptyMarkdown')
  if (/^\s{0,3}#\s+/m.test(markdownAnalysis.outsideCode)) add('contentMarkdown', 'markdownH1')
  if (/<[A-Za-z][^>]*>/i.test(markdownAnalysis.outsideCode)) add('contentMarkdown', 'rawHtml')
  if (/<\/?(?:iframe|script|form)\b/i.test(markdownAnalysis.outsideCode)) {
    add('contentMarkdown', 'unsafeHtmlElement', null, 'strong')
  }
  if (/!\[[^\]]*\]\(\s*https?:\/\/[^)]+\)/i.test(markdownAnalysis.outsideCode)) {
    add('contentMarkdown', 'externalMarkdownImage')
  }
  if (markdownAnalysis.unclosedFence) add('contentMarkdown', 'unclosedCodeFence')

  analyzeSeo(form.seo, add)

  return warnings
}

export function analyzeMarkdown(markdown) {
  const lines = typeof markdown === 'string' ? markdown.split(/\r?\n/) : []
  const outside = []
  let fence = null

  for (const line of lines) {
    const match = line.match(/^\s{0,3}(`{3,}|~{3,})/)
    if (!fence && match) {
      fence = { character: match[1][0], length: match[1].length }
      outside.push('')
      continue
    }
    if (fence && match && match[1][0] === fence.character && match[1].length >= fence.length) {
      fence = null
      outside.push('')
      continue
    }
    outside.push(fence ? '' : line)
  }

  return { outsideCode: outside.join('\n'), unclosedFence: fence !== null }
}

function collectKeys(items, prefix, label, add) {
  const keys = new Set()
  const duplicates = new Set()

  items.forEach((item, index) => {
    if (!isObject(item) || !hasText(item.key)) return
    if (!KEY_PATTERN.test(item.key)) add(`${prefix}[${index}].key`, `invalid${label}Key`)
    if (keys.has(item.key) && !duplicates.has(item.key)) {
      add(`${prefix}[${index}].key`, `duplicate${label}Key`, { key: item.key })
      duplicates.add(item.key)
    }
    keys.add(item.key)
  })

  return keys
}

function collectMarkers(markdown, kind) {
  const values = new Set()
  const pattern = new RegExp(`\\{\\{${kind}:([^{}\\s]+)\\}\\}`, 'g')
  for (const match of markdown.matchAll(pattern)) values.add(match[1])
  return values
}

function analyzeSeo(seo, add) {
  if (!isObject(seo) || !Object.values(seo).some(hasMeaningfulValue)) {
    add('seo', 'missingSeo')
  } else {
    const expected = ['primaryQuery', 'searchIntent', 'seoTitle', 'metaDescription', 'suggestedSlug']
    if (expected.some((property) => !hasText(seo[property]))) add('seo', 'incompleteSeo')
  }

  if (!hasText(seo?.primaryQuery)) add('seo.primaryQuery', 'missingPrimaryQuery')
  if (hasText(seo?.searchIntent) && !SEARCH_INTENTS.has(seo.searchIntent)) {
    add('seo.searchIntent', 'unknownSearchIntent', { value: seo.searchIntent })
  }
  if (hasText(seo?.seoTitle) && (seo.seoTitle.length < 30 || seo.seoTitle.length > 65)) {
    add('seo.seoTitle', 'unusualSeoTitleLength', { length: seo.seoTitle.length })
  }
  if (
    hasText(seo?.metaDescription) &&
    (seo.metaDescription.length < 70 || seo.metaDescription.length > 170)
  ) {
    add('seo.metaDescription', 'unusualMetaDescriptionLength', {
      length: seo.metaDescription.length,
    })
  }
  if (hasText(seo?.suggestedSlug) && !SLUG_PATTERN.test(seo.suggestedSlug)) {
    add('seo.suggestedSlug', 'invalidSuggestedSlug')
  }
}

function isPositiveIntegerText(value) {
  return /^\d+$/.test(String(value)) && Number(value) > 0
}

function isHttpUrl(value) {
  try {
    const url = new URL(value)
    return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname)
  } catch {
    return false
  }
}

function isPublicationDate(value) {
  if (/^\d{4}$/.test(value)) return Number(value) >= 1
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [, month] = value.split('-').map(Number)
    return month >= 1 && month <= 12
  }
  return isFullDate(value)
}

function isFullDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function hasMeaningfulValue(value) {
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'boolean') return value
  if (Array.isArray(value)) return value.some(hasMeaningfulValue)
  if (isObject(value)) return Object.values(value).some(hasMeaningfulValue)
  return false
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
