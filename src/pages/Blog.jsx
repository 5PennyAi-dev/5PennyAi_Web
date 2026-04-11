import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Feather } from 'lucide-react'
import useScrollReveal from '@/hooks/useScrollReveal'
import Button from '@/components/ui/Button'
import ShaderBackground from '@/components/ui/ShaderBackground'
import BlogCard from '@/components/blog/BlogCard'
import { fetchPublishedPosts } from '@/lib/posts'

const PAGE_SIZE = 10

export default function Blog() {
  const { t } = useTranslation()
  const heroRef = useScrollReveal()
  const listRef = useScrollReveal()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [activeTag, setActiveTag] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchPublishedPosts({ limit: PAGE_SIZE, offset: 0 })
      .then((data) => {
        if (cancelled) return
        setPosts(data)
        setOffset(data.length)
        setHasMore(data.length === PAGE_SIZE)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Failed to load posts', err)
        setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleLoadMore = async () => {
    setLoadingMore(true)
    try {
      const more = await fetchPublishedPosts({ limit: PAGE_SIZE, offset })
      setPosts((prev) => [...prev, ...more])
      setOffset((prev) => prev + more.length)
      setHasMore(more.length === PAGE_SIZE)
    } catch (err) {
      console.error('Failed to load more posts', err)
    } finally {
      setLoadingMore(false)
    }
  }

  const availableTags = useMemo(() => {
    const set = new Set()
    posts.forEach((p) => (p.tags || []).forEach((tag) => set.add(tag)))
    return Array.from(set).sort()
  }, [posts])

  const filteredPosts = useMemo(() => {
    if (!activeTag) return posts
    return posts.filter((p) => (p.tags || []).includes(activeTag))
  }, [posts, activeTag])

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
          {availableTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              <TagPill
                active={activeTag === null}
                label={t('blog.filters.all')}
                onClick={() => setActiveTag(null)}
              />
              {availableTags.map((tag) => (
                <TagPill
                  key={tag}
                  active={activeTag === tag}
                  label={tag}
                  onClick={() => setActiveTag(tag)}
                />
              ))}
            </div>
          )}

          {loading ? (
            <div className="text-center text-muted py-20">{t('blog.loading')}</div>
          ) : filteredPosts.length === 0 ? (
            <EmptyState t={t} />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 stagger-children">
                {filteredPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              {hasMore && !activeTag && (
                <div className="flex justify-center mt-14">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? t('blog.loading') : t('blog.loadMore')}
                  </Button>
                </div>
              )}
            </>
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

function TagPill({ active, label, onClick }) {
  const base =
    'rounded-full px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.14em] border transition-colors duration-200'
  const activeClass = 'bg-accent/10 border-accent text-accent-deep'
  const idleClass =
    'bg-transparent border-navy/15 text-navy/60 hover:text-navy hover:border-navy/35'
  return (
    <button type="button" onClick={onClick} className={`${base} ${active ? activeClass : idleClass}`}>
      {label}
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
