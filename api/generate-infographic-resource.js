/* global process */
// Vercel Serverless Function — standalone infographic resource generator.
// Distinct from generate-infographic.js (in-article, Gemini-based) — do NOT conflate.
//
// Flow: Claude (tool use → structured output) drafts the image prompt + bilingual
// SEO metadata, then OpenAI gpt-image-2 renders a portrait PNG.
// The client (step 2.2 studio) uploads the returned base64 to Supabase Storage.
// No Supabase calls server-side.

import { readFileSync } from 'node:fs'
import path from 'node:path'

export const config = {
  maxDuration: 300,
}

const ANTHROPIC_URL  = 'https://api.anthropic.com/v1/messages'
const OPENAI_IMG_URL = 'https://api.openai.com/v1/images/generations'
const MODEL          = 'claude-sonnet-4-6'
const MAX_TOKENS     = 4096

// ─── Style contract — loaded at cold start ────────────────────────────────────

const SKILL_DIR = path.join(process.cwd(), '.claude/skills/nano-banana-infographic')

function loadSkillFile(relativePath) {
  try {
    return readFileSync(path.join(SKILL_DIR, relativePath), 'utf-8')
  } catch (err) {
    console.error(`[generate-infographic-resource] failed to load ${relativePath}:`, err.message)
    return ''
  }
}

// Style dédié aux ressources autonomes — distinct de visual-style.md (in-article, non touché)
const RESOURCE_STYLE = loadSkillFile('references/infographic-resource-style.md')

// ─── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Tu es un expert en création d'infographies **ressources autonomes** pour 5PennyAi, une entreprise de services AI.
Ta mission : à partir d'un concept fourni, (1) choisir l'archétype de mise en page le plus adapté, (2) rédiger un prompt complet et on-brand pour gpt-image-2, (3) produire le texte d'accompagnement bilingue FR/EN.

# Contrat de style — RESSOURCE AUTONOME (OBLIGATOIRE — respecter à la lettre)

${RESOURCE_STYLE}

# EXIGENCE CRITIQUE DE DENSITÉ

Le prompt que tu vas rédiger DOIT produire une infographie avec **5 à 7 sections distinctes et richement remplies**. Une infographie avec 1-2 blocs est un ÉCHEC. Chaque section doit contenir du contenu réel : cartes de concepts, étapes numérotées, colonnes comparatives, listes à puces, etc.

L'orange \`#DD8737\` doit apparaître **exactement une seule fois** dans toute l'infographie — uniquement sur l'encadré « À retenir » ou le point focal principal. Si tu utilises l'orange sur 2 éléments ou plus, c'est un ÉCHEC.

# Bibliothèque d'archétypes

Choisis l'archétype qui correspond le mieux au concept. Si un archétype est imposé dans le message, utilise-le.

- **definition** : bandeau navy + bloc définition + 4-6 cartes de concepts clés + schéma central + usages + encadré orange « À retenir ».
- **process** : bandeau navy + contexte + 4-6 étapes numérotées riches (titre + description + icône) + résultat + encadré orange.
- **comparison** : bandeau navy + contexte + 2-3 colonnes denses côte à côte (chacune avec 4-6 critères) + synthèse + encadré orange « Quand choisir quoi ».
- **anatomy** : bandeau navy + vue d'ensemble + 4-6 couches/composants avec descriptions + interactions + encadré orange.
- **taxonomy** : bandeau navy + définition + grille de 6-9 familles/types en cartes + guide de sélection + encadré orange.

# Règles pour image_prompt

- Portrait obligatoire : composition 2:3, 1024×1536 px.
- Texte dans l'image en **français uniquement**.
- **UN SEUL accent orange \`#DD8737\`** — uniquement sur l'encadré « À retenir » ou le titre de la zone clé. Répéter cette contrainte explicitement à la fin du prompt.
- Pas de logo, URL, filigrane, signature.
- Style flat clean tech, sans dégradés, sans ombres lourdes.
- Le prompt doit être **long et détaillé** (300+ mots) pour que gpt-image-2 comprenne la structure exacte.
- Structure du prompt : [nature = aide-mémoire dense multi-sections] + [palette exacte] + [archétype et disposition précise] + [description section par section avec contenu réel] + [contraintes finales dont orange unique].

# Règles pour le texte d'accompagnement

- Bilingue FR/EN (pour le SEO et l'accessibilité du site).
- content_fr/en : courte intro (1-2 phrases) + liste des points clés en Markdown.
- Longueurs : excerpt max 160 chars, meta_title max 60 chars, meta_description max 155 chars.
- slug : kebab-case sans accents, sans stop words.
- tags : 3-5 tags kebab-case sans accents.`

