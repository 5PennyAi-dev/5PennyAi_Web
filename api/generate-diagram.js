/* global process */
// Vercel Serverless Function — AI diagram generator for the 5PennyAi blog admin.
// Flow: Claude designs ONE canonical Excalidraw scene with bilingual text fields.
// Server materializes FR and EN scenes by substituting text_fr / text_en into text elements.
// Client renders each scene to PNG via @excalidraw/excalidraw and uploads to Supabase.

export const config = {
  maxDuration: 60,
}

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-sonnet-4-6'
const CLAUDE_MAX_TOKENS = 8000

const LAYOUT_LABELS = {
  auto: 'Choose the most appropriate layout yourself based on the article content.',
  flow: 'Left-to-right flow (processes, sequences, transformations).',
  hub: 'Hub and spoke (capabilities or features radiating from a central concept).',
  hierarchy: 'Top-to-bottom hierarchy (levels, layers, progressive depth).',
  comparison: 'Side-by-side comparison (before/after, old vs new, option A vs option B).',
  steps: 'Numbered steps list (frameworks, checklists, ordered instructions).',
  cycle: 'Cycle / loop (feedback loops, iterative processes).',
}

const VALID_ASPECT_RATIOS = new Set(['16:9', '1:1', '4:5'])

const BASE_DEFAULTS = {
  angle: 0,
  strokeColor: '#1e1e1e',
  backgroundColor: 'transparent',
  fillStyle: 'solid',
  strokeWidth: 2,
  strokeStyle: 'solid',
  roughness: 1,
  opacity: 100,
  groupIds: [],
  frameId: null,
  roundness: null,
  boundElements: [],
  updated: 1,
  link: null,
  locked: false,
}

const TEXT_DEFAULTS = {
  fontSize: 18,
  fontFamily: 1,
  textAlign: 'center',
  verticalAlign: 'top',
  containerId: null,
  lineHeight: 1.25,
}

const ARROW_DEFAULTS = {
  lastCommittedPoint: null,
  startBinding: null,
  endBinding: null,
  startArrowhead: null,
  endArrowhead: 'arrow',
}

const DIAGRAM_SYSTEM_PROMPT = `You design clean Excalidraw diagrams for a bilingual (French / English) blog. Given an article, you produce ONE canonical Excalidraw scene. Text elements carry BOTH languages via \`text_fr\` and \`text_en\` fields. The server materializes two scenes by substitution.

# Output format — STRICT
Respond with ONLY a JSON object, parseable by JSON.parse. No markdown fences, no preamble, no commentary.

Top-level schema:
{
  "scene": {
    "elements": [ ... ],
    "appState": { "viewBackgroundColor": "#ffffff" }
  }
}

# Minimal element schema — emit ONLY the fields listed
The server fills in all defaults (angle, strokeWidth, opacity, groupIds, frameId, boundElements, updated, link, locked, fillStyle, strokeStyle, roughness, fontFamily, verticalAlign, containerId, lineHeight, and arrow binding fields). DO NOT repeat those.

All elements (required):
- "id": short unique string
- "type": "rectangle" | "ellipse" | "diamond" | "text" | "arrow" | "line"
- "x", "y", "width", "height": numbers (absolute coordinates, pixels)

Rectangle / ellipse / diamond (add when applicable):
- "strokeColor": hex
- "backgroundColor": hex
- "roundness": {"type": 3}   ← for rounded rectangles; omit for sharp corners

Text (add):
- "text_fr": string (French label)
- "text_en": string (English label)
- "fontSize": number (use 30 for the title, 22 for section headers, 18 for labels, 14 for annotations)
- "textAlign": "center" | "left" | "right"   ← omit if "center"
- "strokeColor": hex   ← use "#143054" (navy) for main text, "#868e96" for muted annotations

Arrow / line (add):
- "points": [[x1, y1], [x2, y2]]   ← relative to element origin; usually [[0,0],[dx,dy]]
- "strokeColor": "#5B8FB9" (default arrow color; omit if using default)
- "roundness": {"type": 2}
- "endArrowhead": "arrow" (omit — it's the default)
- "startArrowhead": optional, omit if none

# Color palette (5PennyAi brand) — choose by semantic role, never arbitrary
| Role | strokeColor | backgroundColor |
|---|---|---|
| Input / source / point de départ | #5B8FB9 | #E3EEF6 |
| Action / process / étape clé | #D4713B | #FFF0E0 |
| Concept clé / header / conteneur principal | #143054 | #DDE4EC |
| Problème / alerte / attention | #C4553A | #FDE8E3 |
| Infrastructure / support / contexte | #7B6B9E | #EEEAF5 |
| Neutre / annotation / fond | #8C8578 | #F7F5F2 |

# Layout rules
- Canvas: design for a 1200 × 800 px viewport. Center the composition.
- Title at top center, fontSize 30.
- 15 px minimum gap between sibling elements, 40 px between major sections.
- Nested elements: child_x = parent_x + 10..15 px padding on all sides.
- Use rounded rectangles (\`roundness: {"type": 3}\`) for all boxes.
- Arrows: hand-drawn feel, \`roundness: {"type": 2}\`.

# Text constraints (both languages)
- Title: max 5 words per language.
- Box labels: max 3 words per language.
- Total visible text: under 30 words per language.
- Use idiomatic vocabulary (FR: "PME", EN: "SME"). Not literal translations.
- Abbreviate words over 8 characters when possible (image-model remnant constraint; even though we now render with real fonts, keep labels short for readability).

# Minimal example (for reference — NOT a template to copy)
{
  "scene": {
    "elements": [
      {
        "id": "title",
        "type": "text",
        "x": 200, "y": 30, "width": 800, "height": 40,
        "fontSize": 30,
        "text_fr": "Comment RAG fonctionne",
        "text_en": "How RAG works"
      },
      {
        "id": "box-question",
        "type": "rectangle",
        "x": 80, "y": 150, "width": 240, "height": 90,
        "strokeColor": "#5B8FB9",
        "backgroundColor": "#E3EEF6",
        "roundness": {"type": 3}
      },
      {
        "id": "label-question",
        "type": "text",
        "x": 100, "y": 180, "width": 200, "height": 30,
        "fontSize": 18,
        "text_fr": "Question",
        "text_en": "Question"
      },
      {
        "id": "arrow-1",
        "type": "arrow",
        "x": 320, "y": 195, "width": 120, "height": 0,
        "points": [[0, 0], [120, 0]],
        "strokeColor": "#5B8FB9",
        "roundness": {"type": 2}
      }
    ],
    "appState": {"viewBackgroundColor": "#ffffff"}
  }
}

REMINDER: respond with ONLY the JSON object. No other characters.`

