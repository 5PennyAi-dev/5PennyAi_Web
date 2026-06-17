import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart2, AlertCircle, Sparkles, Cpu, RefreshCw } from 'lucide-react'
import { Field, inputClass } from '@/components/admin/editorPrimitives'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/posts'
import { FORMATS } from '@/lib/contentFormats'

const BUCKET = 'blog-images'
const TIMEOUT_MS = 270_000
const ENDPOINT = FORMATS.find((f) => f.id === 'infographic')?.generationEndpoint ?? '/api/generate-infographic-resource'

async function base64ToBlob(base64) {
  const res = await fetch(`data:image/png;base64,${base64}`)
  return res.blob()
}

async function uploadInfographic(base64, slug) {
  const safeSlug = slugify(slug || 'untitled') || 'untitled'
  const filename = `infographics/${safeSlug}-fr-${Date.now()}.png`
  const blob = await base64ToBlob(base64)
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, blob, { contentType: 'image/png', upsert: true })
  if (error) throw new Error(`supabase_${error.message || 'upload_failed'}`)
  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filename)
  if (!pub?.publicUrl) throw new Error('supabase_no_public_url')
  return pub.publicUrl
}

export default function InfographicResourceGenerator({ slug, onGenerated }) {
  const { t } = useTranslation()
  const [concept, setConcept] = useState('')
  const [layout, setLayout] = useState('')
  const [audience, setAudience] = useState('')
  const [keyPoints, setKeyPoints] = useState('')
  const [status, setStatus] = useState('idle')
  const [errorKind, setErrorKind] = useState(null)
  const [generationResult, setGenerationResult] = useState(null)
  const [loadingIndex, setLoadingIndex] = useState(0)
  const intervalRef = useRef(null)

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
    t('admin.infographicResource.loadingStep1'),
    t('admin.infographicResource.loadingStep2'),
    t('admin.infographicResource.loadingStep3'),
  ]
  const currentLoadingMessage =
    status === 'uploading'
      ? t('admin.infographicResource.uploading')
      : loadingMessages[loadingIndex % loadingMessages.length]

  const handleSubmit = async () => {
    if (!concept.trim()) return
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
          concept: concept.trim(),
          layout: layout || undefined,
          audience: audience.trim() || undefined,
          keyPoints: keyPoints.trim() || undefined,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.error) throw new Error(data.error || `http_${res.status}`)
      if (!data.image_fr_base64) throw new Error('empty_response')

      setStatus('uploading')
      const coverUrl = await uploadInfographic(data.image_fr_base64, slug)

      setGenerationResult({
        layout_used: data.layout_used || '',
        image_prompt: data.image_prompt || '',
      })
      setStatus('done')

      onGenerated({
        title_fr:            data.title_fr || '',
        title_en:            data.title_en || '',
        excerpt_fr:          data.excerpt_fr || '',
        excerpt_en:          data.excerpt_en || '',
        content_fr:          data.content_fr || '',
        content_en:          data.content_en || '',
        alt_fr:              data.alt_fr || '',
        alt_en:              data.alt_en || '',
        tags:                data.tags || [],
        meta_title_fr:       data.meta_title_fr || '',
        meta_title_en:       data.meta_title_en || '',
        meta_description_fr: data.meta_description_fr || '',
        meta_description_en: data.meta_description_en || '',
        slug:                data.slug || '',
        format:              'infographic',
        cover_image_fr:      coverUrl,
        cover_image_alt_fr:  data.alt_fr || '',
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
      console.error('[InfographicResourceGenerator] failed:', err.message || err)
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
            <BarChart2
              size={18}
              strokeWidth={2.5}
              className="text-accent absolute inset-0 m-auto"
              aria-hidden="true"
            />
          </div>
          <p className="font-heading font-bold text-navy text-lg mb-2">
            {t('admin.infographicResource.loading')}
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
          <div className="h-10 w-10 shrink-0 rounded-full bg-violet-100 flex items-center justify-center">
            <BarChart2 size={18} strokeWidth={2} className="text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-heading font-bold text-navy text-lg leading-tight">
              {t('admin.infographicResource.title')}
            </h2>
            <p className="text-[12px] text-navy/60 mt-0.5">{t('admin.infographicResource.doneHint')}</p>
          </div>
        </div>

        {generationResult.layout_used && (
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-violet-100 text-violet-700 px-3 py-1 text-[12px] font-medium">
            {t('admin.infographicResource.layoutUsedLabel')} : {generationResult.layout_used}
          </div>
        )}

        {generationResult.image_prompt && (
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-navy/40 mb-1.5">
              {t('admin.infographicResource.promptLabel')}
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
            {t('admin.infographicResource.regenerate')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-navy/[0.08] rounded-3xl p-6 md:p-8">
      <div className="flex items-start gap-3 mb-5">
        <div className="h-10 w-10 shrink-0 rounded-full bg-violet-100 flex items-center justify-center">
          <BarChart2 size={18} strokeWidth={2} className="text-violet-600" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-navy text-lg leading-tight">
            {t('admin.infographicResource.title')}
          </h2>
          <p className="text-[12px] text-navy/60 mt-0.5">{t('admin.infographicResource.subtitle')}</p>
        </div>
      </div>

      {status === 'error' && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
          <AlertCircle size={16} strokeWidth={2} className="text-accent-deep mt-0.5 shrink-0" />
          <div className="flex-1 text-[13px] text-accent-deep">
            {errorKind === 'timeout'
              ? t('admin.infographicResource.errorTimeout')
              : errorKind === 'upload'
                ? t('admin.infographicResource.errorUpload')
                : t('admin.infographicResource.error')}
          </div>
        </div>
      )}

      <div className="space-y-5">
        <Field label={t('admin.infographicResource.concept')} required>
          <input
            type="text"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder={t('admin.infographicResource.conceptPlaceholder')}
            className={inputClass}
            required
          />
        </Field>

        <Field label={t('admin.infographicResource.layout')}>
          <select
            value={layout}
            onChange={(e) => setLayout(e.target.value)}
            className={inputClass}
          >
            <option value="">{t('admin.infographicResource.layoutAuto')}</option>
            <option value="definition">{t('admin.infographicResource.layoutDefinition')}</option>
            <option value="process">{t('admin.infographicResource.layoutProcess')}</option>
            <option value="comparison">{t('admin.infographicResource.layoutComparison')}</option>
            <option value="anatomy">{t('admin.infographicResource.layoutAnatomy')}</option>
            <option value="taxonomy">{t('admin.infographicResource.layoutTaxonomy')}</option>
          </select>
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t('admin.infographicResource.audience')}>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder={t('admin.infographicResource.audiencePlaceholder')}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label={t('admin.infographicResource.keyPoints')}>
          <textarea
            value={keyPoints}
            onChange={(e) => setKeyPoints(e.target.value)}
            rows={3}
            placeholder={t('admin.infographicResource.keyPointsPlaceholder')}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-navy/35">
        <Cpu size={11} strokeWidth={2} />
        <span>{t('admin.studio.engines.label')} :</span>
        <span>{t('admin.studio.engines.infographicResource')}</span>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-6 mt-5 border-t border-navy/[0.06]">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!concept.trim() || status === 'loading' || status === 'uploading'}
          className="inline-flex items-center gap-2 rounded-full bg-accent text-white px-6 py-2.5 text-[13px] font-heading font-semibold shadow-[var(--shadow-cta)] hover:brightness-95 hover:shadow-[var(--shadow-cta-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles size={14} strokeWidth={2} />
          {status === 'error'
            ? t('admin.infographicResource.regenerate')
            : t('admin.infographicResource.generate')}
        </button>
      </div>
    </div>
  )
}
