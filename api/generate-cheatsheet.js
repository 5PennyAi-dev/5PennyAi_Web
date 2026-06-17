/* global process */
// Vercel Serverless Function — cheat sheet IMAGE generator for the 5PennyAi blog admin.
// Pipeline: Claude (tool use → verified bilingual content + image_prompt) → gpt-image-2 (portrait PNG).
// No server-side upload; the studio (step 3.2bis) handles storage.
// Client calls POST /api/generate-cheatsheet.

import { readFileSync } from 'node:fs'
import path from 'node:path'

export const config = {
  maxDuration: 300,
}

const ANTHROPIC_URL  = 'https://api.anthropic.com/v1/messages'
const OPENAI_IMG_URL = 'https://api.openai.com/v1/images/generations'
const MODEL          = 'claude-sonnet-4-6'
const MAX_TOKENS     = 8000

// ─── Style contract — loaded at cold start ────────────────────────────────────

const SKILL_DIR = path.join(process.cwd(), '.claude/skills/nano-banana-infographic')

function loadStyleFile(relativePath) {
  try {
    return readFileSync(path.join(SKILL_DIR, relativePath), 'utf-8')
  } catch (err) {
    console.error(`[generate-cheatsheet] failed to load ${relativePath}:`, err.message)
    return ''
  }
}

const CHEATSHEET_STYLE = loadStyleFile('references/cheatsheet-resource-style.md')

// ─── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Tu es un expert technique qui produit des fiches de référence visuelles pour 5PennyAi.

MISSION — DEUX PRODUITS EN UNE SEULE RÉPONSE
1. Le **contenu vérifié bilingue** (sections FR + EN) — source de vérité, stocké tel quel.
2. Le **prompt image** qui demande à gpt-image-2 de rendre CE contenu visuellement, verbatim.

════════════════════════════════════════════════════════
ÉTAPE 1 — CONTENU VÉRIFIÉ (sections)
════════════════════════════════════════════════════════

STRUCTURE LIBRE — DICTÉE PAR LE SUJET
Choisis la structure la plus utile. Exemples :
- Référence de commandes/flags → listes de commandes exactes
- Lexique de termes → entrées terme → définition
- Comparaison d'options → attributs côte à côte
- Workflow → séquence d'étapes avec commandes
Deux fiches ne doivent pas avoir la même organisation.

COMPACITÉ — chaque item doit apporter quelque chose. Pas de remplissage.
Nombre d'items par section : 4-10 items denses. Maximum 6-7 sections.

BILINGUE ALIGNÉ — mêmes sections, même ordre, FR et EN.
Termes techniques conservés tels quels (git commit, RAG, token…).
Code non traduit.

EXACTITUDE TECHNIQUE — RÈGLE IMPÉRATIVE
- N'inclure QUE des commandes / API / termes réels et exacts.
- En cas de doute : OMETTRE plutôt qu'inventer.
- Pas de valeurs fictives ni de syntaxe approximative.

FORMAT DES SECTIONS (pour content_fr/en)
- Chaque section = ## {titre} + corps Markdown
- Corps INTERDIT : titres ## (utiliser ### ou **gras** pour sous-libellés)
- Autorisé : listes, code inline, blocs de code, tableaux
- key_takeaway (si pertinent) : corps = > {citation}

════════════════════════════════════════════════════════
ÉTAPE 2 — IMAGE PROMPT (verbatim du contenu)
════════════════════════════════════════════════════════

# Contrat de style — CHEAT SHEET RESSOURCE (OBLIGATOIRE)

${CHEATSHEET_STYLE}

# Règles pour image_prompt

