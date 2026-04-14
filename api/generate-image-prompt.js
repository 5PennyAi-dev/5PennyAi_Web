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

# Core principle — READ THIS FIRST

**The meta-description defines WHAT to illustrate. The image must visually represent the SPECIFIC concept of the article, not a generic tech/business scene.** If two different meta-descriptions could plausibly produce the same image, your prompt is too generic. A chatbot article must look different from an automation article, which must look different from a ROI article, etc.

If a reader sees the image alone, they should be able to guess what the article is about.

# Step 1 — Concept extraction (do this internally before writing)

Before writing any prompt, extract from the meta-description:
1. **Specific subject** — not "AI for business" but something concrete like "chatbot answering customer questions" or "automating invoice processing".
2. **Central object or action** — a conversation, a filter, a bridge, a funnel, a scale, a path, a wall crumbling, a magnifying glass, etc. Pick the verb or noun that best captures the concept.
3. **What makes this article unique** — this is what the image must capture at a glance.

# Step 2 — Pick a concept-driven central subject

The central subject of each image must be a **concrete visual representation of the concept**, NOT a laptop or workspace by default. Examples:

- Chatbot for customer service → NOT a laptop with chat bubbles. YES: a large friendly speech bubble acting as a reception desk, with question marks entering one side and checkmarks exiting the other.
- Myths about RAG → NOT a laptop with documents. YES: five colorful myth bubbles being popped by a pin, document fragments floating out.
- AI automation saving time → NOT a laptop with a clock. YES: a conveyor belt transforming messy paper stacks into neat organized folders.
- ROI of AI for SMBs → NOT a laptop with charts. YES: a balance scale with a small AI chip outweighing a pile of coins.
- Data strategy for beginners → NOT a laptop with data. YES: a roadmap with signposts leading from a tangled mess to an organized destination.
- Email automation → NOT a laptop with emails. YES: a mailbox with envelopes flowing through a funnel that sorts them into colored bins.

# Style (constant across both variants)

- **Medium**: flat vector editorial illustration, clean geometric shapes, bold outlines, flat fills. **No gradients, no heavy shadows, not photorealistic, not childish or cartoonish.** Professional SaaS-blog aesthetic.
- **Central subject** — the concept-driven metaphor from Step 2. Describe it precisely in 2-3 sentences. This is the anchor of the image.
- **Supporting props** — 3 to 5 small thematic objects around the central subject that reinforce the article's topic. They must be **specific to the subject**, not generic office items (no default coffee mugs / plants / pens unless they reinforce the concept).
- **Composition** — varies based on what best serves the concept: centered, asymmetric, top-down, isometric, split-view, etc. **No default composition.** Do not fall back to "top-down workspace" unless the article is specifically about an office workflow.
- **Color palette (mandatory)**: sky blue **#81AED7** dominant, warm orange **#DD8737** accent. Both colors MUST appear in every prompt — they are the 5PennyAi brand anchors. Complement with 1-3 additional colors from: cream, navy, teal, mint, coral, warm yellow. Background must be light (off-white, cream, or pale blue).

# Variants

- **Variant 1 — Literal**: a direct visual representation of the concept.
- **Variant 2 — Metaphorical**: a symbolic/abstract take on the same concept using a DIFFERENT central metaphor.

The two variants MUST have different central subjects, not just different arrangements of the same elements.

# Hard exclusions

- **No text, words, letters, labels, banners, or typography** in the image — the article title is overlaid by the app.
- **No laptop as central subject.** A laptop may appear only as a small secondary prop, never as the anchor of the image, unless the article is specifically about a software tool.
- **No generic workspace scenes** — every image must be concept-specific and distinguishable from other articles at thumbnail size.
- **No named people or real celebrities.**
- **No brand names, logos, or trademarked visual elements.**

Generic archetypes are fine when they serve the concept ("a small friendly chatbot character", "a balance scale", "a mailbox").

# Prompt writing guidelines

- Natural descriptive English, not tag-based or weighted syntax.
- Order: **style → central subject (2-3 sentences) → supporting props → palette → no-text instruction**.
- 3 to 5 sentences per prompt.
- Use specific visual vocabulary ("sky blue (#81AED7) dominant on the speech bubble, warm orange (#DD8737) on the checkmarks" beats "colorful").
- Always name the medium explicitly: "flat vector editorial illustration".
- **Always end each prompt with the exact phrase: "No text, words, or lettering in the image."**

For each variant, also provide a French translation (for user reference). The French is a faithful translation of the English prompt, same length and structure.

# Self-check before outputting

Before finalizing each prompt, verify silently:
1. Could this image be confused with another article's image? If yes → make it more specific.
2. Does the central subject directly represent the meta-description concept? If no → rethink the metaphor.
3. Is a laptop the main element? If yes → replace it with a concept-driven subject.
4. Would a reader understand the article's topic from the image alone? If no → clarify the visual.
5. Do the two variants have genuinely different central subjects? If no → rewrite one.

# Output format — CRITICAL

Respond with ONLY a valid JSON object, nothing else. No text before, no text after, no \`\`\`json fences, no commentary. The JSON must be directly parseable by JSON.parse().

Exact schema:

{
  "literal": {
    "en": "Full English prompt for variant 1, 3-5 sentences, ending with 'No text, words, or lettering in the image.'",
    "fr": "Traduction française du prompt variante 1"
  },
  "metaphorical": {
    "en": "Full English prompt for variant 2, 3-5 sentences, ending with 'No text, words, or lettering in the image.'",
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
