/* global process, Buffer */
// Vercel Serverless Function — Topic Finder pipeline for the 5PennyAi blog admin.
// Orchestrates: Perplexity (research) → Claude (structuring) → DataForSEO (SEO enrichment).
// Keeps all API keys server-side. Client calls POST /api/search-topics.

export const config = {
  maxDuration: 120,
}

const PERPLEXITY_URL = 'https://api.perplexity.ai/chat/completions'
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const DATAFORSEO_URL = 'https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_overview/live'
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'
const CLAUDE_MAX_TOKENS = 4000

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

const RESEARCH_SYSTEM_PROMPT = `Tu es un chercheur spécialisé en intelligence artificielle pour les PME.

Recherche en profondeur sur le web pour trouver :
1. Les vraies questions que les propriétaires de PME posent sur ce sujet (forums, Reddit, Quora, LinkedIn)
2. Les frustrations et défis concrets mentionnés par des entrepreneurs
3. Les tendances émergentes
4. Les cas d'usage concrets et histoires de succès
5. Les mythes et objections fréquentes
6. Des statistiques et données chiffrées récentes

Sois exhaustif. Cite les sources avec URLs quand possible. Concentre-toi sur le marché nord-américain et francophone.`

const STRUCTURING_SYSTEM_PROMPT = `Tu es un stratège de contenu expert pour le blog 5PennyAi qui aide les PME à comprendre l'IA.

On te donne un rapport de recherche brut. Analyse-le et retourne UNIQUEMENT un JSON valide (pas de markdown, pas de backticks, pas de texte avant/après).

SCORING ÉDITORIAL — pour chaque sujet, évalue deux dimensions :

PERTINENCE BUSINESS (0-25 points) :
5PennyAi offre ces services : développement d'applications IA sur mesure, intégration de modèles de langage dans des processus existants, automatisation de workflows par agents IA, prompt engineering, prototypage rapide, et audit/stratégie IA pour PME.
- 20-25 pts : Le sujet mène DIRECTEMENT à ces services. Un lecteur qui lit cet article penserait naturellement "j'ai besoin d'aide pour faire ça" → appel découverte. Ex: "Comment automatiser vos processus internes avec l'IA"
- 13-19 pts : Le sujet est lié aux services mais indirectement. Le lecteur apprend quelque chose d'utile et découvre 5PennyAi. Ex: "5 outils IA gratuits pour les PME"
- 6-12 pts : Le sujet est éducatif sur l'IA mais ne crée pas de besoin pour les services. Ex: "Comment l'IA transforme l'industrie manufacturière"
- 0-5 pts : Le sujet n'a aucun lien avec les services. Ex: "L'histoire de l'intelligence artificielle depuis 1950"

SPÉCIFICITÉ (0-20 points) :
Un nouveau blog doit cibler des niches, pas des termes génériques.
- 16-20 pts : Sujet très spécifique, longue traîne, peu de compétition probable. Cible un type de PME ou un cas d'usage précis. Ex: "Automatiser la facturation pour les cabinets comptables avec l'IA"
- 10-15 pts : Sujet ciblé mais pas ultra-niche. Ex: "Comment les PME utilisent les chatbots pour le service client"
- 5-9 pts : Sujet assez large, beaucoup de compétiteurs probables. Ex: "Les avantages de l'IA pour les entreprises"
- 0-4 pts : Sujet trop générique, dominé par les gros sites. Ex: "Qu'est-ce que l'intelligence artificielle?"

Structure JSON attendue :
{
  "topics": [
    {
      "title": "Titre d'article de blog accrocheur en français",
      "article_type": "liste | guide | comparaison | etude-de-cas | opinion | tutoriel",
      "problem": "Le problème métier concret que ça résout",
      "audience": "Type de PME visée",
      "angle": "L'angle unique ou le hook de l'article",
      "difficulty": "débutant | intermédiaire | avancé",
      "keywords": ["3-5 mots-clés SEO en français"],
      "keywords_en": ["3-5 mots-clés SEO en anglais"],
      "sources": ["URLs ou descriptions des sources"],
      "blog_precisions": "Instructions complètes pour la rédaction : audience, angle, problème, mots-clés, sources, ton.",
      "business_relevance": {
        "score": 22,
        "reason": "Explication en 1 phrase courte"
      },
      "specificity": {
        "score": 16,
        "reason": "Explication en 1 phrase courte"
      }
    }
  ],
  "trends": ["3-5 tendances émergentes"],
  "raw_questions": ["8-12 vraies questions posées par des gens"],
  "content_gaps": ["3-5 sujets peu couverts en français"]
}

Trouve au moins 6 sujets variés. Les titres doivent être accrocheurs et orientés bénéfice pour le lecteur PME. Les mots-clés doivent être des termes que quelqu'un taperait dans Google. Les reasons de scoring doivent tenir en 1 phrase.`

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function isValidTopicsShape(obj) {
  return (
    obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.topics) &&
    obj.topics.length > 0 &&
    obj.topics.every(
      (t) =>
        typeof t.title === 'string' &&
        t.title.trim().length > 0 &&
        Array.isArray(t.keywords) &&
        t.keywords.length > 0
    )
  )
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n))
}

