import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles, X, AlertCircle } from 'lucide-react'
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
    </div>
  )
}
