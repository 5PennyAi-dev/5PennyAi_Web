/* global process */
// Vercel Serverless Function — Nano Banana infographic generator.
// Flow: Claude (driven by the nano-banana-infographic skill) drafts bilingual
// prompts, then Gemini 2.5 Flash Image renders the FR and EN PNGs in parallel.
// The client uploads the base64 payloads to Supabase Storage and inserts the
// markdown into the article.

import { readFileSync } from 'node:fs'
import path from 'node:path'

export const config = {
  maxDuration: 120,
}

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-sonnet-4-6'
const CLAUDE_MAX_TOKENS = 4000

// Gemini image generation — use Nano Banana Pro (Gemini 3 Pro Image), the highest-quality image model.
// Override with GEMINI_IMAGE_MODEL env var if Google renames or deprecates the current ID.
const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3-pro-image-preview'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent`
const GEMINI_TEMPERATURE = 0.4

const VALID_FORMATS = new Set(['16:9', '4:5', '1:1', '3:4'])
const VALID_SCOPES = new Set(['global', 'section'])

// -----------------------------------------------------------------------------
// Skill loading — read SKILL.md + 3 reference files at cold start.
// These files live in .claude/skills/nano-banana-infographic/ at the repo root.
// Vercel includes them in the deployment unless .vercelignore excludes them.
// -----------------------------------------------------------------------------

const SKILL_DIR = path.join(
  process.cwd(),
  '.claude/skills/nano-banana-infographic',
)

function loadSkillFile(relativePath) {
  try {
    return readFileSync(path.join(SKILL_DIR, relativePath), 'utf-8')
  } catch (err) {
    console.error(
      `[generate-infographic] failed to load skill file ${relativePath}:`,
      err.message,
    )
    return ''
  }
}

const SKILL_MD = loadSkillFile('SKILL.md')
const VISUAL_STYLE = loadSkillFile('references/visual-style.md')
const DIAGRAM_TYPES = loadSkillFile('references/diagram-types.md')
const PROMPT_PATTERNS = loadSkillFile('references/prompt-patterns.md')

const SYSTEM_PROMPT = `${SKILL_MD}

# Reference: visual-style.md
${VISUAL_STYLE}

# Reference: diagram-types.md
${DIAGRAM_TYPES}

# Reference: prompt-patterns.md
${PROMPT_PATTERNS}

# Output format — STRICT
You MUST respond with ONLY a single JSON object, parseable by JSON.parse. No markdown fences, no preamble, no commentary.

Schema:
{
  "title": "short infographic title (5-8 words)",
  "subtitle": "optional 10-15 word subtitle, or empty string",
  "type": "catalogue_7a | catalogue_7b | process_2 | comparison_3 | concept_4 | stack_5 | dashboard_6 | system_1",
  "format": "16:9 | 4:5 | 1:1 | 3:4",
  "takeaway_variant": "A | B | C | D | E",
  "prompt_en": "Full English Nano Banana prompt (200-400 words, the 9 sections from prompt-patterns.md in order)",
  "prompt_fr": "French version, same structure",
  "alt_fr": "French alt text (2-3 sentences, accessible description)",
  "alt_en": "English alt text",
  "reasoning": "one sentence justifying the chosen type + variant"
}

REMINDER: respond with ONLY the JSON object. No other characters.`

// -----------------------------------------------------------------------------
// Claude call — generates the bilingual prompt pair.
// -----------------------------------------------------------------------------

