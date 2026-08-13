import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { MIDDLEWARE_PATH_PATTERN, resolveApiHandlerPath } from './vite.config.js'

test('achemine les pages de ressources vers le middleware crawler en développement', () => {
  assert.match('/ressources-ia/articles/article-public', MIDDLEWARE_PATH_PATTERN)
  assert.match(
    '/ressources-ia/infographies/11111111-1111-4111-8111-111111111111',
    MIDDLEWARE_PATH_PATTERN,
  )
  assert.match('/ressources-ia/prompts/expliquer-un-concept', MIDDLEWARE_PATH_PATTERN)
  assert.doesNotMatch('/ressources-ia', MIDDLEWARE_PATH_PATTERN)
})

test('résout une URL sociale propre vers le handler existant en développement', () => {
  assert.equal(
    resolveApiHandlerPath('/api/article-social-image/article-public'),
    'article-social-image',
  )
  assert.equal(resolveApiHandlerPath('/api/sitemap'), 'sitemap')
  assert.equal(
    resolveApiHandlerPath('/api/prompt-social-image/expliquer-un-concept'),
    'prompt-social-image',
  )
})

test('réécrit la nouvelle URL sociale avant le catch-all API en production', () => {
  const config = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'))
  const socialIndex = config.rewrites.findIndex(
    (rewrite) => rewrite.source === '/api/article-social-image/:slug',
  )
  const apiIndex = config.rewrites.findIndex((rewrite) => rewrite.source === '/api/(.*)')

  assert.ok(socialIndex >= 0)
  assert.ok(socialIndex < apiIndex)
  assert.equal(
    config.rewrites[socialIndex].destination,
    '/api/article-social-image?slug=:slug',
  )
  const promptSocialIndex = config.rewrites.findIndex(
    (rewrite) => rewrite.source === '/api/prompt-social-image/:slug',
  )
  assert.ok(promptSocialIndex >= 0)
  assert.ok(promptSocialIndex < apiIndex)
  assert.equal(
    config.rewrites[promptSocialIndex].destination,
    '/api/prompt-social-image?slug=:slug',
  )
})
