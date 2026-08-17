import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const migrationUrl = new URL(
  './20260817010000_create_resource_topics.sql',
  import.meta.url,
)

async function loadMigration() {
  return readFile(migrationUrl, 'utf8')
}

test('la migration crée une taxonomie plate avec une identité publique stable', async () => {
  const sql = await loadMigration()

  assert.match(sql, /create table public\.resource_topics/i)
  assert.match(sql, /id uuid primary key default gen_random_uuid\(\)/i)
  assert.match(sql, /slug text not null unique/i)
  assert.match(sql, /name_fr text not null/i)
  assert.match(sql, /name_en text not null/i)
  assert.match(sql, /description_fr text/i)
  assert.match(sql, /description_en text/i)
  assert.doesNotMatch(sql, /\bparent_id\b/i)
  assert.doesNotMatch(sql, /resource_count\s+(?:integer|bigint|text|uuid)/i)
})

test('la migration protège la forme, les FKs et les unicitÃ©s des memberships', async () => {
  const sql = await loadMigration()

  assert.match(sql, /create table public\.resource_topic_memberships/i)
  assert.match(sql, /num_nonnulls\(article_id, infographic_id\) = 1/i)
  assert.match(sql, /references public\.resource_topics\(id\) on delete cascade/i)
  assert.match(sql, /references public\.articles\(id\) on delete cascade/i)
  assert.match(sql, /references public\.infographics\(id\) on delete cascade/i)
  assert.match(sql, /unique index resource_topic_memberships_topic_article_uidx[\s\S]*where article_id is not null/i)
  assert.match(sql, /unique index resource_topic_memberships_topic_infographic_uidx[\s\S]*where infographic_id is not null/i)
  assert.doesNotMatch(sql, /\bprompt_id\b/i)
  assert.doesNotMatch(sql, /unique\s*\(article_id\)/i)
  assert.doesNotMatch(sql, /unique\s*\(infographic_id\)/i)
})

test('la migration seed les neuf sujets V1 et le backfill contrôlé', async () => {
  const sql = await loadMigration()
  const topicSlugs = [
    'fondamentaux-ia',
    'modeles-de-langage',
    'prompting-interaction',
    'rag-recherche-semantique',
    'agents-outils',
    'fiabilite-evaluation',
    'entrainement-adaptation',
    'assistants-programmation',
    'multimodalite',
  ]

  for (const slug of topicSlugs) {
    assert.match(sql, new RegExp(`'${slug}'`))
  }

  assert.doesNotMatch(sql, /'ia-generative'\s*,\s*'IA générative'/i)
  assert.match(sql, /'Qu’est-ce qu’un modèle de fondation\?',\s*'fondamentaux-ia'/i)
  assert.match(sql, /'Peut-on faire confiance à une réponse générée par une IA\?',\s*'fiabilite-evaluation'/i)
  assert.match(sql, /actual_mappings <> 38/i)
  assert.match(sql, /expected_memberships integer := 38/i)
  assert.match(sql, /'modeles-de-langage', 11/i)
  assert.match(sql, /resource\.title is distinct from mapping\.expected_title/i)
  assert.match(sql, /a published resource has no explicit mapping/i)
})

test('les policies publiques ne révèlent que les memberships de ressources publiées', async () => {
  const sql = await loadMigration()

  assert.match(sql, /Public can read resource topics/i)
  assert.match(sql, /Public can read published resource topic memberships/i)
  assert.match(sql, /article\.status = 'published'/i)
  assert.match(sql, /infographic\.status = 'published'/i)
  assert.match(sql, /Resources admin can manage resource topics/i)
  assert.match(sql, /Resources admin can manage resource topic memberships/i)
  assert.match(sql, /using \(public\.is_resources_admin\(\)\)/i)
  assert.match(sql, /with check \(public\.is_resources_admin\(\)\)/i)
})

test('the temporary backfill table remains in scope for every validation', async () => {
  const sql = await loadMigration()
  const creationIndex = sql.search(/create temporary table resource_topic_backfill/i)
  const firstUseIndex = sql.search(/insert into resource_topic_backfill/i)
  const lastUseIndex = sql.lastIndexOf('from resource_topic_backfill mapping')
  const dropIndex = sql.search(/drop table resource_topic_backfill;/i)
  const commitIndex = sql.search(/^commit;$/im)

  assert.ok(creationIndex >= 0)
  assert.ok(firstUseIndex > creationIndex)
  assert.match(sql, /\) on commit preserve rows;/i)
  assert.doesNotMatch(sql, /\) on commit drop;/i)
  assert.ok(lastUseIndex > firstUseIndex)
  assert.ok(dropIndex > lastUseIndex)
  assert.ok(commitIndex > dropIndex)
  assert.match(sql, /an explicit mapping has no matching membership/i)
})
