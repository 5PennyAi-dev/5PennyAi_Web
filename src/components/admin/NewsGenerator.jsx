import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Newspaper, AlertCircle, Sparkles, Cpu } from 'lucide-react'
import { Field, inputClass } from '@/components/admin/editorPrimitives'
import { FORMATS } from '@/lib/contentFormats'

const TIMEOUT_MS = 300_000
const NEWS_ENDPOINT = FORMATS.find((f) => f.id === 'news')?.generationEndpoint ?? '/api/generate-news'

export default function NewsGenerator({ onGenerated, initialTopic = '' }) {
  const { t } = useTranslation()
  const [topic, setTopic] = useState(initialTopic)
  const [timeWindow, setTimeWindow] = useState('7d')
  const [count, setCount] = useState(3)
  const [instructions, setInstructions] = useState('')
  const [language, setLanguage] = useState('fr')
  const [status, setStatus] = useState('idle')
  const [errorKind, setErrorKind] = useState(null)
  const [newsInfo, setNewsInfo] = useState(null)
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

  const loadingMessages = [t('admin.news.loadingStep1'), t('admin.news.loadingStep2')]
  const currentLoadingMessage = loadingMessages[loadingIndex % loadingMessages.length]

  const handleSubmit = async () => {
    if (!topic.trim()) return
    setStatus('loading')
    setErrorKind(null)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const res = await fetch(NEWS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          timeWindow,
          count: Math.max(3, count),
          instructions: instructions.trim() || undefined,
          language,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!res.ok) throw new Error(`http_${res.status}`)

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setNewsInfo({ items_found: data.items_found, window_used: data.window_used })
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
      console.error('[NewsGenerator] Generation failed', err)
    }
  }

  if (status === 'loading') {
    return (
      <div className="bg-surface border border-navy/[0.08] rounded-3xl p-8 md:p-10">
        <div className="flex flex-col items-center text-center py-8">
          <div className="relative mb-6">
            <div className="h-14 w-14 rounded-full border-[3px] border-accent/20 border-t-accent animate-spin" />
            <Newspaper
              size={18}
              strokeWidth={2.5}
              className="text-accent absolute inset-0 m-auto"
              aria-hidden="true"
            />
          </div>
          <p className="font-heading font-bold text-navy text-lg mb-2">
            {t('admin.news.loading')}
          </p>
          <p
            key={loadingIndex}
            className="text-[13px] text-navy/60 mb-5 min-h-[20px] transition-opacity duration-300"
          >
            {currentLoadingMessage}
          </p>
          <p className="text-[11px] text-muted max-w-md leading-relaxed">
            {t('admin.news.loadingHint')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-navy/[0.08] rounded-3xl p-6 md:p-8">
      <div className="flex items-start gap-3 mb-5">
        <div className="h-10 w-10 shrink-0 rounded-full bg-steel/15 flex items-center justify-center">
          <Newspaper size={18} strokeWidth={2} className="text-steel-dark" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-navy text-lg leading-tight">
            {t('admin.news.title')}
          </h2>
          <p className="text-[12px] text-navy/60 mt-0.5">{t('admin.news.subtitle')}</p>
        </div>
      </div>

      {status === 'error' && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
          <AlertCircle size={16} strokeWidth={2} className="text-accent-deep mt-0.5 shrink-0" />
          <div className="flex-1 text-[13px] text-accent-deep">
            {errorKind === 'timeout'
              ? t('admin.news.errorTimeout')
              : t('admin.news.error')}
          </div>
        </div>
      )}

      <div className="space-y-5">
        <Field label={t('admin.news.topic')} required>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('admin.news.topicPlaceholder')}
            className={inputClass}
            required
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t('admin.news.timeWindow')}>
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value)}
              className={inputClass}
            >
              <option value="7d">{t('admin.news.timeWindow7d')}</option>
              <option value="14d">{t('admin.news.timeWindow14d')}</option>
              <option value="30d">{t('admin.news.timeWindow30d')}</option>
            </select>
          </Field>
          <Field label={t('admin.news.count')} hint={t('admin.news.countMin')}>
            <input
              type="number"
              value={count}
              min={3}
              step={1}
              onChange={(e) => setCount(Math.max(3, parseInt(e.target.value, 10) || 3))}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t('admin.news.language')}>
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

        <Field label={t('admin.news.instructions')}>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
            placeholder={t('admin.news.instructionsPlaceholder')}
            className={inputClass}
          />
        </Field>
      </div>

      {newsInfo && (
        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-emerald-700">
          <Newspaper size={11} strokeWidth={2} />
          <span>
            {t('admin.news.transparency', {
              count: newsInfo.items_found,
              window: newsInfo.window_used,
            })}
          </span>
        </div>
      )}

      <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-navy/35">
        <Cpu size={11} strokeWidth={2} />
        <span>{t('admin.studio.engines.label')} :</span>
        <span>{t('admin.studio.engines.news')}</span>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-6 mt-5 border-t border-navy/[0.06]">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!topic.trim() || status === 'loading'}
          className="inline-flex items-center gap-2 rounded-full bg-accent text-white px-6 py-2.5 text-[13px] font-heading font-semibold shadow-[var(--shadow-cta)] hover:brightness-95 hover:shadow-[var(--shadow-cta-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles size={14} strokeWidth={2} />
          {status === 'error' ? t('admin.news.regenerate') : t('admin.news.generate')}
        </button>
      </div>
    </div>
  )
}
