import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ClipboardList, AlertCircle, Sparkles, Cpu, RefreshCw } from 'lucide-react'
import { Field, inputClass } from '@/components/admin/editorPrimitives'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/posts'
import { FORMATS } from '@/lib/contentFormats'

const BUCKET = 'blog-images'
// Phase 1: Claude content generation (up to ~175s for dense topics)
const TIMEOUT_CONTENT_MS = 220_000
// Phase 2: gpt-image-2 portrait rendering
const TIMEOUT_IMAGE_MS   = 180_000

const ENDPOINT       = FORMATS.find((f) => f.id === 'cheatsheet')?.generationEndpoint ?? '/api/generate-cheatsheet'
const ENDPOINT_IMAGE = '/api/generate-cheatsheet-image'

async function base64ToBlob(base64) {
  const res = await fetch(`data:image/png;base64,${base64}`)
  return res.blob()
}

async function uploadCheatsheet(base64, slug) {
  const safeSlug = slugify(slug || 'untitled') || 'untitled'
  const filename = `cheatsheets/${safeSlug}-fr-${Date.now()}.png`
  const blob = await base64ToBlob(base64)
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, blob, { contentType: 'image/png', upsert: true })
  if (error) throw new Error(`supabase_${error.message || 'upload_failed'}`)
  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filename)
  if (!pub?.publicUrl) throw new Error('supabase_no_public_url')
  return pub.publicUrl
}

