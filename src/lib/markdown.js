export function stripDiagramArtifacts(md) {
  if (!md) return md
  return md
    .replace(/<!--\s*diagram-prompt\b[\s\S]*?\bdiagram-prompt\s*-->/gi, '')
    .replace(/^diagram-prompt\s*$[\s\S]*?^diagram-prompt\s*$/gm, '')
    .trim()
}

export function extractH2Sections(md) {
  if (!md) return []
  const regex = /^##\s+(.+?)\s*$/gm
  const sections = []
  let match
  while ((match = regex.exec(md)) !== null) {
    sections.push({
      title: match[1].trim(),
      startOffset: match.index,
    })
  }
  return sections
}

export function insertAfterH2Section(md, sectionIndex, block) {
  if (!block) return md
  const base = md || ''
  const sections = extractH2Sections(base)
  if (sectionIndex < 0 || sectionIndex >= sections.length) {
    return base.replace(/\s*$/, '') + '\n\n' + block + '\n'
  }
  const next = sections[sectionIndex + 1]
  const insertAt = next ? next.startOffset : base.length
  const before = base.slice(0, insertAt).replace(/\s*$/, '')
  const after = base.slice(insertAt)
  const separator = after ? '\n\n' : '\n'
  return before + '\n\n' + block + separator + after
}

export function insertBeforeFirstH2(md, block) {
  if (!block) return md
  const base = md || ''
  const firstH2 = base.search(/^##\s/m)
  if (firstH2 === -1) {
    return base.replace(/\s*$/, '') + (base ? '\n\n' : '') + block + '\n'
  }
  const before = base.slice(0, firstH2).replace(/\s*$/, '')
  const after = base.slice(firstH2)
  return before + '\n\n' + block + '\n\n' + after
}
