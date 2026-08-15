import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const migrationUrl = new URL('./20260814173000_drop_legacy_resource_series_columns.sql', import.meta.url)
const sql = readFileSync(migrationUrl, 'utf8')

test('la migration finale est transactionnelle et refuse un schéma inattendu', () => {
  assert.match(sql, /^begin;/i)
  assert.match(sql, /commit;\s*$/i)
  assert.match(sql, /information_schema\.columns/i)
  assert.match(sql, /expected legacy columns are missing/i)
  assert.match(sql, /canonical series tables are missing/i)
  assert.doesNotMatch(sql, /\bcascade\b/i)
})

test('retire explicitement l’index legacy vérifié et seulement les quatre colonnes ciblées', () => {
  assert.match(sql, /articles_series_order_idx has an unexpected definition/i)
  assert.match(sql, /drop index if exists public\.articles_series_order_idx/i)
  assert.equal((sql.match(/drop column series_name/gi) || []).length, 2)
  assert.equal((sql.match(/drop column episode_number/gi) || []).length, 2)
  assert.equal((sql.match(/alter table public\.(?:articles|infographics)/gi) || []).length, 2)
})

test('préserve les tables canoniques et ne modifie ni données, statuts, assets ou memberships', () => {
  assert.match(sql, /to_regclass\('public\.resource_series'\)/i)
  assert.match(sql, /to_regclass\('public\.resource_series_memberships'\)/i)
  assert.doesNotMatch(sql, /\b(?:insert|update|delete|truncate)\b/i)
})
