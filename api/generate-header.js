/* global process */
// Vercel Serverless Function — Nano Banana editorial header generator.
// Flow: Claude (driven by the nano-banana-header skill) drafts bilingual
// 16:9 prompts for an editorial hero banner (category label + title +
// subtitle + one article-specific techno visual thesis), then Gemini 3 Pro
// Image renders the FR and EN PNGs in parallel. The client uploads the
// base64 payloads to Supabase Storage and updates posts.cover_image_fr/en.

import { readFileSync } from 'node:fs'
import path from 'node:path'

export const config = {
  maxDuration: 120,
}

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-sonnet-4-6'
const CLAUDE_MAX_TOKENS = 4000

// Gemini image generation — use Nano Banana Pro (Gemini 3 Pro Image).
// Override with GEMINI_IMAGE_MODEL env var if Google renames or deprecates the current ID.
const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3-pro-image-preview'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent`
const GEMINI_TEMPERATURE = 0.4

// Editorial headers are always 16:9. The skill enforces this.
const HEADER_FORMAT = '16:9'
const HEADER_ASPECT_HINT = 'aspect ratio 16:9, landscape composition, 1920x1080'

const VALID_CATEGORIES = new Set([
  'INSIGHTS',
  'STRATEGIE',
  'TUTORIEL',
  'CAS_DUSAGE',
  'ACTUALITE',
])
const VALID_MODES = new Set(['light', 'dark'])

// -----------------------------------------------------------------------------
// Skill loading — read SKILL.md + 4 reference files at cold start.
// Files live in .claude/skills/nano-banana-header/ at the repo root.
// -----------------------------------------------------------------------------

const SKILL_DIR = path.join(
  process.cwd(),
  '.claude/skills/nano-banana-header',
)

function loadSkillFile(relativePath) {
  try {
    return readFileSync(path.join(SKILL_DIR, relativePath), 'utf-8')
  } catch (err) {
    console.error(
      `[generate-header] failed to load skill file ${relativePath}:`,
      err.message,
    )
    return ''
  }
}

const SKILL_MD = loadSkillFile('SKILL.md')
const VISUAL_STYLE = loadSkillFile('references/visual-style.md')
const EDITORIAL_CATEGORIES = loadSkillFile('references/editorial-categories.md')
const INSPIRATION = loadSkillFile('references/inspiration.md')
const PROMPT_WRITING = loadSkillFile('references/prompt-writing.md')

const SYSTEM_PROMPT = `${SKILL_MD}

# Reference: visual-style.md
${VISUAL_STYLE}

# Reference: editorial-categories.md
${EDITORIAL_CATEGORIES}

# Reference: inspiration.md
${INSPIRATION}

# Reference: prompt-writing.md
${PROMPT_WRITING}

# Output format — STRICT
You MUST respond with ONLY a single JSON object, parseable by JSON.parse. No markdown fences, no preamble, no commentary.

Schema:
{
  "title_in_image_fr": "French title baked into the FR image (3-5 words)",
  "title_in_image_en": "English translation of the title for the EN image (3-5 words)",
  "subtitle_in_image_fr": "French subtitle for the FR image (4-8 words, or empty string)",
  "subtitle_in_image_en": "English translation of the subtitle for the EN image (4-8 words, or empty string)",
  "category": "INSIGHTS | STRATEGIE | TUTORIEL | CAS_DUSAGE | ACTUALITE",
  "mode": "light | dark (must follow the category rule in editorial-categories.md)",
  "visual_thesis": "one precise sentence explaining what the image makes visible about THIS article, not generic AI",
  "primary_visual_metaphor": "the single dominant article-specific techno metaphor or scene",
  "supporting_elements": ["0-2 supporting elements that are necessary to understand the metaphor"],
  "focal_accent": "optional short number/symbol/word used as typography emphasis only; never a badge or standalone icon",
  "metaphor_objects": ["legacy UI summary: primary metaphor + supporting elements only; no generic props"],
  "prompt_en": "Full ENGLISH Nano Banana prompt (200-350 words). MUST embed title_in_image_en and subtitle_in_image_en verbatim between double quotes. MUST NOT contain any French text in the image specification (no accents like é/è/à in the text to render).",
  "prompt_fr": "Full FRENCH Nano Banana prompt (200-350 words). MUST embed title_in_image_fr and subtitle_in_image_fr verbatim between double quotes.",
  "alt_fr": "French alt text (2-3 sentences, accessible description)",
  "alt_en": "English alt text",
  "reasoning": "one sentence justifying the chosen category + mode + metaphors"
}

CRITICAL language discipline:
- prompt_en must generate an ENGLISH-language image. The title and subtitle rendered inside the image MUST be in English (title_in_image_en / subtitle_in_image_en), not the French original. The editorial label (INSIGHTS, TUTORIAL, USE CASE, NEWS, STRATEGY) MUST also be in English.
- prompt_fr must generate a FRENCH-language image with title_in_image_fr / subtitle_in_image_fr and the French label (INSIGHTS, TUTORIEL, CAS D'USAGE, ACTUALITÉ, STRATÉGIE).
- The two prompts are NOT translations of each other at the sentence level — they are two distinct prompts each instructing Nano Banana to render text IN THE TARGET LANGUAGE.

Both prompt_en and prompt_fr MUST specify 16:9 aspect ratio. Never include footers, URLs, or site signatures inside the image.

# Header specificity and anti-repetition rules — CRITICAL
The current failure mode is generic editorial props recurring across articles. Prevent it.

Before writing prompts, extract:
1. the article's precise claim or mechanism;
2. what makes this article different from another AI article;
3. the one visual thesis that would still make sense if the title were hidden.

Composition rules:
- Use ONE dominant visual idea, preferably a modern techno/editorial metaphor: interface layer, data flow, model pipeline, node graph, split-screen system, command palette, modular dashboard, evaluation grid, signal map, protocol stack, synthetic document transformation, or abstract machine diagram.
- Add at most 0-2 supporting elements. They must be necessary to understand the dominant metaphor.
- Do NOT create a still-life desk scene. Do NOT list several independent objects.
- The image must feel more tech-forward than cozy editorial: crisp vector UI fragments, connected data paths, angular panels, grid logic, cobalt/teal/violet accents, clean SaaS/AI product aesthetic.

Recurring generic props are banned unless the article is literally about that object:
plant, sprout, leaves, flower, tree, seedling, watering can, calendar, clock, watch, stopwatch, alarm clock, envelope, letter, email icon, paper plane, mailbox, open book, notebook, journal, checklist clipboard, loose documents, paper stack, wooden desk, tabletop, compass, magnifying glass, generic bar chart, upward chart arrow, light bulb, puzzle piece, cracked ground, wilted plant.

Prompt self-check before output:
- Would the image still clearly evoke THIS article with the title removed? If not, make the visual thesis more specific.
- Did you include any banned recurring prop? If yes, replace it with a topic-specific techno metaphor.
- Did you rely on generic objects around text? If yes, redesign as a coherent tech-forward scene/system.

REMINDER: respond with ONLY the JSON object. No other characters.`

