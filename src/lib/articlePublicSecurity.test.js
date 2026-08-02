import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const sql = readFileSync(
  new URL('../../supabase/migrations/20260801030000_allow_public_read_published_article_assets.sql', import.meta.url),
  'utf8',
)

test('la migration garde le bucket privé et limite la lecture aux parents publiés', () => {
  assert.match(sql, /for select\s+to anon/i)
  assert.match(sql, /for select\s+to authenticated/i)
  assert.match(sql, /articles\.status = 'published'/i)
  assert.match(sql, /bucket_id = 'article-assets'/i)
  assert.match(sql, /\(storage\.foldername\(name\)\)\[1\] = 'articles'/i)
  assert.match(sql, /articles\.id::text = \(storage\.foldername\(name\)\)\[2\]/i)
  assert.doesNotMatch(sql, /public\s*=\s*true/i)
})

test('la migration n’ajoute aucune écriture publique', () => {
  assert.doesNotMatch(sql, /for\s+(insert|update|delete)\s+to\s+(anon|authenticated)/i)
  assert.doesNotMatch(sql, /grant\s+(insert|update|delete)/i)
})
