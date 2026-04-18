import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Image as ImageIcon } from 'lucide-react'
import { localizedField } from '@/lib/postI18n'
import { resolveCoverImage, resolveCoverAlt } from '@/lib/posts'

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

export default function FeaturedCard({ post }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language?.startsWith('en') ? 'en' : 'fr'

  const title = localizedField(post, 'title', lang)
  const excerpt = localizedField(post, 'excerpt', lang)
  const coverUrl = resolveCoverImage(post, lang)
  const coverAlt = resolveCoverAlt(post, lang) || title
  const visibleTags = (post.tags || []).slice(0, 3)

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block bg-white border border-navy/[0.08] rounded-2xl overflow-hidden card-elevated hover:border-steel/40 mb-8"
    >
      <div className="md:grid md:grid-cols-5 md:items-stretch">
        {/* Image — ~40% on desktop, strict 16:9 to preserve header composition */}
        <div className="relative md:col-span-2 aspect-[16/9] bg-warm-gray overflow-hidden">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={coverAlt}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon size={48} strokeWidth={1.5} className="text-navy/25" />
            </div>
          )}
          {/* Badge */}
          <span className="absolute top-4 left-4 bg-accent text-white text-[10px] font-bold uppercase tracking-[0.14em] px-3 py-1 rounded-full shadow-sm">
            {t('blog.featured.badge')}
          </span>
        </div>

        {/* Content — ~60% on desktop */}
        <div className="md:col-span-3 p-6 md:p-8 flex flex-col justify-center">
          {visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className="bg-lavender/50 text-navy text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h3 className="font-heading font-bold text-navy text-xl md:text-2xl leading-snug tracking-tight line-clamp-2 group-hover:text-accent transition-colors">
            {title}
          </h3>

          {excerpt && (
            <p className="text-[14px] text-muted leading-relaxed mt-3 line-clamp-3">
              {excerpt}
            </p>
          )}

          <div className="mt-5 pt-4 border-t border-navy/[0.06] flex items-center gap-2 text-[12px] text-muted tnum">
            <span>{formatDate(post.published_at, lang)}</span>
            {post.reading_time_minutes ? (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {post.reading_time_minutes} {t('blog.card.minRead')}
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  )
}
