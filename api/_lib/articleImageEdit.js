import { Buffer } from 'node:buffer'
import { toFile } from 'openai'

export async function editImageFromReference({
  openai,
  prompt,
  reference,
  model,
  size,
  createError,
  toFileImpl = toFile,
}) {
  try {
    const fileName = reference.path.split('/').at(-1) || 'article-infographic'
    const image = await toFileImpl(reference.buffer, fileName, { type: reference.mimeType })
    const response = await openai.images.edit({
      model,
      image,
      prompt,
      size,
      quality: 'medium',
      output_format: 'webp',
      output_compression: 85,
      background: 'opaque',
      n: 1,
    })
    if (!Array.isArray(response?.data) || response.data.length !== 1) {
      throw createError('provider_invalid_image_count', 502, 'generate_image')
    }
    const base64 = response.data[0]?.b64_json
    if (typeof base64 !== 'string' || !base64) {
      throw createError('provider_no_image', 502, 'generate_image')
    }
    return { buffer: Buffer.from(base64, 'base64'), mimeType: 'image/webp' }
  } catch (error) {
    if (error?.code && error?.status) throw error
    throw createError('provider_failed', 502, 'generate_image')
  }
}
