import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Image as ImageIcon } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import useScrollReveal from '@/hooks/useScrollReveal'
import { fetchPublishedPosts, resolveCoverImage, resolveCoverAlt } from '@/lib/posts'
import { localizedField } from '@/lib/postI18n'

function formatDate(dateString, lang) {
  if (!dateString) return ''
  try {
    return new Intl.DateTimeFormat(lang === 'en' ? 'en-CA' : 'fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString))
  } catch {
    return ''
  }
}

export default function LatestPosts() {
  const { t, i18n } = useTranslation()
  const ref = useScrollReveal()
  const lang = i18n.language?.startsWith('en') ? 'en' : 'fr'

  const [posts, setPosts] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchPublishedPosts({ limit: 3 })
      .then((data) => {
        if (!cancelled) setPosts(data)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => { cancelled = true }
  }, [])

  // Don't render section if no posts after loading
  if (loaded && posts.length === 0) return null

  return (
    <section ref={ref} className="reveal py-24 md:py-32 bg-warm-gray relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        <SectionHeader
          overline={t('latestPosts.overline')}
          title={t('latestPosts.title')}
          className="text-center"
        />

        {!loaded ? (
          /* Skeleton placeholders */
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white border border-navy/[0.08] rounded-2xl p-4 md:p-5 flex gap-5">
                <div className="w-[140px] md:w-[180px] aspect-[16/10] rounded-xl bg-navy/[0.04] animate-pulse shrink-0" />
                <div className="flex-1 py-1 space-y-3">
                  <div className="h-3 w-24 rounded bg-navy/[0.06] animate-pulse" />
                  <div className="h-5 w-3/4 rounded bg-navy/[0.08] animate-pulse" />
                  <div className="h-4 w-full rounded bg-navy/[0.05] animate-pulse" />
                  <div className="h-4 w-2/3 rounded bg-navy/[0.05] animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 stagger-children">
            {posts.map((post) => {
              const title = localizedField(post, 'title', lang)
              const excerpt = localizedField(post, 'excerpt', lang)
              const coverUrl = resolveCoverImage(post, lang)
              const coverAlt = resolveCoverAlt(post, lang) || title

              return (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group flex flex-col sm:flex-row bg-white border border-navy/[0.08] rounded-2xl overflow-hidden card-elevated hover:border-steel/40"
                >
                  {/* Thumbnail */}
                  <div className="sm:w-[180px] md:w-[220px] shrink-0 aspect-[16/10] sm:aspect-auto bg-warm-gray overflow-hidden">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={coverAlt}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center min-h-[120px]">
                        <ImageIcon size={28} strokeWidth={1.5} className="text-navy/20" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 md:p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-[12px] text-muted tnum mb-2">
                      <span>{formatDate(post.published_at, lang)}</span>
                      {post.reading_time_minutes ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{post.reading_time_minutes} {t('latestPosts.minRead')}</span>
                        </>
                      ) : null}
                    </div>

                    <h3 className="font-heading font-bold text-navy text-[16px] md:text-[17px] leading-snug tracking-tight line-clamp-1 group-hover:text-accent transition-colors mb-1.5">
                      {title}
                    </h3>

                    {excerpt && (
                      <p className="text-muted text-[14px] leading-relaxed line-clamp-2 mb-3">
                        {excerpt}
                      </p>
                    )}

                    <span className="inline-flex items-center gap-1 text-accent text-[13px] font-medium group-hover:gap-2 transition-all">
                      {t('latestPosts.readMore')}
                      <ArrowRight size={14} strokeWidth={2} />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* View all link */}
        {loaded && posts.length > 0 && (
          <div className="text-center mt-10">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 rounded-full px-6 py-2.5 text-[13px] font-bold uppercase tracking-[0.12em]
                         border border-navy/15 text-navy/60 hover:text-navy hover:border-navy/35 transition-colors"
            >
              {t('latestPosts.viewAll')}
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
