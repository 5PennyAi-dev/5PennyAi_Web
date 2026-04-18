import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles, X, AlertCircle, RefreshCw, Plus, Copy, Check } from 'lucide-react'
import { Field, inputClass } from '@/components/admin/editorPrimitives'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/posts'
import { extractH2Sections } from '@/lib/markdown'

const BUCKET = 'blog-images'
const FORMATS = ['auto', '4:5', '16:9', '1:1', '3:4']
const TIMEOUT_MS = 180_000
const MIN_CONTENT_LENGTH = 100

async function base64ToBlob(base64) {
  const res = await fetch(`data:image/png;base64,${base64}`)
  return await res.blob()
}

export default function InfographicGenerator({
  articleContentFr,
  articleContentEn,
  slug,
  previousVariants = [],
  onInsert,
  onCancel,
}) {
  const { t, i18n } = useTranslation()
  const [scope, setScope] = useState('global')
  const [sectionIndex, setSectionIndex] = useState(0)
  const [format, setFormat] = useState('auto')
  const [instructions, setInstructions] = useState('')
  const [status, setStatus] = useState('idle')
  const [errorKind, setErrorKind] = useState(null)
  const [result, setResult] = useState(null) // { promptData, imageFrBase64, imageEnBase64 }
  const [uploadedUrls, setUploadedUrls] = useState(null) // { fr, en }
  const [attemptedVariants, setAttemptedVariants] = useState([])
  const [loadingIndex, setLoadingIndex] = useState(0)
  const [copiedKey, setCopiedKey] = useState(null)
  const [previewLang, setPreviewLang] = useState(() =>
    (i18n.language || 'fr').startsWith('en') ? 'en' : 'fr',
  )
  const [inserting, setInserting] = useState(false)
  const intervalRef = useRef(null)

  const hasFr = (articleContentFr || '').length >= MIN_CONTENT_LENGTH
  const hasEn = (articleContentEn || '').length >= MIN_CONTENT_LENGTH
  const sectionsFr = extractH2Sections(articleContentFr || '')
  const sectionsEn = extractH2Sections(articleContentEn || '')
  const sections = sectionsFr.length ? sectionsFr : sectionsEn
  const canGenerate = hasFr && hasEn // need both languages — image contains embedded text

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

  const loadingMessages = t('admin.infographic.loadingMessages', { returnObjects: true })
  const loadingList = Array.isArray(loadingMessages)
    ? loadingMessages
    : [t('admin.infographic.loading')]
  const currentLoadingMessage = loadingList[loadingIndex % loadingList.length]

  const extractSectionContent = (md, idx) => {
    if (!md) return ''
    const items = extractH2Sections(md)
    if (idx < 0 || idx >= items.length) return md
    const start = items[idx].startOffset
    const end = items[idx + 1] ? items[idx + 1].startOffset : md.length
    return md.slice(start, end)
  }

  const handleSubmit = async (extraPreviousVariants = null) => {
    if (!canGenerate) return
    setStatus('loading')
    setErrorKind(null)
    setResult(null)
    setUploadedUrls(null)

    const previousList = [
      ...(previousVariants || []),
      ...attemptedVariants,
      ...(extraPreviousVariants || []),
    ].filter(Boolean)

    const articleContent =
      scope === 'global'
        ? [articleContentFr, articleContentEn].filter(Boolean).join('\n\n---\n\n')
        : [
            extractSectionContent(articleContentFr, sectionIndex),
            extractSectionContent(articleContentEn, sectionIndex),
          ]
            .filter(Boolean)
            .join('\n\n---\n\n')

    const sectionTitle =
      scope === 'section' ? sections[sectionIndex]?.title || null : null

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const res = await fetch('/api/generate-infographic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleContent,
          scope,
          sectionTitle,
          previousVariants: previousList,
          instructions: instructions.trim() || undefined,
          format: format === 'auto' ? undefined : format,
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
      if (promptData.takeaway_variant) {
        setAttemptedVariants((prev) => [...prev, promptData.takeaway_variant])
      }
      setStatus('preview')
    } catch (err) {
      clearTimeout(timeoutId)
      if (err.name === 'AbortError') {
        setErrorKind('timeout')
      } else {
        setErrorKind('generic')
      }
      setStatus('error')
      console.error('Infographic generation failed:', err.message || err)
    }
  }

  const uploadBase64 = async (base64, language) => {
    const safeSlug = slugify(slug || 'untitled') || 'untitled'
    const filename = `infographics/${safeSlug}-${scope}-${language}-${Date.now()}.png`
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

  const handleInsert = async () => {
    if (!result) return
    setInserting(true)
    try {
      // Upload both PNGs (skip if already uploaded from a previous click)
      let urls = uploadedUrls
      if (!urls) {
        const [frUrl, enUrl] = await Promise.all([
          uploadBase64(result.imageFrBase64, 'fr'),
          uploadBase64(result.imageEnBase64, 'en'),
        ])
        urls = { fr: frUrl, en: enUrl }
        setUploadedUrls(urls)
      }

      onInsert({
        scope,
        sectionIndex: scope === 'section' ? sectionIndex : null,
        sectionTitle: scope === 'section' ? sections[sectionIndex]?.title || null : null,
        urls,
        promptData: result.promptData,
        modelVersion: result.modelVersion,
      })
    } catch (err) {
      console.error('Infographic insert failed:', err.message || err)
      setErrorKind('upload')
      setStatus('error')
    } finally {
      setInserting(false)
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
            <Sparkles
              size={18}
              strokeWidth={2.5}
              className="text-accent absolute inset-0 m-auto"
              aria-hidden="true"
            />
          </div>
          <p className="font-heading font-bold text-navy text-lg mb-2">
            {t('admin.infographic.loading')}
          </p>
          <p
            key={loadingIndex}
            className="text-[13px] text-navy/60 mb-5 min-h-[20px] transition-opacity duration-300"
          >
            {currentLoadingMessage}
          </p>
          <p className="text-[11px] text-muted max-w-md leading-relaxed">
            {t('admin.infographic.loadingHint')}
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
              <Sparkles size={18} strokeWidth={2} className="text-accent" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-navy text-lg leading-tight">
                {t('admin.infographic.previewTitle')}
              </h2>
              <p className="text-[12px] text-navy/60 mt-0.5">
                {t('admin.infographic.previewSubtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="h-8 w-8 shrink-0 rounded-full text-navy/50 hover:text-navy hover:bg-navy/[0.05] flex items-center justify-center transition-colors"
            aria-label={t('admin.infographic.cancel')}
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
                previewLang === 'fr'
                  ? 'bg-navy text-white'
                  : 'text-navy/55 hover:text-navy'
              }`}
            >
              {t('admin.infographic.labelFr')}
            </button>
            <button
              type="button"
              onClick={() => setPreviewLang('en')}
              className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                previewLang === 'en'
                  ? 'bg-navy text-white'
                  : 'text-navy/55 hover:text-navy'
              }`}
            >
              {t('admin.infographic.labelEn')}
            </button>
          </div>
          <div className="ml-auto flex items-center gap-2 text-[11px] text-navy/60">
            <span className="uppercase tracking-[0.1em] font-bold">
              {t('admin.infographic.typeLabel')}
            </span>
            <code className="rounded-full bg-white border border-navy/10 px-2.5 py-1 font-mono text-[10px] text-navy/80">
              {result.promptData.type}
            </code>
            {result.promptData.takeaway_variant && (
              <>
                <span className="uppercase tracking-[0.1em] font-bold">
                  {t('admin.infographic.variantLabel')}
                </span>
                <code className="rounded-full bg-white border border-navy/10 px-2.5 py-1 font-mono text-[10px] text-navy/80">
                  {result.promptData.takeaway_variant}
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
          <p className="text-[12px] italic text-navy/60 leading-relaxed">
            <span className="font-bold not-italic uppercase tracking-[0.12em] text-[10px] text-navy/50 mr-2">
              {t('admin.infographic.altLabel')}
            </span>
            {activeAlt}
          </p>
          <details className="rounded-xl border border-navy/10 bg-white/60 p-3">
            <summary className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy/60 cursor-pointer select-none flex items-center justify-between">
              <span>{t('admin.infographic.showPrompt')}</span>
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
                    {t('admin.infographic.copied')}
                  </>
                ) : (
                  <>
                    <Copy size={11} strokeWidth={2} />
                    {t('admin.infographic.copy')}
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
            disabled={inserting}
            className="rounded-full border border-navy/15 bg-white text-navy/75 px-5 py-2.5 text-[13px] font-medium hover:border-navy/25 hover:text-navy transition-colors disabled:opacity-50"
          >
            {t('admin.infographic.cancel')}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={inserting}
            className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white text-navy/75 px-5 py-2.5 text-[13px] font-medium hover:border-navy/25 hover:text-navy transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} strokeWidth={2} />
            {t('admin.infographic.regenerate')}
          </button>
          <button
            type="button"
            onClick={handleInsert}
            disabled={inserting}
            className="inline-flex items-center gap-2 rounded-full bg-accent text-white px-6 py-2.5 text-[13px] font-heading font-semibold shadow-[var(--shadow-cta)] hover:brightness-95 hover:shadow-[var(--shadow-cta-hover)] transition-all disabled:opacity-70"
          >
            <Plus size={14} strokeWidth={2.5} />
            {inserting ? t('admin.infographic.inserting') : t('admin.infographic.insert')}
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
            <Sparkles size={18} strokeWidth={2} className="text-accent" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-navy text-lg leading-tight">
              {t('admin.infographic.title')}
            </h2>
            <p className="text-[12px] text-navy/60 mt-0.5">
              {t('admin.infographic.subtitle')}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="h-8 w-8 shrink-0 rounded-full text-navy/50 hover:text-navy hover:bg-navy/[0.05] flex items-center justify-center transition-colors"
          aria-label={t('admin.infographic.cancel')}
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      {status === 'error' && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
          <AlertCircle size={16} strokeWidth={2} className="text-accent-deep mt-0.5 shrink-0" />
          <div className="flex-1 text-[13px] text-accent-deep">
            {errorKind === 'timeout'
              ? t('admin.infographic.errorTimeout')
              : errorKind === 'upload'
              ? t('admin.infographic.errorUpload')
              : t('admin.infographic.error')}
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t('admin.infographic.scopeLabel')}>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className={inputClass}
            >
              <option value="global">{t('admin.infographic.scopeGlobal')}</option>
              <option value="section" disabled={sections.length === 0}>
                {t('admin.infographic.scopeSection')}
              </option>
            </select>
          </Field>
          <Field label={t('admin.infographic.format')}>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className={inputClass}
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {t(`admin.infographic.formats.${f.replace(':', '_')}`)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {scope === 'section' && (
          <Field label={t('admin.infographic.sectionLabel')}>
            <select
              value={sectionIndex}
              onChange={(e) => setSectionIndex(Number.parseInt(e.target.value, 10))}
              className={inputClass}
            >
              {sections.map((section, idx) => (
                <option key={`${idx}-${section.startOffset}`} value={idx}>
                  {section.title}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label={t('admin.infographic.instructions')}>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={2}
            placeholder={t('admin.infographic.instructionsPlaceholder')}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-5 border-t border-navy/[0.06]">
        <p className="text-[11px] text-muted max-w-md leading-relaxed">
          {!canGenerate
            ? t('admin.infographic.minContent')
            : t('admin.infographic.bilingualHint')}
        </p>
        <div className="flex flex-wrap items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-navy/15 bg-white text-navy/75 px-6 py-2.5 text-[13px] font-medium hover:border-navy/25 hover:text-navy transition-colors"
          >
            {t('admin.infographic.cancel')}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!canGenerate}
            className="inline-flex items-center gap-2 rounded-full bg-accent text-white px-6 py-2.5 text-[13px] font-heading font-semibold shadow-[var(--shadow-cta)] hover:brightness-95 hover:shadow-[var(--shadow-cta-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={14} strokeWidth={2} />
            {status === 'error'
              ? t('admin.infographic.retry')
              : t('admin.infographic.generateButton')}
          </button>
        </div>
      </div>
    </div>
  )
}
