import {
  ResourceSocialError,
  PLATFORM_RULES,
  validateProviderSocialOutput,
} from './resourceSocialValidation.js'

export const RESOURCE_SOCIAL_MODEL = 'gpt-5.6-luna'
export const SOCIAL_POST_STYLE_VERSION = 'social-post-style-v1'
export const FACEBOOK_PROFILE_VERSION = 'facebook-post-profile-v1'
export const LINKEDIN_PROFILE_VERSION = 'linkedin-post-profile-v1'

const PLATFORM_PROPERTY_SCHEMAS = Object.freeze({
  facebook: buildPlatformSchema('facebook'),
  linkedin: buildPlatformSchema('linkedin'),
})

export function buildResourceSocialSchema(platform) {
  if (platform) {
    return {
      type: 'object',
      additionalProperties: false,
      properties: {
        body: PLATFORM_PROPERTY_SCHEMAS[platform].properties.body,
        hashtags: PLATFORM_PROPERTY_SCHEMAS[platform].properties.hashtags,
      },
      required: ['body', 'hashtags'],
    }
  }

  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      facebook: PLATFORM_PROPERTY_SCHEMAS.facebook,
      linkedin: PLATFORM_PROPERTY_SCHEMAS.linkedin,
    },
    required: ['facebook', 'linkedin'],
  }
}

export function buildResourceSocialRequest({ context, platform, correction }) {
  const formatName = platform ? `resource_social_${platform}_v1` : 'resource_social_full_v1'
  return {
    model: RESOURCE_SOCIAL_MODEL,
    instructions: buildInstructions(platform),
    input: buildEditorialInput(context, platform, correction),
    max_output_tokens: platform ? 600 : 1000,
    store: false,
    text: {
      format: {
        type: 'json_schema',
        name: formatName,
        strict: true,
        schema: buildResourceSocialSchema(platform),
      },
    },
  }
}

export async function generateResourceSocialContent({
  openai,
  context,
  platform,
  logger = console,
  now = () => Date.now(),
}) {
  let correction
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const startedAt = now()
    const request = buildResourceSocialRequest({ context, platform, correction })
    let response
    try {
      response = await openai.responses.create(request)
    } catch {
      logAttempt(logger, context, platform, attempt, 'provider_failed', now() - startedAt)
      throw new ResourceSocialError('provider_failed', 502)
    }

    const refusal = findRefusal(response)
    if (refusal) {
      logAttempt(logger, context, platform, attempt, 'provider_refusal', now() - startedAt)
      throw new ResourceSocialError('provider_failed', 502)
    }
    if (response?.error) {
      logAttempt(logger, context, platform, attempt, 'provider_failed', now() - startedAt)
      throw new ResourceSocialError('provider_failed', 502)
    }
    if (response?.status && response.status !== 'completed') {
      const category = response.status === 'incomplete' ? 'provider_incomplete' : 'provider_failed'
      logAttempt(logger, context, platform, attempt, category, now() - startedAt)
      if (response.status !== 'incomplete' || attempt === 2) {
        throw new ResourceSocialError(
          response.status === 'incomplete' ? 'invalid_provider_output' : 'provider_failed',
          502,
        )
      }
      correction = { issues: ['response_incomplete'], previousOutput: response.output_text || '' }
      continue
    }

    let payload
    try {
      if (typeof response?.output_text !== 'string' || !response.output_text.trim()) {
        throw new ResourceSocialError('invalid_provider_output', 502, ['empty_response'])
      }
      payload = JSON.parse(response.output_text)
      const normalized = validateProviderSocialOutput(payload, platform)
      logAttempt(logger, context, platform, attempt, 'success', now() - startedAt)
      return normalized
    } catch (error) {
      const normalizedError = error instanceof ResourceSocialError
        ? error
        : new ResourceSocialError('invalid_provider_output', 502, ['invalid_json'])
      logAttempt(logger, context, platform, attempt, normalizedError.code, now() - startedAt)
      if (attempt === 2) throw normalizedError
      correction = {
        issues: normalizedError.issues.length ? normalizedError.issues : ['invalid_provider_output'],
        previousOutput: response?.output_text || '',
      }
    }
  }

  throw new ResourceSocialError('invalid_provider_output', 502)
}

