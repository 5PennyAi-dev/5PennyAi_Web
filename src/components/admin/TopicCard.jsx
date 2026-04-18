import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp, Bookmark, Star, PenLine, Trash2, Check, ArrowRight } from 'lucide-react'

const DIFFICULTY_COLORS = {
  'débutant': 'bg-green-100 text-green-800 border-green-300',
  'intermédiaire': 'bg-amber-100 text-amber-800 border-amber-300',
  'avancé': 'bg-red-100 text-red-800 border-red-300',
}

const COMPETITION_COLORS = {
  LOW: 'text-green-600',
  MEDIUM: 'text-amber-600',
  HIGH: 'text-red-600',
}

const COMPETITION_LABELS = {
  LOW: 'facile',
  MEDIUM: 'moyen',
  HIGH: 'élevé',
}

function SEOScoreBadge({ score }) {
  if (score == null) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-gray-100 text-gray-400">
        SEO: —
      </span>
    )
  }
  const tone =
    score >= 70
      ? 'bg-green-100 text-green-800 border-green-300'
      : score >= 40
        ? 'bg-amber-100 text-amber-800 border-amber-300'
        : 'bg-red-100 text-red-800 border-red-300'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${tone}`}>
      SEO: {score}
    </span>
  )
}

function formatVolume(vol) {
  if (vol == null) return '—'
  return vol >= 1000 ? `${(vol / 1000).toFixed(1).replace('.0', '')}k` : String(vol)
}

export default function TopicCard({
  topic,
  mode = 'result',
  isInBank = false,
  onSaveToBank,
  onMarkChosen,
  onWriteArticle,
  onUpdateStatus,
  onDelete,
}) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const seo = topic.seo_data || {}
  const primary = seo.primary_keyword || {}
  const seoScore = seo.seo_score ?? null
  const difficulty = topic.difficulty || ''
  const articleType = topic.article_type || ''

  const STATUS_BADGES = {
    saved: { label: t('admin.topics.bank.saved'), className: 'bg-blue-100 text-blue-800 border-blue-300' },
    chosen: { label: t('admin.topics.bank.chosen'), className: 'bg-orange-50 text-orange-800 border-orange-300' },
    written: { label: t('admin.topics.bank.written'), className: 'bg-green-100 text-green-800 border-green-300' },
  }

  return (
    <div
      className={`bg-white rounded-xl border p-5 transition-all duration-200 ${
        expanded ? 'border-2 border-accent/20 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {/* Collapsed header — always visible */}
      <div
        className="cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Top row: badges */}
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          {difficulty && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${DIFFICULTY_COLORS[difficulty] || 'bg-gray-100 text-gray-600'}`}>
              {t(`admin.topics.difficulty.${difficulty}`, difficulty)}
            </span>
          )}
          {articleType && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono bg-blue-50 text-blue-700">
              {articleType}
            </span>
          )}
          {topic.audience && (
            <span className="text-xs text-gray-500">{topic.audience}</span>
          )}
          {mode === 'bank' && topic.status && STATUS_BADGES[topic.status] && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGES[topic.status].className}`}>
              {STATUS_BADGES[topic.status].label}
            </span>
          )}
        </div>

        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading font-semibold text-navy text-[15px] leading-snug">
            {topic.title}
          </h3>
          <div className="flex items-center gap-2 shrink-0 mt-0.5">
            <SEOScoreBadge score={seoScore} />
            {expanded ? (
              <ChevronUp size={16} className="text-gray-400" />
            ) : (
              <ChevronDown size={16} className="text-gray-400" />
            )}
          </div>
        </div>

        {/* SEO data line */}
        {primary.keyword && (
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 font-mono flex-wrap">
            <span>
              {t('admin.topics.seo.volume')}: <strong className="text-navy">{formatVolume(primary.search_volume)}</strong>/mois
            </span>
            <span>
              {t('admin.topics.seo.difficulty')}:{' '}
              <strong className={COMPETITION_COLORS[primary.competition_level] || 'text-gray-600'}>
                {COMPETITION_LABELS[primary.competition_level] || '—'}
              </strong>
            </span>
            <span>
              {t('admin.topics.seo.cpc')}: <strong className="text-navy">{primary.cpc != null ? `${primary.cpc.toFixed(2)}$` : '—'}</strong>
            </span>
            <span>
              {t('admin.topics.seo.intent')}: <strong className="text-steel">{primary.search_intent || '—'}</strong>
            </span>
          </div>
        )}

        {/* Bank metadata */}
        {mode === 'bank' && (
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            {topic.created_at && (
              <span>{t('admin.topics.bank.savedAt')} {new Date(topic.created_at).toLocaleDateString('fr-CA')}</span>
            )}
            {topic.query && (
              <span className="truncate max-w-[200px]">· {topic.query}</span>
            )}
          </div>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
          {/* Problem */}
          {topic.problem && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Problème</p>
              <p className="text-sm text-navy">{topic.problem}</p>
            </div>
          )}

          {/* Angle */}
          {topic.angle && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Angle</p>
              <p className="text-sm text-navy">{topic.angle}</p>
            </div>
          )}

          {/* Blog precisions */}
          {topic.blog_precisions && (
            <div className="bg-surface rounded-xl p-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Précisions pour la rédaction</p>
              <p className="text-sm text-navy whitespace-pre-line">{topic.blog_precisions}</p>
            </div>
          )}

          {/* Keywords with volumes — EN keyword (metrics) → FR equivalent */}
          {seo.primary_keyword?.keyword && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Mots-clés</p>
              <div className="flex flex-wrap gap-2">
                {[seo.primary_keyword, ...(seo.secondary_keywords || [])].map((kw, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                    {kw.keyword}
                    {kw.search_volume != null && (
                      <span className="text-gray-400">({formatVolume(kw.search_volume)}/mo)</span>
                    )}
                    {kw.keyword_fr && (
                      <span className="text-gray-400">→ {kw.keyword_fr}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Keywords without SEO data — show FR keywords plain */}
          {!seo.primary_keyword?.keyword && topic.keywords?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Mots-clés</p>
              <div className="flex flex-wrap gap-2">
                {topic.keywords.map((kw, i) => (
                  <span key={i} className="inline-flex items-center text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                    {kw}
                    {topic.keywords_en?.[i] && (
                      <span className="text-gray-400 ml-1">(EN: {topic.keywords_en[i]})</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {topic.sources?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Sources</p>
              <ul className="space-y-1">
                {topic.sources.map((src, i) => (
                  <li key={i} className="text-xs text-steel truncate">
                    {src.startsWith('http') ? (
                      <a href={src} target="_blank" rel="noopener noreferrer" className="hover:underline">{src}</a>
                    ) : (
                      src
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap pt-2">
            {mode === 'result' && (
              <>
                {isInBank ? (
                  <span className="inline-flex items-center gap-1.5 text-green-700 text-xs font-medium">
                    <Check size={14} />
                    {t('admin.topics.results.inBank')}
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onSaveToBank?.(topic) }}
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors duration-150 inline-flex items-center gap-1.5"
                    >
                      <Bookmark size={13} />
                      {t('admin.topics.results.saveToBank')}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onMarkChosen?.(topic) }}
                      className="border border-accent/30 text-accent rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-accent/5 transition-colors duration-150 inline-flex items-center gap-1.5"
                    >
                      <Star size={13} />
                      {t('admin.topics.results.markChosen')}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onWriteArticle?.(topic) }}
                  className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-accent/90 transition-colors duration-200 inline-flex items-center gap-1.5 ml-auto"
                >
                  {t('admin.topics.results.writeArticle')}
                  <ArrowRight size={14} />
                </button>
              </>
            )}

            {mode === 'bank' && (
              <>
                {topic.status === 'saved' && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onUpdateStatus?.(topic.id, 'chosen') }}
                      className="border border-accent/30 text-accent rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-accent/5 transition-colors duration-150 inline-flex items-center gap-1.5"
                    >
                      <Star size={13} />
                      {t('admin.topics.bank.chosen')}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onWriteArticle?.(topic) }}
                      className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-accent/90 transition-colors duration-200 inline-flex items-center gap-1.5"
                    >
                      {t('admin.topics.results.writeArticle')}
                      <ArrowRight size={14} />
                    </button>
                  </>
                )}
                {topic.status === 'chosen' && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onUpdateStatus?.(topic.id, 'saved') }}
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors duration-150 inline-flex items-center gap-1.5"
                    >
                      <Bookmark size={13} />
                      {t('admin.topics.bank.saved')}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onWriteArticle?.(topic) }}
                      className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-accent/90 transition-colors duration-200 inline-flex items-center gap-1.5"
                    >
                      {t('admin.topics.results.writeArticle')}
                      <ArrowRight size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onUpdateStatus?.(topic.id, 'written') }}
                      className="border border-green-200 text-green-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-green-50 transition-colors duration-150 inline-flex items-center gap-1.5"
                    >
                      <Check size={13} />
                      {t('admin.topics.bank.written')}
                    </button>
                  </>
                )}
                {topic.status === 'written' && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onUpdateStatus?.(topic.id, 'saved') }}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors duration-150 inline-flex items-center gap-1.5"
                  >
                    <Bookmark size={13} />
                    {t('admin.topics.bank.saved')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm(t('admin.topics.bank.confirmRemove'))) {
                      onDelete?.(topic.id)
                    }
                  }}
                  className="border border-red-200 text-red-600 rounded-lg px-3 py-1.5 text-xs hover:bg-red-50 transition-colors duration-150 inline-flex items-center gap-1.5 ml-auto"
                >
                  <Trash2 size={13} />
                  {t('admin.topics.bank.remove')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
