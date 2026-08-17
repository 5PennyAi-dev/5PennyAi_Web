import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('./ResourceTopicMembershipsField.jsx', import.meta.url), 'utf8')
const articleForm = await readFile(new URL('../../../pages/admin/resources/AdminArticleForm.jsx', import.meta.url), 'utf8')
const infographicForm = await readFile(new URL('../../../pages/admin/resources/AdminInfographicForm.jsx', import.meta.url), 'utf8')

test('partage le bloc Sujets entre Article et Infographie, jamais Prompt', () => {
  assert.match(articleForm, /ResourceTopicMembershipsField resourceId=\{id\} resourceType="article"/)
  assert.match(infographicForm, /ResourceTopicMembershipsField resourceId=\{resourceId\} resourceType="infographic"/)
  assert.doesNotMatch(source, /prompt/)
})

test('couvre ressource non enregistrÃ©e, Ã©tat vide, sÃ©lecteur rÃ©el et retrait ciblÃ©', () => {
  assert.match(source, /if \(!resourceId\)/)
  assert.match(source, /memberships\.length === 0/)
  assert.match(source, /availableTopics\.length === 0/)
  assert.match(source, /<select/)
  assert.match(source, /availableTopics\.map/)
  assert.match(source, /createResourceTopicMembership/)
  assert.match(source, /deleteResourceTopicMembership/)
})

test('empÃªche les doubles requÃªtes et rafraÃ®chit aprÃ¨s un ajout concurrent', () => {
  assert.match(source, /if \(!selectedTopicId \|\| busyId\) return/)
  assert.match(source, /disabled=\{!selectedTopicId \|\| Boolean\(busyId\)\}/)
  assert.match(source, /await load\(\)/)
  assert.match(source, /role="alert"/)
})
