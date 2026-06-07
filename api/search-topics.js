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
const CLAUDE_MAX_TOKENS = 8000

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

const RESEARCH_SYSTEM_PROMPT = `Tu es un veilleur spécialisé en intelligence artificielle. Tu cherches des sujets d'articles pour un blog de vulgarisation IA destiné au GRAND PUBLIC (étudiants, professionnels non techniques, curieux).

Recherche en profondeur sur le web pour trouver :
1. Les questions que les gens posent sur l'IA en ce moment (Reddit r/ArtificialIntelligence, r/ChatGPT, Quora, forums, commentaires YouTube, Twitter/X)
2. Les concepts mal compris ou souvent mal expliqués qui mériteraient un article de vulgarisation
3. Les actualités IA récentes (nouveaux modèles, fonctionnalités, polémiques) qui méritent d'être décryptées pour le grand public
4. Les outils IA qui gagnent en popularité et que les gens veulent comprendre
5. Les mythes, peurs, idées reçues sur l'IA qui circulent et qu'il faudrait nuancer
6. Les comparaisons d'outils que les gens cherchent (ChatGPT vs X, Y vs Z)
7. Les termes techniques qui apparaissent dans la presse sans être bien expliqués

Sources de tendance : Google Trends, Reddit (subreddits IA), Hacker News, Product Hunt, Twitter/X (annonces officielles OpenAI/Anthropic/Google), MIT Tech Review, Wired, The Verge, Ars Technica.

Évite les sources B2B et les angles "comment booster ma productivité au travail" — ce n'est pas l'audience. On cherche des sujets de culture générale IA.

Cite les sources avec URLs. Marché : francophone et anglophone.`

