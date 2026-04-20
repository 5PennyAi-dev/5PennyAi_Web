import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import useScrollReveal from '@/hooks/useScrollReveal'
import { fetchPublishedPosts } from '@/lib/posts'
import BlogCard from '@/components/blog/BlogCard'
import SkeletonCard from '@/components/blog/SkeletonCard'

export default function LatestPosts() {
  const { t } = useTranslation()
  const ref = useScrollReveal()

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
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeader
          overline={t('latestPosts.overline')}
          title={t('latestPosts.title')}
          className="text-center"
        />

        {!loaded ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[0, 1, 2].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 stagger-children">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* View all link */}
        {loaded && posts.length > 0 && (
          <div className="text-center mt-12">
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
