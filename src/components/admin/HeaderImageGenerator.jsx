import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image as ImageIcon, X, AlertCircle, RefreshCw, Check, Copy, Save } from 'lucide-react'
import { Field, inputClass } from '@/components/admin/editorPrimitives'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/posts'

const BUCKET = 'blog-images'
const TIMEOUT_MS = 180_000
const MIN_CONTENT_LENGTH = 100

async function base64ToBlob(base64) {
  const res = await fetch(`data:image/png;base64,${base64}`)
  return await res.blob()
}

export default function HeaderImageGenerator({
  articleContentFr,
  articleContentEn,
  slug,
  onSave,
  onCancel,
}) {
  const { t, i18n } = useTranslation()
  const [instructions, setInstructions] = useState('')
  const [status, setStatus] = useState('idle')
  const [errorKind, setErrorKind] = useState(null)
  const [result, setResult] = useState(null)
  const [loadingIndex, setLoadingIndex] = useState(0)
  const [copiedKey, setCopiedKey] = useState(null)
  const [previewLang, setPreviewLang] = useState(() =>
    (i18n.language || 'fr').startsWith('en') ? 'en' : 'fr',
  )
  const [saving, setSaving] = useState(false)
  const intervalRef = useRef(null)

  const hasFr = (articleContentFr || '').length >= MIN_CONTENT_LENGTH
  const hasEn = (articleContentEn || '').length >= MIN_CONTENT_LENGTH
  const canGenerate = hasFr && hasEn

  useEffect(() => {
    if (status === 'loading') {
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

  const loadingMessages = t('admin.header.loadingMessages', { returnObjects: true })
  const loadingList = Array.isArray(loadingMessages)
    ? loadingMessages
    : [t('admin.header.loading')]
  const currentLoadingMessage = loadingList[loadingIndex % loadingList.length]

  const handleSubmit = async () => {
    if (!canGenerate) return
    setStatus('loading')
    setErrorKind(null)
    setResult(null)

    const articleContent = [articleContentFr, articleContentEn]
      .filter(Boolean)
      .join('\n\n---\n\n')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const res = await fetch('/api/generate-header', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleContent,
          instructions: instructions.trim() || undefined,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.error) {
        throw new Error(data.error || `http_${res.status}`)
      }

      const { promptData, imageFr, imageEn, modelVersion } = data
      if (!promptData || !imageFr || !imageEn) {
        throw new Error('empty_response')
      }

      setResult({
        promptData,
        imageFrBase64: imageFr,
        imageEnBase64: imageEn,
        modelVersion: modelVersion || null,
      })
      setStatus('preview')
    } catch (err) {
      clearTimeout(timeoutId)
      if (err.name === 'AbortError') {
        setErrorKind('timeout')
      } else {
        setErrorKind('generic')
      }
      setStatus('error')
      console.error('Header generation failed:', err.message || err)
    }
  }

  const uploadBase64 = async (base64, language) => {
    const safeSlug = slugify(slug || 'untitled') || 'untitled'
    const filename = `headers/${safeSlug}-${language}-${Date.now()}.png`
    const blob = await base64ToBlob(base64)
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, blob, { contentType: 'image/png', upsert: true })
    if (uploadError) {
      throw new Error(`supabase_${uploadError.message || 'upload_failed'}`)
    }
    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(filename)
    if (!publicData?.publicUrl) {
      throw new Error('supabase_no_public_url')
    }
    return publicData.publicUrl
  }

  const handleSave = async () => {
    if (!result) return
    setSaving(true)
    try {
      const [frUrl, enUrl] = await Promise.all([
        uploadBase64(result.imageFrBase64, 'fr'),
        uploadBase64(result.imageEnBase64, 'en'),
      ])

      onSave({
        urls: { fr: frUrl, en: enUrl },
        promptData: result.promptData,
        modelVersion: result.modelVersion,
      })
    } catch (err) {
      console.error('Header save failed:', err.message || err)
      setErrorKind('upload')
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const handleCopyPrompt = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch (err) {
      console.error('Clipboard write failed', err)
    }
  }

  // -----------------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------------
  if (status === 'loading') {
    return (
      <div className="bg-surface border border-navy/[0.08] rounded-3xl p-8 md:p-10">
        <div className="flex flex-col items-center text-center py-8">
          <div className="relative mb-6">
            <div className="h-14 w-14 rounded-full border-[3px] border-accent/20 border-t-accent animate-spin" />
            <ImageIcon
              size={18}
              strokeWidth={2.5}
              className="text-accent absolute inset-0 m-auto"
              aria-hidden="true"
            />
          </div>
          <p className="font-heading font-bold text-navy text-lg mb-2">
            {t('admin.header.loading')}
          </p>
          <p
            key={loadingIndex}
            className="text-[13px] text-navy/60 mb-5 min-h-[20px] transition-opacity duration-300"
          >
            {currentLoadingMessage}
          </p>
          <p className="text-[11px] text-muted max-w-md leading-relaxed">
            {t('admin.header.loadingHint')}
          </p>
        </div>
      </div>
    )
  }

  // -----------------------------------------------------------------------------
  // Preview state
  // -----------------------------------------------------------------------------
  if (status === 'preview' && result) {
    const activeBase64 =
      previewLang === 'en' ? result.imageEnBase64 : result.imageFrBase64
    const activePrompt =
      previewLang === 'en' ? result.promptData.prompt_en : result.promptData.prompt_fr
    const activeAlt =
      previewLang === 'en' ? result.promptData.alt_en : result.promptData.alt_fr

    return (
      <div className="bg-surface border border-navy/[0.08] rounded-3xl p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-accent/10 flex items-center justify-center">
              <ImageIcon size={18} strokeWidth={2} className="text-accent" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-navy text-lg leading-tight">
                {t('admin.header.previewTitle')}
              </h2>
              <p className="text-[12px] text-navy/60 mt-0.5">
                {t('admin.header.previewSubtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="h-8 w-8 shrink-0 rounded-full text-navy/50 hover:text-navy hover:bg-navy/[0.05] flex items-center justify-center transition-colors disabled:opacity-50"
            aria-label={t('admin.header.cancel')}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-1 rounded-full border border-navy/10 p-1 w-fit">
            <button
              type="button"
              onClick={() => setPreviewLang('fr')}
              className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                previewLang === 'fr' ? 'bg-navy text-white' : 'text-navy/55 hover:text-navy'
              }`}
            >
              {t('admin.header.labelFr')}
            </button>
            <button
              type="button"
              onClick={() => setPreviewLang('en')}
              className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                previewLang === 'en' ? 'bg-navy text-white' : 'text-navy/55 hover:text-navy'
              }`}
            >
              {t('admin.header.labelEn')}
            </button>
          </div>
          <div className="ml-auto flex items-center gap-2 text-[11px] text-navy/60 flex-wrap">
            <span className="uppercase tracking-[0.1em] font-bold">
              {t('admin.header.categoryLabel')}
            </span>
            <code className="rounded-full bg-white border border-navy/10 px-2.5 py-1 font-mono text-[10px] text-navy/80">
              {t(`admin.header.categories.${result.promptData.category}`, {
                defaultValue: result.promptData.category,
              })}
            </code>
            <span className="uppercase tracking-[0.1em] font-bold">
              {t('admin.header.modeLabel')}
            </span>
            <code className="rounded-full bg-white border border-navy/10 px-2.5 py-1 font-mono text-[10px] text-navy/80">
              {result.promptData.mode}
            </code>
            {result.promptData.focal_accent && (
              <>
                <span className="uppercase tracking-[0.1em] font-bold">
                  {t('admin.header.focalLabel')}
                </span>
                <code className="rounded-full bg-white border border-navy/10 px-2.5 py-1 font-mono text-[10px] text-navy/80">
                  {result.promptData.focal_accent}
                </code>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-5">
          <div className="rounded-xl border border-navy/10 bg-white p-3">
            <img
              src={`data:image/png;base64,${activeBase64}`}
              alt={activeAlt}
              className="max-w-full h-auto rounded-lg mx-auto block"
            />
          </div>
          {Array.isArray(result.promptData.metaphor_objects) &&
            result.promptData.metaphor_objects.length > 0 && (
              <p className="text-[11px] text-navy/55 leading-relaxed">
                <span className="font-bold uppercase tracking-[0.12em] text-navy/50 mr-2">
                  {t('admin.header.objectsLabel')}
                </span>
                {result.promptData.metaphor_objects.join(' · ')}
              </p>
            )}
          <p className="text-[12px] italic text-navy/60 leading-relaxed">
            <span className="font-bold not-italic uppercase tracking-[0.12em] text-[10px] text-navy/50 mr-2">
              {t('admin.header.altLabel', { defaultValue: 'Alt' })}
            </span>
            {activeAlt}
          </p>
          <details className="rounded-xl border border-navy/10 bg-white/60 p-3">
            <summary className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy/60 cursor-pointer select-none flex items-center justify-between">
              <span>{t('admin.header.showPrompt')}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  handleCopyPrompt(previewLang, activePrompt)
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 bg-white px-3 py-1 text-[10px] font-medium text-navy/70 hover:text-navy hover:border-navy/30 transition-colors"
              >
                {copiedKey === previewLang ? (
                  <>
                    <Check size={11} strokeWidth={2.5} />
                    {t('admin.header.copied')}
                  </>
                ) : (
                  <>
                    <Copy size={11} strokeWidth={2} />
                    {t('admin.header.copy')}
                  </>
                )}
              </button>
            </summary>
            <pre className="mt-3 whitespace-pre-wrap text-[11px] text-navy/70 font-mono leading-relaxed max-h-60 overflow-auto">
              {activePrompt}
            </pre>
          </details>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-5 border-t border-navy/[0.06]">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-full border border-navy/15 bg-white text-navy/75 px-5 py-2.5 text-[13px] font-medium hover:border-navy/25 hover:text-navy transition-colors disabled:opacity-50"
          >
            {t('admin.header.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white text-navy/75 px-5 py-2.5 text-[13px] font-medium hover:border-navy/25 hover:text-navy transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} strokeWidth={2} />
            {t('admin.header.regenerate')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-accent text-white px-6 py-2.5 text-[13px] font-heading font-semibold shadow-[var(--shadow-cta)] hover:brightness-95 hover:shadow-[var(--shadow-cta-hover)] transition-all disabled:opacity-70"
          >
            <Save size={14} strokeWidth={2.5} />
            {saving ? t('admin.header.saving', { defaultValue: t('admin.header.save') }) : t('admin.header.save')}
          </button>
        </div>
      </div>
    )
  }

  // -----------------------------------------------------------------------------
  // Idle / error state — form
  // -----------------------------------------------------------------------------
  return (
    <div className="bg-surface border border-navy/[0.08] rounded-3xl p-6 md:p-8">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-accent/10 flex items-center justify-center">
            <ImageIcon size={18} strokeWidth={2} className="text-accent" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-navy text-lg leading-tight">
              {t('admin.header.title')}
            </h2>
            <p className="text-[12px] text-navy/60 mt-0.5">
              {t('admin.header.subtitle')}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="h-8 w-8 shrink-0 rounded-full text-navy/50 hover:text-navy hover:bg-navy/[0.05] flex items-center justify-center transition-colors"
          aria-label={t('admin.header.cancel')}
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      {status === 'error' && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
          <AlertCircle size={16} strokeWidth={2} className="text-accent-deep mt-0.5 shrink-0" />
          <div className="flex-1 text-[13px] text-accent-deep">
            {errorKind === 'timeout'
              ? t('admin.header.errorTimeout')
              : errorKind === 'upload'
              ? t('admin.header.errorUpload')
              : t('admin.header.error')}
          </div>
        </div>
      )}

      <div className="space-y-5">
        <Field label={t('admin.header.instructions')}>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={2}
            placeholder={t('admin.header.instructionsPlaceholder')}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-5 border-t border-navy/[0.06]">
        <p className="text-[11px] text-muted max-w-md leading-relaxed">
          {!canGenerate
            ? t('admin.header.minContent')
            : t('admin.header.bilingualHint', {
                defaultValue: t('admin.infographic.bilingualHint'),
              })}
        </p>
        <div className="flex flex-wrap items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-navy/15 bg-white text-navy/75 px-6 py-2.5 text-[13px] font-medium hover:border-navy/25 hover:text-navy transition-colors"
          >
            {t('admin.header.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canGenerate}
            className="inline-flex items-center gap-2 rounded-full bg-accent text-white px-6 py-2.5 text-[13px] font-heading font-semibold shadow-[var(--shadow-cta)] hover:brightness-95 hover:shadow-[var(--shadow-cta-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ImageIcon size={14} strokeWidth={2} />
            {status === 'error'
              ? t('admin.header.retry')
              : t('admin.header.generateButton')}
          </button>
        </div>
      </div>
    </div>
  )
}
