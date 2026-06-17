/* global process */
// Vercel Serverless Function — AI news digest generator for the 5PennyAi blog admin.
// Keeps ANTHROPIC_API_KEY and PERPLEXITY_API_KEY server-side.
// Client calls POST /api/generate-news.
// Uses Anthropic tool use (structured output) to avoid JSON escaping failures on
// Markdown fields that contain quotes/newlines.

export const config = {
  maxDuration: 300,
}

const ANTHROPIC_URL  = 'https://api.anthropic.com/v1/messages'
const PERPLEXITY_URL = 'https://api.perplexity.ai/chat/completions'
const MODEL          = 'claude-sonnet-4-6'
const MAX_TOKENS     = 16000

// ─── Tool definition ──────────────────────────────────────────────────────────
// Forces Claude to emit structured output via the tool-use mechanism.
// The API parses the JSON internally, so Markdown fields with quotes/newlines
// never reach our code as raw text to parse.

const EMIT_TOOL = {
  name: 'emit_news_digest',
  description: 'Émet le digest d\'actualités bilingue au format structuré.',
  input_schema: {
    type: 'object',
    properties: {
      title_fr:            { type: 'string',  description: 'Titre du digest FR (max 70 caractères)' },
      title_en:            { type: 'string',  description: 'Digest title EN (max 70 characters)' },
      slug:                { type: 'string',  description: 'slug-kebab-case-sans-accents' },
      excerpt_fr:          { type: 'string',  description: 'Accroche FR donnant envie de lire (max 160 caractères)' },
      excerpt_en:          { type: 'string',  description: 'EN hook (max 160 characters)' },
      content_fr:          { type: 'string',  description: 'Digest complet en Markdown français selon la structure demandée' },
      content_en:          { type: 'string',  description: 'Full digest in English Markdown using the same structure' },
      tags:                { type: 'array',   items: { type: 'string' }, description: '3-5 tags kebab-case sans accents' },
      reading_time_minutes:{ type: 'integer', description: 'Temps de lecture estimé en minutes' },
      meta_title_fr:       { type: 'string',  description: 'Meta Title FR | 5PennyAi (max 60 caractères)' },
      meta_description_fr: { type: 'string',  description: 'Meta description FR (max 155 caractères)' },
      meta_title_en:       { type: 'string',  description: 'Meta Title EN | 5PennyAi (max 60 characters)' },
      meta_description_en: { type: 'string',  description: 'Meta description EN (max 155 characters)' },
      sources: {
        type: 'array',
        description: 'Sources utilisées — uniquement des URLs réelles présentes dans la recherche',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            url:   { type: 'string' },
          },
          required: ['title', 'url'],
        },
      },
      items_found: { type: 'integer', description: 'Nombre RÉEL d\'actualités utilisées' },
      window_used: { type: 'string',  description: 'Fenêtre temporelle effective (ex : "7d")' },
    },
    required: [
      'title_fr', 'title_en', 'slug',
      'excerpt_fr', 'excerpt_en',
      'content_fr', 'content_en',
      'tags', 'reading_time_minutes',
      'meta_title_fr', 'meta_description_fr',
      'meta_title_en', 'meta_description_en',
      'sources', 'items_found', 'window_used',
    ],
  },
}

// ─── Perplexity research ─────────────────────────────────────────────────────

const NEWS_RESEARCH_SYSTEM_PROMPT = `Tu es un veilleur d'actualités spécialisé en intelligence artificielle.
Ta mission : trouver des actualités RÉELLES et RÉCENTES sur le sujet demandé.

Pour chaque actualité trouvée, fournis :
- Un titre précis (tel qu'il apparaît dans la source)
- Un résumé factuel de 2-3 phrases (faits seulement, sans opinion)
- L'URL directe de la source originale (article de presse, blog officiel, communiqué)

Sources acceptées : The Verge, Wired, MIT Technology Review, Ars Technica, TechCrunch, Reuters, AP,
Le Monde, Le Figaro, Numerama, Korii, Radio-Canada, blogs officiels (OpenAI, Anthropic, Google, Meta AI, Mistral).

RÈGLE IMPÉRATIVE : Ne jamais inventer ou extrapoler une actualité.
Si le nombre d'actualités demandé n'est pas disponible dans la fenêtre temporelle,
retourne seulement les actualités réelles que tu trouves et signale-le clairement.`