// status values: idle | loading | rendering | uploading | done | error
export default function CheatSheetGenerator({ slug, onGenerated, initialTopic = '' }) {
  const { t } = useTranslation()
  const [topic, setTopic] = useState(initialTopic)
  const [audience, setAudience] = useState('')
  const [instructions, setInstructions] = useState('')
  const [language, setLanguage] = useState('fr')
  const [status, setStatus] = useState('idle')
  const [errorKind, setErrorKind] = useState(null)
  const [generationResult, setGenerationResult] = useState(null)
  const [loadingIndex, setLoadingIndex] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    setTopic(initialTopic)
  }, [initialTopic])

  const isWorking = ['loading', 'rendering', 'uploading'].includes(status)

  useEffect(() => {
    if (isWorking) {
      setLoadingIndex(0)
      intervalRef.current = setInterval(() => {
        setLoadingIndex((i) => i + 1)
      }, 4500)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isWorking])

  const currentLoadingMessage =
    status === 'uploading'  ? t('admin.cheatsheet.uploading') :
    status === 'rendering'  ? t('admin.cheatsheet.loadingStep2') :
                              t('admin.cheatsheet.loadingStep1')

  const handleSubmit = async () => {
    if (!topic.trim()) return
    setStatus('loading')
    setErrorKind(null)
    setGenerationResult(null)

    try {
      // ── Phase 1 : Claude generates verified bilingual content + image_prompt ──
      const ctrl1 = new AbortController()
      const tid1  = setTimeout(() => ctrl1.abort(), TIMEOUT_CONTENT_MS)

      const res1 = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          audience: audience.trim() || undefined,
          instructions: instructions.trim() || undefined,
          language,
        }),
        signal: ctrl1.signal,
      })
      clearTimeout(tid1)

      const data1 = await res1.json().catch(() => ({}))
      if (!res1.ok || data1.error) throw new Error(data1.error || `http_${res1.status}`)
      if (!data1.image_prompt)     throw new Error('empty_content_response')

      // ── Phase 2 : gpt-image-2 renders the portrait PNG ────────────────────────
      setStatus('rendering')

      const ctrl2 = new AbortController()
      const tid2  = setTimeout(() => ctrl2.abort(), TIMEOUT_IMAGE_MS)

      const res2 = await fetch(ENDPOINT_IMAGE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_prompt: data1.image_prompt }),
        signal: ctrl2.signal,
      })
      clearTimeout(tid2)

      const data2 = await res2.json().catch(() => ({}))
      if (!res2.ok || data2.error)   throw new Error(data2.error || `http_${res2.status}`)
      if (!data2.image_fr_base64)    throw new Error('empty_image_response')

      // ── Phase 3 : upload to Supabase Storage ──────────────────────────────────
      setStatus('uploading')
      const coverUrl = await uploadCheatsheet(data2.image_fr_base64, slug || data1.slug)

      setGenerationResult({
        layout_used: data1.layout_used || '',
        image_prompt: data1.image_prompt || '',
      })
      setStatus('done')

      onGenerated({
        slug:                data1.slug || '',
        title_fr:            data1.title_fr || '',
        title_en:            data1.title_en || '',
        excerpt_fr:          data1.excerpt_fr || '',
        excerpt_en:          data1.excerpt_en || '',
        content_fr:          data1.content_fr || '',
        content_en:          data1.content_en || '',
        tags:                data1.tags || [],
        reading_time_minutes: data1.reading_time_minutes || 2,
        meta_title_fr:       data1.meta_title_fr || '',
        meta_title_en:       data1.meta_title_en || '',
        meta_description_fr: data1.meta_description_fr || '',
        meta_description_en: data1.meta_description_en || '',
        format:              'cheatsheet',
        article_type:        'cheatsheet',
        cover_image_fr:      coverUrl,
        layout_used:         data1.layout_used || '',
        image_prompt:        data1.image_prompt || '',
      })
    } catch (err) {
      if (err.name === 'AbortError') {
        setErrorKind('timeout')
      } else if (String(err.message).startsWith('supabase_')) {
        setErrorKind('upload')
      } else {
        setErrorKind('generic')
      }
      setStatus('error')
      console.error('[CheatSheetGenerator] failed:', err.message || err)
    }
  }

  const handleRegenerate = () => {
    setStatus('idle')
    setGenerationResult(null)
  }

  if (isWorking) {
    return (
      <div className="bg-surface border border-navy/[0.08] rounded-3xl p-8 md:p-10">
        <div className="flex flex-col items-center text-center py-8">
          <div className="relative mb-6">
            <div className="h-14 w-14 rounded-full border-[3px] border-accent/20 border-t-accent animate-spin" />
            <ClipboardList
              size={18}
              strokeWidth={2.5}
              className="text-accent absolute inset-0 m-auto"
              aria-hidden="true"
            />
          </div>
          <p className="font-heading font-bold text-navy text-lg mb-2">
            {t('admin.cheatsheet.loading')}
          </p>
          <p
            key={status}
            className="text-[13px] text-navy/60 mb-5 min-h-[20px] transition-opacity duration-300"
          >
            {currentLoadingMessage}
          </p>
        </div>
      </div>
    )
  }

  if (status === 'done' && generationResult) {
    return (
      <div className="bg-surface border border-navy/[0.08] rounded-3xl p-6 md:p-8">
        <div className="flex items-start gap-3 mb-5">
          <div className="h-10 w-10 shrink-0 rounded-full bg-teal-100 flex items-center justify-center">
            <ClipboardList size={18} strokeWidth={2} className="text-teal-700" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-heading font-bold text-navy text-lg leading-tight">
              {t('admin.cheatsheet.title')}
            </h2>
            <p className="text-[12px] text-navy/60 mt-0.5">{t('admin.cheatsheet.doneHint')}</p>
          </div>
        </div>

        {generationResult.layout_used && (
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-teal-100 text-teal-700 px-3 py-1 text-[12px] font-medium">
            {t('admin.cheatsheet.layoutUsedLabel')} : {generationResult.layout_used}
          </div>
        )}

        {generationResult.image_prompt && (
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-navy/40 mb-1.5">
              {t('admin.cheatsheet.promptLabel')}
            </p>
            <textarea
              value={generationResult.image_prompt}
              readOnly
              rows={3}
              className={`${inputClass} font-mono text-[11px] resize-none`}
            />
          </div>
        )}

        <div className="flex items-center justify-end pt-4 border-t border-navy/[0.06]">
          <button
            type="button"
            onClick={handleRegenerate}
            className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white text-navy/75 px-5 py-2 text-[13px] font-medium hover:border-navy/25 hover:text-navy transition-colors"
          >
            <RefreshCw size={13} strokeWidth={2} />
            {t('admin.cheatsheet.regenerate')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-navy/[0.08] rounded-3xl p-6 md:p-8">
      <div className="flex items-start gap-3 mb-5">
        <div className="h-10 w-10 shrink-0 rounded-full bg-teal-100 flex items-center justify-center">
          <ClipboardList size={18} strokeWidth={2} className="text-teal-700" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-navy text-lg leading-tight">
            {t('admin.cheatsheet.title')}
          </h2>
          <p className="text-[12px] text-navy/60 mt-0.5">{t('admin.cheatsheet.subtitle')}</p>
        </div>
      </div>

      {status === 'error' && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
          <AlertCircle size={16} strokeWidth={2} className="text-accent-deep mt-0.5 shrink-0" />
          <div className="flex-1 text-[13px] text-accent-deep">
            {errorKind === 'timeout'
              ? t('admin.cheatsheet.errorTimeout')
              : errorKind === 'upload'
                ? t('admin.cheatsheet.errorUpload')
                : t('admin.cheatsheet.error')}
          </div>
        </div>
      )}

      <div className="space-y-5">
        <Field label={t('admin.cheatsheet.topic')} required>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('admin.cheatsheet.topicPlaceholder')}
            className={inputClass}
            required
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t('admin.cheatsheet.audience')}>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder={t('admin.cheatsheet.audiencePlaceholder')}
              className={inputClass}
            />
          </Field>
          <Field label={t('admin.cheatsheet.language')}>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={inputClass}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </Field>
        </div>

        <Field label={t('admin.cheatsheet.instructions')}>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
            placeholder={t('admin.cheatsheet.instructionsPlaceholder')}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-navy/35">
        <Cpu size={11} strokeWidth={2} />
        <span>{t('admin.studio.engines.label')} :</span>
        <span>{t('admin.studio.engines.cheatsheet')}</span>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-6 mt-5 border-t border-navy/[0.06]">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!topic.trim() || isWorking}
          className="inline-flex items-center gap-2 rounded-full bg-accent text-white px-6 py-2.5 text-[13px] font-heading font-semibold shadow-[var(--shadow-cta)] hover:brightness-95 hover:shadow-[var(--shadow-cta-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles size={14} strokeWidth={2} />
          {status === 'error' ? t('admin.cheatsheet.regenerate') : t('admin.cheatsheet.generate')}
        </button>
      </div>
    </div>
  )
}
