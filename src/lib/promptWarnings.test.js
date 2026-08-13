import assert from 'node:assert/strict'
import test from 'node:test'
import { createEmptyPromptForm } from './promptFormData.js'
import { getPromptWarnings } from './promptWarnings.js'

test('produit les avertissements déterministes sans bloquer le formulaire', () => {
  const form = createEmptyPromptForm()
  Object.assign(form, {
    schemaVersion: '2', contentType: 'article', language: 'es', category: 'other', level: 'expert',
    contexts: ['business'], resultTypes: ['diagram'],
    promptTemplate: '[SUJET] [PUBLIC]', quickTemplate: '[AUTRE]',
    variables: [
      { key: 'SUJET', example: '' },
      { key: 'SUJET', example: 'deuxième' },
      { key: 'INUTILE', example: 'x' },
      { key: 'pas valide', example: 'x' },
    ],
    thumbnail: { altText: 'Visuel', generationBrief: '', preferredAspectRatio: '4:3' },
    seo: { primaryQuery: '', seoTitle: '', metaDescription: '', suggestedSlug: 'Slug Invalide' },
  })
  const codes = getPromptWarnings(form).map(({ code }) => code)
  for (const expected of [
    'unsupportedSchemaVersion', 'unexpectedContentType', 'unknownLanguage', 'unknownCategory',
    'unknownLevel', 'unknownContext', 'unknownResultType', 'invalidVariableKey',
    'duplicateVariableKey', 'undeclaredPlaceholder', 'unusedVariable', 'missingExample',
    'unknownQuickPlaceholder', 'thumbnailBriefMissing', 'thumbnailRatioUnexpected',
    'seoPrimaryQueryMissing', 'seoTitleMissing', 'seoDescriptionMissing', 'invalidSuggestedSlug',
  ]) assert.ok(codes.includes(expected), expected)
})
