/* global process */
// Vercel Serverless Function — AI social media post generator for the 5PennyAi blog admin.
// Produces platform-specific posts (LinkedIn, Facebook, Twitter/X) in FR + EN from article content.
// Keeps ANTHROPIC_API_KEY server-side. Client calls POST /api/generate-social-posts.

export const config = {
  maxDuration: 60,
}

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 4000

const SYSTEM_PROMPT = `You transform blog articles into 3 platform-specific social media posts, each in French and English.

# Core principle
Each platform gets a DIFFERENT ANGLE from the article — not a different length of the same text. If all three posts say the same thing, you have failed.

# Process
1. Read the article and extract: (a) the headline insight, (b) a surprising stat or fact, (c) the most relatable pain point, (d) a contrarian take.
2. Assign angles: LinkedIn gets the insight or contrarian take. Facebook gets the relatable pain point. Twitter gets the most tweetable stat or punchy line.
3. Write FR first, then EN adaptation (not literal translation — adapt tone to each language's social media culture).

# Platform rules

## LinkedIn (FR + EN)
- Length: 1000–1300 characters. Hook MUST fit in first 210 characters (before "voir plus" fold).
- Structure: Hook (bold statement, no emoji on first line) → Body (3-5 short paragraphs developing ONE insight, line breaks between paragraphs, 2-3 emojis as paragraph markers) → CTA with link on its own line → 3-5 hashtags on final line.
- Tone: Professional, first person ("J'ai constaté que..."), thought-leadership voice.

## Facebook (FR + EN)
- Length: 400–600 characters.
- Structure: Hook question or relatable scenario → 2-3 teaser sentences → CTA + link on its own line.
- Tone: Conversational, warm, 3-5 emojis OK. Use "vous" (not "tu").

## Twitter/X (FR + EN)
- Length: Max 280 characters INCLUDING the link (~23 chars). This is strict — count carefully.
- Structure: One punchy statement or hot take + link.
- Tone: Sharp, direct, 0-1 emoji. 1-2 hashtags only if they fit.

# Hard exclusions
- Never summarize the entire article — each post takes ONE angle.
- Never reuse phrases from the article — rephrase completely.
- Never start with "Nouvel article !" or "Je viens de publier..." or "New article!" or "Just published...".
- Never exceed character limits.
- No unexplained jargon.

# Quality self-check before outputting
1. Do the 3 posts use genuinely DIFFERENT angles?
2. Is the LinkedIn hook under 210 characters?
3. Is the tweet under 280 characters (link included)?
4. Are FR and EN adapted (not word-for-word translations)?
5. Would someone who hasn't read the article want to click?

# Output format — CRITICAL
Respond with ONLY a valid JSON object, nothing else. No text before, no text after, no \`\`\`json fences, no commentary. The JSON must be directly parseable by JSON.parse().

Exact schema:
{
  "linkedin": { "fr": "full LinkedIn post FR", "en": "full LinkedIn post EN" },
  "facebook": { "fr": "full Facebook post FR", "en": "full Facebook post EN" },
  "twitter": { "fr": "full tweet FR", "en": "full tweet EN" }
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
  const platforms = ['linkedin', 'facebook', 'twitter']
  const langs = ['fr', 'en']
  return (
    obj &&
    typeof obj === 'object' &&
    platforms.every(
      (p) =>
        obj[p] &&
        langs.every((l) => typeof obj[p][l] === 'string' && obj[p][l].trim().length > 0)
    )
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
  const { contentFr, contentEn, articleUrl } = body

  if (!contentFr || typeof contentFr !== 'string' || !contentFr.trim()) {
    return res.status(400).json({ error: 'contentFr is required' })
  }

  const url = articleUrl || '[LIEN]'
  const userMessage = `Génère des posts sociaux pour cet article de blog.\nURL de l'article : ${url}\n\n=== CONTENU FR ===\n${contentFr.trim()}\n\n=== CONTENU EN ===\n${contentEn ? contentEn.trim() : '(non fourni — adapte depuis le FR)'}\n\nRéponds UNIQUEMENT en JSON avec cette structure : { "linkedin": { "fr": "...", "en": "..." }, "facebook": { "fr": "...", "en": "..." }, "twitter": { "fr": "...", "en": "..." } }`

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
    console.log(`[generate-social-posts] model=${MODEL} elapsed=${elapsed}s`)

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
      console.error(
        'Failed to parse JSON from Claude response. First 400 chars:',
        text.slice(0, 400)
      )
      return res.status(500).json({ error: 'Generation produced invalid JSON' })
    }

    if (!isValidShape(parsed)) {
      console.error('Parsed JSON has invalid shape:', JSON.stringify(parsed).slice(0, 400))
      return res.status(500).json({ error: 'Generation produced invalid shape' })
    }

    return res.status(200).json({
      linkedin: { fr: parsed.linkedin.fr.trim(), en: parsed.linkedin.en.trim() },
      facebook: { fr: parsed.facebook.fr.trim(), en: parsed.facebook.en.trim() },
      twitter: { fr: parsed.twitter.fr.trim(), en: parsed.twitter.en.trim() },
    })
  } catch (err) {
    console.error('Generation error:', err)
    return res.status(500).json({ error: 'Generation failed' })
  }
}