- **VERBATIM ABSOLU** : chaque commande, terme ou valeur courte rendu dans l'image DOIT être copié mot-pour-mot depuis les sections. Jamais de paraphrase, jamais de raccourci inventé.
- Si le contenu total dépasse la capacité visuelle : sélectionne les items les plus importants et cite-les verbatim dans le prompt. **Omettre > inventer.**
- Mentionne explicitement les strings à rendre en monospace pills dans le prompt (entre guillemets ou préfixés d'un tiret).
- Spécifie la couleur d'accent de chaque carte (steel #81AED7, cobalt #4F7CD4, violet #8B5CF6, teal #14B8A6).
- Bandeau orange #DD8737 UNIQUEMENT pour « À retenir » en pied — et UN SEUL.
- Format portrait 2:3 (1024x1536), fond surface #F7F5F2.
- **Jamais de taille en px dans le prompt** — utiliser des termes relatifs (titre grand, label small).
- **Jamais de footer, URL, filigrane, signature dans l'image.**
- Longueur du prompt : 300-500 mots, suffisamment détaillé pour guider gpt-image-2 section par section.

SEO
- slug : kebab-case sans accents, sans stop words
- meta_title : max 60 caractères, inclure "| 5PennyAi"
- meta_description : max 155 caractères
- tags : 3-5 tags kebab-case minuscules`

// ─── Tool definition ──────────────────────────────────────────────────────────

const EMIT_TOOL = {
  name: 'emit_cheatsheet',
  description: 'Émet le contenu bilingue vérifié (sections) + le prompt image verbatim pour la cheat sheet.',
  input_schema: {
    type: 'object',
    properties: {
      slug:                { type: 'string', description: 'slug-kebab-case-sans-accents' },
      title_fr:            { type: 'string', description: 'Titre de la fiche FR (max 70 caractères)' },
      title_en:            { type: 'string', description: 'Cheat sheet title EN (max 70 characters)' },
      excerpt_fr:          { type: 'string', description: 'Accroche FR (max 160 caractères)' },
      excerpt_en:          { type: 'string', description: 'EN hook (max 160 characters)' },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: '3-5 tags kebab-case sans accents, minuscules',
      },
      meta_title_fr:       { type: 'string', description: 'Meta Title FR | 5PennyAi (max 60 caractères)' },
      meta_title_en:       { type: 'string', description: 'Meta Title EN | 5PennyAi (max 60 characters)' },
      meta_description_fr: { type: 'string', description: 'Meta description FR (max 155 caractères)' },
      meta_description_en: { type: 'string', description: 'Meta description EN (max 155 characters)' },
      sections: {
        type: 'array',
        description: 'Sections FR+EN alignées. Chaque section devient ## dans content_fr/en. Corps : pas de ## ; code inline autorisé.',
        items: {
          type: 'object',
          properties: {
            title_fr:   { type: 'string', description: 'Titre de section FR (sans ##)' },
            title_en:   { type: 'string', description: 'Section title EN (no ##)' },
            body_md_fr: { type: 'string', description: 'Corps Markdown FR. INTERDIT : ## de niveau 2.' },
            body_md_en: { type: 'string', description: 'Body Markdown EN. FORBIDDEN: ## level-2 headings.' },
          },
          required: ['title_fr', 'title_en', 'body_md_fr', 'body_md_en'],
        },
      },
      key_takeaway_fr: { type: 'string', description: '(Optionnel) Takeaway FR — texte court, percutant. Omets si pas naturel.' },
      key_takeaway_en: { type: 'string', description: '(Optional) EN takeaway — short, punchy. Omit if not natural.' },
      layout_used: {
        type: 'string',
        enum: ['commands', 'lexicon', 'comparison', 'workflow', 'mixed'],
        description: 'Archétype de layout choisi selon le sujet.',
      },
      image_prompt: {
        type: 'string',
        description: 'Prompt complet pour gpt-image-2 : style cheat sheet on-brand, verbatim du contenu des sections, portrait 2:3, sans footer ni URL. FR uniquement.',
      },
    },
    required: [
      'slug',
      'title_fr', 'title_en',
      'excerpt_fr', 'excerpt_en',
      'tags',
      'meta_title_fr', 'meta_title_en',
      'meta_description_fr', 'meta_description_en',
      'sections',
      'layout_used',
      'image_prompt',
    ],
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(input) {
  if (!input) return ''
  return String(input)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function truncate(str, max) {
  if (!str) return ''
  const s = String(str).trim()
  return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s
}

function countWords(markdown) {
  if (!markdown) return 0
  return String(markdown).replace(/[#>*_`[\](){}!-]/g, ' ').split(/\s+/).filter(Boolean).length
}

// Takeaway heading names — used to deduplicate when Claude emits both a section
// named "À retenir" AND a key_takeaway field.
const TAKEAWAY_TITLES = new Set(['à retenir', 'key takeaway', 'a retenir', 'takeaway'])

function assembleSections(sections, lang, key_takeaway) {
  const heading = lang === 'fr' ? 'À retenir' : 'Key takeaway'

  // Filter out any section already named after the takeaway to avoid duplication
  const filtered = (Array.isArray(sections) ? sections : []).filter((s) => {
    const t = (lang === 'fr' ? s.title_fr : s.title_en) || ''
    return !TAKEAWAY_TITLES.has(t.toLowerCase().trim())
  })

  const parts = filtered.map((s) => {
    const title = lang === 'fr' ? s.title_fr : s.title_en
    const body  = lang === 'fr' ? s.body_md_fr : s.body_md_en
    return `## ${title}\n\n${body}`
  })

  if (key_takeaway && String(key_takeaway).trim()) {
    const blockquote = `> ${String(key_takeaway).trim()}`
    parts.push(`## ${heading}\n\n${blockquote}`)
  }

  return parts.join('\n\n')
}

function postProcess(raw) {
  const out = { ...raw }

  out.slug                 = slugify(out.slug || out.title_fr || 'cheatsheet')
  out.title_fr             = truncate(out.title_fr, 70)
  out.title_en             = truncate(out.title_en, 70)
  out.excerpt_fr           = truncate(out.excerpt_fr, 160)
  out.excerpt_en           = truncate(out.excerpt_en, 160)
  out.meta_title_fr        = truncate(out.meta_title_fr, 60)
  out.meta_title_en        = truncate(out.meta_title_en, 60)
  out.meta_description_fr  = truncate(out.meta_description_fr, 155)
  out.meta_description_en  = truncate(out.meta_description_en, 155)

  if (!Array.isArray(out.tags)) out.tags = []
  out.tags = out.tags.map((t) => slugify(t)).filter(Boolean).slice(0, 6)

  out.content_fr = assembleSections(out.sections, 'fr', out.key_takeaway_fr)
  out.content_en = assembleSections(out.sections, 'en', out.key_takeaway_en)

  const words = countWords(out.content_fr)
  out.reading_time_minutes = Math.max(1, Math.round(words / 200))

  return out
}

