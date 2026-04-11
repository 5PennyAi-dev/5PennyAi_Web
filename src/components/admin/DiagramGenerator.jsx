import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PenTool, X, AlertCircle, RefreshCw, Plus, Check, Pencil, Copy } from 'lucide-react'
import ExcalidrawEditModal from '@/components/admin/ExcalidrawEditModal'
import { Field, inputClass } from '@/components/admin/editorPrimitives'
import { renderExcalidrawToBlob } from '@/lib/excalidraw'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/posts'
import { extractH2Sections } from '@/lib/markdown'

const BUCKET = 'blog-images'

const LAYOUT_TYPES = ['auto', 'flow', 'hub', 'hierarchy', 'comparison', 'steps', 'cycle']
const ASPECT_RATIOS = ['16:9', '1:1', '4:5']
const TIMEOUT_MS = 180_000
const MIN_CONTENT_LENGTH = 100

export default function DiagramGenerator({ articleContentFr, articleContentEn, slug, onInsert, onCancel }) {
  const { t, i18n } = useTranslation()
  const [layoutType, setLayoutType] = useState('auto')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [instructions, setInstructions] = useState('')
  const [insertPosition, setInsertPosition] = useState('end')
  const [status, setStatus] = useState('idle')
  const [errorKind, setErrorKind] = useState(null)
  const [result, setResult] = useState(null)
  const [loadingIndex, setLoadingIndex] = useState(0)
  const [copiedKey, setCopiedKey] = useState(null)
  const [previewLang, setPreviewLang] = useState(() => (i18n.language || 'fr').startsWith('en') ? 'en' : 'fr')
  const [editingVariant, setEditingVariant] = useState(null)
  const [saving, setSaving] = useState(false)
  const intervalRef = useRef(null)

  const hasFr = (articleContentFr || '').length >= MIN_CONTENT_LENGTH
  const hasEn = (articleContentEn || '').length >= MIN_CONTENT_LENGTH
  const sectionsFr = extractH2Sections(articleContentFr || '')

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

  const loadingMessages = t('admin.diagram.loadingMessages', { returnObjects: true })
  const loadingList = Array.isArray(loadingMessages) ? loadingMessages : [t('admin.diagram.loading')]
  const currentLoadingMessage = loadingList[loadingIndex % loadingList.length]

  const canGenerate = hasFr || hasEn

  const handleEditSave = async (newScene) => {
    if (!editingVariant || !result) return
    setSaving(true)
    try {
      const blob = await renderExcalidrawToBlob(newScene)
      const url = await uploadBlob(blob, editingVariant)
      setResult((prev) => ({
        ...prev,
        [editingVariant]: {
          ...(prev[editingVariant] || { language: editingVariant }),
          url,
          scene: newScene,
        },
      }))
      setEditingVariant(null)
    } catch (err) {
      console.error('Edit save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  const uploadBlob = async (blob, language) => {
    const safeSlug = slugify(slug || 'untitled') || 'untitled'
    const filename = `diagrams/${safeSlug}-${language}-${Date.now()}.png`
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

  const handleSubmit = async () => {
    if (!canGenerate) return
    setStatus('loading')
    setErrorKind(null)
    setResult(null)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const requestedLanguages = [
      hasFr ? 'fr' : null,
      hasEn ? 'en' : null,
    ].filter(Boolean)

    try {
      const res = await fetch('/api/generate-diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleContentFr: hasFr ? articleContentFr : undefined,
          articleContentEn: hasEn ? articleContentEn : undefined,
          instructions: instructions.trim() || undefined,
          layoutType,
          aspectRatio,
          languages: requestedLanguages,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.error) {
        throw new Error(data.error || `http_${res.status}`)
      }

      const variants = {}
      const pending = []
      if (data.fr) {
        pending.push(
          renderExcalidrawToBlob(data.fr)
            .then((blob) => uploadBlob(blob, 'fr'))
            .then((url) => {
              variants.fr = { language: 'fr', url, scene: data.fr }
            })
        )
      }
      if (data.en) {
        pending.push(
          renderExcalidrawToBlob(data.en)
            .then((blob) => uploadBlob(blob, 'en'))
            .then((url) => {
              variants.en = { language: 'en', url, scene: data.en }
            })
        )
      }

      const settled = await Promise.allSettled(pending)
      const firstFailure = settled.find((r) => r.status === 'rejected')
      if (!variants.fr && !variants.en) {
        throw firstFailure?.reason || new Error('render_upload_failed')
      }

      setResult({ fr: variants.fr || null, en: variants.en || null })
      setStatus('preview')
    } catch (err) {
      clearTimeout(timeoutId)
      if (err.name === 'AbortError') {
        setErrorKind('timeout')
      } else {
        setErrorKind('generic')
      }
      setStatus('error')
      console.error('Diagram generation failed:', err.message || err)
    }
  }

  if (status === 'loading') {
    return (
      <div className="bg-surface border border-navy/[0.08] rounded-3xl p-8 md:p-10">
        <div className="flex flex-col items-center text-center py-8">
          <div className="relative mb-6">
            <div className="h-14 w-14 rounded-full border-[3px] border-accent/20 border-t-accent animate-spin" />
            <PenTool
              size={18}
              strokeWidth={2.5}
              className="text-accent absolute inset-0 m-auto"
              aria-hidden="true"
            />
          </div>
          <p className="font-heading font-bold text-navy text-lg mb-2">
            {t('admin.diagram.loading')}
          </p>
          <p
            key={loadingIndex}
            className="text-[13px] text-navy/60 mb-5 min-h-[20px] transition-opacity duration-300"
          >
            {currentLoadingMessage}
          </p>
          <p className="text-[11px] text-muted max-w-md leading-relaxed">
            {t('admin.diagram.loadingHint')}
          </p>
        </div>
      </div>
    )
  }

  if (status === 'preview' && result) {
    const availableVariants = [
      { key: 'fr', label: t('admin.diagram.labelFr'), data: result.fr },
      { key: 'en', label: t('admin.diagram.labelEn'), data: result.en },
    ].filter((v) => v.data)

    const activeKey = availableVariants.some((v) => v.key === previewLang)
      ? previewLang
      : availableVariants[0]?.key
    const activeVariant = availableVariants.find((v) => v.key === activeKey)

    return (
      <div className="bg-surface border border-navy/[0.08] rounded-3xl p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-accent/10 flex items-center justify-center">
              <PenTool size={18} strokeWidth={2} className="text-accent" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-navy text-lg leading-tight">
                {t('admin.diagram.previewTitle')}
              </h2>
              <p className="text-[12px] text-navy/60 mt-0.5">{t('admin.diagram.previewSubtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="h-8 w-8 shrink-0 rounded-full text-navy/50 hover:text-navy hover:bg-navy/[0.05] flex items-center justify-center transition-colors"
            aria-label={t('admin.diagram.cancel')}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {availableVariants.length > 1 && (
          <div className="flex items-center gap-1 mb-4 rounded-full border border-navy/10 p-1 w-fit">
            {availableVariants.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => setPreviewLang(v.key)}
                className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                  activeKey === v.key ? 'bg-navy text-white' : 'text-navy/55 hover:text-navy'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        {activeVariant && (
          <div className="space-y-3 mb-5">
            <div className="rounded-xl border border-navy/10 bg-white p-3">
              <img
                src={activeVariant.data.url}
                alt={activeVariant.label}
                className="max-w-full h-auto rounded-lg mx-auto block"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setEditingVariant(activeVariant.key)}
                className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-4 py-2 text-[12px] font-medium text-navy/75 hover:text-navy hover:border-navy/30 transition-colors"
              >
                <Pencil size={12} strokeWidth={2} />
                {t('admin.diagram.edit')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(JSON.stringify(activeVariant.data.scene, null, 2))
                    setCopiedKey(activeVariant.key)
                    setTimeout(() => setCopiedKey(null), 2000)
                  } catch (err) {
                    console.error('Clipboard write failed', err)
                  }
                }}
                className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-4 py-2 text-[12px] font-medium text-navy/75 hover:text-navy hover:border-navy/30 transition-colors"
              >
                {copiedKey === activeVariant.key ? (
                  <>
                    <Check size={12} strokeWidth={2.5} />
                    {t('admin.diagram.jsonCopied')}
                  </>
                ) : (
                  <>
                    <Copy size={12} strokeWidth={2} />
                    {t('admin.diagram.copyJson')}
                  </>
                )}
              </button>
            </div>
            <details className="rounded-xl border border-navy/10 bg-white/60 p-3">
              <summary className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy/60 cursor-pointer select-none">
                {t('admin.diagram.sceneJson')}
              </summary>
              <pre className="mt-3 whitespace-pre-wrap text-[11px] text-navy/70 font-mono leading-relaxed max-h-60 overflow-auto">
                {JSON.stringify(activeVariant.data.scene, null, 2)}
              </pre>
            </details>
          </div>
        )}

        <div className="mb-5 pt-5 border-t border-navy/[0.06]">
          <Field label={t('admin.diagram.insertPosition')}>
            <select
              value={insertPosition}
              onChange={(e) => setInsertPosition(e.target.value)}
              className={inputClass}
            >
              <option value="end">{t('admin.diagram.insertAtEnd')}</option>
              {sectionsFr.map((section, idx) => (
                <option key={`${idx}-${section.startOffset}`} value={String(idx)}>
                  {t('admin.diagram.insertAfter', { title: section.title })}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-5 border-t border-navy/[0.06]">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-navy/15 bg-white text-navy/75 px-5 py-2.5 text-[13px] font-medium hover:border-navy/25 hover:text-navy transition-colors"
          >
            {t('admin.diagram.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white text-navy/75 px-5 py-2.5 text-[13px] font-medium hover:border-navy/25 hover:text-navy transition-colors"
          >
            <RefreshCw size={14} strokeWidth={2} />
            {t('admin.diagram.regenerate')}
          </button>
          <button
            type="button"
            onClick={() => onInsert({ fr: result.fr, en: result.en, insertPosition })}
            className="inline-flex items-center gap-2 rounded-full bg-accent text-white px-6 py-2.5 text-[13px] font-heading font-semibold shadow-[var(--shadow-cta)] hover:brightness-95 hover:shadow-[var(--shadow-cta-hover)] transition-all"
          >
            <Plus size={14} strokeWidth={2.5} />
            {t('admin.diagram.insert')}
          </button>
        </div>

        {editingVariant && result[editingVariant] && (
          <ExcalidrawEditModal
            scene={result[editingVariant].scene}
            saving={saving}
            onSave={handleEditSave}
            onCancel={() => setEditingVariant(null)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="bg-surface border border-navy/[0.08] rounded-3xl p-6 md:p-8">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-accent/10 flex items-center justify-center">
            <PenTool size={18} strokeWidth={2} className="text-accent" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-navy text-lg leading-tight">
              {t('admin.diagram.title')}
            </h2>
            <p className="text-[12px] text-navy/60 mt-0.5">{t('admin.diagram.subtitle')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="h-8 w-8 shrink-0 rounded-full text-navy/50 hover:text-navy hover:bg-navy/[0.05] flex items-center justify-center transition-colors"
          aria-label={t('admin.diagram.cancel')}
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      {status === 'error' && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
          <AlertCircle size={16} strokeWidth={2} className="text-accent-deep mt-0.5 shrink-0" />
          <div className="flex-1 text-[13px] text-accent-deep">
            {errorKind === 'timeout'
              ? t('admin.diagram.errorTimeout')
              : t('admin.diagram.error')}
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t('admin.diagram.type')}>
            <select
              value={layoutType}
              onChange={(e) => setLayoutType(e.target.value)}
              className={inputClass}
            >
              {LAYOUT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`admin.diagram.types.${type}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('admin.diagram.format')}>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className={inputClass}
            >
              <option value="16:9">{t('admin.diagram.formats.landscape')}</option>
              <option value="1:1">{t('admin.diagram.formats.square')}</option>
              <option value="4:5">{t('admin.diagram.formats.portrait')}</option>
            </select>
          </Field>
        </div>

        <Field label={t('admin.diagram.instructions')}>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={2}
            placeholder={t('admin.diagram.instructionsPlaceholder')}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-5 border-t border-navy/[0.06]">
        <p className="text-[11px] text-muted">
          {!canGenerate
            ? t('admin.diagram.minContent')
            : hasFr && hasEn
            ? t('admin.diagram.bilingualHint')
            : t('admin.diagram.singleHint', { lang: hasFr ? t('admin.diagram.labelFr') : t('admin.diagram.labelEn') })}
        </p>
        <div className="flex flex-wrap items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-navy/15 bg-white text-navy/75 px-6 py-2.5 text-[13px] font-medium hover:border-navy/25 hover:text-navy transition-colors"
          >
            {t('admin.diagram.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canGenerate}
            className="inline-flex items-center gap-2 rounded-full bg-accent text-white px-6 py-2.5 text-[13px] font-heading font-semibold shadow-[var(--shadow-cta)] hover:brightness-95 hover:shadow-[var(--shadow-cta-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PenTool size={14} strokeWidth={2} />
            {status === 'error' ? t('admin.diagram.retry') : t('admin.diagram.generateButton')}
          </button>
        </div>
      </div>
    </div>
  )
}
