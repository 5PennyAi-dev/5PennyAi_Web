const MIME_EXTENSIONS = new Map([
  ['image/avif', 'avif'],
  ['image/gif', 'gif'],
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
])

export function resolveBlobDownloadFileName(fileName, mimeType) {
  const extension = MIME_EXTENSIONS.get(typeof mimeType === 'string' ? mimeType.toLowerCase() : '')
  if (!extension) return fileName
  const base = typeof fileName === 'string' ? fileName.replace(/\.[a-z0-9]+$/i, '') : 'download'
  return `${base || 'download'}.${extension}`
}

export async function downloadPublicAsset(
  downloadUrl,
  downloadFileName,
  {
    fetchObject = globalThis.fetch,
    documentObject = globalThis.document,
    urlObject = globalThis.URL,
  } = {},
) {
  const response = await fetchObject(downloadUrl)
  if (!response.ok) throw new Error('download_failed')

  const blob = await response.blob()
  const objectUrl = urlObject.createObjectURL(blob)
  const link = documentObject.createElement('a')

  try {
    link.href = objectUrl
    link.download = resolveBlobDownloadFileName(downloadFileName, blob.type)
    link.hidden = true
    documentObject.body.appendChild(link)
    link.click()
  } finally {
    link.remove()
    urlObject.revokeObjectURL(objectUrl)
  }
}