// -----------------------------------------------------------------------------
// Claude call — generates the bilingual prompt pair.
// -----------------------------------------------------------------------------

function buildUserMessage({ articleContent, instructions }) {
  const trimmed = (articleContent || '').slice(0, 8000)
  const extras = []
  if (instructions && instructions.trim()) {
    extras.push(`Additional author instructions:\n${instructions.trim()}`)
  }

  return `Article content:
---
${trimmed}
---
${extras.length ? `\n${extras.join('\n\n')}\n` : ''}
Follow the skill. Pick the editorial category based on the article's register
(INSIGHTS/STRATEGIE → dark navy; TUTORIEL/CAS_DUSAGE/ACTUALITE → light glacier).

Output TWO independent prompts:
- title_in_image_fr (French) + subtitle_in_image_fr (French) → used in prompt_fr, which renders a FRENCH image with the French editorial label.
- title_in_image_en (English translation) + subtitle_in_image_en (English translation) → used in prompt_en, which renders an ENGLISH image with the English editorial label (INSIGHTS, TUTORIAL, USE CASE, NEWS, STRATEGY).

The two images share the same category, mode and visual thesis. Only the rendered text language differs. Do NOT leave French text inside prompt_en.

Do NOT pick generic metaphor objects. There is no object catalogue to follow. Instead, design one article-specific techno/editorial visual system that expresses the article's core mechanism or tension. Use at most two supporting elements, and avoid the banned recurring props listed in the system prompt. Return only the JSON object defined in the system prompt.`
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

async function callClaude({ articleContent, instructions, apiKey }) {
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: CLAUDE_MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildUserMessage({ articleContent, instructions }),
        },
      ],
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('Anthropic API error:', res.status, errText.slice(0, 500))
    throw new Error(`anthropic_${res.status}`)
  }

  const data = await res.json()
  const stopReason = data?.stop_reason
  const text = extractText(data)
  if (!text) {
    console.error('Anthropic empty text. stop_reason=', stopReason)
    throw new Error('anthropic_empty')
  }

  const parsed = extractJson(text)
  if (!parsed) {
    console.error(
      `Failed to parse Claude JSON. stop_reason=${stopReason} textLen=${text.length} head=${text.slice(0, 300)}`,
    )
    throw new Error('anthropic_invalid_json')
  }

  // FR↔EN fallback for translated pairs: if Claude omits one language,
  // copy from the other so generation can still proceed (degraded but usable).
  const translationPairs = [
    ['title_in_image_fr', 'title_in_image_en'],
    ['subtitle_in_image_fr', 'subtitle_in_image_en'],
    ['prompt_fr', 'prompt_en'],
    ['alt_fr', 'alt_en'],
  ]
  const filled = []
  for (const [a, b] of translationPairs) {
    const aOk = typeof parsed[a] === 'string' && parsed[a].trim()
    const bOk = typeof parsed[b] === 'string' && parsed[b].trim()
    if (!aOk && bOk) { parsed[a] = parsed[b]; filled.push(a) }
    else if (!bOk && aOk) { parsed[b] = parsed[a]; filled.push(b) }
  }
  if (filled.length) {
    console.warn(
      `[generate-header] Claude omitted ${filled.join(',')} — filled from sibling. Returned keys: ${Object.keys(parsed).join(',')}`,
    )
  }

  const required = [
    'title_in_image_fr',
    'title_in_image_en',
    'category',
    'mode',
    'prompt_en',
    'prompt_fr',
    'alt_fr',
    'alt_en',
  ]
  const missing = required.filter((k) => typeof parsed[k] !== 'string' || !parsed[k].trim())
  if (missing.length) {
    console.error(
      `Claude response missing fields after FR/EN fallback: ${missing.join(',')}. Returned keys: ${Object.keys(parsed).join(',')}`,
    )
    throw new Error(`anthropic_missing_fields_${missing.join(',')}`)
  }

  if (!VALID_CATEGORIES.has(parsed.category)) {
    console.warn(`[generate-header] Claude returned unsupported category "${parsed.category}", falling back to INSIGHTS`)
    parsed.category = 'INSIGHTS'
  }
  if (!VALID_MODES.has(parsed.mode)) {
    console.warn(`[generate-header] Claude returned unsupported mode "${parsed.mode}", falling back to dark`)
    parsed.mode = 'dark'
  }
  if (!Array.isArray(parsed.metaphor_objects)) {
    parsed.metaphor_objects = []
  }

  return parsed
}