function buildUserMessage({
  articleContent,
  scope,
  sectionTitle,
  previousVariants,
  instructions,
  requestedFormat,
}) {
  const trimmed = (articleContent || '').slice(0, 8000)
  const extras = []
  if (instructions && instructions.trim()) {
    extras.push(`Additional author instructions:\n${instructions.trim()}`)
  }
  if (requestedFormat) {
    extras.push(`Requested format: ${requestedFormat} (use this unless it clashes with the chosen type).`)
  }
  if (previousVariants?.length) {
    extras.push(
      `IMPORTANT — takeaway variants already used on this article (DO NOT reuse): ${previousVariants.join(', ')}. Pick a different variant.`,
    )
  }

  return `Article content${scope === 'section' ? ` (section "${sectionTitle || ''}")` : ''}:
---
${trimmed}
---

Scope: ${scope}
${extras.length ? `\n${extras.join('\n\n')}` : ''}

Follow the skill. Return only the JSON object defined in the system prompt.`
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

async function callClaude({
  articleContent,
  scope,
  sectionTitle,
  previousVariants,
  instructions,
  requestedFormat,
  apiKey,
}) {
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
          content: buildUserMessage({
            articleContent,
            scope,
            sectionTitle,
            previousVariants,
            instructions,
            requestedFormat,
          }),
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

  // Minimal shape validation
  const required = ['type', 'format', 'prompt_en', 'prompt_fr', 'alt_fr', 'alt_en']
  const missing = required.filter((k) => typeof parsed[k] !== 'string' || !parsed[k].trim())
  if (missing.length) {
    console.error(`Claude response missing fields: ${missing.join(',')}`)
    throw new Error(`anthropic_missing_fields_${missing.join(',')}`)
  }

  // Normalize format
  if (!VALID_FORMATS.has(parsed.format)) {
    console.warn(`[generate-infographic] Claude returned unsupported format "${parsed.format}", falling back to 4:5`)
    parsed.format = '4:5'
  }

  return parsed
}

// -----------------------------------------------------------------------------
// Gemini 2.5 Flash Image call — renders one PNG.
// -----------------------------------------------------------------------------

const ASPECT_HINTS = {
  '16:9': 'aspect ratio 16:9, landscape composition, 1920x1080',
  '4:5': 'aspect ratio 4:5, portrait composition, 1200x1500',
  '1:1': 'aspect ratio 1:1, square composition, 1200x1200',
  '3:4': 'aspect ratio 3:4, portrait composition, 1200x1600',
}

async function callGemini({ prompt, format, apiKey }) {
  const aspectHint = ASPECT_HINTS[format] || ASPECT_HINTS['4:5']
  const finalPrompt = /aspect ratio/i.test(prompt)
    ? prompt
    : `${prompt}\n\n${aspectHint}`

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

  return imagePart.inlineData.data // base64 PNG
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
      '[generate-infographic] server not configured. hasAnthropic=',
      Boolean(anthropicKey),
      'hasGemini=',
      Boolean(geminiKey),
    )
    return res.status(500).json({ error: 'Server is not configured' })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  const {
    articleContent,
    scope,
    sectionTitle,
    previousVariants,
    instructions,
    format,
  } = body

  if (typeof articleContent !== 'string' || articleContent.trim().length < 100) {
    return res.status(400).json({ error: 'article_content_too_short' })
  }
  if (!VALID_SCOPES.has(scope)) {
    return res.status(400).json({ error: 'invalid_scope' })
  }
  if (scope === 'section' && (!sectionTitle || typeof sectionTitle !== 'string')) {
    return res.status(400).json({ error: 'section_scope_requires_title' })
  }

  const normalizedFormat = VALID_FORMATS.has(format) ? format : null
  const cleanedPrevious = Array.isArray(previousVariants)
    ? previousVariants.filter((v) => typeof v === 'string' && v.trim())
    : []

  const started = Date.now()
  try {
    // 1. Claude generates bilingual prompts + metadata
    const promptData = await callClaude({
      articleContent,
      scope,
      sectionTitle,
      previousVariants: cleanedPrevious,
      instructions,
      requestedFormat: normalizedFormat,
      apiKey: anthropicKey,
    })

    const chosenFormat = promptData.format

    // 2. Gemini renders FR + EN in parallel
    const [imageFr, imageEn] = await Promise.all([
      callGemini({
        prompt: promptData.prompt_fr,
        format: chosenFormat,
        apiKey: geminiKey,
      }),
      callGemini({
        prompt: promptData.prompt_en,
        format: chosenFormat,
        apiKey: geminiKey,
      }),
    ])

    const elapsed = Math.round((Date.now() - started) / 1000)
    console.log(
      `[generate-infographic] elapsed=${elapsed}s scope=${scope} type=${promptData.type} variant=${promptData.takeaway_variant || '-'}`,
    )

    return res.status(200).json({
      promptData,
      imageFr,
      imageEn,
      modelVersion: GEMINI_IMAGE_MODEL,
    })
  } catch (err) {
    const elapsed = Math.round((Date.now() - started) / 1000)
    const code = String(err.message || 'unknown')
    console.error(`[generate-infographic] failed after ${elapsed}s: ${code}`)
    if (code.startsWith('anthropic_')) {
      return res.status(502).json({ error: `Prompt generation failed (${code})` })
    }
    if (code.startsWith('gemini_')) {
      return res.status(502).json({ error: `Image generation failed (${code})` })
    }
    return res.status(500).json({ error: `Infographic generation failed (${code})` })
  }
}
