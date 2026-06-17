import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ClipboardList, AlertCircle, Sparkles, Cpu, RefreshCw } from 'lucide-react'
import { Field, inputClass } from '@/components/admin/editorPrimitives'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/posts'
import { FORMATS } from '@/lib/contentFormats'

const BUCKET = 'blog-images'
const TIMEOUT_MS = 270_000
const ENDPOINT = FORMATS.find((f) => f.id === 'cheatsheet')?.generationEndpoint ?? '/api/generate-cheatsheet'

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

  useEffect(() => {
    if (status === 'loading' || status === 'uploading') {
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
  }, [status])

  const loadingMessages = [
    t('admin.cheatsheet.loadingStep1'),
    t('admin.cheatsheet.loadingStep2'),
    t('admin.cheatsheet.loadingStep3'),
  ]
  const currentLoadingMessage =
    status === 'uploading'
      ? t('admin.cheatsheet.uploading')
      : loadingMessages[loadingIndex % loadingMessages.length]

  const handleSubmit = async () => {
    if (!topic.trim()) return
    setStatus('loading')
    setErrorKind(null)
    setGenerationResult(null)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          audience: audience.trim() || undefined,
          instructions: instructions.trim() || undefined,
          language,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.error) throw new Error(data.error || `http_${res.status}`)
      if (!data.image_fr_base64) throw new Error('empty_response')

      setStatus('uploading')
      const coverUrl = await uploadCheatsheet(data.image_fr_base64, slug || data.slug)

      setGenerationResult({
        layout_used: data.layout_used || '',
        image_prompt: data.image_prompt || '',
      })
      setStatus('done')

      onGenerated({
        slug:                data.slug || '',
        title_fr:            data.title_fr || '',
        title_en:            data.title_en || '',
        excerpt_fr:          data.excerpt_fr || '',
        excerpt_en:          data.excerpt_en || '',
        content_fr:          data.content_fr || '',
        content_en:          data.content_en || '',
        tags:                data.tags || [],
        reading_time_minutes: data.reading_time_minutes || 2,
        meta_title_fr:       data.meta_title_fr || '',
        meta_title_en:       data.meta_title_en || '',
        meta_description_fr: data.meta_description_fr || '',
        meta_description_en: data.meta_description_en || '',
        format:              'cheatsheet',
        article_type:        'cheatsheet',
        cover_image_fr:      coverUrl,
        layout_used:         data.layout_used || '',
        image_prompt:        data.image_prompt || '',
      })
    } catch (err) {
      clearTimeout(timeoutId)
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

  if (status === 'loading' || status === 'uploading') {
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
            key={loadingIndex}
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
          disabled={!topic.trim() || status === 'loading' || status === 'uploading'}
          className="inline-flex items-center gap-2 rounded-full bg-accent text-white px-6 py-2.5 text-[13px] font-heading font-semibold shadow-[var(--shadow-cta)] hover:brightness-95 hover:shadow-[var(--shadow-cta-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles size={14} strokeWidth={2} />
          {status === 'error' ? t('admin.cheatsheet.regenerate') : t('admin.cheatsheet.generate')}
        </button>
      </div>
    </div>
  )
}