function buildUserMessage({ articleContentFr, articleContentEn, instructions, layoutType, aspectRatio }) {
  const layoutHint = LAYOUT_LABELS[layoutType] || LAYOUT_LABELS.auto
  const extras = instructions && instructions.trim() ? `\n\nAdditional instructions from the author:\n${instructions.trim()}` : ''
  const fr = (articleContentFr || '').slice(0, 4000)
  const en = (articleContentEn || '').slice(0, 4000)

  const contentSection = [
    fr ? `FRENCH version of the article:\n${fr}` : null,
    en ? `ENGLISH version of the article:\n${en}` : null,
  ].filter(Boolean).join('\n\n---\n\n')

  return `Article content:

${contentSection}

Requested layout: ${layoutHint}
Canvas: 1200 × 800 px, aspect ratio hint ${aspectRatio}${extras}

Design ONE canonical Excalidraw scene illustrating the main concept. Every text element must include BOTH text_fr and text_en fields. Return ONLY the JSON object following the schema in the system prompt. No other text.`
}

function extractText(data) {
  return (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim()
}

function extractJson(text) {
  if (!text) return null
  let cleaned = text.trim()
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch {
        return null
      }
    }
    return null
  }
}

function normalizeElement(el) {
  if (!el || typeof el !== 'object' || !el.type) return null
  const base = {
    ...BASE_DEFAULTS,
    id: el.id || `el-${Math.random().toString(36).slice(2, 10)}`,
    type: el.type,
    x: Number(el.x) || 0,
    y: Number(el.y) || 0,
    width: Number(el.width) || 0,
    height: Number(el.height) || 0,
  }

  if (typeof el.strokeColor === 'string') base.strokeColor = el.strokeColor
  if (typeof el.backgroundColor === 'string') base.backgroundColor = el.backgroundColor
  if (el.roundness && typeof el.roundness === 'object') base.roundness = el.roundness
  if (typeof el.strokeWidth === 'number') base.strokeWidth = el.strokeWidth
  if (typeof el.opacity === 'number') base.opacity = el.opacity

  if (el.type === 'text') {
    return {
      ...base,
      ...TEXT_DEFAULTS,
      fontSize: Number(el.fontSize) || TEXT_DEFAULTS.fontSize,
      textAlign: typeof el.textAlign === 'string' ? el.textAlign : TEXT_DEFAULTS.textAlign,
      text_fr: typeof el.text_fr === 'string' ? el.text_fr : '',
      text_en: typeof el.text_en === 'string' ? el.text_en : '',
    }
  }

  if (el.type === 'arrow' || el.type === 'line') {
    const points = Array.isArray(el.points) && el.points.length >= 2 ? el.points : [[0, 0], [base.width || 100, 0]]
    return {
      ...base,
      ...ARROW_DEFAULTS,
      strokeColor: base.strokeColor === BASE_DEFAULTS.strokeColor ? '#5B8FB9' : base.strokeColor,
      roundness: el.roundness || { type: 2 },
      points,
      endArrowhead: typeof el.endArrowhead === 'string' ? el.endArrowhead : ARROW_DEFAULTS.endArrowhead,
      startArrowhead: typeof el.startArrowhead === 'string' ? el.startArrowhead : ARROW_DEFAULTS.startArrowhead,
    }
  }

  return base
}