function buildPlatformSchema(platform) {
  const rules = PLATFORM_RULES[platform]
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      body: { type: 'string', minLength: 1, maxLength: rules.maxBodyLength },
      hashtags: {
        type: 'array',
        items: { type: 'string', minLength: 1 },
        minItems: rules.minHashtags,
        maxItems: rules.maxHashtags,
      },
    },
    required: ['body', 'hashtags'],
  }
}

function buildInstructions(platform) {
  const requested = platform ? `Produis uniquement la version ${platform}.` : 'Produis Facebook et LinkedIn.'
  return `Tu es l’éditeur social de 5PennyAi.
Versions : ${SOCIAL_POST_STYLE_VERSION}, ${FACEBOOK_PROFILE_VERSION}, ${LINKEDIN_PROFILE_VERSION}.

La publication n’est pas un résumé de la ressource. Elle doit susciter l’intérêt, présenter brièvement la question traitée et inviter sobrement à ouvrir le lien. Choisis une seule idée, distinction ou question et préserve la curiosité.

Règles communes :
- reste strictement fidèle au contexte fourni; n’invente aucun fait, chiffre, exemple ou actualité;
- emploie correctement « article » ou « infographie » et respecte la langue indiquée;
- ton clair, pédagogique, naturel et non sensationnaliste;
- normalement 1 à 3 émojis pertinents, sans suite décorative ni ton enfantin;
- aucune URL, source, citation, liste à puces, bloc de code ou marqueur technique;
- ne recopie pas le titre, les objectifs, les points essentiels ou le message principal mot pour mot;
- n’utilise pas « incontournable », « révolutionnaire », « ultime » ou « exceptionnel »;
- place les hashtags uniquement dans le tableau hashtags.

Facebook (${FACEBOOK_PROFILE_VERSION}) : 150 à 350 caractères visés, 450 maximum, 2 à 3 hashtags; ton chaleureux et conversationnel, accroche immédiate et invitation sobre.
LinkedIn (${LINKEDIN_PROFILE_VERSION}) : 200 à 450 caractères visés, 550 maximum, 2 à 4 hashtags; ton professionnel et pédagogique, contexte très bref et raison concrète de consulter.

Pour une génération complète, les deux corps doivent employer un angle, une accroche ou une formulation réellement distincte; LinkedIn peut être plus contextuel et Facebook plus conversationnel.
${requested}`
}

function buildEditorialInput(context, platform, correction) {
  const resourceLabel = context.resourceType === 'article' ? 'article' : 'infographie'
  const lines = [
    `Format : ${resourceLabel}`,
    `Langue : ${context.language}`,
    `Titre : ${context.title}`,
    context.subtitle ? `Sous-titre : ${context.subtitle}` : '',
    context.theme ? `Thème : ${context.theme}` : '',
    context.level ? `Niveau : ${context.level}` : '',
    `Idée principale : ${context.mainIdea}`,
    context.supportingContext ? `Contexte d’appui : ${context.supportingContext}` : '',
  ].filter(Boolean)

  if (platform) lines.push(`Plateforme demandée : ${platform}`)
  if (correction) {
    lines.push(
      '',
      'CORRECTION UNIQUE : corrige seulement les problèmes suivants sans changer les faits :',
      correction.issues.join(', '),
      'Sortie précédente à corriger :',
      `${correction.previousOutput}`.slice(0, 5000),
    )
  }
  return lines.join('\n')
}

function findRefusal(response) {
  return response?.output
    ?.flatMap((item) => item?.type === 'message' ? item.content || [] : [])
    .find((content) => content?.type === 'refusal')
}

function logAttempt(logger, context, platform, attempt, outcome, durationMs) {
  const level = outcome === 'success' ? 'info' : 'error'
  const log = typeof logger?.[level] === 'function' ? logger[level].bind(logger) : () => {}
  log('[resource-social-posts]', {
    resourceType: context.resourceType,
    resourceId: context.id,
    platform: platform || 'full',
    model: RESOURCE_SOCIAL_MODEL,
    promptVersion: SOCIAL_POST_STYLE_VERSION,
    attempt: attempt === 1 ? 'initial' : 'correction',
    outcome,
    durationMs: Math.max(0, Number(durationMs) || 0),
  })
}
