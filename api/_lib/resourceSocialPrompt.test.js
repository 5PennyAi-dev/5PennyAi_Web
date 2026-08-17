import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildResourceSocialRequest,
  buildResourceSocialSchema,
  generateResourceSocialContent,
  RESOURCE_SOCIAL_MODEL,
  SOCIAL_POST_STYLE_VERSION,
} from './resourceSocialPrompt.js'

const CONTEXT = Object.freeze({
  id: '123e4567-e89b-12d3-a456-426614174000',
  resourceType: 'article',
  language: 'fr',
  title: 'Comprendre le RAG',
  subtitle: '',
  level: 'beginner',
  mainIdea: 'Le contexte récupéré soutient la génération.',
  supportingContext: 'La récupération précède la réponse.',
})

test('construit deux schémas stricts complet et ciblé', () => {
  const full = buildResourceSocialSchema()
  assert.equal(full.additionalProperties, false)
  assert.deepEqual(full.required, ['facebook', 'linkedin'])
  assert.equal(full.properties.facebook.additionalProperties, false)
  assert.equal(full.properties.facebook.properties.hashtags.minItems, 2)
  assert.equal(full.properties.linkedin.properties.hashtags.maxItems, 4)

  const targeted = buildResourceSocialSchema('facebook')
  assert.deepEqual(targeted.required, ['body', 'hashtags'])
  assert.equal(targeted.properties.body.maxLength, 450)
  assert.equal(targeted.additionalProperties, false)
})

test('prépare la Responses API avec le modèle imposé, store false et aucun outil', () => {
  const request = buildResourceSocialRequest({ context: CONTEXT })
  assert.equal(request.model, RESOURCE_SOCIAL_MODEL)
  assert.equal(request.model, 'gpt-5.6-luna')
  assert.equal(request.store, false)
  assert.equal(request.text.format.type, 'json_schema')
  assert.equal(request.text.format.strict, true)
  assert.equal(Object.hasOwn(request, 'tools'), false)
  assert.match(request.instructions, new RegExp(SOCIAL_POST_STYLE_VERSION))
  assert.match(request.instructions, /1 à 3 émojis/)
  assert.match(request.instructions, /n’est pas un résumé/)
  assert.doesNotMatch(request.input, /resourceId|123e4567|https?:|cover_path/)
})

test('utilise le schéma ciblé pour une régénération LinkedIn', () => {
  const request = buildResourceSocialRequest({ context: CONTEXT, platform: 'linkedin' })
  assert.equal(request.text.format.name, 'resource_social_linkedin_v1')
  assert.deepEqual(request.text.format.schema.required, ['body', 'hashtags'])
  assert.match(request.input, /Plateforme demandée : linkedin/)
})

test('retourne une sortie complète valide au premier appel', async () => {
  const { openai, calls } = mockOpenAi([completed(validFull())])
  const result = await generateResourceSocialContent({ openai, context: CONTEXT, logger: quietLogger() })
  assert.equal(calls.length, 1)
  assert.equal(result.facebook.hashtags.length, 2)
  assert.equal(result.linkedin.hashtags.length, 2)
})

test('retourne uniquement la plateforme ciblée', async () => {
  const { openai, calls } = mockOpenAi([completed({
    body: 'Une accroche professionnelle et distincte 🧠',
    hashtags: ['#IA', '#RAG'],
  })])
  const result = await generateResourceSocialContent({
    openai, context: CONTEXT, platform: 'linkedin', logger: quietLogger(),
  })
  assert.deepEqual(Object.keys(result), ['linkedin'])
  assert.deepEqual(calls[0].text.format.schema.required, ['body', 'hashtags'])
})

test('effectue une seule correction ciblée après une sortie éditoriale invalide', async () => {
  const invalid = validFull()
  invalid.linkedin.body = invalid.facebook.body
  const { openai, calls } = mockOpenAi([completed(invalid), completed(validFull())])
  const result = await generateResourceSocialContent({ openai, context: CONTEXT, logger: quietLogger() })
  assert.equal(calls.length, 2)
  assert.match(calls[1].input, /CORRECTION UNIQUE/)
  assert.match(calls[1].input, /platform_bodies_identical/)
  assert.equal(result.linkedin.body, validFull().linkedin.body)
})

test('corrige une réponse JSON invalide sans extraire de bloc Markdown', async () => {
  const { openai, calls } = mockOpenAi([
    { status: 'completed', output_text: '```json\n{}\n```', output: [] },
    completed(validFull()),
  ])
  await generateResourceSocialContent({ openai, context: CONTEXT, logger: quietLogger() })
  assert.equal(calls.length, 2)
  assert.match(calls[1].input, /invalid_json/)
})

test('refuse après la correction invalide et ne lance jamais de troisième appel', async () => {
  const { openai, calls } = mockOpenAi([completed({}), completed({})])
  await assert.rejects(
    generateResourceSocialContent({ openai, context: CONTEXT, logger: quietLogger() }),
    { code: 'invalid_provider_output', status: 502 },
  )
  assert.equal(calls.length, 2)
})

test('gère réponse vide et incomplète avec au plus une correction', async () => {
  const empty = mockOpenAi([{ status: 'completed', output_text: '', output: [] }, completed(validFull())])
  await generateResourceSocialContent({ openai: empty.openai, context: CONTEXT, logger: quietLogger() })
  assert.equal(empty.calls.length, 2)

  const incomplete = mockOpenAi([
    { status: 'incomplete', incomplete_details: { reason: 'max_output_tokens' }, output_text: '', output: [] },
    completed(validFull()),
  ])
  await generateResourceSocialContent({ openai: incomplete.openai, context: CONTEXT, logger: quietLogger() })
  assert.equal(incomplete.calls.length, 2)
})

test('gère explicitement un refus sans réessai ni contenu sensible', async () => {
  const { openai, calls } = mockOpenAi([{
    status: 'completed',
    output_text: '',
    output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'private explanation' }] }],
  }])
  await assert.rejects(
    generateResourceSocialContent({ openai, context: CONTEXT, logger: quietLogger() }),
    { code: 'provider_failed', status: 502 },
  )
  assert.equal(calls.length, 1)
})

test('transforme les erreurs réseau, quota ou fournisseur en provider_failed', async () => {
  for (const error of [new Error('network'), Object.assign(new Error('quota'), { status: 429 })]) {
    const openai = { responses: { create: async () => { throw error } } }
    await assert.rejects(
      generateResourceSocialContent({ openai, context: CONTEXT, logger: quietLogger() }),
      { code: 'provider_failed', status: 502 },
    )
  }
})

function validFull() {
  return {
    facebook: {
      body: 'Une question accessible pour mieux comprendre le RAG 📚',
      hashtags: ['#IA', '#RAG'],
    },
    linkedin: {
      body: 'Pourquoi la récupération change-t-elle le contexte professionnel? 🧠 Consultez cet article pour distinguer les étapes.',
      hashtags: ['#IntelligenceArtificielle', '#RAG'],
    },
  }
}

function completed(payload) {
  return { status: 'completed', output_text: JSON.stringify(payload), output: [] }
}

function mockOpenAi(responses) {
  const calls = []
  return {
    calls,
    openai: {
      responses: {
        create: async (request) => {
          calls.push(request)
          return responses[calls.length - 1]
        },
      },
    },
  }
}

function quietLogger() {
  return { info() {}, error() {} }
}
