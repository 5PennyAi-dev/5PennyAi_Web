import assert from 'node:assert/strict'
import test from 'node:test'
import { filterAnalyticsEvent } from './analytics.js'

test('exclut les pages d’administration de Vercel Analytics', () => {
  const event = { type: 'pageview', url: 'https://5pennyai.com/admin/ressources-ia/articles' }

  assert.equal(filterAnalyticsEvent(event), null)
  assert.equal(filterAnalyticsEvent({ ...event, url: 'https://5pennyai.com/admin' }), null)
})

test('conserve les pages publiques, y compris celles contenant admin dans leur nom', () => {
  const event = { type: 'pageview', url: 'https://5pennyai.com/ressources-ia?q=admin' }

  assert.equal(filterAnalyticsEvent(event), event)
})
