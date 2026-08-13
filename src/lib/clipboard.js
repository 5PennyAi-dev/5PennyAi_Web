export async function copyText(text, navigatorObject = globalThis.navigator) {
  if (typeof text !== 'string' || typeof navigatorObject?.clipboard?.writeText !== 'function') {
    return false
  }

  try {
    await navigatorObject.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