// Maps DataForSEO results onto a topic's EN keywords and returns the keyword
// structure used by the UI. Score calculation is centralized in
// `calculateTopicScore` below — this function only shapes the raw SEO data.
function buildSeoKeywordData(topic, dfsResults) {
  const kwEn = topic.keywords_en || []
  const kwFr = topic.keywords || []

  const dfsMap = new Map()
  for (const item of dfsResults) {
    if (item.keyword) {
      dfsMap.set(item.keyword.trim().toLowerCase(), item)
    }
  }

  const keywordData = kwEn.map((kw, i) => {
    const match = dfsMap.get(kw.trim().toLowerCase())
    const frEquivalent = kwFr[i] || null
    if (!match) return { keyword: kw, keyword_fr: frEquivalent, search_volume: null, cpc: null, competition_level: null }
    return {
      keyword: match.keyword,
      keyword_fr: frEquivalent,
      search_volume: match.keyword_info?.search_volume || 0,
      cpc: match.keyword_info?.cpc || 0,
      competition: match.keyword_info?.competition || 0,
      competition_level: match.keyword_info?.competition_level || 'UNKNOWN',
      search_intent: match.keyword_info?.search_intent_info?.main_intent || 'informational',
      monthly_searches: match.keyword_info?.monthly_searches || [],
    }
  })

  const sorted = [...keywordData].sort((a, b) => (b.search_volume || 0) - (a.search_volume || 0))
  return {
    primary_keyword: sorted[0] || {},
    secondary_keywords: sorted.slice(1),
    fetched_at: new Date().toISOString(),
  }
}

// 4-dimension composite score (0-100). Used for both fresh results and fallback
// when DataForSEO is unavailable — in that case the two SEO dimensions fall
// back to their low defaults and Claude's business/specificity scores drive
// the total.
function calculateTopicScore(topic, seoData) {
  // Dim 1 — Recherche (max 25)
  const volume = seoData?.primary_keyword?.search_volume || 0
  let searchScore =
    volume >= 5000 ? 25
    : volume >= 2000 ? 22
    : volume >= 1000 ? 18
    : volume >= 500 ? 14
    : volume >= 200 ? 10
    : volume >= 50 ? 6
    : 2
  const intent = (seoData?.primary_keyword?.search_intent || '').toLowerCase()
  if (intent === 'informational') searchScore = Math.min(searchScore + 3, 25)

  // Dim 2 — Ranker (max 30)
  const comp = (seoData?.primary_keyword?.competition_level || 'UNKNOWN').toUpperCase()
  let rankScore =
    comp === 'LOW' ? 28
    : comp === 'MEDIUM' ? 18
    : comp === 'HIGH' ? 8
    : 15
  const kw = seoData?.primary_keyword?.keyword || ''
  const words = kw.trim().split(/\s+/).filter(Boolean).length
  if (words >= 4) rankScore = Math.min(rankScore + 5, 30)
  else if (words >= 3) rankScore = Math.min(rankScore + 2, 30)

  // Dim 3 — Business (max 25, défaut moyen 12 si Claude n'a pas scoré)
  const businessScore = clamp(topic.business_relevance?.score ?? 12, 0, 25)

  // Dim 4 — Spécificité (max 20, défaut moyen 10 si Claude n'a pas scoré)
  const specificityScore = clamp(topic.specificity?.score ?? 10, 0, 20)

  return {
    total: Math.min(searchScore + rankScore + businessScore + specificityScore, 100),
    breakdown: {
      search: searchScore,
      rank: rankScore,
      business: businessScore,
      specificity: specificityScore,
    },
  }
}

