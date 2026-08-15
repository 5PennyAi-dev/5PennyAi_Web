import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const articleForm = await readFile(new URL('./AdminArticleForm.jsx', import.meta.url), 'utf8')
const infographicForm = await readFile(new URL('./AdminInfographicForm.jsx', import.meta.url), 'utf8')
const articleData = await readFile(new URL('../../../lib/articleFormData.js', import.meta.url), 'utf8')
const articleImport = await readFile(new URL('../../../lib/articleJsonImport.js', import.meta.url), 'utf8')
const infographicImport = await readFile(new URL('../../../lib/infographicJsonImport.js', import.meta.url), 'utf8')
const articleList = await readFile(new URL('./AdminArticles.jsx', import.meta.url), 'utf8')
const infographicList = await readFile(new URL('./AdminInfographics.jsx', import.meta.url), 'utf8')
const publicCatalog = await readFile(new URL('../../../lib/publicResourceCatalog.js', import.meta.url), 'utf8')

test('les sauvegardes éditoriales ne contiennent aucun double write legacy', () => {
  assert.doesNotMatch(articleData, /series_name|episode_number/)
  const infographicPayload = infographicForm.slice(infographicForm.indexOf('function toDatabasePayload'))
  assert.doesNotMatch(infographicPayload, /series_name|episode_number/)
})

test('les imports legacy avertissent sans produire de patch de série', () => {
  for (const source of [articleImport, infographicImport]) {
    assert.match(source, /legacySeriesIgnored/)
    assert.doesNotMatch(source, /patch\.series|patch\.series_name|patch\.episode_number/)
  }
})

test('les formulaires utilisent les memberships sans champ libre ni thumbnail de série', () => {
  assert.match(articleForm, /resourceType="article"/)
  assert.match(infographicForm, /resourceType="infographic"/)
  for (const source of [articleForm, infographicForm]) {
    assert.doesNotMatch(source, /SeriesThumbnailField/)
    assert.doesNotMatch(source, /series_name|episode_number/)
  }
})

test('les listes administratives résument les memberships chargés en lot', () => {
  for (const source of [articleList, infographicList]) {
    assert.match(source, /seriesMemberships/)
    assert.match(source, /memberships\.summary/)
    assert.doesNotMatch(source, /series_name|episode_number/)
  }
})

test('la lecture publique utilise exclusivement les memberships relationnels', () => {
  assert.match(publicCatalog, /seriesMemberships/)
  assert.match(publicCatalog, /resource_series_memberships/)
  assert.doesNotMatch(publicCatalog, /series_name|episode_number/)
})
