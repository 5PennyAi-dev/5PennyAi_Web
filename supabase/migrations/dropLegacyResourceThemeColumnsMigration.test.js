import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const migrationUrl = new URL('./20260817143338_drop_legacy_resource_theme_columns.sql', import.meta.url)
const sql = readFileSync(migrationUrl, 'utf8')

test('la migration Theme est transactionnelle, cible le schéma attendu et interdit CASCADE', () => {
  assert.match(sql, /^begin;/i)
  assert.match(sql, /commit;\s*$/i)
  assert.match(sql, /pg_attribute/i)
  assert.match(sql, /execute 'alter table public\.articles drop column if exists theme';/i)
  assert.match(sql, /execute 'alter table public\.infographics drop column if exists theme';/i)
  assert.doesNotMatch(sql, /\bcascade\b/i)
})

test('elle protège seulement les ressources publiées et accepte les brouillons non classifiés', () => {
  assert.match(sql, /article\.status = 'published'/i)
  assert.match(sql, /infographic\.status = 'published'/i)
  assert.match(sql, /published Article has no Topic membership/i)
  assert.match(sql, /published Infographic has no Topic membership/i)
  assert.match(sql, /Draft resources are allowed[\s\S]*not migrated/i)
  assert.doesNotMatch(sql, /status\s*(?:=|<>|!=)\s*'draft'/i)
  assert.doesNotMatch(sql, /theme\s+is\s+not\s+null/i)
})

test('elle inspecte les dépendances et ne retire que les deux colonnes legacy', () => {
  for (const dependency of ['pg_index', 'constraint_column_usage', 'pg_views', 'pg_proc', 'information_schema.triggers', 'pg_policies']) {
    assert.match(sql, new RegExp(dependency.replace('.', '\\.')))
  }
  assert.equal((sql.match(/drop column (?:if exists )?theme/gi) || []).length, 2)
  assert.equal((sql.match(/alter table public\.(?:articles|infographics)/gi) || []).length, 2)
  assert.doesNotMatch(sql, /drop (?:table|index|function|trigger|policy)/i)
})

test('elle conserve les Topics, Séries, comptes et memberships sans mapping ni DML métier', () => {
  assert.doesNotMatch(sql, /resource_theme_drop_baseline|create\s+temporary\s+table/i)
  assert.match(sql, /resource_topics/i)
  assert.match(sql, /resource_topic_memberships/i)
  assert.match(sql, /resource_series/i)
  assert.match(sql, /resource_series_memberships/i)
  assert.match(sql, /invalid or orphaned Topic membership/i)
  assert.match(sql, /counts changed unexpectedly/i)
  assert.doesNotMatch(sql, /\b(?:update|delete|truncate)\b/i)
  assert.doesNotMatch(sql, /insert into public\.(?:resource_topics|resource_topic_memberships|resource_series|resource_series_memberships)/i)
  assert.doesNotMatch(sql, /theme\s*[-=]>\s*topic/i)
})

test('keeps the baseline and idempotent column drops inside one DO block', () => {
  assert.equal((sql.match(/do \$migration\$/gi) || []).length, 1)
  assert.match(sql, /articles_total integer/i)
  assert.match(sql, /into\s+articles_total,\s+articles_published,\s+infographics_total,/i)
  assert.match(sql, /execute 'alter table public\.articles drop column if exists theme';[\s\S]*execute 'alter table public\.infographics drop column if exists theme';[\s\S]*articles_total <>/i)
})
