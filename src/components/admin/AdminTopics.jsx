import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, TrendingUp, HelpCircle, Lightbulb, Inbox } from 'lucide-react'
import TopicCard from '@/components/admin/TopicCard'
import { saveSearch, saveTopic, loadTopics, updateTopicStatus, deleteTopic } from '@/lib/topics'

const LOADING_STEPS = [
  { key: 'loading1', minMs: 0 },
  { key: 'loading2', minMs: 10000 },
  { key: 'loading3', minMs: 20000 },
  { key: 'loading4', minMs: 30000 },
]

const BANK_FILTERS = ['all', 'saved', 'chosen', 'written']

export default function AdminTopics() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Search state
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [loadingStep, setLoadingStep] = useState(0)
  const loadingTimer = useRef(null)

  // Results state
  const [results, setResults] = useState(null)
  const [searchId, setSearchId] = useState(null)
  const [seoAvailable, setSeoAvailable] = useState(true)

  // Bank state
  const [bankTopics, setBankTopics] = useState([])
  const [bankLoading, setBankLoading] = useState(true)
  const [bankFilter, setBankFilter] = useState('all')

  // Stepper
  const currentStep = results ? (seoAvailable ? 2 : 1) : searching ? 1 : 0

  // Track which result titles are already in the bank
  const bankTitles = new Set(bankTopics.map((t) => t.title))

  // ── Load bank on mount ──────────────────────────────────────────────
  const refreshBank = useCallback(async () => {
    try {
      const data = await loadTopics()
      setBankTopics(data)
    } catch (err) {
      console.error('Failed to load topics bank:', err)
    } finally {
      setBankLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshBank()
  }, [refreshBank])

  // ── Loading step progression ────────────────────────────────────────
  useEffect(() => {
    if (!searching) {
      clearInterval(loadingTimer.current)
      return
    }
    const started = Date.now()
    setLoadingStep(0)
    loadingTimer.current = setInterval(() => {
      const elapsed = Date.now() - started
      const step = LOADING_STEPS.findIndex((s, i) => {
        const next = LOADING_STEPS[i + 1]
        return !next || elapsed < next.minMs
      })
      setLoadingStep(step >= 0 ? step : LOADING_STEPS.length - 1)
    }, 1000)
    return () => clearInterval(loadingTimer.current)
  }, [searching])

  // ── Search handler ──────────────────────────────────────────────────
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim() || searching) return

    setSearching(true)
    setSearchError(null)
    setResults(null)
    setSearchId(null)

    try {
      const res = await fetch('/api/search-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}`)
      }

      setResults(data)
      setSeoAvailable(data.seo_available !== false)

      // Save search to Supabase
      try {
        const search = await saveSearch({
          query: query.trim(),
          raw_research: data.raw_research || '',
          trends: data.trends || [],
          raw_questions: data.raw_questions || [],
          content_gaps: data.content_gaps || [],
        })
        setSearchId(search.id)
      } catch (err) {
        console.error('Failed to save search:', err)
      }
    } catch (err) {
      console.error('Search failed:', err)
      setSearchError(err.message)
    } finally {
      setSearching(false)
    }
  }

  // ── Topic actions ───────────────────────────────────────────────────
  const handleSaveToBank = async (topic) => {
    try {
      await saveTopic(topic, searchId)
      await refreshBank()
    } catch (err) {
      console.error('Failed to save topic:', err)
    }
  }

  const handleMarkChosen = async (topic) => {
    try {
      const saved = await saveTopic({ ...topic, status: 'chosen' }, searchId)
      // Update the saved topic's status to chosen
      await updateTopicStatus(saved.id, 'chosen')
      await refreshBank()
    } catch (err) {
      console.error('Failed to mark topic as chosen:', err)
    }
  }

  const handleWriteArticle = async (topic) => {
    let topicId = topic.id || null

    // Save to bank as "chosen" if not already saved
    if (!topicId && !bankTitles.has(topic.title)) {
      try {
        const saved = await saveTopic(topic, searchId)
        topicId = saved.id
        await updateTopicStatus(topicId, 'chosen')
        await refreshBank()
      } catch (err) {
        console.error('Failed to save topic before writing:', err)
      }
    } else if (topicId) {
      // Already in bank — update status to "chosen"
      try {
        await updateTopicStatus(topicId, 'chosen')
        await refreshBank()
      } catch (err) {
        console.error('Failed to update topic status:', err)
      }
    }

    navigate('/admin/blog/new', {
      state: {
        fromTopicFinder: true,
        topicId,
        topic: topic.title,
        articleType: topic.article_type,
        instructions: topic.blog_precisions,
        seoData: topic.seo_data,
        keywords: topic.keywords,
        keywords_en: topic.keywords_en,
        sources: topic.sources,
      },
    })
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateTopicStatus(id, status)
      await refreshBank()
    } catch (err) {
      console.error('Failed to update topic status:', err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteTopic(id)
      setBankTopics((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error('Failed to delete topic:', err)
    }
  }

  // ── Bank filtering ──────────────────────────────────────────────────
  const filteredBank = bankFilter === 'all'
    ? bankTopics
    : bankTopics.filter((t) => t.status === bankFilter)

  const bankCounts = {
    all: bankTopics.length,
    saved: bankTopics.filter((t) => t.status === 'saved').length,
    chosen: bankTopics.filter((t) => t.status === 'chosen').length,
    written: bankTopics.filter((t) => t.status === 'written').length,
  }

  return (
    <div className="space-y-8">
      {/* Stepper */}
      <div className="flex items-center gap-3">
        <StepperDot active={currentStep >= 1} completed={currentStep > 1} label={t('admin.topics.stepper.research')} number={1} />
        <div className="w-8 h-px bg-gray-200" />
        <StepperDot active={currentStep >= 2} completed={currentStep > 2} label={t('admin.topics.stepper.seo')} number={2} />
        <div className="w-8 h-px bg-gray-200" />
        <StepperDot active={currentStep >= 3} completed={false} label={t('admin.topics.stepper.writing')} number={3} />
      </div>

      {/* Search form */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          {t('admin.topics.stepper.research')}
        </p>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('admin.topics.search.placeholder')}
              disabled={searching}
              className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2.5 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200 disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="bg-accent text-white rounded-full px-6 py-2.5 font-semibold text-sm hover:bg-accent/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 shrink-0"
          >
            {searching ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                {t(`admin.topics.search.${LOADING_STEPS[loadingStep].key}`)}
              </>
            ) : (
              t('admin.topics.search.button')
            )}
          </button>
        </form>
      </div>

      {/* Error message */}
      {searchError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {searchError}
        </div>
      )}

      {/* SEO unavailable notice */}
      {results && !seoAvailable && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
          {t('admin.topics.seo.unavailable')}
        </div>
      )}

      {/* Results */}
      {results && results.topics?.length > 0 && (
        <div className="space-y-6">
          {/* Topic cards */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              {results.topics.length} {t('admin.topics.results.title')}
            </p>
            <div className="space-y-3">
              {results.topics.map((topic, i) => (
                <TopicCard
                  key={i}
                  topic={topic}
                  mode="result"
                  isInBank={bankTitles.has(topic.title)}
                  onSaveToBank={handleSaveToBank}
                  onMarkChosen={handleMarkChosen}
                  onWriteArticle={handleWriteArticle}
                />
              ))}
            </div>
          </div>

          {/* Trends */}
          {results.trends?.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <TrendingUp size={14} />
                {t('admin.topics.trends.title')}
              </h3>
              <ul className="space-y-1.5">
                {results.trends.map((trend, i) => (
                  <li key={i} className="text-sm text-navy">↗ {trend}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Content gaps / Opportunities */}
          {results.content_gaps?.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Lightbulb size={14} />
                {t('admin.topics.gaps.title')}
              </h3>
              <ul className="space-y-1.5">
                {results.content_gaps.map((gap, i) => (
                  <li key={i} className="text-sm text-navy">◆ {gap}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Questions */}
          {results.raw_questions?.length > 0 && (
            <div className="bg-surface rounded-xl p-5">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <HelpCircle size={14} />
                {t('admin.topics.questions.title')}
              </h3>
              <ul className="space-y-2">
                {results.raw_questions.map((q, i) => (
                  <li key={i} className="text-sm text-navy border-l-2 border-gray-300 pl-3">
                    &laquo; {q} &raquo;
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Separator */}
      <hr className="border-gray-200" />

      {/* Bank section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-navy font-heading">
            {t('admin.topics.bank.title')} ({bankCounts.all})
          </h2>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {BANK_FILTERS.map((filter) => {
            const label = t(`admin.topics.bank.${filter === 'all' ? 'all' : filter}`)
            const count = bankCounts[filter]
            const isActive = bankFilter === filter
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setBankFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors duration-200 ${
                  isActive
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'
                }`}
              >
                {label} ({count})
              </button>
            )
          })}
        </div>

        {/* Bank content */}
        {bankLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : filteredBank.length === 0 ? (
          <div className="text-center py-12">
            <Inbox size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">{t('admin.topics.bank.empty')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('admin.topics.bank.emptySubtitle')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBank.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                mode="bank"
                onUpdateStatus={handleUpdateStatus}
                onWriteArticle={handleWriteArticle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StepperDot({ active, completed, label, number }) {
  const bg = completed
    ? 'bg-green-100 text-green-700'
    : active
      ? 'bg-accent text-white'
      : 'bg-gray-100 text-gray-400'
  return (
    <div className="flex items-center gap-2">
      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${bg}`}>
        {number}
      </span>
      <span className={`text-sm font-medium ${active || completed ? 'text-navy' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  )
}
