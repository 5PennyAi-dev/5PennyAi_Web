import { isValidPromptSlug } from './promptSlug.js'
import {
  isPromptCategory,
  isPromptContext,
  isPromptLanguage,
  isPromptLevel,
  isPromptResultType,
} from './promptTaxonomies.js'
import { analyzePromptVariables } from './promptVariables.js'

export function getPromptWarnings(form = {}) {
  const warnings = []
  const add = (path, code, detail) => warnings.push({ path, code, detail })

  if (form.schemaVersion !== '' && Number(form.schemaVersion) !== 1) add('schemaVersion', 'unsupportedSchemaVersion')
  if (form.contentType && form.contentType !== 'prompt') add('contentType', 'unexpectedContentType')
  if (form.language && !isPromptLanguage(form.language)) add('language', 'unknownLanguage')
  if (form.category && !isPromptCategory(form.category)) add('category', 'unknownCategory')
  if (form.level && !isPromptLevel(form.level)) add('level', 'unknownLevel')
  for (const [index, context] of array(form.contexts).entries()) {
    if (!isPromptContext(context)) add(`contexts[${index}]`, 'unknownContext', context)
  }
  for (const [index, resultType] of array(form.resultTypes).entries()) {
    if (!isPromptResultType(resultType)) add(`resultTypes[${index}]`, 'unknownResultType', resultType)
  }

  const analysis = analyzePromptVariables(form)
  analysis.invalidKeys.forEach(({ key, index }) => add(`variables[${index}].key`, 'invalidVariableKey', key))
  analysis.duplicateKeys.forEach((key) => add('variables', 'duplicateVariableKey', key))
  analysis.undeclaredPlaceholders.forEach((key) => add('promptTemplate', 'undeclaredPlaceholder', key))
  analysis.unusedVariables.forEach((key) => add('variables', 'unusedVariable', key))
  analysis.missingExamples.forEach((key) => add('variables', 'missingExample', key))
  analysis.unknownQuickPlaceholders.forEach((key) => add('quickTemplate', 'unknownQuickPlaceholder', key))

  if (isObject(form.thumbnail)) {
    const hasThumbnailMetadata = Object.values(form.thumbnail).some(hasText)
    if (hasThumbnailMetadata && !hasText(form.thumbnail.generationBrief)) {
      add('thumbnail.generationBrief', 'thumbnailBriefMissing')
    }
    if (hasText(form.thumbnail.preferredAspectRatio) && form.thumbnail.preferredAspectRatio !== '16:9') {
      add('thumbnail.preferredAspectRatio', 'thumbnailRatioUnexpected')
    }
  }

  if (isObject(form.seo)) {
    if (!hasText(form.seo.primaryQuery)) add('seo.primaryQuery', 'seoPrimaryQueryMissing')
    if (!hasText(form.seo.seoTitle)) add('seo.seoTitle', 'seoTitleMissing')
    if (!hasText(form.seo.metaDescription)) add('seo.metaDescription', 'seoDescriptionMissing')
    if (hasText(form.seo.suggestedSlug) && !isValidPromptSlug(form.seo.suggestedSlug)) {
      add('seo.suggestedSlug', 'invalidSuggestedSlug')
    }
  }

  if (!hasText(form.promptTemplate)) add('promptTemplate', 'promptTemplateMissing')
  return warnings
}

function array(value) {
  return Array.isArray(value) ? value : []
}

function hasText(value) {
  return typeof value === 'string' && Boolean(value.trim())
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
