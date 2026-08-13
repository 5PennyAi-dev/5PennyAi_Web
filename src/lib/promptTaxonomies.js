export const PROMPT_CATEGORIES = Object.freeze([
  'understand',
  'learn',
  'write',
  'summarize',
  'think',
  'organize',
  'decide',
  'verify',
])

export const PROMPT_CONTEXTS = Object.freeze([
  'daily_life',
  'work',
  'studies',
  'communication',
  'creativity',
])

export const PROMPT_RESULT_TYPES = Object.freeze([
  'text',
  'list',
  'table',
  'plan',
  'checklist',
  'questions',
  'ideas',
  'analysis',
  'other',
])

export const PROMPT_LEVELS = Object.freeze(['beginner', 'intermediate', 'advanced'])
export const PROMPT_LANGUAGES = Object.freeze(['fr', 'en'])

const SETS = Object.freeze({
  category: new Set(PROMPT_CATEGORIES),
  context: new Set(PROMPT_CONTEXTS),
  resultType: new Set(PROMPT_RESULT_TYPES),
  level: new Set(PROMPT_LEVELS),
  language: new Set(PROMPT_LANGUAGES),
})

export function isPromptCategory(value) {
  return SETS.category.has(value)
}

export function isPromptContext(value) {
  return SETS.context.has(value)
}

export function isPromptResultType(value) {
  return SETS.resultType.has(value)
}

export function isPromptLevel(value) {
  return SETS.level.has(value)
}

export function isPromptLanguage(value) {
  return SETS.language.has(value)
}

export function promptTaxonomyLabelKey(kind, value) {
  return `admin.resourcesAi.promptTaxonomies.${kind}.${value}`
}