// ─── Tool definition ──────────────────────────────────────────────────────────

const EMIT_TOOL = {
  name: 'emit_infographic_resource',
  description: 'Émet le prompt image et les métadonnées bilingues de l\'infographie autonome.',
  input_schema: {
    type: 'object',
    properties: {
      layout_used: {
        type: 'string',
        enum: ['definition', 'process', 'comparison', 'anatomy', 'taxonomy'],
        description: 'Archétype de mise en page choisi (ou imposé).',
      },
      image_prompt: {
        type: 'string',
        description: 'Prompt complet pour gpt-image-2 : style + palette + archétype + contenu + contraintes. En français, portrait, on-brand.',
      },
      title_fr:            { type: 'string',  description: 'Titre de l\'infographie en français (max 70 caractères).' },
      title_en:            { type: 'string',  description: 'Infographic title in English (max 70 characters).' },
      excerpt_fr:          { type: 'string',  description: 'Accroche FR donnant envie de lire (max 160 caractères).' },
      excerpt_en:          { type: 'string',  description: 'EN hook (max 160 characters).' },
      content_fr:          { type: 'string',  description: 'Texte d\'accompagnement FR en Markdown : intro courte + points clés.' },
      content_en:          { type: 'string',  description: 'Accompanying text in English Markdown: short intro + key points.' },
      alt_fr:              { type: 'string',  description: 'Texte alternatif FR de l\'image (2-3 phrases, accessibilité).' },
      alt_en:              { type: 'string',  description: 'Image alt text in English (2-3 sentences, accessible).' },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: '3-5 tags kebab-case sans accents.',
      },
      meta_title_fr:       { type: 'string',  description: 'Meta Title FR | 5PennyAi (max 60 caractères).' },
      meta_title_en:       { type: 'string',  description: 'Meta Title EN | 5PennyAi (max 60 characters).' },
      meta_description_fr: { type: 'string',  description: 'Meta description FR (max 155 caractères).' },
      meta_description_en: { type: 'string',  description: 'Meta description EN (max 155 characters).' },
      slug:                { type: 'string',  description: 'slug-kebab-case-sans-accents.' },
    },
    required: [
      'layout_used', 'image_prompt',
      'title_fr', 'title_en',
      'excerpt_fr', 'excerpt_en',
      'content_fr', 'content_en',
      'alt_fr', 'alt_en',
      'tags',
      'meta_title_fr', 'meta_title_en',
      'meta_description_fr', 'meta_description_en',
      'slug',
    ],
  },
}

// ─── Claude call ───────────────────────────────────────────────────────────────

async function callClaude({ concept, layout, audience, keyPoints, instructions, apiKey }) {
  const parts = [`Concept : ${concept}`]
  if (layout)       parts.push(`Archétype imposé : ${layout}`)
  if (audience)     parts.push(`Audience cible : ${audience}`)
  if (keyPoints)    parts.push(`Points clés à inclure : ${keyPoints}`)
  if (instructions) parts.push(`Instructions libres : ${instructions}`)

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      tools: [EMIT_TOOL],
      tool_choice: { type: 'tool', name: 'emit_infographic_resource' },
      messages: [{ role: 'user', content: parts.join('\n') }],
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('[generate-infographic-resource] Anthropic error:', res.status, errText.slice(0, 500))
    throw new Error(`anthropic_${res.status}`)
  }

  const data = await res.json()
  const toolBlock = (data.content || []).find(
    (b) => b.type === 'tool_use' && b.name === 'emit_infographic_resource',
  )

  if (!toolBlock) {
    console.error('[generate-infographic-resource] No tool_use block. stop_reason=', data?.stop_reason)
    throw new Error('anthropic_no_tool_output')
  }

  return toolBlock.input // already a parsed JS object — no JSON.parse needed
}

