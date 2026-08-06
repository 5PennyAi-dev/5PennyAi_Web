import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const articleSource = await readFile(new URL('./AdminArticleForm.jsx', import.meta.url), 'utf8')
const infographicSource = await readFile(new URL('./AdminInfographicForm.jsx', import.meta.url), 'utf8')

test('le formulaire article transmet l’identifiant, le slug sauvegardé et la couverture déjà chargée', () => {
  assert.match(articleSource, /<ResourceSocialPostsPanel/)
  assert.match(articleSource, /persistedSlug = editing \? persistedForm\.slug/)
  assert.match(articleSource, /buildArticleCanonicalUrl\(persistedSlug\)/)
  assert.match(articleSource, /assetUrls\[coverPath\] \|\| buildDefaultSocialImageUrl\(\)/)
  assert.match(articleSource, /resourceType="article"/)
  assert.match(articleSource, /resourceId=\{id\}/)
})

test('le formulaire infographie transmet l’UUID, le thumbnail chargé et le statut', () => {
  assert.match(infographicSource, /<ResourceSocialPostsPanel/)
  assert.match(infographicSource, /buildInfographicCanonicalUrl\(resourceId\)/)
  assert.match(infographicSource, /existingThumbnailUrl \|\| buildDefaultSocialImageUrl\(\)/)
  assert.match(infographicSource, /resourceType="infographic"/)
  assert.match(infographicSource, /resourceId=\{resourceId\}/)
  assert.match(infographicSource, /status=\{status\}/)
})

test('les panneaux précèdent les actions existantes et ne remplacent pas leurs gestionnaires', () => {
  assert.ok(articleSource.indexOf('<ResourceSocialPostsPanel') < articleSource.indexOf('onClick={handlePublish}'))
  assert.ok(infographicSource.indexOf('<ResourceSocialPostsPanel') < infographicSource.lastIndexOf('<ActionBar'))
  assert.match(articleSource, /onSubmit=\{handleSubmit\}/)
  assert.match(infographicSource, /onSave=\{handleSave\}/)
})
