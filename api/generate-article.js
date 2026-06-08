/* global process */
// Vercel Serverless Function — AI article generator for the 5PennyAi blog admin.
// Keeps ANTHROPIC_API_KEY server-side. Client calls POST /api/generate-article.

import { normalizeType, ARTICLE_TYPE_LABELS, ARTICLE_TYPES, DEFAULT_FORMAT } from '../src/lib/contentFormats.js'

export const config = {
  maxDuration: 300,
}

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const PERPLEXITY_URL = 'https://api.perplexity.ai/chat/completions'
const MODEL = 'claude-opus-4-6'
const MAX_TOKENS = 16000

const RESEARCH_SYSTEM_PROMPT = `Tu es un chercheur qui prépare la documentation d'un article de vulgarisation sur l'intelligence artificielle, destiné au grand public.

Recherche en profondeur sur le web pour trouver :
1. Des explications simples du concept ou de l'actualité (Wikipedia, blogs de vulgarisation, articles de presse mainstream)
2. Des analogies, métaphores ou comparaisons que d'autres rédacteurs ont utilisées avec succès
3. Des exemples concrets, anecdotes, ou cas d'usage du quotidien (pas du B2B)
4. Des chiffres et statistiques récents (adoption, utilisateurs, performance) — mais seulement ceux qui parlent au grand public
5. Les controverses, débats, et points de vue critiques sur le sujet
6. Les erreurs ou idées reçues fréquentes à corriger
7. Les développements les plus récents (modèles, outils, actualités) si pertinent

Sources préférées : Wired, MIT Technology Review, The Verge, Ars Technica, Nature/Science (vulgarisé), Numerama, Korii, Le Monde Tech, Radio-Canada, blogs officiels (OpenAI, Anthropic, Google DeepMind, Meta AI), Wikipédia.

Évite les sources orientées B2B/PME (Forbes business, HubSpot, McKinsey) sauf si l'article porte spécifiquement sur l'adoption en entreprise.

Inclus les URLs des sources. Concentre-toi sur le contenu francophone ET anglophone.`

function buildResearchQuery(topic, articleType, instructions) {
  let query = `Recherche des informations claires et accessibles pour vulgariser ce sujet auprès du grand public : "${topic}"`

  const typeHints = {
    explainer: 'C\'est pour un article de vulgarisation — trouve des analogies du quotidien, des définitions simples et des exemples illustratifs. Évite le jargon technique.',
    cheatsheet: 'C\'est pour un aide-mémoire pratique — trouve les commandes, prompts, raccourcis ou astuces les plus utiles et les plus partagés en ligne.',
    news: 'C\'est pour un article d\'actualité IA — trouve les annonces les plus récentes, les réactions de la communauté, les analyses d\'experts, et l\'impact concret pour les utilisateurs.',
    comparison: 'C\'est pour une comparaison d\'outils — trouve les forces et faiblesses de chaque option, les benchmarks récents, les retours d\'utilisateurs, les prix actuels.',
    tutorial: 'C\'est pour un tutoriel pratique — trouve les étapes précises, les écueils fréquents, les outils gratuits ou abordables, les exemples concrets.',
    mythbusting: 'C\'est pour démystifier — trouve le mythe ou la croyance répandue, les preuves factuelles qui le contredisent, et l\'explication de pourquoi le mythe persiste.',
    glossary: 'C\'est pour définir un terme — trouve l\'étymologie ou origine, la définition technique précise, une définition simplifiée, et 2-3 exemples d\'usage.',
    list: 'C\'est pour une liste utile — trouve des cas d\'usage variés, des outils concrets, des exemples du quotidien, avec sources.',
  }

  if (typeHints[articleType]) {
    query += `\n\n${typeHints[articleType]}`
  }

  if (instructions && instructions.trim()) {
    query += `\n\nPrécisions supplémentaires : ${instructions.trim()}`
  }

  return query
}