// ─── OpenAI gpt-image-2 call ──────────────────────────────────────────────────

async function callOpenAiImage({ prompt, apiKey }) {
  const res = await fetch(OPENAI_IMG_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-image-2',
      prompt,
      size: '1024x1536', // portrait 2:3
      n: 1,
      // response_format not set — gpt-image-2 returns b64_json by default
    }),
  })

  if (!res.ok) {
    let detail = ''
    try {
      const errBody = await res.json()
      detail = errBody?.error?.message || JSON.stringify(errBody).slice(0, 300)
    } catch {
      detail = await res.text().catch(() => '')
    }
    console.error(`[generate-infographic-resource] OpenAI image error: ${res.status} — ${detail}`)
    throw new Error(`openai_${res.status}: ${detail}`)
  }

  const data = await res.json()
  const b64 = data?.data?.[0]?.b64_json
  if (!b64) {
    const raw = JSON.stringify(data).slice(0, 300)
    console.error('[generate-infographic-resource] OpenAI returned no b64_json:', raw)
    throw new Error(`openai_no_image: ${raw}`)
  }

  return b64
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const openaiKey    = process.env.OPENAI_API_KEY
  if (!anthropicKey || !openaiKey) {
    console.error(
      '[generate-infographic-resource] server not configured. hasAnthropic=',
      Boolean(anthropicKey),
      'hasOpenAI=',
      Boolean(openaiKey),
    )
    return res.status(500).json({ error: 'Server is not configured' })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  const { concept, layout, audience, keyPoints, instructions } = body

  if (!concept || typeof concept !== 'string' || !concept.trim()) {
    return res.status(400).json({ error: 'concept is required' })
  }

  const started = Date.now()
  try {
    // 1. Claude → structured prompt + metadata (tool use)
    const structured = await callClaude({
      concept: concept.trim(),
      layout:       typeof layout === 'string' ? layout.trim() : undefined,
      audience:     typeof audience === 'string' ? audience.trim() : undefined,
      keyPoints:    typeof keyPoints === 'string' ? keyPoints.trim() : undefined,
      instructions: typeof instructions === 'string' ? instructions.trim() : undefined,
      apiKey: anthropicKey,
    })

    // 2. OpenAI gpt-image-2 → portrait PNG in base64 (FR only)
    const image_fr_base64 = await callOpenAiImage({
      prompt: structured.image_prompt,
      apiKey: openaiKey,
    })

    const elapsed = Math.round((Date.now() - started) / 1000)
    console.log(
      `[generate-infographic-resource] elapsed=${elapsed}s layout=${structured.layout_used} slug=${structured.slug}`,
    )

    return res.status(200).json({
      image_fr_base64,
      image_prompt:        structured.image_prompt,
      layout_used:         structured.layout_used,
      format:              'infographic',
      title_fr:            structured.title_fr,
      title_en:            structured.title_en,
      excerpt_fr:          structured.excerpt_fr,
      excerpt_en:          structured.excerpt_en,
      content_fr:          structured.content_fr,
      content_en:          structured.content_en,
      alt_fr:              structured.alt_fr,
      alt_en:              structured.alt_en,
      tags:                structured.tags,
      meta_title_fr:       structured.meta_title_fr,
      meta_title_en:       structured.meta_title_en,
      meta_description_fr: structured.meta_description_fr,
      meta_description_en: structured.meta_description_en,
      slug:                structured.slug,
    })
  } catch (err) {
    const elapsed = Math.round((Date.now() - started) / 1000)
    const code = String(err.message || 'unknown')
    console.error(`[generate-infographic-resource] failed after ${elapsed}s: ${code}`)
    if (code.startsWith('anthropic_')) {
      return res.status(502).json({ error: `Prompt generation failed (${code})` })
    }
    if (code.startsWith('openai_')) {
      // Forward the full OpenAI error detail so the client can diagnose the issue
      return res.status(502).json({ error: `Image generation failed — ${code}` })
    }
    return res.status(500).json({ error: `Infographic resource generation failed (${code})` })
  }
}
