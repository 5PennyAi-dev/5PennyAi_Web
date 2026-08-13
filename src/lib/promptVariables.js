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
  const template = typeof promptTemplate === 'string' ? promptTemplate : ''
  const firstExamples = new Map()
  for (const variable of Array.isArray(variables) ? variables : []) {
    const key = typeof variable?.key === 'string' ? variable.key : ''
    if (!key || firstExamples.has(key)) continue
    if (typeof variable.example === 'string' && variable.example.trim()) {
      firstExamples.set(key, variable.example)
    }
  }

  const unresolvedKeys = []
  const text = template.replace(new RegExp(PLACEHOLDER_PATTERN.source, 'g'), (match, key) => {
    if (!firstExamples.has(key)) {
      unresolvedKeys.push(key)
      return match
    }
    return firstExamples.get(key)
  })

  return {
    complete: unique(unresolvedKeys).length === 0,
    text,
    unresolvedKeys: unique(unresolvedKeys),
  }
}

function unique(values) {
  return [...new Set(values)]
}
