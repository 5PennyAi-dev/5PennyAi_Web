import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const app = await readFile(new URL('../../../App.jsx', import.meta.url), 'utf8')
const nav = await readFile(new URL('../../../components/admin/resources/AdminResourcesNav.jsx', import.meta.url), 'utf8')
const list = await readFile(new URL('./AdminTopics.jsx', import.meta.url), 'utf8')
const form = await readFile(new URL('./AdminTopicForm.jsx', import.meta.url), 'utf8')
const helper = await readFile(new URL('../../../lib/adminResourceTopics.js', import.meta.url), 'utf8')

test('expose Sujets seulement dans le parcours admin Ressources IA', () => {
  assert.match(app, /path="\/admin\/ressources-ia\/sujets"/)
  assert.match(app, /path="\/admin\/ressources-ia\/sujets\/nouveau"/)
  assert.match(app, /path="\/admin\/ressources-ia\/sujets\/:id"/)
  assert.match(nav, /key: 'topics'/)
  assert.doesNotMatch(app, /path="\/ressources-ia\/sujets/)
})

test('la liste admin affiche les deux langues, slug, comptes et actions responsives', () => {
  for (const key of ['nameFr', 'nameEn', 'slug', 'resources', 'published', 'updated', 'actions']) {
    assert.match(list, new RegExp(`columns\\.\\$\\{key\\}|columns\\.${key}`))
  }
  assert.match(list, /resourceCount/)
  assert.match(list, /publishedCount/)
  assert.match(list, /md:hidden/)
  assert.match(list, /role="alertdialog"/)
})

test('la fiche conserve le slug lors du renommage et affiche les membres avec leurs actions', () => {
  assert.match(form, /!editing && !slugTouched \? proposeResourceTopicSlug\(value\) : current\.slug/)
  assert.match(form, /slugWarning/)
  assert.match(form, /fetchAdminResourceTopicMemberships/)
  assert.match(form, /deleteAdminResourceTopicMembership/)
  assert.match(form, /membership\.format === 'article'/)
})

test('la lecture de liste utilise deux requÃªtes, sans N+1 par sujet', () => {
  assert.match(helper, /Promise\.all\(\[/)
  assert.match(helper, /from\('resource_topics'\)/)
  assert.match(helper, /from\('resource_topic_memberships'\)/)
})
