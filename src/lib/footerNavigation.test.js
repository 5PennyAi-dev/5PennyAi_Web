import test from 'node:test'
import assert from 'node:assert/strict'
import { FOOTER_NAVIGATION } from './footerNavigation.js'

test('footer navigation retains the public educational routes without a learning-path placeholder', () => {
  const routes = FOOTER_NAVIGATION.flatMap((group) => group.links.map((link) => link.to))

  assert.deepEqual(routes, [
    '/ressources-ia?vue=series',
    '/ressources-ia',
    '/ressources-ia?format=articles',
    '/ressources-ia?format=infographies',
    '/ressources-ia?format=prompt',
    '/about',
    '/portfolio',
    '/contact',
  ])
  assert.equal(FOOTER_NAVIGATION.some((group) => group.key === 'path'), false)
})