async function fetchPerplexityResearch(topic, articleType, instructions) {
  const perplexityKey = process.env.PERPLEXITY_API_KEY
  if (!perplexityKey) {
    console.warn('[generate-article] PERPLEXITY_API_KEY not set, skipping research')
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
          { role: 'system', content: RESEARCH_SYSTEM_PROMPT },
          { role: 'user', content: buildResearchQuery(topic, articleType, instructions) },
        ],
        temperature: 0.3,
      }),
    })

    const data = await response.json()

    if (data.error) {
      console.error('[generate-article] Perplexity error:', data.error)
      return { research: '', used: false }
    }

    const content = data.choices?.[0]?.message?.content || ''
    if (!content) {
      console.warn('[generate-article] Perplexity returned empty content')
      return { research: '', used: false }
    }

    console.log(`[generate-article] Perplexity research received (${content.length} chars)`)
    return { research: content, used: true }
  } catch (err) {
    console.error('[generate-article] Perplexity fetch failed:', err)
    return { research: '', used: false }
  }
}

const SYSTEM_PROMPT = `Tu es un rédacteur du blog 5PennyAi, un blog de vulgarisation sur l'intelligence artificielle destiné au GRAND PUBLIC.

MISSION DU BLOG
Démocratiser l'IA. Expliquer simplement les concepts, les outils, les actualités. Aider les gens à comprendre ce qui se passe dans le monde de l'IA, sans jargon, sans hype, sans peur. C'est un espace éducatif — PAS un blog commercial.

AUDIENCE
Le grand public : étudiants, professionnels non techniques, parents curieux, retraités, jeunes adultes. Toute personne qui veut comprendre l'IA sans devenir développeur. Tu écris pour quelqu'un d'intelligent mais qui n'est pas spécialiste.

RÈGLES DE RÉDACTION

Ton et style
- Pédagogue et curieux, comme un prof passionné qui aime expliquer
- Accessible : zéro jargon non expliqué. Si un terme technique apparaît (LLM, token, embedding, RAG), explique-le en une phrase la première fois.
- Concret : illustre chaque concept par un exemple de la vie quotidienne
- Honnête : ne survends pas l'IA. Mentionne aussi les limites.
- Vouvoiement amical (le "vous" qui s'adresse au lecteur, pas formel-distant)
- Phrases courtes, paragraphes courts (3-4 phrases max)
- Analogies du quotidien plutôt que comparaisons techniques (ex: "un LLM, c'est comme un autocomplete surpuissant qui a lu Internet")

À ÉVITER absolument
- Le jargon corporate ("optimiser vos processus", "transformer votre organisation")
- Les clichés IA ("révolutionner", "game-changer", "à l'ère de l'IA")
- Le ton apocalyptique OU le ton hype. On reste factuel.
- Les références aux PME, entreprises, dirigeants, ROI, productivité métier — ce n'est PAS l'audience.
- La publicité déguisée pour 5PennyAi ou PennySEO. Le blog est éducatif.

ADAPTATION SELON LE TYPE D'ARTICLE
- explainer : structure pédagogique progressive (du simple au complexe), beaucoup d'analogies
- cheatsheet : format liste claire, chaque item court et actionnable, mise en page scannable
- news : contexte → ce qui change → pourquoi c'est important → ce que ça veut dire pour vous
- comparison : tableau ou sections parallèles, critères clairs, recommandation honnête à la fin
- tutorial : étapes numérotées, prérequis listés, captures ou exemples concrets à chaque étape
- mythbusting : énoncer le mythe → expliquer pourquoi il circule → présenter les faits → nuancer
- glossary : définition courte d'abord, puis explication progressive, étymologie si pertinent, exemples d'usage
- list : intro courte, items variés et concrets, conclusion qui invite à explorer

STRUCTURE GÉNÉRALE
- Longueur : 700-1300 mots (FR), équivalent en EN
- Intro : accroche concrète + ce que le lecteur va apprendre (2-3 phrases)
- Corps : 3-6 sections avec sous-titres H2 clairs et engageants
- Conclusion : récap pédagogique + invitation à explorer plus (PAS un CTA commercial)
- Section "## Sources" OBLIGATOIRE juste avant le CTA final, sous forme de liste à puces Markdown avec 3-5 liens cliquables vers les sources réellement présentes dans la recherche Perplexity fournie. Format : \`- [Titre de la source](https://url-complete.com)\`. JAMAIS inventer de sources ou d'URLs : n'inclure QUE des liens effectivement présents dans la recherche. Privilégier les sources francophones dans content_fr et anglophones dans content_en quand possible. Version EN : "## Sources" (même titre, traduit naturellement si besoin).
- Terminer par exactement : "---\n\n*5PennyAi est un blog de vulgarisation sur l'intelligence artificielle. [Explorez d'autres articles](/blog) ou [contactez-nous](/contact) pour suggérer un sujet.*"
- Version EN du CTA : "---\n\n*5PennyAi is a blog about making AI understandable. [Browse other articles](/blog) or [contact us](/contact) to suggest a topic.*"

SEO
- Mot-clé principal dans : titre, extrait, premier paragraphe, 2+ sous-titres, meta description
- Sous-titres H2 = questions ou phrases recherchées par le grand public
- Meta title : max 60 caractères, inclure "| 5PennyAi"
- Meta description : max 155 caractères

FORMAT DE RÉPONSE — JSON UNIQUEMENT, pas de texte avant ou après, pas de backticks :
{
  "title_fr": "Titre français accrocheur (max 70 caractères)",
  "title_en": "English title (max 70 characters)",
  "slug": "slug-en-kebab-case-sans-accents",
  "excerpt_fr": "Extrait FR qui donne envie de lire (max 160 caractères)",
  "excerpt_en": "EN excerpt (max 160 characters)",
  "content_fr": "Contenu complet en Markdown français",
  "content_en": "Full content in English Markdown",
  "tags": ["3-5 tags en kebab-case sans accents"],
  "reading_time_minutes": 6,
  "meta_title_fr": "Meta Title FR | 5PennyAi",
  "meta_description_fr": "Meta description FR (max 155 caractères)",
  "meta_title_en": "Meta Title EN | 5PennyAi",
  "meta_description_en": "Meta description EN (max 155 characters)",
  "cover_image_prompt": "Prompt détaillé pour générer une image AI. Style moderne, illustratif, palette bleu #81AED7 + orange #DD8737 + navy #143054. Évite les clichés visuels (cerveau bleu, robot, circuits). Format 16:9."
}`