// ─── Claude call ───────────────────────────────────────────────────────────────

async function callClaude({ topic, audience, instructions, language, apiKey }) {
  const parts = [`Sujet de la fiche : ${topic}`]
  if (audience)     parts.push(`Audience cible : ${audience}`)
  if (instructions) parts.push(`Instructions supplémentaires : ${instructions}`)
  const primary = language === 'en'
    ? 'Langue principale : anglais (EN principal, FR adaptation).'
    : 'Langue principale : français (FR principal, EN adaptation).'
  parts.push(primary)

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
      tool_choice: { type: 'tool', name: 'emit_cheatsheet' },
      messages: [{ role: 'user', content: parts.join('\n') }],
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('[generate-cheatsheet] Anthropic error:', res.status, errText.slice(0, 500))
    throw new Error(`anthropic_${res.status}`)
  }

  const data = await res.json()
  const stopReason = data?.stop_reason || 'unknown'
  console.log(`[generate-cheatsheet] Claude stop_reason=${stopReason}`)

  const toolBlock = (data.content || []).find(
    (b) => b.type === 'tool_use' && b.name === 'emit_cheatsheet',
  )

  if (!toolBlock) {
    console.error('[generate-cheatsheet] No tool_use block. stop_reason=', stopReason)
    throw new Error('anthropic_no_tool_output')
  }

  return toolBlock.input
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
      size: '1024x1536',
      n: 1,
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
    console.error(`[generate-cheatsheet] OpenAI image error: ${res.status} — ${detail}`)
    throw new Error(`openai_${res.status}: ${detail}`)
  }

  const data = await res.json()
  const b64 = data?.data?.[0]?.b64_json
  if (!b64) {
    const raw = JSON.stringify(data).slice(0, 300)
    console.error('[generate-cheatsheet] OpenAI returned no b64_json:', raw)
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
      '[generate-cheatsheet] server not configured. hasAnthropic=',
      Boolean(anthropicKey), 'hasOpenAI=', Boolean(openaiKey),
    )
    return res.status(500).json({ error: 'Server is not configured' })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  const { topic, audience, instructions, language } = body

  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    return res.status(400).json({ error: 'topic is required' })
  }

  const normalizedLanguage = language === 'en' ? 'en' : 'fr'
  const started = Date.now()

  try {
    // Step 1 — Claude: verified bilingual content + image_prompt (tool use)
    const structured = await callClaude({
      topic:        topic.trim(),
      audience:     typeof audience === 'string' ? audience.trim() : undefined,
      instructions: typeof instructions === 'string' ? instructions.trim() : undefined,
      language:     normalizedLanguage,
      apiKey:       anthropicKey,
    })

    const cheatsheet = postProcess(structured)

    const claudeElapsed = Math.round((Date.now() - started) / 1000)
    console.log(
      `[generate-cheatsheet] Claude done in ${claudeElapsed}s layout=${cheatsheet.layout_used} slug=${cheatsheet.slug}`,
    )

    // Step 2 — gpt-image-2: render cheat sheet portrait PNG (FR only)
    const image_fr_base64 = await callOpenAiImage({
      prompt: structured.image_prompt,
      apiKey: openaiKey,
    })

    const elapsed = Math.round((Date.now() - started) / 1000)
    console.log(`[generate-cheatsheet] total elapsed=${elapsed}s`)

    return res.status(200).json({
      image_fr_base64,
      image_prompt:        structured.image_prompt,
      layout_used:         cheatsheet.layout_used,
      slug:                cheatsheet.slug,
      title_fr:            cheatsheet.title_fr,
      title_en:            cheatsheet.title_en,
      excerpt_fr:          cheatsheet.excerpt_fr,
      excerpt_en:          cheatsheet.excerpt_en,
      content_fr:          cheatsheet.content_fr,
      content_en:          cheatsheet.content_en,
      tags:                cheatsheet.tags,
      meta_title_fr:       cheatsheet.meta_title_fr,
      meta_title_en:       cheatsheet.meta_title_en,
      meta_description_fr: cheatsheet.meta_description_fr,
      meta_description_en: cheatsheet.meta_description_en,
      reading_time_minutes: cheatsheet.reading_time_minutes,
      format:              'cheatsheet',
      article_type:        'cheatsheet',
    })
  } catch (err) {
    const elapsed = Math.round((Date.now() - started) / 1000)
    const code    = String(err.message || 'unknown')
    console.error(`[generate-cheatsheet] failed after ${elapsed}s: ${code}`)

    if (code.startsWith('anthropic_')) {
      return res.status(502).json({ error: `Content generation failed (${code})` })
    }
    if (code.startsWith('openai_')) {
      return res.status(502).json({ error: `Image generation failed — ${code}` })
    }
    return res.status(500).json({ error: 'Cheat sheet generation failed' })
  }
}
