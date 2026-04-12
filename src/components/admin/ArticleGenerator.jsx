import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles, X, AlertCircle, ClipboardPaste, Check, Search, AlertTriangle } from 'lucide-react'
import { Field, inputClass } from '@/components/admin/editorPrimitives'

const ARTICLE_TYPES = ['list', 'tutorial', 'caseStudy', 'news', 'myth']
const TIMEOUT_MS = 180_000

export default function ArticleGenerator({ onGenerated, onCancel, initialTopic = '' }) {
  const { t } = useTranslation()
  const [topic, setTopic] = useState(initialTopic)
  const [articleType, setArticleType] = useState('list')
  const [instructions, setInstructions] = useState('')
  const [language, setLanguage] = useState('fr')
  const [status, setStatus] = useState('idle')
  const [errorKind, setErrorKind] = useState(null)
  const [loadingIndex, setLoadingIndex] = useState(0)
  const [pasteSuccess, setPasteSuccess] = useState(false)
  const [clipboardError, setClipboardError] = useState(null)
  const [showManualPaste, setShowManualPaste] = useState(false)
  const [manualPasteText, setManualPasteText] = useState('')
  const [researchUsed, setResearchUsed] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    setTopic(initialTopic)
  }, [initialTopic])

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

  const loadingMessages = t('admin.generator.loadingMessages', { returnObjects: true })
  const loadingList = Array.isArray(loadingMessages) ? loadingMessages : [t('admin.generator.loading')]
  const currentLoadingMessage = loadingList[loadingIndex % loadingList.length]

  function parseTopicFinderClipboard(text) {
    if (!text || (!text.includes('SUJET :') && !text.includes('SUJET:'))) {
      return null
    }
    const lines = text.split('\n').filter((l) => l.trim())
    let sujet = ''
    let type = ''
    let precisions = ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (/^SUJET\s*:/.test(trimmed)) {
        sujet = trimmed.replace(/^SUJET\s*:\s*/, '')
      } else if (/^TYPE\s*:/.test(trimmed)) {
        type = trimmed.replace(/^TYPE\s*:\s*/, '')
      } else if (/^PR[ÉE]CISIONS\s*:/.test(trimmed)) {
        precisions = trimmed.replace(/^PR[ÉE]CISIONS\s*:\s*/, '')
      }
    }
    return { sujet, type, precisions }
  }

  function mapArticleType(topicFinderType) {
    const mapping = {
      'Liste (X façons de...)': 'list',
      'Guide pratique': 'tutorial',
      'Comparaison': 'list',
      'Étude de cas': 'caseStudy',
      'Opinion / Éditorial': 'news',
      'Tutoriel pas-à-pas': 'tutorial',
    }
    if (mapping[topicFinderType]) return mapping[topicFinderType]

    const normalized = topicFinderType.toLowerCase()
    if (normalized.includes('liste')) return 'list'
    if (normalized.includes('guide') || normalized.includes('tutoriel')) return 'tutorial'
    if (normalized.includes('cas')) return 'caseStudy'
    if (normalized.includes('opinion') || normalized.includes('actualité')) return 'news'
    if (normalized.includes('démystif') || normalized.includes('myth')) return 'myth'
    if (normalized.includes('comparaison')) return 'list'
    return 'tutorial'
  }

  function applyParsedData(parsed) {
    setTopic(parsed.sujet)
    if (parsed.type) setArticleType(mapArticleType(parsed.type))
    setInstructions(parsed.precisions)
    setClipboardError(null)
    setShowManualPaste(false)
    setManualPasteText('')
    setPasteSuccess(true)
    setTimeout(() => setPasteSuccess(false), 2500)
  }

  async function handlePasteFromTopicFinder() {
    setClipboardError(null)
    try {
      const text = await navigator.clipboard.readText()
      const parsed = parseTopicFinderClipboard(text)
      if (!parsed) {
        setClipboardError(t('admin.generator.pasteFormatError'))
        return
      }
      applyParsedData(parsed)
    } catch {
      setShowManualPaste(true)
    }
  }

  function handleManualPasteApply() {
    const parsed = parseTopicFinderClipboard(manualPasteText)
    if (!parsed) {
      setClipboardError(t('admin.generator.pasteFormatError'))
      return
    }
    applyParsedData(parsed)
  }

  const handleSubmit = async () => {
    if (!topic.trim()) return
    setStatus('loading')
    setErrorKind(null)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const res = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          articleType,
          instructions: instructions.trim() || undefined,
          language,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!res.ok) {
        throw new Error(`http_${res.status}`)
      }

      const data = await res.json()
      if (data.error) {
        throw new Error(data.error)
      }

      setResearchUsed(data._research_used ?? null)
      setStatus('idle')
      onGenerated(data)
    } catch (err) {
      clearTimeout(timeoutId)
      if (err.name === 'AbortError') {
        setErrorKind('timeout')
      } else {
        setErrorKind('generic')
      }
      setStatus('error')
      console.error('Generation failed', err)
    }
  }

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
            {t('admin.generator.loading')}
          </p>
          <p
            key={loadingIndex}
            className="text-[13px] text-navy/60 mb-5 min-h-[20px] transition-opacity duration-300"
          >
            {currentLoadingMessage}
          </p>
          <p className="text-[11px] text-muted max-w-md leading-relaxed">
            {t('admin.generator.loadingHint')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-navy/[0.08] rounded-3xl p-6 md:p-8">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-accent/10 flex items-center justify-center">
            <Sparkles size={18} strokeWidth={2} className="text-accent" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-navy text-lg leading-tight">
              {t('admin.generator.title')}
            </h2>
            <p className="text-[12px] text-navy/60 mt-0.5">{t('admin.generator.subtitle')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="h-8 w-8 shrink-0 rounded-full text-navy/50 hover:text-navy hover:bg-navy/[0.05] flex items-center justify-center transition-colors"
          aria-label={t('admin.generator.cancel')}
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      {status === 'error' && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
          <AlertCircle size={16} strokeWidth={2} className="text-accent-deep mt-0.5 shrink-0" />
          <div className="flex-1 text-[13px] text-accent-deep">
            {errorKind === 'timeout'
              ? t('admin.generator.errorTimeout')
              : t('admin.generator.error')}
          </div>
        </div>
      )}

      {/* Topic Finder paste */}
      <div className="mb-5">
        {!showManualPaste ? (
          <button
            type="button"
            onClick={handlePasteFromTopicFinder}
            className="group w-full flex items-center gap-3 rounded-xl border border-dashed border-navy/20 bg-navy/[0.02] px-4 py-3 text-left transition-all duration-200 hover:border-solid hover:border-accent/40 hover:bg-accent/[0.04]"
          >
            {pasteSuccess ? (
              <div className="h-8 w-8 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check size={16} strokeWidth={2.5} className="text-emerald-600" />
              </div>
            ) : (
              <div className="h-8 w-8 shrink-0 rounded-full bg-navy/[0.06] flex items-center justify-center transition-colors group-hover:bg-accent/10">
                <ClipboardPaste size={15} strokeWidth={2} className="text-navy/50 transition-colors group-hover:text-accent" />
              </div>
            )}
            <div className="min-w-0">
              <p className={`text-[13px] font-medium leading-tight transition-colors ${pasteSuccess ? 'text-emerald-700' : 'text-navy/70 group-hover:text-navy'}`}>
                {pasteSuccess ? t('admin.generator.pasteSuccess') : t('admin.generator.pasteFromTopicFinder')}
              </p>
              {!pasteSuccess && (
                <p className="text-[11px] text-navy/40 mt-0.5">{t('admin.generator.pasteHint')}</p>
              )}
            </div>
          </button>
        ) : (
          <div className="rounded-xl border border-dashed border-navy/20 bg-navy/[0.02] p-4 space-y-3">
            <textarea
              value={manualPasteText}
              onChange={(e) => setManualPasteText(e.target.value)}
              rows={4}
              placeholder={t('admin.generator.pasteManualLabel')}
              className={inputClass}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualPasteApply}
                disabled={!manualPasteText.trim()}
                className="rounded-full bg-accent text-white px-4 py-1.5 text-[12px] font-medium hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('admin.generator.pasteManualApply')}
              </button>
              <button
                type="button"
                onClick={() => { setShowManualPaste(false); setManualPasteText(''); setClipboardError(null) }}
                className="rounded-full border border-navy/15 text-navy/60 px-4 py-1.5 text-[12px] font-medium hover:text-navy transition-colors"
              >
                {t('admin.generator.cancel')}
              </button>
            </div>
          </div>
        )}

        {clipboardError && (
          <p className="mt-2 text-[12px] text-accent-deep bg-accent/5 border border-accent/20 rounded-lg px-3 py-2">
            {clipboardError}
          </p>
        )}
      </div>

      <div className="space-y-5">
        <Field label={t('admin.generator.topic')} required>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={2}
            placeholder={t('admin.generator.topicPlaceholder')}
            className={inputClass}
            required
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t('admin.generator.type')}>
            <select
              value={articleType}
              onChange={(e) => setArticleType(e.target.value)}
              className={inputClass}
            >
              {ARTICLE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`admin.generator.types.${type}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('admin.generator.language')}>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={inputClass}
            >
              <option value="fr">{t('admin.generator.languageFr')}</option>
              <option value="en">{t('admin.generator.languageEn')}</option>
            </select>
          </Field>
        </div>

        <Field label={t('admin.generator.instructions')}>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
            placeholder={t('admin.generator.instructionsPlaceholder')}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-6 mt-5 border-t border-navy/[0.06]">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-navy/15 bg-white text-navy/75 px-6 py-2.5 text-[13px] font-medium hover:border-navy/25 hover:text-navy transition-colors"
        >
          {t('admin.generator.cancel')}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!topic.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-accent text-white px-6 py-2.5 text-[13px] font-heading font-semibold shadow-[var(--shadow-cta)] hover:brightness-95 hover:shadow-[var(--shadow-cta-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles size={14} strokeWidth={2} />
          {status === 'error' ? t('admin.generator.retry') : t('admin.generator.generate')}
        </button>
      </div>

      {researchUsed !== null && (
        <div className={`mt-4 flex items-center gap-2 text-[12px] ${researchUsed ? 'text-emerald-700' : 'text-accent-deep'}`}>
          {researchUsed ? (
            <>
              <Search size={13} strokeWidth={2} className="shrink-0" />
              <span>{t('admin.generator.researchUsed')}</span>
            </>
          ) : (
            <>
              <AlertTriangle size={13} strokeWidth={2} className="shrink-0" />
              <span>{t('admin.generator.researchNotUsed')}</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
