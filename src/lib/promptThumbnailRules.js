import { ARTICLE_ASSETS_BUCKET } from './articleAssetRules.js'

export const PROMPT_ASSETS_BUCKET = ARTICLE_ASSETS_BUCKET

const UUID_SOURCE = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}'
const UUID_PATTERN = new RegExp(`^${UUID_SOURCE}$`)
const MIME_EXTENSION = new Map([['image/png', 'png'], ['image/jpeg', 'jpg'], ['image/webp', 'webp']])

export function buildPromptThumbnailPath(promptId, uniqueId, mimeType) {
  if (!UUID_PATTERN.test(promptId || '') || !UUID_PATTERN.test(uniqueId || '')) {
    throw new TypeError('Invalid prompt thumbnail UUID')
  }
  const extension = MIME_EXTENSION.get(mimeType)
  if (!extension) throw new TypeError('Unsupported prompt thumbnail type')
  return `prompts/${promptId}/thumbnail/${uniqueId}.${extension}`
}

export function isPromptThumbnailPath(path, promptId) {
  if (typeof path !== 'string' || !UUID_PATTERN.test(promptId || '')) return false
  const escapedId = promptId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^prompts/${escapedId}/thumbnail/${UUID_SOURCE}\\.(?:png|jpg|webp)$`).test(path)
}