// ---------------------------------------------------------------------------
// Pipeline steps
// ---------------------------------------------------------------------------

async function fetchPerplexityResearch(query, perplexityKey) {
  const response = await fetch(PERPLEXITY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${perplexityKey}`,
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: RESEARCH_SYSTEM_PROMPT },
        { role: 'user', content: query },
      ],
      temperature: 0.3,
    }),
  })

  const data = await response.json()

  if (data.error) {
    throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error))
  }

  const content = data.choices?.[0]?.message?.content || ''
  if (!content) {
    throw new Error('Perplexity returned empty content')
  }

  return content
}

async function structureWithClaude(rawResearch, query, apiKey) {
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
      system: STRUCTURING_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Voici le rapport de recherche brut sur le sujet "${query}" :\n\n${rawResearch}\n\nAnalyse ce rapport et structure-le en sujets d'articles de blog.`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Anthropic API ${response.status}: ${errText.slice(0, 200)}`)
  }

  const data = await response.json()

  const text = (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim()

  if (!text) {
    throw new Error('Claude returned empty content')
  }

  const parsed = extractJson(text)
  if (!parsed || !isValidTopicsShape(parsed)) {
    throw new Error('Claude produced invalid JSON structure')
  }

  return parsed
}

async function enrichWithDataForSEO(topics, login, password) {
  // Only send EN keywords — US market has the most SEO data available.
  // FR keywords stay on the topic for article writing but metrics come from EN equivalents.
  const allKeywords = topics.flatMap((t) => t.keywords_en || [])
  const uniqueKeywords = [...new Set(allKeywords)]

  if (uniqueKeywords.length === 0) {
    console.log('[search-topics] DataForSEO skipped — no EN keywords to enrich')
    return { enriched: false, results: [] }
  }

  console.log(`[search-topics] DataForSEO request: ${uniqueKeywords.length} EN keywords →`, uniqueKeywords)

  const response = await fetch(DATAFORSEO_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from(login + ':' + password).toString('base64'),
    },
    body: JSON.stringify([
      {
        keywords: uniqueKeywords,
        location_name: 'United States',
        language_name: 'English',
        include_serp_info: true,
      },
    ]),
  })

  const data = await response.json()
  console.log(`[search-topics] DataForSEO response: status_code=${data.status_code}, tasks=${data.tasks?.length}, cost=${data.cost}`)

  if (data.status_code !== 20000) {
    console.error(`[search-topics] DataForSEO error: ${data.status_code} — ${data.status_message}`, JSON.stringify(data).slice(0, 500))
    throw new Error(`DataForSEO ${data.status_code}: ${data.status_message || 'Unknown error'}`)
  }

  // Debug: inspect the actual response structure
  const resultWrapper = data.tasks?.[0]?.result?.[0]
  console.log(`[search-topics] DataForSEO result[0] structure (500 chars):`, JSON.stringify(resultWrapper).slice(0, 500))
  console.log(`[search-topics] DataForSEO result[0].items count: ${resultWrapper?.items?.length ?? 'N/A'}`)
  if (resultWrapper?.items?.[0]) {
    console.log(`[search-topics] DataForSEO first item:`, JSON.stringify(resultWrapper.items[0]).slice(0, 500))
  }

  // The actual keyword data lives in tasks[0].result[0].items[]
  // NOT in tasks[0].result[] directly
  const dfsResults = resultWrapper?.items || []
  console.log(`[search-topics] DataForSEO enriched ${dfsResults.length} keywords out of ${uniqueKeywords.length} sent`)
  return { enriched: true, results: dfsResults }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  const perplexityKey = process.env.PERPLEXITY_API_KEY
  if (!apiKey || !perplexityKey) {
    console.error('[search-topics] Missing required API keys (ANTHROPIC_API_KEY or PERPLEXITY_API_KEY)')
    return res.status(500).json({ error: 'Server is not configured' })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  const { query } = body

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Query is required' })
  }

  const started = Date.now()

  // Step 1: Perplexity research
  let rawResearch
  try {
    rawResearch = await fetchPerplexityResearch(query.trim(), perplexityKey)
    const elapsed = Math.round((Date.now() - started) / 1000)
    console.log(`[search-topics] Perplexity done in ${elapsed}s (${rawResearch.length} chars)`)
  } catch (err) {
    console.error('[search-topics] Perplexity failed:', err.message)
    return res.status(502).json({ error: `Perplexity: ${err.message}`, step: 'research' })
  }

  // Step 2: Claude structuring
  let structured
  try {
    structured = await structureWithClaude(rawResearch, query.trim(), apiKey)
    const elapsed = Math.round((Date.now() - started) / 1000)
    console.log(`[search-topics] Claude done in ${elapsed}s (${structured.topics.length} topics)`)
  } catch (err) {
    console.error('[search-topics] Claude structuring failed:', err.message)
    return res.status(502).json({
      error: `Claude: ${err.message}`,
      step: 'structure',
      raw_research: rawResearch,
    })
  }

  // Step 3: DataForSEO enrichment (soft fail)
  const dfsLogin = process.env.DATAFORSEO_LOGIN
  const dfsPassword = process.env.DATAFORSEO_PASSWORD
  let seoAvailable = false

  if (dfsLogin && dfsPassword) {
    try {
      const { enriched, results } = await enrichWithDataForSEO(structured.topics, dfsLogin, dfsPassword)
      if (enriched) {
        structured.topics = structured.topics.map((topic) => ({
          ...topic,
          seo_data: buildSeoKeywordData(topic, results),
        }))
        seoAvailable = true
      }
      const elapsed = Math.round((Date.now() - started) / 1000)
      console.log(`[search-topics] DataForSEO done in ${elapsed}s (enriched=${enriched})`)
    } catch (err) {
      console.warn('[search-topics] DataForSEO failed (non-blocking):', err.message)
    }
  } else {
    console.warn('[search-topics] DataForSEO credentials not configured, skipping SEO enrichment')
  }

  // Step 4: Composite score (always runs — fallback defaults kick in when SEO is missing)
  structured.topics = structured.topics.map((topic) => {
    const score = calculateTopicScore(topic, topic.seo_data)
    return {
      ...topic,
      seo_data: {
        ...(topic.seo_data || {}),
        seo_score: score.total,
        score_breakdown: score.breakdown,
      },
    }
  })

  // Sort descending: best opportunities first
  structured.topics.sort((a, b) => (b.seo_data?.seo_score || 0) - (a.seo_data?.seo_score || 0))

  const totalElapsed = Math.round((Date.now() - started) / 1000)
  console.log(`[search-topics] Pipeline complete in ${totalElapsed}s — ${structured.topics.length} topics, seo=${seoAvailable}`)

  return res.status(200).json({
    topics: structured.topics,
    trends: structured.trends || [],
    raw_questions: structured.raw_questions || [],
    content_gaps: structured.content_gaps || [],
    raw_research: rawResearch,
    seo_available: seoAvailable,
  })
}
