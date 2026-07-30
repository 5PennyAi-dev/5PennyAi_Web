const KNOWN_PROPERTIES = new Set([
  'schemaVersion',
  'title',
  'subtitle',
  'summary',
  'introduction',
  'imageAlt',
  'theme',
  'level',
  'readingTimeMinutes',
  'series',
  'keyPoints',
  'takeaway',
  'keywords',
  'sources',
])

const STRING_FIELDS = {
  title: 'title',
  subtitle: 'subtitle',
  summary: 'summary',
  introduction: 'introduction',
  imageAlt: 'image_alt',
  theme: 'theme',
  takeaway: 'takeaway',
}

const LEVELS = new Set(['beginner', 'intermediate', 'advanced'])

export function importInfographicJson(jsonText, currentForm) {
  const analysis = analyzeInfographicJson(jsonText)
  return {
    ...analysis,
    nextForm: analysis.success ? { ...currentForm, ...analysis.patch } : currentForm,
  }
}

export function analyzeInfographicJson(jsonText) {
  let data

  try {
    data = JSON.parse(jsonText)
  } catch {
    return failedAnalysis('invalidJson')
  }

  if (!isObject(data)) return failedAnalysis('invalidRoot')

  const patch = {}
  const imported = []
  const warnings = []
  const unknown = Object.keys(data).filter((property) => !KNOWN_PROPERTIES.has(property))

  if ('schemaVersion' in data && data.schemaVersion !== 1) {
    warnings.push({ path: 'schemaVersion', code: 'unsupportedSchemaVersion' })
  }

  for (const [jsonField, formField] of Object.entries(STRING_FIELDS)) {
    if (!(jsonField in data)) continue
    if (typeof data[jsonField] !== 'string') {
      warnings.push({ path: jsonField, code: 'expectedString' })
      continue
    }
    patch[formField] = data[jsonField]
    imported.push(jsonField)
  }

  if ('level' in data) {
    if (typeof data.level === 'string' && LEVELS.has(data.level)) {
      patch.level = data.level
      imported.push('level')
    } else {
      warnings.push({ path: 'level', code: 'invalidLevel' })
    }
  }

  if ('readingTimeMinutes' in data) {
    if (isPositiveInteger(data.readingTimeMinutes)) {
      patch.reading_time_minutes = String(data.readingTimeMinutes)
      imported.push('readingTimeMinutes')
    } else {
      warnings.push({ path: 'readingTimeMinutes', code: 'expectedPositiveInteger' })
    }
  }

  if ('series' in data) {
    analyzeSeries(data.series, patch, imported, warnings, unknown)
  }

  if ('keyPoints' in data) {
    analyzeKeyPoints(data.keyPoints, patch, imported, warnings, unknown)
  }

  if ('keywords' in data) {
    analyzeKeywords(data.keywords, patch, imported, warnings)
  }

  if ('sources' in data) {
    analyzeSources(data.sources, patch, imported, warnings, unknown)
  }

  return {
    success: true,
    error: null,
    patch,
    imported,
    warnings,
    unknown,
  }
}

export function hasInfographicMetadata(form) {
  return Object.values(form).some((value) => {
    if (typeof value === 'string') return value.trim().length > 0
    if (!Array.isArray(value)) return false
    return value.some(
      (item) =>
        isObject(item) &&
        Object.values(item).some(
          (itemValue) => typeof itemValue === 'string' && itemValue.trim().length > 0,
        ),
    )
  })
}

function analyzeSeries(series, patch, imported, warnings, unknown) {
  if (!isObject(series)) {
    warnings.push({ path: 'series', code: 'expectedObject' })
    return
  }

  collectUnknown(series, ['name', 'episodeNumber'], 'series', unknown)

  if ('name' in series) {
    if (typeof series.name === 'string') {
      patch.series_name = series.name
      imported.push('series.name')
    } else {
      warnings.push({ path: 'series.name', code: 'expectedString' })
    }
  }

  if ('episodeNumber' in series) {
    if (isPositiveInteger(series.episodeNumber)) {
      patch.episode_number = String(series.episodeNumber)
      imported.push('series.episodeNumber')
    } else {
      warnings.push({ path: 'series.episodeNumber', code: 'expectedPositiveInteger' })
    }
  }
}

