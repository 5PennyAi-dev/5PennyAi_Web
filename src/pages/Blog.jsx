import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Feather, Search, X, ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react'
import useScrollReveal from '@/hooks/useScrollReveal'
import useDebounce from '@/hooks/useDebounce'
import ShaderBackground from '@/components/ui/ShaderBackground'
import BlogCard from '@/components/blog/BlogCard'
import FeaturedCard from '@/components/blog/FeaturedCard'
import SkeletonCard from '@/components/blog/SkeletonCard'
import SortSelect from '@/components/blog/SortSelect'
import { fetchAllPublishedPosts } from '@/lib/posts'
import { localizedField } from '@/lib/postI18n'

const PAGE_SIZE = 6
const TAG_LIMIT = 8

export default function Blog() {
  const { t, i18n } = useTranslation()
  const heroRef = useScrollReveal()
  const listRef = useScrollReveal()
  const gridRef = useRef(null)

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTag, setActiveTag] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [tagsExpanded, setTagsExpanded] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  const debouncedSearch = useDebounce(searchInput, 300)
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const lang = i18n.language?.startsWith('en') ? 'en' : 'fr'

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchAllPublishedPosts()
      .then((data) => {
        if (!cancelled) setPosts(data)
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to load posts', err)
          setError(err)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const tagData = useMemo(() => {
    const counts = {}
    posts.forEach((p) => (p.tags || []).forEach((tag) => { counts[tag] = (counts[tag] || 0) + 1 }))
    const sorted = Object.entries(counts)
      .sort(([a, ca], [b, cb]) => cb - ca || a.localeCompare(b))
    return { counts, tags: sorted.map(([tag]) => tag) }
  }, [posts])

  const { paginatedPosts, totalFiltered, totalPages } = useMemo(() => {
    let result = [...posts]

    if (activeTag) {
      result = result.filter((p) => (p.tags || []).includes(activeTag))
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase()
      result = result.filter((p) => {
        const title = localizedField(p, 'title', lang).toLowerCase()
        const excerpt = localizedField(p, 'excerpt', lang).toLowerCase()
        return title.includes(q) || excerpt.includes(q)
      })
    }

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.published_at) - new Date(b.published_at))
    } else if (sortBy === 'readingTime') {
      result.sort((a, b) => (a.reading_time_minutes || 0) - (b.reading_time_minutes || 0))
    }

    const totalFiltered = result.length
    const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE))
    const safePage = Math.min(currentPage, totalPages)
    const start = (safePage - 1) * PAGE_SIZE
    const paginatedPosts = result.slice(start, start + PAGE_SIZE)

    return { paginatedPosts, totalFiltered, totalPages }
  }, [posts, activeTag, debouncedSearch, sortBy, currentPage, lang])

  // Reset to page 1 when filters change (skip initial mount)
  const filtersRef = useRef({ activeTag, debouncedSearch, sortBy })
  useEffect(() => {
    const prev = filtersRef.current
    filtersRef.current = { activeTag, debouncedSearch, sortBy }

    const changed =
      prev.activeTag !== activeTag ||
      prev.debouncedSearch !== debouncedSearch ||
      prev.sortBy !== sortBy

    if (!changed) return

    setSearchParams((p) => {
      const next = new URLSearchParams(p)
      next.delete('page')
      return next
    }, { replace: true })
  }, [activeTag, debouncedSearch, sortBy, setSearchParams])

  const goToPage = useCallback((page) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (page <= 1) {
        next.delete('page')
      } else {
        next.set('page', String(page))
      }
      return next
    }, { replace: true })

    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [setSearchParams])

  const handleTagClick = (tag) => {
    setActiveTag((prev) => (prev === tag ? null : tag))
  }

  const handleReset = () => {
    setSearchInput('')
    setActiveTag(null)
  }

  const hasActiveFilters = debouncedSearch.trim() || activeTag
  const showNoResults = !loading && totalFiltered === 0 && hasActiveFilters
  const showEmpty = !loading && posts.length === 0 && !hasActiveFilters
  const showFeatured = currentPage === 1 && !hasActiveFilters && paginatedPosts.length > 0
  const gridKey = `${currentPage}-${activeTag}-${debouncedSearch}-${sortBy}`

  return (
    <>
      <Helmet>
        <title>{t('seo.blog.title')}</title>
        <meta name="description" content={t('seo.blog.description')} />
        <meta property="og:title" content={t('seo.blog.title')} />
        <meta property="og:description" content={t('seo.blog.description')} />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero */}
      <section
        ref={heroRef}
        className="reveal relative pt-36 pb-24 md:pt-40 md:pb-28 overflow-hidden bg-grain"
        style={{
          backgroundColor: '#0D2240',
          backgroundImage:
            'radial-gradient(ellipse 80% 70% at 70% 20%, rgba(221,135,55,0.16), transparent 60%), ' +
            'radial-gradient(ellipse 70% 70% at 20% 100%, rgba(129,174,215,0.20), transparent 60%), ' +
            'radial-gradient(ellipse 100% 100% at 50% 50%, #143054 0%, #0D2240 80%)',
        }}
      >
        <ShaderBackground />
        <div className="absolute inset-0 bg-dot-grid-dark opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center z-10">
          <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.14] rounded-full px-4 py-1.5 mb-6 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(221,135,55,0.6)]" />
            <span className="text-white/75 uppercase tracking-[0.2em] text-[11px] font-bold">
              {t('blog.hero.overline')}
            </span>
          </div>
          <h1 className="text-display text-[2.25rem] md:text-[3.25rem] lg:text-[4rem] font-bold text-white mb-5">
            {t('blog.hero.title')}
          </h1>
          <p className="text-white/65 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {t('blog.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Filters + grid */}
      <section ref={listRef} className="reveal py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Search bar */}
          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('blog.search.placeholder')}
                className="w-full pl-11 pr-10 py-2.5 rounded-full border border-navy/15 bg-white
                           text-[14px] text-navy placeholder:text-navy/40
                           focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10
                           transition-colors"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/40 hover:text-navy transition-colors"
                  aria-label={t('blog.search.clear')}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Tag filters */}
          {tagData.tags.length > 0 && (() => {
            const visibleTags = tagsExpanded ? tagData.tags : tagData.tags.slice(0, TAG_LIMIT)
            const hasMore = tagData.tags.length > TAG_LIMIT
            return (
              <div className="mb-8">
                <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none">
                  <TagPill
                    active={activeTag === null}
                    label={t('blog.filters.all')}
                    count={posts.length}
                    onClick={() => handleTagClick(null)}
                  />
                  {visibleTags.map((tag) => (
                    <TagPill
                      key={tag}
                      active={activeTag === tag}
                      label={tag}
                      count={tagData.counts[tag]}
                      onClick={() => handleTagClick(tag)}
                    />
                  ))}
                  {hasMore && (
                    <button
                      type="button"
                      onClick={() => setTagsExpanded((v) => !v)}
                      className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.14em]
                                 border border-navy/15 text-navy/50 hover:text-navy hover:border-navy/35 transition-colors whitespace-nowrap"
                    >
                      {tagsExpanded ? t('blog.filters.showLess') : t('blog.filters.showAll')}
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${tagsExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                </div>
              </div>
            )
          })()}

          {/* Results bar */}
          {!loading && totalFiltered > 0 && (
            <div className="flex items-center justify-between mb-8">
              <p className="text-[13px] text-muted tabular-nums">
                {activeTag
                  ? t('blog.articleCountFor', { count: totalFiltered, tag: activeTag })
                  : t('blog.articleCount', { count: totalFiltered })}
              </p>
              <SortSelect value={sortBy} onChange={setSortBy} />
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div>
              {currentPage === 1 && !hasActiveFilters && <SkeletonCard featured />}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Array.from({ length: currentPage === 1 && !hasActiveFilters ? 5 : 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
          ) : showEmpty ? (
            <EmptyState t={t} />
          ) : showNoResults ? (
            <div className="text-center py-16">
              <p className="text-muted text-[14px] mb-4">{t('blog.empty.filtered')}</p>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-full px-5 py-2 text-[12px] font-bold uppercase tracking-[0.14em]
                           border border-accent text-accent hover:bg-accent/10 transition-colors"
              >
                {t('blog.empty.reset')}
              </button>
            </div>
          ) : (
            <div key={gridKey} className="card-enter">
              {showFeatured && <FeaturedCard post={paginatedPosts[0]} />}
              <div
                ref={gridRef}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 scroll-mt-24"
              >
                {(showFeatured ? paginatedPosts.slice(1) : paginatedPosts).map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-14 mb-4">
                  <button
                    type="button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5
                               text-[12px] font-bold uppercase tracking-[0.14em]
                               border border-navy/15 text-navy/60
                               hover:text-navy hover:border-navy/35 transition-colors
                               disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <ArrowLeft size={14} />
                    {t('blog.pagination.previous')}
                  </button>
                  <span className="text-[13px] text-muted tabular-nums">
                    {t('blog.pagination.pageOf', { current: Math.min(currentPage, totalPages), total: totalPages })}
                  </span>
                  <button
                    type="button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5
                               text-[12px] font-bold uppercase tracking-[0.14em]
                               border border-navy/15 text-navy/60
                               hover:text-navy hover:border-navy/35 transition-colors
                               disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {t('blog.pagination.next')}
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="text-center text-[13px] text-accent-deep mt-6">
              {error.message || 'Error'}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function TagPill({ active, label, count, onClick }) {
  const base =
    'rounded-full px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.14em] border transition-colors duration-200 whitespace-nowrap'
  const activeClass = 'bg-accent border-accent text-white'
  const idleClass =
    'bg-transparent border-navy/15 text-navy/60 hover:text-navy hover:border-navy/35'
  return (
    <button type="button" onClick={onClick} className={`${base} ${active ? activeClass : idleClass}`}>
      {label}{count != null ? ` (${count})` : ''}
    </button>
  )
}

function EmptyState({ t }) {
  return (
    <div className="max-w-xl mx-auto text-center bg-warm-gray rounded-3xl border border-navy/[0.06] p-12 md:p-16">
      <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-accent/10 flex items-center justify-center">
        <Feather size={24} strokeWidth={1.8} className="text-accent" />
      </div>
      <h2 className="font-heading font-bold text-navy text-xl md:text-2xl mb-2">
        {t('blog.empty.title')}
      </h2>
      <p className="text-muted text-[14px] leading-relaxed">{t('blog.empty.subtitle')}</p>
    </div>
  )
}
