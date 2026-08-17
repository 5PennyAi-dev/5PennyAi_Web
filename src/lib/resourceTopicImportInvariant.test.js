import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { createEmptyArticleForm } from './articleFormData.js'
import { importArticleJson } from './articleJsonImport.js'
import { importInfographicJson } from './infographicJsonImport.js'

const articleImporter = await readFile(new URL('./articleJsonImport.js', import.meta.url), 'utf8')
const infographicImporter = await readFile(new URL('./infographicJsonImport.js', import.meta.url), 'utf8')

test('import et r\u00e9import Article conservent les topic memberships hors du contrat JSON', () => {
  const current = createEmptyArticleForm()
  current.topicMemberships = [{ id: 'topic-membership-existing', topic_id: 'language' }]

  const result = importArticleJson(JSON.stringify({ title: 'Titre import\u00e9', theme: 'rag', keywords: ['rag'] }), current)

  assert.equal(result.success, true)
  assert.equal(result.nextForm.title, 'Titre import\u00e9')
  assert.deepEqual(result.nextForm.topicMemberships, current.topicMemberships)
  assert.equal('topicMemberships' in result.patch, false)
})

test('import et r\u00e9import Infographie conservent les topic memberships hors du contrat JSON', () => {
  const current = {
    title: 'Titre actuel',
    topicMemberships: [{ id: 'topic-membership-existing', topic_id: 'multimodalite' }],
  }

  const result = importInfographicJson(
    JSON.stringify({ title: 'Titre import\u00e9', theme: 'ia-generative', keywords: ['image'] }),
    current,
  )

  assert.equal(result.success, true)
  assert.equal(result.nextForm.title, 'Titre import\u00e9')
  assert.deepEqual(result.nextForm.topicMemberships, current.topicMemberships)
  assert.equal('topicMemberships' in result.patch, false)
})

test('les importeurs ne connaissent ni la table ni les helpers de memberships Sujet', () => {
  for (const source of [articleImporter, infographicImporter]) {
    assert.doesNotMatch(source, /resource_topic_memberships/)
    assert.doesNotMatch(source, /adminResourceTopic/)
  }
})

test('les anciens champs theme sont ignorés sans modifier les memberships', () => {
  const articleCurrent = {
    title: 'Current article',
    topicMemberships: [{ id: 'article-membership' }],
  }
  const infographicCurrent = {
    title: 'Current infographic',
    topicMemberships: [{ id: 'infographic-membership' }],
  }

  const article = importArticleJson(JSON.stringify({ title: 'Imported article', theme: 'Legacy' }), articleCurrent)
  const infographic = importInfographicJson(JSON.stringify({ title: 'Imported infographic', theme: 'Legacy' }), infographicCurrent)

  for (const result of [article, infographic]) {
    assert.equal('theme' in result.patch, false)
    assert.ok(result.warnings.some(({ code }) => code === 'legacyThemeIgnored'))
  }
  assert.deepEqual(article.nextForm.topicMemberships, articleCurrent.topicMemberships)
  assert.deepEqual(infographic.nextForm.topicMemberships, infographicCurrent.topicMemberships)
})