// -----------------------------------------------------------------------------
// Gemini 3 Pro Image call — renders one 16:9 PNG.
// -----------------------------------------------------------------------------

async function callGemini({ prompt, apiKey }) {
  const finalPrompt = /aspect ratio/i.test(prompt)
    ? prompt
    : `${prompt}\n\n${HEADER_ASPECT_HINT}`

  const res = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: finalPrompt }] }],
      generationConfig: {
        temperature: GEMINI_TEMPERATURE,
        responseModalities: ['IMAGE'],
      },
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('Gemini API error:', res.status, errText.slice(0, 500))
    throw new Error(`gemini_${res.status}`)
  }

  const data = await res.json()
  const parts = data?.candidates?.[0]?.content?.parts || []
  const imagePart = parts.find((p) => p?.inlineData?.data)

  if (!imagePart) {
    const textPart = parts.find((p) => p?.text)
    console.error(
      'Gemini returned no image. finishReason=',
      data?.candidates?.[0]?.finishReason,
      'textPart=',
      textPart?.text?.slice(0, 300),
    )
    throw new Error('gemini_no_image')
  }

  return imagePart.inlineData.data
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY
  if (!anthropicKey || !geminiKey) {
    console.error(
      '[generate-header] server not configured. hasAnthropic=',
      Boolean(anthropicKey),
      'hasGemini=',
      Boolean(geminiKey),
    )
    return res.status(500).json({ error: 'Server is not configured' })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  const { articleContent, instructions } = body

  if (typeof articleContent !== 'string' || articleContent.trim().length < 100) {
    return res.status(400).json({ error: 'article_content_too_short' })
  }

  const started = Date.now()
  try {
    const promptData = await callClaude({
      articleContent,
      instructions,
      apiKey: anthropicKey,
    })

    const [imageFr, imageEn] = await Promise.all([
      callGemini({ prompt: promptData.prompt_fr, apiKey: geminiKey }),
      callGemini({ prompt: promptData.prompt_en, apiKey: geminiKey }),
    ])

    const elapsed = Math.round((Date.now() - started) / 1000)
    console.log(
      `[generate-header] elapsed=${elapsed}s category=${promptData.category} mode=${promptData.mode}`,
    )

    return res.status(200).json({
      promptData: { ...promptData, format: HEADER_FORMAT },
      imageFr,
      imageEn,
      modelVersion: GEMINI_IMAGE_MODEL,
    })
  } catch (err) {
    const elapsed = Math.round((Date.now() - started) / 1000)
    const code = String(err.message || 'unknown')
    console.error(`[generate-header] failed after ${elapsed}s: ${code}`)
    if (code.startsWith('anthropic_')) {
      return res.status(502).json({ error: `Prompt generation failed (${code})` })
    }
    if (code.startsWith('gemini_')) {
      return res.status(502).json({ error: `Image generation failed (${code})` })
    }
    return res.status(500).json({ error: `Header generation failed (${code})` })
  }
}
