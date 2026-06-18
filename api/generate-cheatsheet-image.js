/* global process */
// Vercel Serverless Function — gpt-image-2 rendering step for cheat sheets.
// Receives a pre-built image_prompt (from /api/generate-cheatsheet) and returns
// a base64 PNG. Split from content generation to stay within Vercel 300s limit.

export const config = {
  maxDuration: 200,
}

const OPENAI_IMG_URL = 'https://api.openai.com/v1/images/generations'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const openaiKey = process.env.OPENAI_API_KEY
  if (!openaiKey) {
    console.error('[generate-cheatsheet-image] OPENAI_API_KEY is not set')
    return res.status(500).json({ error: 'Server is not configured' })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  const { image_prompt } = body

  if (!image_prompt || typeof image_prompt !== 'string' || !image_prompt.trim()) {
    return res.status(400).json({ error: 'image_prompt is required' })
  }

  const started = Date.now()

  try {
    const res2 = await fetch(OPENAI_IMG_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-2',
        prompt: image_prompt.trim(),
        size: '1024x1536',
        n: 1,
      }),
    })

    if (!res2.ok) {
      let detail = ''
      try {
        const errBody = await res2.json()
        detail = errBody?.error?.message || JSON.stringify(errBody).slice(0, 300)
      } catch {
        detail = await res2.text().catch(() => '')
      }
      console.error(`[generate-cheatsheet-image] OpenAI error: ${res2.status} — ${detail}`)
      return res.status(502).json({ error: `Image generation failed — ${detail}` })
    }

    const data = await res2.json()
    const b64 = data?.data?.[0]?.b64_json
    if (!b64) {
      const raw = JSON.stringify(data).slice(0, 300)
      console.error('[generate-cheatsheet-image] no b64_json:', raw)
      return res.status(500).json({ error: `Image generation returned no data: ${raw}` })
    }

    const elapsed = Math.round((Date.now() - started) / 1000)
    console.log(`[generate-cheatsheet-image] elapsed=${elapsed}s`)

    return res.status(200).json({ image_fr_base64: b64 })
  } catch (err) {
    const elapsed = Math.round((Date.now() - started) / 1000)
    console.error(`[generate-cheatsheet-image] failed after ${elapsed}s:`, err)
    return res.status(500).json({ error: 'Image generation failed' })
  }
}
