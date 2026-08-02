const MARKER_PATTERN = /\{\{(cite|media):([^{}\s]+)\}\}/g
const MEDIA_PARAGRAPH_PATTERN = /^\s*\{\{media:([^{}\s]+)\}\}\s*$/

export function remarkArticleMarkers(options = {}) {
  return (tree) => transformNode(tree, options)
}

export function transformArticleMarkerTree(tree, options = {}) {
  transformNode(tree, options)
  return tree
}

export function calculateArticleReadingTime(markdown, wordsPerMinute = 200) {
  if (typeof markdown !== 'string' || !markdown.trim()) return 0
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\{\{(?:cite|media):[^{}]+\}\}/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}(?:#{1,6}|>|[-+*]|\d+[.)])\s+/gm, '')
    .replace(/[|*_~>#]/g, ' ')
  const words = text.match(/[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu) || []
  return words.length ? Math.max(1, Math.ceil(words.length / wordsPerMinute)) : 0
}

export function isSafeArticleLink(value) {
  if (typeof value !== 'string' || !value.trim()) return false
  const url = value.trim()
  if (url.startsWith('#')) return true
  if (url.startsWith('/') && !url.startsWith('//')) return true
  if (/^(?:\.\.?\/)[^\s]*$/.test(url)) return true
  try {
    const parsed = new URL(url)
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && Boolean(parsed.hostname)
  } catch {
    return false
  }
}

export function articleUrlTransform(url) {
  if (/^article-(?:cite|media):/.test(url || '')) return url
  return isSafeArticleLink(url) ? url : ''
}

export function isExternalArticleLink(url) {
  return /^https?:\/\//i.test(url || '')
}

function transformNode(node, options) {
  if (!node || !Array.isArray(node.children)) return

  if (node.type === 'paragraph' && node.children.length === 1 && node.children[0].type === 'text') {
    const mediaMatch = MEDIA_PARAGRAPH_PATTERN.exec(node.children[0].value)
    if (mediaMatch) {
      node.data = { ...node.data, hName: 'div' }
      node.children = [{ type: 'image', url: `article-media:${encodeURIComponent(mediaMatch[1])}`, alt: mediaMatch[1] }]
      return
    }
  }

  const nextChildren = []
  for (const child of node.children) {
    if (child.type === 'text') {
      nextChildren.push(...markerTextNodes(child.value, options))
    } else {
      transformNode(child, options)
      nextChildren.push(child)
    }
  }
  node.children = nextChildren
}

function markerTextNodes(value, { mode = 'admin' } = {}) {
  const nodes = []
  let cursor = 0
  for (const match of value.matchAll(MARKER_PATTERN)) {
    if (match.index > cursor) nodes.push({ type: 'text', value: value.slice(cursor, match.index) })
    const [, kind, key] = match
    if (kind === 'cite') {
      nodes.push({
        type: 'link',
        url: `article-cite:${encodeURIComponent(key)}`,
        children: [{ type: 'text', value: key }],
      })
    } else if (mode !== 'public') {
      nodes.push({ type: 'text', value: match[0] })
    }
    cursor = match.index + match[0].length
  }
  if (cursor < value.length) nodes.push({ type: 'text', value: value.slice(cursor) })
  if (mode === 'public') {
    for (const node of nodes) {
      if (node.type === 'text') node.value = node.value.replace(/\{\{(?:cite|media):[^{}]*\}\}/g, '')
    }
  }
  return nodes.length ? nodes : [{ type: 'text', value }]
}
