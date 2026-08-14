export const PLACEHOLDER_PATTERN = /\[([A-Z0-9]+(?:_[A-Z0-9]+)*)\]/g
export const VARIABLE_KEY_PATTERN = /^[A-Z0-9]+(?:_[A-Z0-9]+)*$/

export function extractPromptPlaceholders(value) {
  const text = typeof value === 'string' ? value : ''
  const keys = []
  const seen = new Set()
  for (const match of text.matchAll(new RegExp(PLACEHOLDER_PATTERN.source, 'g'))) {
    if (seen.has(match[1])) continue
    seen.add(match[1])
    keys.push(match[1])
  }
  return keys
}

export function getUsedPromptVariableKeys(promptTemplate, variables = []) {
  const declaredKeys = new Set(
    (Array.isArray(variables) ? variables : [])
      .map((variable) => typeof variable?.key === 'string' ? variable.key : '')
      .filter((key) => VARIABLE_KEY_PATTERN.test(key)),
  )
  return extractPromptPlaceholders(promptTemplate).filter((key) => declaredKeys.has(key))
}

export function splitPromptTemplateForDisplay(value, highlightedKeys = []) {
  const allowedKeys = new Set(Array.isArray(highlightedKeys) ? highlightedKeys : [])
  return buildPromptSubstitutionSegments(value).segments.map((segment) => ({
    highlighted: segment.origin === 'placeholder' && allowedKeys.has(segment.key),
    key: segment.key,
    text: segment.text,
  }))
}

export function buildCustomizedPromptSegments(promptTemplate, customValues = {}, allowedKeys = []) {
  const allowed = new Set(Array.isArray(allowedKeys) ? allowedKeys : [])
  const values = new Map(
    Object.entries(customValues || {}).filter(([key]) => allowed.has(key)),
  )
  return buildPromptSubstitutionSegments(promptTemplate, values)
}

export function analyzePromptVariables({ promptTemplate = '', quickTemplate = '', variables = [] } = {}) {
  const items = Array.isArray(variables) ? variables : []
  const mainPlaceholders = extractPromptPlaceholders(promptTemplate)
  const quickPlaceholders = extractPromptPlaceholders(quickTemplate)
  const declared = new Set()
  const duplicateKeys = []
  const invalidKeys = []
  const firstByKey = new Map()

  items.forEach((variable, index) => {
    const key = typeof variable?.key === 'string' ? variable.key : ''
    if (!VARIABLE_KEY_PATTERN.test(key)) invalidKeys.push({ key, index })
    if (!key) return
    if (declared.has(key)) duplicateKeys.push(key)
    else {
      declared.add(key)
      firstByKey.set(key, variable)
    }
  })

  const mainSet = new Set(mainPlaceholders)
  const undeclaredPlaceholders = mainPlaceholders.filter((key) => !declared.has(key))
  const unusedVariables = [...declared].filter((key) => !mainSet.has(key))
  const missingExamples = mainPlaceholders.filter((key) => {
    const example = firstByKey.get(key)?.example
    return declared.has(key) && (typeof example !== 'string' || !example.trim())
  })
  const unknownQuickPlaceholders = quickPlaceholders.filter((key) => !declared.has(key))

  return {
    duplicateKeys: unique(duplicateKeys),
    invalidKeys,
    mainPlaceholders,
    missingExamples: unique(missingExamples),
    quickPlaceholders,
    undeclaredPlaceholders,
    unknownQuickPlaceholders,
    unusedVariables,
  }
}

export function buildPromptExample(promptTemplate, variables = []) {
  const { complete, text, unresolvedKeys } = buildPromptExampleSegments(promptTemplate, variables)
  return { complete, text, unresolvedKeys }
}

export function buildPromptExampleSegments(promptTemplate, variables = []) {
  const firstExamples = new Map()
  for (const variable of Array.isArray(variables) ? variables : []) {
    const key = typeof variable?.key === 'string' ? variable.key : ''
    if (!key || firstExamples.has(key)) continue
    if (typeof variable.example === 'string' && variable.example.trim()) {
      firstExamples.set(key, variable.example)
    }
  }

  return buildPromptSubstitutionSegments(promptTemplate, firstExamples)
}

function buildPromptSubstitutionSegments(promptTemplate, values = new Map()) {
  const template = typeof promptTemplate === 'string' ? promptTemplate : ''

  const unresolvedKeys = []
  const segments = []
  let cursor = 0

  for (const match of template.matchAll(new RegExp(PLACEHOLDER_PATTERN.source, 'g'))) {
    if (match.index > cursor) {
      segments.push({ injected: false, origin: 'fixed', text: template.slice(cursor, match.index) })
    }

    const key = match[1]
    const value = values.get(key)
    if (typeof value !== 'string' || !value.trim()) {
      unresolvedKeys.push(key)
      segments.push({ injected: false, key, origin: 'placeholder', text: match[0] })
    } else {
      segments.push({ injected: true, key, origin: 'injected', text: value })
    }
    cursor = match.index + match[0].length
  }

  if (cursor < template.length || segments.length === 0) {
    segments.push({ injected: false, origin: 'fixed', text: template.slice(cursor) })
  }

  return {
    complete: unique(unresolvedKeys).length === 0,
    segments,
    text: segments.map((segment) => segment.text).join(''),
    unresolvedKeys: unique(unresolvedKeys),
  }
}

function unique(values) {
  return [...new Set(values)]
}
