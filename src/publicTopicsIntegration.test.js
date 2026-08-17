import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const catalog = await readFile(new URL('./lib/publicResourceCatalog.js', import.meta.url), 'utf8')
const topics = await readFile(new URL('./lib/resourceTopics.js', import.meta.url), 'utf8')
const resourcesPage = await readFile(new URL('./pages/ResourcesAI.jsx', import.meta.url), 'utf8')
const homeTopics = await readFile(new URL('./components/sections/HomeTopics.jsx', import.meta.url), 'utf8')
const resourceCard = await readFile(new URL('./components/resources/ResourceCard.jsx', import.meta.url), 'utf8')

test('the public catalog loads and attaches topic data in bounded global queries', () => {
  assert.match(catalog, /fetchPublicResourceTopicRows/)
  assert.match(catalog, /fetchPublicResourceTopicMembershipRows/)
  assert.match(catalog, /attachResourceTopicMemberships/)
  assert.match(catalog, /fetchTopics\(client\)/)
  assert.match(catalog, /fetchTopicMemberships\(client\)/)
  assert.match(catalog, /topicMemberships: \[\]/)
})

test('topic filtering is membership-only and prompts remain outside topics', () => {
  assert.match(topics, /resource\?\.topicMemberships/)
  assert.doesNotMatch(topics, /resource\?\.theme/)
  assert.match(topics, /resource\?\.contentType === 'prompt'/)
  assert.doesNotMatch(catalog, /matchesResourceTopic\([^\n]*theme/)
})

test('the catalogue replaces aliases and removes invalid or ia-generative filters', () => {
  assert.match(resourcesPage, /resolveResourceTopicSlug\(resources, rawTopic\)/)
  assert.match(resourcesPage, /setSearchParams\(nextParams, \{ replace: true \}\)/)
  assert.match(topics, /'ia-generative': ''/)
  assert.match(topics, /LEGACY_RESOURCE_TOPIC_SLUG_ALIASES/)
})

test('homepage, filter chip, and cards use localized persisted topic names', () => {
  assert.match(homeTopics, /getResourceTopicLabel\(topic, i18n\.language\)/)
  assert.match(resourcesPage, /getResourceTopicLabel\(topic, language\)/)
  assert.match(resourceCard, /getResourceTopicMembershipLabels\(resource, i18n\.language\)/)
  assert.doesNotMatch(homeTopics, /labelKey/)
  assert.doesNotMatch(resourceCard, /resource\.theme/)
})
