import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Image as ImageIcon } from 'lucide-react'
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

export default function BlogCard({ post }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language?.startsWith('en') ? 'en' : 'fr'

  const title = localizedField(post, 'title', lang)
  const excerpt = localizedField(post, 'excerpt', lang)
  const visibleTags = (post.tags || []).slice(0, 2)

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block h-full bg-white border border-navy/[0.08] rounded-2xl overflow-hidden card-elevated hover:border-steel/40"
    >
      <div className="relative aspect-[16/9] bg-warm-gray overflow-hidden">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon size={36} strokeWidth={1.5} className="text-navy/25" />
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col h-[calc(100%-theme(aspectRatio.video))]">
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

        <h3 className="font-heading font-bold text-navy text-[18px] leading-snug tracking-tight line-clamp-2 group-hover:text-accent transition-colors">
          {title}
        </h3>

        {excerpt && (
          <p className="text-[14px] text-muted leading-relaxed mt-2 line-clamp-3">{excerpt}</p>
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
    </Link>
  )
}
