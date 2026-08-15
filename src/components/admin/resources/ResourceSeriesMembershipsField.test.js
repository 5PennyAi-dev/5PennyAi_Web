import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('./ResourceSeriesMembershipsField.jsx', import.meta.url), 'utf8')
const articleForm = await readFile(new URL('../../../pages/admin/resources/AdminArticleForm.jsx', import.meta.url), 'utf8')
const infographicForm = await readFile(new URL('../../../pages/admin/resources/AdminInfographicForm.jsx', import.meta.url), 'utf8')

test('partage le même composant entre Article et Infographie', () => {
  assert.match(articleForm, /ResourceSeriesMembershipsField resourceId=\{id\} resourceType="article"/)
  assert.match(infographicForm, /ResourceSeriesMembershipsField resourceId=\{resourceId\} resourceType="infographic"/)
})

test('gère ressource non enregistrée, état vide, ajout et toutes séries utilisées', () => {
  assert.match(source, /if \(!resourceId\)/)
  assert.match(source, /memberships\.length === 0/)
  assert.match(source, /availableSeries\.length === 0/)
  assert.match(source, /selectedSeriesId/)
  assert.doesNotMatch(source, /resourceType="prompt"/)
})

test('affiche chaque membership avec position indépendante et actions explicites', () => {
  assert.match(source, /memberships\.map\(\(membership\)/)
  assert.match(source, /positions\[membership\.id\]/)
  assert.match(source, /updateMembershipPosition/)
  assert.match(source, /deleteMembership/)
  assert.match(source, /SERIES_PATH.*membership\.seriesId/)
})

test('désactive les mutations concurrentes et associe les erreurs aux champs', () => {
  assert.match(source, /disabled=\{Boolean\(busyId\)/)
  assert.match(source, /aria-describedby=\{formError === 'positionConflict'/)
  assert.match(source, /role="alert"/)
})

test('les formulaires ne présentent plus les champs ou thumbnails legacy', () => {
  for (const form of [articleForm, infographicForm]) {
    assert.doesNotMatch(form, /SeriesThumbnailField/)
    assert.doesNotMatch(form, /series_name|episode_number/)
  }
})