function analyzeKeyPoints(keyPoints, patch, imported, warnings, unknown) {
  if (!Array.isArray(keyPoints)) {
    warnings.push({ path: 'keyPoints', code: 'expectedArray' })
    return
  }

  const usablePoints = []

  keyPoints.forEach((point, index) => {
    const path = `keyPoints[${index}]`
    if (!isObject(point)) {
      warnings.push({ path, code: 'expectedObject' })
      return
    }

    collectUnknown(point, ['title', 'description'], path, unknown)
    const usablePoint = {}

    for (const property of ['title', 'description']) {
      if (!(property in point)) continue
      if (typeof point[property] !== 'string') {
        warnings.push({ path: `${path}.${property}`, code: 'expectedString' })
      } else if (point[property].trim()) {
        usablePoint[property] = point[property]
      }
    }

    if (Object.keys(usablePoint).length > 0) {
      usablePoints.push(usablePoint)
    } else {
      warnings.push({ path, code: 'unusableItem' })
    }
  })

  if (keyPoints.length === 0 || usablePoints.length > 0) {
    patch.key_points = usablePoints
    imported.push('keyPoints')
  }
}

function analyzeKeywords(keywords, patch, imported, warnings) {
  if (!Array.isArray(keywords)) {
    warnings.push({ path: 'keywords', code: 'expectedArray' })
    return
  }

  const usableKeywords = []

  keywords.forEach((keyword, index) => {
    const path = `keywords[${index}]`
    if (typeof keyword !== 'string') {
      warnings.push({ path, code: 'expectedString' })
    } else if (!keyword.trim()) {
      warnings.push({ path, code: 'emptyString' })
    } else {
      usableKeywords.push(keyword.trim())
    }
  })

  if (keywords.length === 0 || usableKeywords.length > 0) {
    patch.keywords = usableKeywords.join(', ')
    imported.push('keywords')
  }
}

function analyzeSources(sources, patch, imported, warnings, unknown) {
  if (!Array.isArray(sources)) {
    warnings.push({ path: 'sources', code: 'expectedArray' })
    return
  }

  const usableSources = []

  sources.forEach((source, index) => {
    const path = `sources[${index}]`
    if (!isObject(source)) {
      warnings.push({ path, code: 'expectedObject' })
      return
    }

    collectUnknown(source, ['title', 'url'], path, unknown)
    const usableSource = {}

    if ('title' in source) {
      if (typeof source.title !== 'string') {
        warnings.push({ path: `${path}.title`, code: 'expectedString' })
      } else if (source.title.trim()) {
        usableSource.title = source.title
      }
    }

    if ('url' in source) {
      if (typeof source.url !== 'string') {
        warnings.push({ path: `${path}.url`, code: 'expectedString' })
      } else if (isHttpUrl(source.url)) {
        usableSource.url = source.url
      } else {
        warnings.push({ path: `${path}.url`, code: 'invalidUrl' })
      }
    }

    if (Object.keys(usableSource).length > 0) {
      usableSources.push(usableSource)
    } else {
      warnings.push({ path, code: 'unusableItem' })
    }
  })

  if (sources.length === 0 || usableSources.length > 0) {
    patch.sources = usableSources
    imported.push('sources')
  }
}

function failedAnalysis(error) {
  return {
    success: false,
    error,
    patch: {},
    imported: [],
    warnings: [],
    unknown: [],
  }
}

function collectUnknown(value, knownProperties, prefix, unknown) {
  const known = new Set(knownProperties)
  Object.keys(value)
    .filter((property) => !known.has(property))
    .forEach((property) => unknown.push(`${prefix}.${property}`))
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0
}

function isHttpUrl(value) {
  try {
    const url = new URL(value)
    return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname)
  } catch {
    return false
  }
}