const STRUCTURING_SYSTEM_PROMPT = `Tu es un stratège de contenu pour 5PennyAi, un blog de vulgarisation IA pour le grand public.

On te donne un rapport de recherche brut. Ta tâche : extraire 8 à 12 sujets d'articles concrets, variés et engageants pour le grand public.

PRINCIPES
- Audience : grand public curieux (étudiants, parents, professionnels non techniques)
- Objectif : éduquer et démocratiser l'IA, PAS vendre des services
- Variété : mélange différents types d'articles dans tes sorties
- Concrétude : chaque sujet doit avoir un angle clair et un titre accrocheur

TYPES D'ARTICLES disponibles (à varier dans tes sorties) :
- "explainer" — Vulgariser un concept (ex: "C'est quoi un LLM?")
- "cheatsheet" — Aide-mémoire pratique (ex: "20 prompts ChatGPT essentiels")
- "news" — Actualité IA décryptée (ex: "Gemini 3 vient de sortir : ce qui change")
- "comparison" — Comparaison d'outils (ex: "ChatGPT vs Claude vs Gemini en 2026")
- "tutorial" — Tutoriel pratique (ex: "Créer un GPT personnalisé en 10 min")
- "mythbusting" — Démystification (ex: "Non, l'IA n'a pas de conscience")
- "glossary" — Définition d'un terme (ex: "RAG, c'est quoi exactement?")
- "list" — Liste utile (ex: "10 cas d'usage de l'IA pour les étudiants")

SCORING ÉDITORIAL — pour chaque sujet, évalue deux dimensions :

AUDIENCE RELEVANCE (0-25 points) :
À quel point ce sujet parle au grand public curieux d'IA ? Est-ce que le titre attire un lecteur non spécialiste ? Est-ce un sujet de culture générale IA ou un sujet de niche professionnelle ?
- 20-25 pts : Sujet de culture générale IA, titre qui attire n'importe quel curieux. Ex: "C'est quoi un LLM, expliqué simplement"
- 13-19 pts : Intéresse une partie du grand public (ex: utilisateurs ChatGPT) sans être niche. Ex: "10 prompts ChatGPT pour mieux étudier"
- 6-12 pts : Sujet utile mais à audience plus restreinte (étudiants en info, créateurs de contenu). Ex: "Fine-tuner un modèle open source en local"
- 0-5 pts : Niche pro / B2B, ne parle pas au grand public. Ex: "Optimiser le ROI de votre déploiement IA en entreprise"

SPÉCIFICITÉ (0-20 points) :
Un nouveau blog doit cibler des angles précis, pas des termes génériques.
- 16-20 pts : Sujet très spécifique, longue traîne, peu de compétition probable. Angle pédagogique unique. Ex: "Pourquoi ChatGPT invente parfois des sources : l'hallucination expliquée avec une analogie de cuisine"
- 10-15 pts : Sujet ciblé mais pas ultra-niche. Ex: "5 différences concrètes entre ChatGPT et Claude"
- 5-9 pts : Sujet assez large, beaucoup de compétiteurs probables. Ex: "Comment utiliser l'IA au quotidien"
- 0-4 pts : Sujet trop générique, dominé par les gros sites. Ex: "Qu'est-ce que l'intelligence artificielle?"

Structure JSON attendue :
{
  "topics": [
    {
      "title": "Titre d'article accrocheur en français (style vulgarisation)",
      "article_type": "explainer | cheatsheet | news | comparison | tutorial | mythbusting | glossary | list",
      "problem": "La question ou la confusion concrète que cet article éclaire",
      "audience": "Type de lecteur visé (ex: débutants curieux, parents qui s'inquiètent, étudiants, utilisateurs de ChatGPT)",
      "angle": "L'angle unique ou pédagogique (ex: analogie de cuisine, sans jargon, comparaison côte à côte)",
      "difficulty": "débutant | intermédiaire | avancé",
      "keywords": ["3-5 mots-clés SEO grand public en français (PAS B2B)"],
      "keywords_en": ["3-5 mots-clés SEO grand public en anglais"],
      "sources": ["URLs ou descriptions des sources"],
      "blog_precisions": "Paragraphe complet prêt à coller dans le générateur d'articles : audience cible, angle pédagogique, analogies à utiliser, concepts à expliquer, ton, mots-clés à inclure.",
      "audience_relevance": {
        "score": 22,
        "reason": "Explication en 1 phrase courte"
      },
      "specificity": {
        "score": 16,
        "reason": "Explication en 1 phrase courte"
      }
    }
  ],
  "trends": ["3-5 tendances IA actuelles repérées dans la recherche"],
  "raw_questions": ["5-10 vraies questions du grand public extraites de la recherche"],
  "content_gaps": ["3-5 angles peu couverts par d'autres blogs IA grand public"]
}

Trouve 8 à 12 sujets variés (mélange les article_type). Les titres doivent être accrocheurs et clairs pour un lecteur non spécialiste. Les mots-clés doivent être des termes que quelqu'un taperait dans Google pour comprendre l'IA. Les reasons de scoring doivent tenir en 1 phrase.`

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

  // Dim 3 — Audience (max 25, défaut moyen 12 si Claude n'a pas scoré)
  const audienceScore = clamp(topic.audience_relevance?.score ?? 12, 0, 25)

  // Dim 4 — Spécificité (max 20, défaut moyen 10 si Claude n'a pas scoré)
  const specificityScore = clamp(topic.specificity?.score ?? 10, 0, 20)

  return {
    total: Math.min(searchScore + rankScore + audienceScore + specificityScore, 100),
    breakdown: {
      search: searchScore,
      rank: rankScore,
      audience: audienceScore,
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

  const stopReason = data?.stop_reason || 'unknown'
  const parsed = extractJson(text)
  if (!parsed) {
    console.error(`[search-topics] JSON parse failed. stop_reason=${stopReason} len=${text.length} tail=${text.slice(-400)}`)
    if (stopReason === 'max_tokens') {
      throw new Error(`Truncated at max_tokens=${CLAUDE_MAX_TOKENS}. Increase CLAUDE_MAX_TOKENS or request fewer topics.`)
    }
    throw new Error('Claude returned unparseable JSON')
  }
  if (!isValidTopicsShape(parsed)) {
    const issues = []
    if (!Array.isArray(parsed.topics)) issues.push('topics is not an array')
    else if (parsed.topics.length === 0) issues.push('topics is empty')
    else {
      parsed.topics.forEach((t, i) => {
        if (!t.title || typeof t.title !== 'string') issues.push(`topic[${i}].title missing`)
        if (!Array.isArray(t.keywords) || t.keywords.length === 0) issues.push(`topic[${i}].keywords missing`)
      })
    }
    console.error(`[search-topics] Schema validation failed. stop_reason=${stopReason} issues=${issues.slice(0, 5).join(' | ')}`)
    throw new Error(`Claude produced invalid JSON structure (${issues[0] || 'unknown'})`)
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
