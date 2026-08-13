import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const migration = fs.readFileSync(
  new URL('../../supabase/migrations/20260813010000_create_prompts.sql', import.meta.url),
  'utf8',
)
const app = fs.readFileSync(new URL('../App.jsx', import.meta.url), 'utf8')
const resourcesPage = fs.readFileSync(new URL('../pages/ResourcesAI.jsx', import.meta.url), 'utf8')

test('RLS limite les lectures publiques aux prompts publiés et réserve le CRUD à admin', () => {
  assert.match(migration, /to anon\s+using \(status = 'published'\)/s)
  assert.match(migration, /to authenticated\s+using \(status = 'published'\)/s)
  assert.match(migration, /for all\s+to authenticated\s+using \(public\.is_resources_admin\(\)\)/s)
})

test('Storage reste privé, limité au préfixe thumbnail et lié au statut publié', () => {
  assert.match(migration, /bucket_id = 'article-assets'/)
  assert.match(migration, /\(storage\.foldername\(name\)\)\[1\] = 'prompts'/)
  assert.match(migration, /\(storage\.foldername\(name\)\)\[3\] = 'thumbnail'/)
  assert.match(migration, /prompts\.id::text = \(storage\.foldername\(name\)\)\[2\][\s\S]*prompts\.status = 'published'/)
  assert.doesNotMatch(migration, /values \('infographics'/)
})

test('l’incrément 3 conserve la route directe et branche la carte spécialisée du catalogue', () => {
  assert.match(app, /path="\/ressources-ia\/prompts\/:slug"/)
  assert.match(resourcesPage, /import PromptCard from/)
  assert.match(resourcesPage, /resource\.contentType === 'prompt'/)
  assert.doesNotMatch(resourcesPage, /PromptDetail/)
})
