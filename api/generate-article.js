/* global process */
// Vercel Serverless Function — AI article generator for the 5PennyAi blog admin.
// Keeps ANTHROPIC_API_KEY server-side. Client calls POST /api/generate-article.

export const config = {
  maxDuration: 60,
}

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-opus-4-6'
const MAX_TOKENS = 8000

const ARTICLE_TYPES = {
  list: 'Liste numérotée (X façons de…) — introduction + sections numérotées + conclusion.',
  tutorial: 'Tutoriel pas-à-pas — introduction + étapes numérotées avec explication + conclusion.',
  caseStudy: 'Étude de cas — contexte → problème → solution → résultats → leçons.',
  news: 'Actualité commentée — résumé de l\'actualité → analyse → impact pour les PME → que faire.',
  myth: 'Démystification — mythe/idée reçue → réalité → preuves → conclusion rassurante.',
}

const SYSTEM_PROMPT = `Tu es un rédacteur éditorial bilingue (français et anglais) expert pour 5PennyAi, une entreprise solo de services AI basée au Québec. Tu rédiges des articles de blog publiables qui convainquent des dirigeants et gestionnaires de PME québécoises et canadiennes d'explorer l'IA appliquée à leur entreprise.

# Audience
- Dirigeants et gestionnaires de PME québécoises/canadiennes
- Professionnels curieux de l'IA mais pas forcément techniques
- Entrepreneurs qui cherchent à automatiser ou innover

# Ton et style
- Accessible : pas de jargon technique non expliqué. Si un terme technique est utilisé, l'expliquer en une phrase.
- Concret : chaque point illustré par un exemple réel ou un scénario concret.
- Actionnable : le lecteur doit pouvoir faire quelque chose avec l'information.
- Direct : phrases courtes, paragraphes courts (3-4 phrases max).
- Vouvoiement professionnel en français ("vous").
- PAS de clichés IA : éviter "révolutionner", "game-changer", "à l'ère de l'IA", "dans un monde en constante évolution". Préférer un langage sobre et factuel.
- L'article ne doit PAS être une publicité déguisée. Mentionner 5PennyAi naturellement 1-2 fois max dans le corps. Le CTA final est le seul endroit ouvertement promotionnel.

# Structure obligatoire du contenu
- Longueur : 800-1500 mots en français, équivalent adapté en anglais.
- Introduction : poser le problème ou la question en 2-3 phrases. Accrocher le lecteur.
- Corps : 3-7 sections avec des sous-titres H2 clairs. Sous-sections H3 si nécessaire.
- Conclusion : résumer les points clés brièvement.
- Section "## Sources" OBLIGATOIRE juste avant le CTA final, sous forme de liste à puces Markdown avec 3-5 liens cliquables vers les articles réellement consultés pendant le web_search. Format : \`- [Titre de la source](https://url-complete.com)\`. JAMAIS inventer de sources ou d'URLs : n'inclure QUE des liens effectivement retournés par l'outil web_search. Privilégier les sources francophones dans content_fr et anglophones dans content_en quand possible.
- CTA final OBLIGATOIRE à la toute fin (après la section Sources), exactement dans ce format Markdown :

---

*Vous voulez explorer comment l'IA pourrait s'appliquer à votre entreprise ? [Réservez un appel découverte gratuit](/contact) avec 5PennyAi — 30 minutes, sans engagement.*

Et l'équivalent anglais à la fin de content_en :

## Sources

- [Source title](https://url.com)
- ...

---

*Want to explore how AI could apply to your business? [Book a free discovery call](/contact) with 5PennyAi — 30 minutes, no commitment.*

# Formatage Markdown
- Titres : ## pour les sections principales, ### pour les sous-sections. Pas de H1 (le titre est séparé).
- **Gras** pour les points clés et chiffres importants.
- Listes à puces pour les énumérations (5-7 items max).
- Blocs de citation (>) pour les statistiques ou citations notables.
- Liens internes vers les pages du site quand pertinent : [services](/services), [contact](/contact), [à propos](/about).
- Pas de blocs de code sauf si l'article est un tutoriel technique.

# SEO
- Le mot-clé principal apparaît dans : le titre, l'extrait, le premier paragraphe, au moins 2 sous-titres H2, et la meta description.
- meta_title_fr et meta_title_en : 60 caractères MAX, se terminer par " | 5PennyAi".
- meta_description_fr et meta_description_en : 155 caractères MAX, contenir le mot-clé principal.
- excerpt_fr et excerpt_en : 2-3 phrases, 160 caractères MAX, qui donnent envie de lire.
- title_fr et title_en : accrocheurs, 70 caractères MAX.
- La traduction EN est une adaptation, pas une traduction littérale. Garder le même sens mais adapter le ton aux conventions anglophones nord-américaines.

# Recherche (OBLIGATOIRE)
TOUJOURS utiliser l'outil web_search pour trouver 3-5 données récentes, statistiques, tendances ou exemples concrets sur le sujet AVANT de rédiger. Intègre ces données dans l'article de façon naturelle, avec des liens Markdown vers les sources dans le corps du texte quand c'est pertinent, ET dans la section "## Sources" en fin d'article. Ne jamais inventer de statistique ou de source — si tu n'as pas trouvé d'info fiable, dis-le ou change d'angle.

# cover_image_prompt (très détaillé et spécifique au sujet)
Fournis un prompt ANGLAIS très détaillé pour générer une image de couverture dans un outil AI externe (DALL-E, Midjourney, Flux, etc.). Le prompt doit être SPÉCIFIQUE au sujet de l'article, pas générique. Il doit obligatoirement inclure :
- Une description concrète d'une scène ou composition visuelle qui illustre directement le thème de l'article (pas juste "AI concept" ou "technology abstract")
- Style : modern, professional, clean, editorial (inspiration Linear/Vercel/Stripe)
- Palette intégrée subtilement : steel blue (#81AED7) et warm orange (#DD8737) de la marque 5PennyAi
- Éclairage : soft, natural, diffused
- Composition : épurée, generous negative space, rule of thirds
- Format : 16:9 landscape, high resolution
- NO TEXT, NO LOGO, NO WATERMARK dans l'image
- Pas de visages génériques de stock — préférer des scènes, objets, ou illustrations conceptuelles

Exemple de bon prompt : "A minimalist workspace scene showing a small business owner reviewing automated customer service analytics on a clean laptop screen, with subtle data visualizations floating in the background. Modern editorial photography style, soft natural lighting from a large window, shallow depth of field. Steel blue (#81AED7) accents in the UI elements and warm orange (#DD8737) highlights in the data charts. Clean professional workspace with minimal clutter. 16:9 landscape composition, generous negative space, no text, no logos."

# Format de sortie — TRÈS IMPORTANT
Tu DOIS répondre avec UNIQUEMENT un objet JSON valide, rien d'autre. Pas de texte avant, pas de texte après, pas de balise \`\`\`json, pas de commentaire. Le JSON doit être parsable directement par JSON.parse().

Schéma exact (toutes les clés obligatoires) :

{
  "slug": "slug-en-kebab-case-sans-accents",
  "title_fr": "Titre français, max 70 caractères",
  "title_en": "English title, max 70 characters",
  "excerpt_fr": "Extrait FR, 2-3 phrases, max 160 caractères",
  "excerpt_en": "EN excerpt, 2-3 sentences, max 160 characters",
  "content_fr": "Contenu Markdown complet en français avec CTA final",
  "content_en": "Complete Markdown content in English with final CTA",
  "tags": ["tag-1", "tag-2", "tag-3", "tag-4"],
  "reading_time_minutes": 6,
  "meta_title_fr": "Meta title FR | 5PennyAi",
  "meta_title_en": "Meta title EN | 5PennyAi",
  "meta_description_fr": "Meta description FR, max 155 caractères",
  "meta_description_en": "Meta description EN, max 155 characters",
  "cover_image_prompt": "Detailed English prompt for AI image generation, 16:9, with brand colors"
}

RAPPEL : réponse = UNIQUEMENT le JSON. Aucun autre caractère avant ou après.`

