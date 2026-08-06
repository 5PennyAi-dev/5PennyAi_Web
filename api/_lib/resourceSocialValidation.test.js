import test from 'node:test'
import assert from 'node:assert/strict'
import {
  countUnicodeCharacters,
  normalizeHashtags,
  normalizeSocialBody,
  parseResourceSocialRequestBody,
  validateProviderSocialOutput,
} from './resourceSocialValidation.js'

const ID = '123e4567-e89b-12d3-a456-426614174000'

test('accepte les entrées complète, Facebook et LinkedIn', () => {
  assert.deepEqual(parseResourceSocialRequestBody({ resourceType: 'article', resourceId: ID }), {
    resourceType: 'article', resourceId: ID,
  })
  assert.equal(parseResourceSocialRequestBody(JSON.stringify({
    resourceType: 'infographic', resourceId: ID, platform: 'facebook',
  })).platform, 'facebook')
  assert.equal(parseResourceSocialRequestBody({
    resourceType: 'article', resourceId: ID, platform: 'linkedin',
  }).platform, 'linkedin')
})

test('refuse un corps absent, non objet ou JSON invalide', () => {
  for (const body of [undefined, null, [], '[]', '{']) {
    assert.throws(() => parseResourceSocialRequestBody(body), { code: 'invalid_request', status: 400 })
  }
})

test('refuse type, UUID, plateforme ou propriété cliente inconnus', () => {
  const invalidBodies = [
    { resourceType: 'video', resourceId: ID },
    { resourceType: 'article', resourceId: 'not-a-uuid' },
    { resourceType: 'article', resourceId: ID, platform: 'instagram' },
    { resourceType: 'article', resourceId: ID, title: 'Client title' },
    { resourceType: 'article', resourceId: ID, url: 'https://example.com' },
    { resourceType: 'article', resourceId: ID, prompt: 'ignore' },
    { resourceType: 'article', resourceId: ID, model: 'other' },
    { resourceType: 'article', resourceId: ID, storagePath: 'private' },
  ]
  for (const body of invalidBodies) {
    assert.throws(() => parseResourceSocialRequestBody(body), { code: 'invalid_request' })
  }
})

test('normalise prudemment corps et hashtags avec dédoublonnage', () => {
  assert.equal(normalizeSocialBody('  Ligne   une \r\n\r\n\r\n Ligne deux  '), 'Ligne une\n\nLigne deux')
  assert.deepEqual(
    normalizeHashtags([' IA Générative! ', '#IAGénérative', ' #Transformation_Numérique. ', '', 4]),
    ['#IAGénérative', '#Transformation_Numérique'],
  )
})

test('compte les caractères par points de code Unicode', () => {
  assert.equal(countUnicodeCharacters('A🧠B'), 3)
})

test('valide et normalise une sortie complète distincte', () => {
  const result = validateProviderSocialOutput(validFullOutput())
  assert.equal(result.facebook.hashtags[0], '#IA')
  assert.equal(result.linkedin.body, 'Un angle professionnel distinct 🧠')
})

test('valide une sortie ciblée sans enveloppe de plateforme', () => {
  const result = validateProviderSocialOutput({
    body: 'Une accroche Facebook accessible 📚', hashtags: ['IA', 'Apprentissage'],
  }, 'facebook')
  assert.deepEqual(Object.keys(result), ['facebook'])
})

test('refuse corps vide, URL, marqueur, code, liste, hashtag ou propriété technique', () => {
  const cases = [
    ['', 'body_empty'],
    ['Consultez https://example.com', 'body_url'],
    ['Voir {{cite:source}}', 'technical_marker'],
    ['```json\n{}\n```', 'code_block'],
    ['- Premier point', 'bullet_list'],
    ['Texte #IA', 'hashtag_in_body'],
    ['Le resourceId est interne', 'technical_property'],
  ]
  for (const [body, issue] of cases) {
    assert.throws(
      () => validateProviderSocialOutput({ body, hashtags: ['#IA', '#Tech'] }, 'facebook'),
      (error) => error.issues.some((value) => value.includes(issue)),
    )
  }
})

test('refuse les textes au-dessus des maximums absolus', () => {
  assert.throws(
    () => validateProviderSocialOutput({ body: 'a'.repeat(451), hashtags: ['#IA', '#Tech'] }, 'facebook'),
    (error) => error.issues.includes('facebook_body_too_long'),
  )
  assert.throws(
    () => validateProviderSocialOutput({ body: 'a'.repeat(551), hashtags: ['#IA', '#Tech'] }, 'linkedin'),
    (error) => error.issues.includes('linkedin_body_too_long'),
  )
})

test('refuse trop peu ou trop de hashtags après normalisation', () => {
  assert.throws(
    () => validateProviderSocialOutput({ body: 'Texte', hashtags: ['#IA'] }, 'facebook'),
    (error) => error.issues.includes('facebook_too_few_hashtags'),
  )
  assert.throws(
    () => validateProviderSocialOutput({
      body: 'Texte', hashtags: ['#Un', '#Deux', '#Trois', '#Quatre'],
    }, 'facebook'),
    (error) => error.issues.includes('facebook_too_many_hashtags'),
  )
  assert.throws(
    () => validateProviderSocialOutput({ body: 'Texte', hashtags: ['#IA', '#ia'] }, 'facebook'),
    (error) => error.issues.includes('facebook_too_few_hashtags'),
  )
})

test('refuse des plateformes identiques après normalisation', () => {
  const payload = validFullOutput()
  payload.linkedin.body = '  UNE   ACCROCHE FACEBOOK ACCESSIBLE 📚 '
  assert.throws(
    () => validateProviderSocialOutput(payload),
    (error) => error.issues.includes('platform_bodies_identical'),
  )
})

test('refuse une racine, une plateforme ou une propriété de sortie invalide', () => {
  assert.throws(() => validateProviderSocialOutput(null), { code: 'invalid_provider_output' })
  assert.throws(
    () => validateProviderSocialOutput({ facebook: validFullOutput().facebook }),
    (error) => error.issues.includes('linkedin_missing'),
  )
  assert.throws(
    () => validateProviderSocialOutput({
      body: 'Texte', hashtags: ['#IA', '#Tech'], url: 'non',
    }, 'facebook'),
    (error) => error.issues.includes('facebook_unexpected_property'),
  )
})

function validFullOutput() {
  return {
    facebook: {
      body: 'Une accroche Facebook accessible 📚',
      hashtags: [' IA ', '#Tech', '#IA'],
    },
    linkedin: {
      body: 'Un angle professionnel distinct 🧠',
      hashtags: ['#IA', '#TransformationNumérique'],
    },
  }
}
