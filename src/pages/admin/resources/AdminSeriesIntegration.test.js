import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const appSource = await readFile(new URL('../../../App.jsx', import.meta.url), 'utf8')
const navSource = await readFile(new URL('../../../components/admin/resources/AdminResourcesNav.jsx', import.meta.url), 'utf8')
const listSource = await readFile(new URL('./AdminSeries.jsx', import.meta.url), 'utf8')
const formSource = await readFile(new URL('./AdminSeriesForm.jsx', import.meta.url), 'utf8')
const articleFormSource = await readFile(new URL('./AdminArticleForm.jsx', import.meta.url), 'utf8')
const dataSource = await readFile(new URL('../../../lib/adminResourceSeries.js', import.meta.url), 'utf8')

test('expose les routes UUID et l’entrée Séries après Prompts', () => {
  assert.match(appSource, /path="\/admin\/ressources-ia\/series"/)
  assert.match(appSource, /path="\/admin\/ressources-ia\/series\/nouvelle"/)
  assert.match(appSource, /path="\/admin\/ressources-ia\/series\/:id"/)
  assert.ok(navSource.indexOf("key: 'series'") > navSource.indexOf("key: 'prompts'"))
})

test('la liste conserve les séries vides et réserve Voir aux séries publiées', () => {
  assert.match(dataSource, /resourceCount: 0, publishedCount: 0/)
  assert.match(listSource, /series\.publishedCount > 0/)
  assert.match(listSource, /series\.resourceCount/)
  assert.match(listSource, /series\.thumbnail_path/)
})

test('la fiche lit les memberships sans écrire les colonnes legacy', () => {
  assert.match(dataSource, /from\('resource_series_memberships'\)/)
  assert.match(dataSource, /article:articles!resource_series_memberships_article_id_fkey/)
  assert.match(dataSource, /infographic:infographics!resource_series_memberships_infographic_id_fkey/)
  assert.match(formSource, /updateAdminSeriesMembershipPosition/)
  assert.match(formSource, /deleteAdminSeriesMembership/)
  assert.doesNotMatch(formSource, /\.update\([^)]*(?:series_name|episode_number)/s)
  assert.doesNotMatch(dataSource, /series_name|episode_number/)
})

test('le slug est proposé à la création puis verrouillé en modification', () => {
  assert.match(formSource, /!editing && !slugTouched \? proposeResourceSeriesSlug\(value\)/)
  assert.match(formSource, /readOnly=\{editing\}/)
})

test('place les séries associées à la section 3 et conserve une numérotation continue', () => {
  const generalSection = articleFormSource.indexOf('<FormSection number="2"')
  const membershipsSection = articleFormSource.indexOf('<FormSection number="3"')
  const topicsSection = articleFormSource.indexOf('<FormSection number="4"')
  const learningSection = articleFormSource.indexOf('<FormSection number="5"')

  assert.ok(generalSection < membershipsSection)
  assert.ok(membershipsSection < topicsSection)
  assert.ok(topicsSection < learningSection)
  for (let number = 1; number <= 16; number += 1) {
    assert.match(articleFormSource, new RegExp(`<FormSection number="${number}"`))
  }
  assert.doesNotMatch(articleFormSource, /<FormSection number="17"/)
})
