import assert from 'node:assert/strict'
import test from 'node:test'
import {
  analyzePromptVariables,
  buildPromptExample,
  extractPromptPlaceholders,
} from './promptVariables.js'

test('extrait les placeholders valides, uniques et dans leur ordre', () => {
  assert.deepEqual(
    extractPromptPlaceholders('[SUJET] [OPTION_A] [SUJET] [pas valide] [OPTION-B]'),
    ['SUJET', 'OPTION_A'],
  )
})

test('détecte clés invalides, doublons, variables inutilisées et placeholders inconnus', () => {
  const result = analyzePromptVariables({
    promptTemplate: 'Compare [OPTION_A] et [OPTION_B] pour [PUBLIC].',
    quickTemplate: 'Compare [OPTION_A] pour [INCONNUE].',
    variables: [
      { key: 'OPTION_A', example: 'A' },
      { key: 'OPTION_A', example: 'Autre A' },
      { key: 'OPTION_B', example: '' },
      { key: 'INUTILE', example: 'X' },
      { key: 'clé invalide', example: 'X' },
    ],
  })
  assert.deepEqual(result.duplicateKeys, ['OPTION_A'])
  assert.deepEqual(result.invalidKeys, [{ key: 'clé invalide', index: 4 }])
  assert.deepEqual(result.undeclaredPlaceholders, ['PUBLIC'])
  assert.deepEqual(result.unusedVariables, ['INUTILE', 'clé invalide'])
  assert.deepEqual(result.missingExamples, ['OPTION_B'])
  assert.deepEqual(result.unknownQuickPlaceholders, ['INCONNUE'])
})

test('calcule en une passe, conserve les inconnus et utilise la première déclaration', () => {
  const result = buildPromptExample('Explique [SUJET] à [PUBLIC] puis [SUJET].', [
    { key: 'SUJET', example: '[PUBLIC]' },
    { key: 'SUJET', example: 'valeur ignorée' },
  ])
  assert.equal(result.text, 'Explique [PUBLIC] à [PUBLIC] puis [PUBLIC].')
  assert.equal(result.complete, false)
  assert.deepEqual(result.unresolvedKeys, ['PUBLIC'])
})

test('accepte les exemples multilignes', () => {
  assert.equal(
    buildPromptExample('Critères:\n[CRITERES]', [{ key: 'CRITERES', example: '- coût\n- délai' }]).text,
    'Critères:\n- coût\n- délai',
  )
})