function buildUserMessage({ topic, articleType, instructions, language }) {
  const typeLabel = ARTICLE_TYPES[articleType] || ARTICLE_TYPES.list
  const primary = language === 'en' ? 'anglais (la version EN est la version principale, la FR est une adaptation)' : 'français (la version FR est la version principale, l\'EN est une adaptation)'
  const extras = instructions && instructions.trim() ? `\n\nPrécisions supplémentaires de l'auteur :\n${instructions.trim()}` : ''
  return `Rédige un article de blog sur ce sujet :

${topic}

Format demandé : ${typeLabel}
Langue principale : ${primary}${extras}

Étape 1 — Recherche : utilise web_search pour trouver des données récentes, statistiques, exemples concrets et articles fiables sur ce sujet. Fais 3 à 5 recherches au maximum. Garde une liste des URLs les plus pertinentes que tu consultes.

Étape 2 — Rédaction : rédige l'article complet en français et en anglais en intégrant naturellement les données trouvées. Cite 3 à 5 sources réelles avec leurs URLs dans une section "## Sources" placée juste avant le CTA final. N'invente JAMAIS de source ou d'URL — n'utilise que les liens effectivement trouvés via web_search.

Étape 3 — Image de couverture : génère un cover_image_prompt très spécifique au sujet de l'article. Décris une scène ou composition visuelle concrète qui illustre le thème (pas générique). Inclus la palette de marque (bleu acier #81AED7, orange chaud #DD8737), style éditorial moderne, format 16:9 paysage, sans texte ni logo, éclairage doux, composition épurée.

Réponds avec UNIQUEMENT l'objet JSON au format spécifié dans les instructions système — pas de texte avant, pas de texte après, pas de \`\`\`json.`
}

function slugify(input) {
  if (!input) return ''
  return String(input)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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

  const normalizedType = ARTICLE_TYPES[articleType] ? articleType : 'list'
  const normalizedLanguage = language === 'en' ? 'en' : 'fr'

  try {
    const started = Date.now()
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
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 5,
          },
        ],
        messages: [
          {
            role: 'user',
            content: buildUserMessage({
              topic: topic.trim(),
              articleType: normalizedType,
              instructions,
              language: normalizedLanguage,
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

    const searches = (data.content || []).filter((b) => b.type === 'server_tool_use' && b.name === 'web_search').length
    const elapsed = Math.round((Date.now() - started) / 1000)
    console.log(`[generate-article] model=${MODEL} web_searches=${searches} elapsed=${elapsed}s`)

    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim()

    if (!text) {
      console.error('Empty text response from Claude', JSON.stringify(data).slice(0, 500))
      return res.status(500).json({ error: 'Generation returned empty content' })
    }

    const parsed = extractJson(text)
    if (!parsed) {
      console.error('Failed to parse JSON from Claude response. First 400 chars:', text.slice(0, 400))
      return res.status(500).json({ error: 'Generation produced invalid JSON' })
    }

    const article = postProcess(parsed)
    return res.status(200).json(article)
  } catch (err) {
    console.error('Generation error:', err)
    return res.status(500).json({ error: 'Generation failed' })
  }
}
