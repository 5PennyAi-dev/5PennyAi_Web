import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import test from 'node:test'
import { analyzePromptJson } from './promptJsonImport.js'
import { matchesResourceSearch } from './publicResourceCatalog.js'

const FIXTURE_DIRECTORY = new URL('../../docs/ressources-ia/fixtures/prompts/', import.meta.url)
const fixtures = readdirSync(FIXTURE_DIRECTORY)
  .filter((name) => name.endsWith('.prompt.json'))
  .sort()
  .map((name) => {
    const raw = readFileSync(new URL(name, FIXTURE_DIRECTORY), 'utf8')
    return { name, raw, value: JSON.parse(raw) }
  })

const existingPublished = [
  {
    contentType: 'prompt',
    title: 'Expliquer un concept simplement sans perdre l’essentiel',
    summary: 'Obtenez une explication claire et progressive d’un concept.',
    category: 'understand',
    level: 'beginner',
    contexts: ['daily_life', 'work', 'studies'],
    keywords: ['expliquer', 'concept', 'comprendre'],
  },
  {
    contentType: 'prompt',
    title: 'Comparer deux options selon mes critères',
    summary: 'Comparez deux possibilités selon les critères qui comptent.',
    category: 'decide',
    level: 'beginner',
    contexts: ['daily_life', 'work'],
    keywords: ['comparer', 'options', 'critères'],
  },
]

test('le lot complémentaire contient 18 Prompts importables sans avertissement', () => {
  assert.equal(fixtures.length, 18)
  for (const fixture of fixtures) {
    const analysis = analyzePromptJson(fixture.raw)
    assert.equal(analysis.success, true, fixture.name)
    assert.deepEqual(analysis.warnings, [], fixture.name)
    assert.deepEqual(analysis.forbidden, [], fixture.name)
    assert.deepEqual(analysis.unknown, [], fixture.name)
  }
})

test('respecte la répartition éditoriale, avec une majorité de niveaux débutants', () => {
  const completeCorpus = [
    ...fixtures.map(({ value }) => value),
    ...existingPublished,
  ]
  const categories = countBy(completeCorpus, (value) => value.category)
  assert.deepEqual(categories, {
    decide: 2,
    learn: 3,
    organize: 3,
    summarize: 2,
    think: 2,
    understand: 2,
    verify: 2,
    write: 4,
  })
  assert.deepEqual(countBy(completeCorpus, (value) => value.level), { beginner: 14, intermediate: 6 })
})

test('chaque Prompt possède variables, exemples, SEO et brief de thumbnail fidèles', () => {
  const titles = new Set()
  const slugs = new Set()
  for (const { name, value } of fixtures) {
    assert.ok(!titles.has(value.title), `titre dupliqué: ${value.title}`)
    assert.ok(!slugs.has(value.seo.suggestedSlug), `slug dupliqué: ${value.seo.suggestedSlug}`)
    titles.add(value.title)
    slugs.add(value.seo.suggestedSlug)
    assert.ok(value.summary && value.whenToUse && value.promptTemplate && value.tip, name)
    assert.ok(value.editorialObjective && value.keywords.length >= 4, name)
    assert.ok(value.seo.primaryQuery && value.seo.seoTitle && value.seo.metaDescription, name)
    assert.equal(value.seo.internalLinkSuggestions.length, 0, name)
    assert.equal(value.thumbnail.preferredAspectRatio, '16:9', name)
    assert.match(value.thumbnail.generationBrief, new RegExp(escapeRegExp(`« ${value.title} »`)), name)
    assert.match(value.thumbnail.generationBrief, /zone sûre/i, name)
    assert.match(value.thumbnail.generationBrief, /coupée|coupé/i, name)
    assert.doesNotMatch(value.promptTemplate, /chain[- ]of[- ]thought|raisonnement interne|étapes de ton raisonnement/i, name)
    for (const variable of value.variables) {
      assert.match(variable.key, /^[A-Z0-9]+(?:_[A-Z0-9]+)*$/, name)
      assert.ok(variable.label && variable.description && variable.example, `${name}:${variable.key}`)
      assert.match(value.promptTemplate, new RegExp(`\\[${variable.key}\\]`), `${name}:${variable.key}`)
    }
  }
})

test('les recherches naturelles et multi-termes retrouvent les fiches attendues sans indexer le template', () => {
  const resources = fixtures.map(({ value }, index) => ({
    id: String(index),
    contentType: 'prompt',
    title: value.title,
    summary: value.summary,
    category: value.category,
    contexts: value.contexts,
    keywords: value.keywords,
  })).concat(existingPublished)
  for (const [query, titlePart] of [
    ['expliquer', 'Expliquer un concept'],
    ['apprendre', 'Créer un plan'],
    ['brouillon', 'premier brouillon'],
    ['reformuler', 'Reformuler'],
    ['résumer', 'Résumer'],
    ['notes', 'notes dispersées'],
    ['tâches', 'liste de tâches'],
    ['options', 'Comparer deux options'],
    ['vérifier', 'vérifié dans une réponse'],
    ['comparer options', 'Comparer deux options'],
    ['plan apprendre', 'Créer un plan'],
    ['message professionnel', 'message professionnel'],
  ]) {
    const found = resources.filter((resource) => matchesResourceSearch(resource, query))
    assert.ok(found.some(({ title }) => title.includes(titlePart)), `${query}: ${found.map(({ title }) => title).join(', ')}`)
  }

  const hiddenTemplateOnly = { contentType: 'prompt', title: 'Titre neutre', promptTemplate: 'mot-secret-template' }
  assert.equal(matchesResourceSearch(hiddenTemplateOnly, 'mot-secret-template'), false)
})

function countBy(values, getKey) {
  return Object.fromEntries([...values.reduce((map, value) => {
    const key = getKey(value)
    map.set(key, (map.get(key) || 0) + 1)
    return map
  }, new Map())].sort(([left], [right]) => left.localeCompare(right)))
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
