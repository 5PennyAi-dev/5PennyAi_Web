/* global process */
// Vercel Serverless Function — AI image prompt generator for the 5PennyAi blog admin.
// Produces 2 Nano Banana Pro prompts (literal + metaphorical) from a meta description.
// Keeps ANTHROPIC_API_KEY server-side. Client calls POST /api/generate-image-prompt.

export const config = {
  maxDuration: 30,
}

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 2000

const SYSTEM_PROMPT = `You generate hero image prompts for 5PennyAi blog articles, optimized for Nano Banana Pro (Google Gemini image model). Given a single meta-description, you produce 2 distinct prompt variants.

# Variants

- **Variant 1 — Literal**: direct illustration of the subject, using a workspace or object closely tied to what the article is about.
- **Variant 2 — Metaphorical**: symbolic or conceptual illustration of the same subject, using a different central metaphor.

Both variants share the exact same visual language (see Style below). Only the angle of the idea differs.

# Style (constant across both variants)

- **Medium**: flat vector editorial illustration in a SaaS / business-blog aesthetic (think Dribbble flat illustration, Freepik vector packs used by productivity and marketing blogs). Visually rich and decorative, not minimal. Clean bold geometric shapes, flat fills, **no gradients, no shadows, not photorealistic, not childish or cartoonish**.
- **Composition**: top-down (overhead) OR slight 3/4-angle workspace composition. A central subject anchors the frame with scattered thematic props arranged around it (coffee mugs, documents, pens, lightbulbs, charts, phones, plants, notebooks, etc.). Occasional circular or rounded colored backdrop behind the central element is welcome.
- **Mood**: confident, optimistic, energetic, professional. Adjust the exact emotional tone to the subject.
- **Color palette (mandatory)**: sky blue **#81AED7** as dominant, warm orange **#DD8737** as accent. Both colors MUST appear in every prompt — they are the 5PennyAi brand anchors. Complement with 1-3 additional colors from the SaaS-blog spectrum (cream, navy, teal, mint, coral, warm yellow). Background should be light (off-white, cream, or pale blue).

# Hard exclusions (never include)

- No text, words, letters, labels, banners, or typographic elements of any kind — the article title is overlaid by the app.
- No named people or real celebrities.
- No brand names, logos, or trademarked visual elements.

Generic archetypes are fine ("a software engineer at a laptop", "a data center at night").

# Prompt writing guidelines

- Natural descriptive English, not tag-based or weighted syntax.
- Order: **subject → style → composition → props → palette**.
- 3 to 5 sentences per prompt — enough room to list the scattered thematic props around the central subject.
- Use specific visual vocabulary ("sky blue and warm orange palette with cream and navy accents" beats "colorful").
- Always name the medium explicitly: "flat vector editorial illustration in a SaaS blog style".
- Always describe the scattered thematic props around the central subject.
- **Always end each prompt with the exact phrase: "No text or lettering in the image."**

For each variant, also provide a French translation (for user reference). The French is a faithful translation of the English prompt, same length and structure.

# Output format — CRITICAL

Respond with ONLY a valid JSON object, nothing else. No text before, no text after, no \`\`\`json fences, no commentary. The JSON must be directly parseable by JSON.parse().

Exact schema:

{
  "literal": {
    "en": "Full English prompt for variant 1, 3-5 sentences, ending with 'No text or lettering in the image.'",
    "fr": "Traduction française du prompt variante 1"
  },
  "metaphorical": {
    "en": "Full English prompt for variant 2, 3-5 sentences, ending with 'No text or lettering in the image.'",
    "fr": "Traduction française du prompt variante 2"
  }
}

REMINDER: response = ONLY the JSON. No characters before or after.`

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

function isValidShape(obj) {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.literal &&
    typeof obj.literal.en === 'string' &&
    obj.literal.en.trim().length > 0 &&
    typeof obj.literal.fr === 'string' &&
    obj.literal.fr.trim().length > 0 &&
    obj.metaphorical &&
    typeof obj.metaphorical.en === 'string' &&
    obj.metaphorical.en.trim().length > 0 &&
    typeof obj.metaphorical.fr === 'string' &&
    obj.metaphorical.fr.trim().length > 0
  )
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
  const { metaDescription } = body

  if (!metaDescription || typeof metaDescription !== 'string' || !metaDescription.trim()) {
    return res.status(400).json({ error: 'Meta description is required' })
  }

  const userMessage = `Génère 2 prompts d'image pour cette meta-description : ${metaDescription.trim()}. Réponds UNIQUEMENT en JSON avec cette structure : { "literal": { "en": "...", "fr": "..." }, "metaphorical": { "en": "...", "fr": "..." } }`

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
        messages: [
          {
            role: 'user',
            content: userMessage,
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
    const elapsed = Math.round((Date.now() - started) / 1000)
    console.log(`[generate-image-prompt] model=${MODEL} elapsed=${elapsed}s`)

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

    if (!isValidShape(parsed)) {
      console.error('Parsed JSON has invalid shape:', JSON.stringify(parsed).slice(0, 400))
      return res.status(500).json({ error: 'Generation produced invalid shape' })
    }

    return res.status(200).json({
      literal: {
        en: parsed.literal.en.trim(),
        fr: parsed.literal.fr.trim(),
      },
      metaphorical: {
        en: parsed.metaphorical.en.trim(),
        fr: parsed.metaphorical.fr.trim(),
      },
    })
  } catch (err) {
    console.error('Generation error:', err)
    return res.status(500).json({ error: 'Generation failed' })
  }
}