function buildUserMessage({ topic, articleType, instructions, language, research }) {
  const typeLabel = ARTICLE_TYPE_LABELS[articleType]?.fr || 'Vulgarisation'
  const primary = language === 'en' ? 'anglais (la version EN est la version principale, la FR est une adaptation)' : 'français (la version FR est la version principale, l\'EN est une adaptation)'
  const extras = instructions && instructions.trim() ? `\n\nPrécisions supplémentaires de l'auteur :\n${instructions.trim()}` : ''

  const researchBlock = research
    ? `\n\nRECHERCHE WEB (utilise ces données pour enrichir l'article avec des analogies, exemples concrets et chiffres parlants) :\n---\n${research}\n---\n\nIMPORTANT : Intègre naturellement les analogies, exemples et chiffres trouvés dans la recherche. Reformule, ne copie pas mot pour mot. Les URLs présentes dans cette recherche doivent apparaître dans la section "## Sources" en fin d'article (3-5 liens maximum). N'invente JAMAIS d'URL — n'utilise que les liens effectivement présents ci-dessus.`
    : ''

  return `Rédige un article de vulgarisation sur ce sujet :

${topic}

Format demandé : ${typeLabel}
Langue principale : ${primary}${extras}${researchBlock}

Génère aussi un cover_image_prompt spécifique au sujet de l'article (scène ou composition visuelle concrète qui illustre le thème), style moderne illustratif, palette steel #81AED7 + accent #DD8737 + navy #143054, format 16:9, sans texte ni logo, sans clichés visuels IA (cerveau bleu, robot, circuits).

Réponds avec UNIQUEMENT l'objet JSON au format spécifié dans les instructions système — pas de texte avant, pas de texte après, pas de \`\`\`json.`
}

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

// Scan backward from the last `}` and find the matching opening `{`
// that yields the outermost balanced JSON object in the string.
// Handles preamble/narration text that Claude may emit before the final JSON output.
function findLastBalancedJsonObject(text) {
  if (!text) return null
  const lastClose = text.lastIndexOf('}')
  if (lastClose === -1) return null

  let inString = false
  let escape = false
  let depth = 0

  for (let i = lastClose; i >= 0; i--) {
    const ch = text[i]
    if (escape) {
      escape = false
      continue
    }
    if (ch === '\\') {
      escape = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      continue
    }
    if (inString) continue
    if (ch === '}') depth++
    else if (ch === '{') {
      depth--
      if (depth === 0) return text.slice(i, lastClose + 1)
    }
  }
  return null
}