function materializeScene(canonical, language) {
  const elements = (canonical.elements || [])
    .map(normalizeElement)
    .filter(Boolean)
    .map((el) => {
      if (el.type !== 'text') return el
      const text = el[`text_${language}`] || el.text_fr || el.text_en || ''
      const { text_fr, text_en, ...rest } = el
      return { ...rest, text, originalText: text }
    })

  return {
    type: 'excalidraw',
    version: 2,
    source: 'https://excalidraw.com',
    elements,
    appState: {
      gridSize: null,
      viewBackgroundColor: '#ffffff',
      ...(canonical.appState || {}),
    },
    files: canonical.files || {},
  }
}

async function buildBilingualScenes({ articleContentFr, articleContentEn, instructions, layoutType, aspectRatio, languages, apiKey }) {
  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: CLAUDE_MAX_TOKENS,
      system: DIAGRAM_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildUserMessage({ articleContentFr, articleContentEn, instructions, layoutType, aspectRatio }),
        },
      ],
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    console.error('Anthropic API error:', response.status, errText.slice(0, 500))
    throw new Error(`anthropic_${response.status}`)
  }

  const data = await response.json()
  const stopReason = data?.stop_reason
  const text = extractText(data)
  if (!text) {
    console.error('Anthropic empty text. stop_reason=', stopReason)
    throw new Error('anthropic_empty')
  }

  const parsed = extractJson(text)
  if (!parsed) {
    console.error(`Failed to parse JSON. stop_reason=${stopReason} textLen=${text.length} head=${text.slice(0, 300)} tail=${text.slice(-300)}`)
    throw new Error('anthropic_invalid_json')
  }

  // Accept { scene: { elements, appState } }, { elements, appState }, or legacy { scenes: { fr, en } }
  let canonical = null
  if (parsed.scene && Array.isArray(parsed.scene.elements)) {
    canonical = parsed.scene
  } else if (Array.isArray(parsed.elements)) {
    canonical = parsed
  } else if (parsed.scenes && parsed.scenes.fr && Array.isArray(parsed.scenes.fr.elements)) {
    // Legacy: old bilingual format. Fall back to FR as the canonical.
    console.warn('[generate-diagram] legacy { scenes: { fr, en } } format detected — using scenes.fr as canonical')
    canonical = parsed.scenes.fr
  }

  if (!canonical || !Array.isArray(canonical.elements) || canonical.elements.length === 0) {
    console.error(`Invalid canonical scene. stop_reason=${stopReason} textLen=${text.length} keys=${Object.keys(parsed).join(',')} head=${text.slice(0, 500)}`)
    throw new Error('anthropic_invalid_scenes')
  }

  if (stopReason === 'max_tokens') {
    console.warn(`[generate-diagram] hit max_tokens (${CLAUDE_MAX_TOKENS}). Scene may be truncated.`)
  }

  const fr = languages.includes('fr') ? materializeScene(canonical, 'fr') : null
  const en = languages.includes('en') ? materializeScene(canonical, 'en') : null

  return { fr, en }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) {
    console.error('ANTHROPIC_API_KEY not set')
    return res.status(500).json({ error: 'Server is not configured' })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  const { articleContentFr, articleContentEn, instructions, layoutType, aspectRatio, languages } = body

  const hasFr = typeof articleContentFr === 'string' && articleContentFr.trim().length > 0
  const hasEn = typeof articleContentEn === 'string' && articleContentEn.trim().length > 0
  if (!hasFr && !hasEn) {
    return res.status(400).json({ error: 'Article content is required (FR or EN)' })
  }

  const requestedLanguages = Array.isArray(languages) && languages.length
    ? languages.filter((l) => l === 'fr' || l === 'en')
    : ['fr', 'en'].filter((l) => (l === 'fr' ? hasFr : hasEn))

  if (requestedLanguages.length === 0) {
    return res.status(400).json({ error: 'No valid languages requested' })
  }

  const normalizedLayout = LAYOUT_LABELS[layoutType] ? layoutType : 'auto'
  const normalizedRatio = VALID_ASPECT_RATIOS.has(aspectRatio) ? aspectRatio : '16:9'

  const started = Date.now()
  try {
    const scenes = await buildBilingualScenes({
      articleContentFr,
      articleContentEn,
      instructions,
      layoutType: normalizedLayout,
      aspectRatio: normalizedRatio,
      languages: requestedLanguages,
      apiKey: anthropicKey,
    })

    const elapsed = Math.round((Date.now() - started) / 1000)
    const produced = [scenes.fr ? 'fr' : null, scenes.en ? 'en' : null].filter(Boolean).join(',')
    console.log(`[generate-diagram] elapsed=${elapsed}s produced=${produced}`)

    return res.status(200).json({
      fr: scenes.fr,
      en: scenes.en,
    })
  } catch (err) {
    const elapsed = Math.round((Date.now() - started) / 1000)
    const code = String(err.message || '')
    console.error(`[generate-diagram] failed after ${elapsed}s: ${code}`, err)
    if (code.startsWith('anthropic_')) {
      return res.status(502).json({ error: `AI diagram generation failed (${code})` })
    }
    return res.status(500).json({ error: `Diagram generation failed (${code})` })
  }
}
