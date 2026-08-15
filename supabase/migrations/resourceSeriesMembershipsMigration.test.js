import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const migrationUrl = new URL(
  './20260814010000_create_resource_series_memberships.sql',
  import.meta.url,
)

async function loadMigration() {
  return readFile(migrationUrl, 'utf8')
}

test('la migration crée l’identité stable et conserve le slug public unique', async () => {
  const sql = await loadMigration()

  assert.match(sql, /add column id uuid default gen_random_uuid\(\)/i)
  assert.match(sql, /add constraint resource_series_pkey primary key \(id\)/i)
  assert.match(sql, /add constraint resource_series_slug_key unique \(slug\)/i)
  assert.doesNotMatch(sql, /drop column\s+(?:if exists\s+)?(?:series_name|episode_number)/i)
})

test('la migration protège la forme et les unicités des memberships', async () => {
  const sql = await loadMigration()

  assert.match(sql, /num_nonnulls\(article_id, infographic_id\) = 1/i)
  assert.match(sql, /position is null or position > 0/i)
  assert.match(sql, /references public\.resource_series\(id\) on delete cascade/i)
  assert.match(sql, /references public\.articles\(id\) on delete cascade/i)
  assert.match(sql, /references public\.infographics\(id\) on delete cascade/i)
  assert.match(sql, /unique index resource_series_memberships_series_article_uidx[\s\S]*where article_id is not null/i)
  assert.match(sql, /unique index resource_series_memberships_series_infographic_uidx[\s\S]*where infographic_id is not null/i)
  assert.match(sql, /unique index resource_series_memberships_series_position_uidx[\s\S]*where position is not null/i)
})

test('les deux apostrophes du vocabulaire ciblent le même slug explicite', async () => {
  const sql = await loadMigration()
  const straightApostrophe = "Le vocabulaire de l''IA générative"
  const typographicApostrophe = 'Le vocabulaire de l’IA générative'

  assert.ok(sql.includes(straightApostrophe))
  assert.ok(sql.includes(typographicApostrophe))
  assert.match(
    sql,
    /when series_name in \([\s\S]*Le vocabulaire de l''IA générative[\s\S]*Le vocabulaire de l’IA générative[\s\S]*\) then 'le-vocabulaire-de-l-ia-generative'/i,
  )
})

test('les politiques publiques filtrent les brouillons et les écritures exigent l’admin', async () => {
  const sql = await loadMigration()

  assert.match(sql, /Public can read published resource series memberships/i)
  assert.match(sql, /article\.status = 'published'/i)
  assert.match(sql, /infographic\.status = 'published'/i)
  assert.match(sql, /Resources admin can manage resource series memberships/i)
  assert.match(sql, /using \(public\.is_resources_admin\(\)\)/i)
  assert.match(sql, /with check \(public\.is_resources_admin\(\)\)/i)
})