function extractJson(text) {
  if (!text) return null
  let cleaned = text.trim()
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch { /* fall through */ }

  const balanced = findLastBalancedJsonObject(cleaned)
  if (balanced) {
    try {
      return JSON.parse(balanced)
    } catch { /* fall through */ }
  }

  // Last-chance fallback: greedy regex for the widest {...} span
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

function postProcess(article) {
  const out = { ...article }

  out.slug = slugify(out.slug || out.title_fr || 'article')

  out.title_fr = truncate(out.title_fr, 70)
  out.title_en = truncate(out.title_en, 70)
  out.excerpt_fr = truncate(out.excerpt_fr, 160)
  out.excerpt_en = truncate(out.excerpt_en, 160)
  out.meta_title_fr = truncate(out.meta_title_fr, 60)
  out.meta_title_en = truncate(out.meta_title_en, 60)
  out.meta_description_fr = truncate(out.meta_description_fr, 155)
  out.meta_description_en = truncate(out.meta_description_en, 155)

  if (!Array.isArray(out.tags)) out.tags = []
  out.tags = out.tags
    .map((t) => slugify(t))
    .filter(Boolean)
    .slice(0, 6)

  const rt = parseInt(out.reading_time_minutes, 10)
  if (!Number.isFinite(rt) || rt < 1) {
    const words = countWords(out.content_fr)
    out.reading_time_minutes = Math.max(1, Math.round(words / 200))
  } else {
    out.reading_time_minutes = rt
  }

  out.content_fr = String(out.content_fr || '')
  out.content_en = String(out.content_en || '')
  out.cover_image_prompt = String(out.cover_image_prompt || '')

  return out
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not set')
    return res.status(500).json({ error: 'Server is not configured' })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  const { topic, articleType, instructions, language } = body

  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    return res.status(400).json({ error: 'Topic is required' })
  }

  const normalizedType = normalizeType(articleType)
  const finalType = ARTICLE_TYPES.includes(normalizedType) ? normalizedType : 'explainer'
  const normalizedLanguage = language === 'en' ? 'en' : 'fr'

  try {
    const started = Date.now()

    // Step 1: Perplexity research
    const { research, used: researchUsed } = await fetchPerplexityResearch(
      topic.trim(),
      finalType,
      instructions
    )
    const researchElapsed = Math.round((Date.now() - started) / 1000)
    console.log(`[generate-article] Perplexity done in ${researchElapsed}s (used=${researchUsed})`)

    // Step 2: Claude generation with research context
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
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: buildUserMessage({
              topic: topic.trim(),
              articleType: finalType,
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
      console.error('Anthropic API error:', response.status, errText)
      return res.status(502).json({ error: 'Upstream API error', status: response.status })
    }

    const data = await response.json()

    const stopReason = data?.stop_reason || 'unknown'
    const elapsed = Math.round((Date.now() - started) / 1000)
    console.log(
      `[generate-article] model=${MODEL} elapsed=${elapsed}s stop_reason=${stopReason}`,
    )

    const textBlocks = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text)
    if (!textBlocks.length) {
      console.error('Empty text response from Claude', JSON.stringify(data).slice(0, 500))
      return res.status(500).json({ error: 'Generation returned empty content' })
    }

    const lastText = (textBlocks[textBlocks.length - 1] || '').trim()
    const allText = textBlocks.join('\n').trim()

    let parsed = extractJson(lastText)
    if (!parsed && allText !== lastText) {
      parsed = extractJson(allText)
    }
    if (!parsed) {
      if (stopReason === 'max_tokens') {
        console.error(
          `Failed to parse JSON: response hit max_tokens=${MAX_TOKENS} and was truncated. ` +
            `blocks=${textBlocks.length} lastLen=${lastText.length} allLen=${allText.length} ` +
            `tail=${lastText.slice(-400)}`,
        )
        return res.status(500).json({
          error: 'Generation truncated at max_tokens. Try a shorter topic or request a shorter article.',
        })
      }
      console.error(
        `Failed to parse JSON. stop_reason=${stopReason} blocks=${textBlocks.length} ` +
          `lastLen=${lastText.length} lastHead=${lastText.slice(0, 300)} lastTail=${lastText.slice(-300)}`,
      )
      return res.status(500).json({ error: 'Generation produced invalid JSON' })
    }

    const article = postProcess(parsed)
    return res.status(200).json({ ...article, article_type: finalType, format: DEFAULT_FORMAT, _research_used: researchUsed })
  } catch (err) {
    console.error('Generation error:', err)
    return res.status(500).json({ error: 'Generation failed' })
  }
}
