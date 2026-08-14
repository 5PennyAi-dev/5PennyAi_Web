import assert from 'node:assert/strict'
import test from 'node:test'
import {
  analyzePromptVariables,
  buildCustomizedPromptSegments,
  buildPromptExample,
  buildPromptExampleSegments,
  extractPromptPlaceholders,
  getUsedPromptVariableKeys,
  splitPromptTemplateForDisplay,
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

test('segmente les substitutions au moment du remplacement sans altérer le résultat final', () => {
  const template = 'Texte identique.\n[TEXTE]\nContexte : [CONTEXTE]\nRappel : [TEXTE]'
  const result = buildPromptExampleSegments(template, [
    { key: 'TEXTE', example: 'Texte identique.' },
    { key: 'CONTEXTE', example: '- coût\n- flexibilité' },
  ])

  assert.equal(result.text, buildPromptExample(template, [
    { key: 'TEXTE', example: 'Texte identique.' },
    { key: 'CONTEXTE', example: '- coût\n- flexibilité' },
  ]).text)
  assert.deepEqual(
    result.segments.filter(({ injected }) => injected).map(({ key, text }) => ({ key, text })),
    [
      { key: 'TEXTE', text: 'Texte identique.' },
      { key: 'CONTEXTE', text: '- coût\n- flexibilité' },
      { key: 'TEXTE', text: 'Texte identique.' },
    ],
  )
  assert.equal(result.segments[0].injected, false)
  assert.equal(result.segments[0].text, 'Texte identique.\n')
})

test('les segments injectés restent littéraux et la substitution demeure non récursive', () => {
  const result = buildPromptExampleSegments('Analyse [A] puis [B].', [
    { key: 'A', example: '[B]' },
    { key: 'B', example: '<script>alert("x")</script>' },
  ])
  assert.equal(result.text, 'Analyse [B] puis <script>alert("x")</script>.')
  assert.deepEqual(
    result.segments.filter(({ injected }) => injected).map(({ text }) => text),
    ['[B]', '<script>alert("x")</script>'],
  )
})

test('retient une seule fois les variables déclarées réellement utilisées', () => {
  assert.deepEqual(
    getUsedPromptVariableKeys('[SUJET] puis [SUJET] pour [PUBLIC] et [INVALIDE-CLE]', [
      { key: 'SUJET' },
      { key: 'INUTILE' },
      { key: 'INVALIDE-CLE' },
    ]),
    ['SUJET'],
  )
})

test('enrichit seulement les placeholders reconnus sans altérer le texte', () => {
  const template = 'Explique [SUJET]\nà [PUBLIC] puis [SUJET].'
  const parts = splitPromptTemplateForDisplay(template, ['SUJET'])
  assert.equal(parts.map(({ text }) => text).join(''), template)
  assert.deepEqual(
    parts.filter(({ highlighted }) => highlighted).map(({ key }) => key),
    ['SUJET', 'SUJET'],
  )
  assert.equal(parts.find(({ key }) => key === 'PUBLIC').highlighted, false)
})

test('personnalise partiellement avec les seules clés autorisées', () => {
  const result = buildCustomizedPromptSegments(
    'Explique [SUJET] à [PUBLIC], puis résume [SUJET] et garde [INCONNUE].',
    { SUJET: 'Les embeddings', PUBLIC: '   ', INCONNUE: 'ne doit pas remplacer' },
    ['SUJET', 'PUBLIC'],
  )
  assert.equal(result.text, 'Explique Les embeddings à [PUBLIC], puis résume Les embeddings et garde [INCONNUE].')
  assert.deepEqual(result.unresolvedKeys, ['PUBLIC', 'INCONNUE'])
  assert.equal(result.segments.filter(({ key, injected }) => key === 'SUJET' && injected).length, 2)
})

test('préserve exactement les valeurs multilignes et effectue une seule passe non récursive', () => {
  const value = 'Premier paragraphe\n\n- [OPTION_B]\n- <script>alert("x")</script>'
  const result = buildCustomizedPromptSegments(
    'Compare [OPTION_A] et [OPTION_B].',
    { OPTION_A: value, OPTION_B: 'la seconde option' },
    ['OPTION_A', 'OPTION_B'],
  )
  assert.equal(result.text, `Compare ${value} et la seconde option.`)
  assert.deepEqual(
    result.segments.filter(({ injected }) => injected).map(({ text }) => text),
    [value, 'la seconde option'],
  )
})

test('une valeur vide conserve son placeholder et son origine', () => {
  const result = buildCustomizedPromptSegments('[A] / [B]', { A: '', B: '\n  ' }, ['A', 'B'])
  assert.equal(result.text, '[A] / [B]')
  assert.deepEqual(
    result.segments.filter(({ origin }) => origin === 'placeholder').map(({ key }) => key),
    ['A', 'B'],
  )
})