function buildNewsResearchQuery(topic, timeWindow, count, language) {
  const days = timeWindow.replace('d', '')
  const langHint = language === 'en'
    ? 'Prioritize English-language sources.'
    : 'Privilégie les sources francophones, complète avec des sources anglophones si nécessaire.'

  return `Trouve les ${count} actualités les plus importantes sur "${topic}" publiées dans les ${days} derniers jours.

Pour chaque actualité : titre exact, résumé factuel 2-3 phrases, URL source directe et vérifiable.
${langHint}

Si tu trouves moins de ${count} actualités solides dans cette fenêtre, retourne uniquement les vraies
actualités disponibles — n'en invente pas pour atteindre le nombre demandé.`
}

async function fetchNewsResearch(topic, timeWindow, count, language) {
  const perplexityKey = process.env.PERPLEXITY_API_KEY
  if (!perplexityKey) {
    console.warn('[generate-news] PERPLEXITY_API_KEY not set, skipping research')
    return { research: '', used: false }
  }

  try {
    const response = await fetch(PERPLEXITY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${perplexityKey}`,
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: NEWS_RESEARCH_SYSTEM_PROMPT },
          { role: 'user', content: buildNewsResearchQuery(topic, timeWindow, count, language) },
        ],
        temperature: 0.2,
      }),
    })

    const data = await response.json()

    if (data.error) {
      console.error('[generate-news] Perplexity error:', data.error)
      return { research: '', used: false }
    }

    const content = data.choices?.[0]?.message?.content || ''
    if (!content) {
      console.warn('[generate-news] Perplexity returned empty content')
      return { research: '', used: false }
    }

    console.log(`[generate-news] Perplexity research received (${content.length} chars)`)
    return { research: content, used: true }
  } catch (err) {
    console.error('[generate-news] Perplexity fetch failed:', err)
    return { research: '', used: false }
  }
}

// ─── Claude synthesis ─────────────────────────────────────────────────────────

const NEWS_SYSTEM_PROMPT = `Tu es un journaliste-vulgarisateur pour le blog 5PennyAi, spécialisé en intelligence artificielle grand public.

MISSION
Produire un digest d'actualités bilingue (FR + EN) accessible à un lecteur non-technique.
Chaque actualité doit répondre à deux questions : qu'est-ce qui s'est passé, et pourquoi c'est important pour le grand public ?

RÈGLE ANTI-FABRICATION — IMPÉRATIVE
Tu produis UNIQUEMENT des faits ancrés dans la recherche fournie.
- Si la recherche contient moins d'actualités que demandé : utilise uniquement les actualités disponibles, n'en invente JAMAIS pour atteindre le compte.
- N'invente JAMAIS une URL source — utilise uniquement les URLs présentes dans la recherche.
- Si une URL n'est pas disponible pour une actualité, omets le lien.
- Retourne dans items_found le nombre RÉEL d'actualités utilisées.
- Retourne dans window_used la fenêtre temporelle effective (peut différer si élargie).

TON ET STYLE
- Accessible : zéro jargon non expliqué. Si un terme technique apparaît, explique-le en une phrase.
- Factuel et honnête : pas de hype, pas d'alarmisme.
- "Pourquoi ça compte" : toujours ramener à l'impact concret sur la vie des gens, pas sur les entreprises.
- Phrases courtes, paragraphes courts.

STRUCTURE MARKDOWN OBLIGATOIRE pour content_fr et content_en :
1. Un paragraphe d'intro (2-3 phrases) situant le thème et la période couverte.
2. Pour chaque actualité :
   ## {titre court de l'actualité}
   **Ce qui s'est passé** — {1-2 phrases factuelles, concrètes}
   **Pourquoi ça compte** — {1 phrase, angle grand public, sans jargon}
   [source]({url})
3. Une section finale :
   ## À retenir
   {synthèse transversale 1-2 phrases — ce que ces actualités disent ensemble sur l'évolution de l'IA}

SEO
- Mot-clé principal dans le titre, l'extrait et la meta description.
- Meta title : max 60 caractères, inclure "| 5PennyAi"
- Meta description : max 155 caractères`

function buildNewsUserMessage({ topic, timeWindow, count, instructions, language, research }) {
  const days = timeWindow.replace('d', '')
  const primary = language === 'en'
    ? 'anglais (EN est la version principale, FR est une adaptation)'
    : 'français (FR est la version principale, EN est une adaptation)'
  const extras = instructions && instructions.trim()
    ? `\n\nPrécisions supplémentaires : ${instructions.trim()}`
    : ''

  const researchBlock = research
    ? `\n\nRECHERCHE D'ACTUALITÉS (utilise UNIQUEMENT ces données — ne complète pas avec des faits inventés) :\n---\n${research}\n---`
    : '\n\n(Aucune recherche disponible — base-toi sur tes connaissances récentes, mais applique la règle anti-fabrication avec rigueur.)'

  return `Crée un digest des actualités récentes sur ce sujet :

${topic}

Période couverte : les ${days} derniers jours
Nombre d'actualités cibles : ${count} (minimum — mais ne dépasse jamais les actualités réelles disponibles)
Langue principale : ${primary}${extras}${researchBlock}`
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function postProcessNews(digest) {
  const out = { ...digest }

  out.slug = slugify(out.slug || out.title_fr || 'actu-ia')

  out.title_fr            = truncate(out.title_fr, 70)
  out.title_en            = truncate(out.title_en, 70)
  out.excerpt_fr          = truncate(out.excerpt_fr, 160)
  out.excerpt_en          = truncate(out.excerpt_en, 160)
  out.meta_title_fr       = truncate(out.meta_title_fr, 60)
  out.meta_title_en       = truncate(out.meta_title_en, 60)
  out.meta_description_fr = truncate(out.meta_description_fr, 155)
  out.meta_description_en = truncate(out.meta_description_en, 155)

  if (!Array.isArray(out.tags)) out.tags = []
  out.tags = out.tags.map((t) => slugify(t)).filter(Boolean).slice(0, 6)

  const rt = parseInt(out.reading_time_minutes, 10)
  if (!Number.isFinite(rt) || rt < 1) {
    const words = countWords(out.content_fr)
    out.reading_time_minutes = Math.max(1, Math.round(words / 200))
  } else {
    out.reading_time_minutes = rt
  }

  out.content_fr = String(out.content_fr || '')
  out.content_en = String(out.content_en || '')

  if (!Array.isArray(out.sources)) out.sources = []
  out.items_found = Number.isInteger(out.items_found) ? out.items_found : out.sources.length
  out.window_used = out.window_used ? String(out.window_used) : '7d'

  return out
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('[generate-news] ANTHROPIC_API_KEY is not set')
    return res.status(500).json({ error: 'Server is not configured' })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  const { topic, timeWindow, count, instructions, language } = body

  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    return res.status(400).json({ error: 'topic is required' })
  }

  const normalizedWindow   = ['7d', '14d', '30d'].includes(timeWindow) ? timeWindow : '7d'
  const normalizedCount    = Math.max(3, parseInt(count, 10) || 3)
  const normalizedLanguage = language === 'en' ? 'en' : 'fr'

  try {
    const started = Date.now()

    // Step 1: Perplexity — find real news items with sources
    const { research, used: researchUsed } = await fetchNewsResearch(
      topic.trim(),
      normalizedWindow,
      normalizedCount,
      normalizedLanguage,
    )
    const researchElapsed = Math.round((Date.now() - started) / 1000)
    console.log(`[generate-news] Perplexity done in ${researchElapsed}s (used=${researchUsed})`)

    // Step 2: Claude Sonnet — bilingual Markdown digest via structured tool use.
    // tool_choice forces a tool_use block in the response; the API handles JSON
    // escaping internally, eliminating parse failures on Markdown content.
    const response = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: NEWS_SYSTEM_PROMPT,
        tools: [EMIT_TOOL],
        tool_choice: { type: 'tool', name: 'emit_news_digest' },
        messages: [
          {
            role: 'user',
            content: buildNewsUserMessage({
              topic: topic.trim(),
              timeWindow: normalizedWindow,
              count: normalizedCount,
              instructions,
              language: normalizedLanguage,
              research,
            }),
          },
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('[generate-news] Anthropic API error:', response.status, errText)
      return res.status(502).json({ error: 'Upstream API error', status: response.status })
    }

    const data = await response.json()

    const stopReason = data?.stop_reason || 'unknown'
    const elapsed = Math.round((Date.now() - started) / 1000)
    console.log(`[generate-news] model=${MODEL} elapsed=${elapsed}s stop_reason=${stopReason}`)

    // With tool_choice forced, the response contains a tool_use block whose
    // .input is already a parsed JS object — no JSON.parse needed.
    const toolBlock = (data.content || []).find(
      (b) => b.type === 'tool_use' && b.name === 'emit_news_digest'
    )

    if (!toolBlock) {
      console.error(
        `[generate-news] No tool_use block in response. stop_reason=${stopReason} ` +
        `content=${JSON.stringify(data.content || []).slice(0, 500)}`
      )
      return res.status(500).json({ error: 'Generation did not return structured output' })
    }

    const digest = postProcessNews(toolBlock.input)
    return res.status(200).json({
      ...digest,
      format: 'news',
      article_type: 'news',
      _research_used: researchUsed,
    })
  } catch (err) {
    console.error('[generate-news] Generation error:', err)
    return res.status(500).json({ error: 'News generation failed' })
  }
}
