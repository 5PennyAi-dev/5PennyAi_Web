import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, ArrowRight, Copy, Check } from 'lucide-react'
import useScrollReveal from '@/hooks/useScrollReveal'
import Button from '@/components/ui/Button'
import BookingButton from '@/components/ui/BookingButton'
import { fetchPostBySlug, fetchAdjacentPosts } from '@/lib/posts'
import { localizedField } from '@/lib/postI18n'
import { markdownComponents } from '@/components/blog/markdownComponents'

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

export default function BlogPost() {
  const { slug } = useParams()
  const { t, i18n } = useTranslation()
  const lang = i18n.language?.startsWith('en') ? 'en' : 'fr'
  const heroRef = useScrollReveal()
  const bodyRef = useScrollReveal()

  const [state, setState] = useState({
    slug: null,
    post: null,
    adjacent: { previous: null, next: null },
    loading: true,
    notFound: false,
  })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchPostBySlug(slug)
      .then(async (data) => {
        if (cancelled) return
        if (!data) {
          setState({
            slug,
            post: null,
            adjacent: { previous: null, next: null },
            loading: false,
            notFound: true,
          })
          return
        }
        const adjacent = await fetchAdjacentPosts(data.published_at)
        if (cancelled) return
        setState({ slug, post: data, adjacent, loading: false, notFound: false })
      })
      .catch((err) => {
        console.error('Failed to load post', err)
        if (cancelled) return
        setState({
          slug,
          post: null,
          adjacent: { previous: null, next: null },
          loading: false,
          notFound: true,
        })
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  const loading = state.loading || state.slug !== slug
  const notFound = state.notFound && state.slug === slug
  const post = state.slug === slug ? state.post : null
  const adjacent = state.slug === slug ? state.adjacent : { previous: null, next: null }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-muted text-sm">{t('blog.loading')}</p>
      </div>
    )
  }

  if (notFound || !post) {
    return <NotFoundBlock t={t} />
  }

  const title = localizedField(post, 'title', lang)
  const excerpt = localizedField(post, 'excerpt', lang)
  const content = localizedField(post, 'content', lang)
  const metaTitle = localizedField(post, 'meta_title', lang) || title
  const metaDescription = localizedField(post, 'meta_description', lang) || excerpt
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed', err)
    }
  }

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`

  return (
    <>
      <Helmet>
        <title>{`${metaTitle} — 5PennyAi`}</title>
        {metaDescription && <meta name="description" content={metaDescription} />}
        <meta property="og:title" content={metaTitle} />
        {metaDescription && <meta property="og:description" content={metaDescription} />}
        <meta property="og:type" content="article" />
        {post.cover_image && <meta property="og:image" content={post.cover_image} />}
        {post.published_at && (
          <meta property="article:published_time" content={post.published_at} />
        )}
      </Helmet>

      {/* Hero */}
      <section
        ref={heroRef}
        className="reveal relative pt-36 pb-16 md:pt-40 md:pb-20 overflow-hidden bg-grain"
        style={{
          backgroundColor: '#0D2240',
          backgroundImage:
            'radial-gradient(ellipse 80% 70% at 70% 20%, rgba(221,135,55,0.16), transparent 60%), ' +
            'radial-gradient(ellipse 70% 70% at 20% 100%, rgba(129,174,215,0.20), transparent 60%), ' +
            'radial-gradient(ellipse 100% 100% at 50% 50%, #143054 0%, #0D2240 80%)',
        }}
      >
        <div className="absolute inset-0 bg-dot-grid-dark opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center z-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.14] rounded-full px-4 py-1.5 mb-6 backdrop-blur-md text-white/75 hover:text-white hover:border-white/30 transition-colors"
          >
            <ArrowLeft size={12} strokeWidth={2} />
            <span className="uppercase tracking-[0.2em] text-[11px] font-bold">
              {t('blog.hero.overline')}
            </span>
          </Link>

          <h1 className="text-display text-[2rem] md:text-[2.75rem] lg:text-[3.25rem] font-bold text-white mb-5 leading-[1.1]">
            {title}
          </h1>

          <div className="flex items-center justify-center gap-2 text-[13px] text-white/55 tnum">
            {post.published_at && <span>{formatDate(post.published_at, lang)}</span>}
            {post.reading_time_minutes ? (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {post.reading_time_minutes} {t('blog.card.minRead')}
                </span>
              </>
            ) : null}
            {post.author && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {t('blog.post.by')} {post.author}
                </span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Body */}
      <article ref={bodyRef} className="reveal py-16 md:py-20">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6">
          {post.cover_image && (
            <img
              src={post.cover_image}
              alt={title}
              className="w-full aspect-video object-cover rounded-2xl mb-10 shadow-[var(--shadow-card)]"
            />
          )}

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-8">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-lavender/50 text-navy text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="blog-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {content}
            </ReactMarkdown>
          </div>

          {/* Share */}
          <div className="mt-16 pt-8 border-t border-navy/[0.08]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-navy/55 mb-4">
              {t('blog.post.share')}
            </p>
            <div className="flex flex-wrap gap-3">
              <ShareLink href={linkedInUrl} icon={<LinkedInGlyph />} label="LinkedIn" />
              <ShareLink href={twitterUrl} icon={<TwitterGlyph />} label="X / Twitter" />
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-4 py-2 text-[13px] font-medium text-navy/75 hover:text-navy hover:border-navy/30 transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={14} strokeWidth={2} className="text-accent" />
                    <span>{t('blog.post.copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} strokeWidth={2} />
                    <span>{t('blog.post.copyLink')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Prev / next */}
          {(adjacent.previous || adjacent.next) && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdjacentLink
                post={adjacent.previous}
                label={t('blog.post.prev')}
                direction="prev"
                lang={lang}
              />
              <AdjacentLink
                post={adjacent.next}
                label={t('blog.post.next')}
                direction="next"
                lang={lang}
              />
            </div>
          )}

          {/* CTA */}
          <div
            className="mt-16 rounded-3xl p-10 md:p-12 text-center overflow-hidden relative bg-grain ring-inner-highlight"
            style={{
              backgroundColor: '#0D2240',
              backgroundImage:
                'radial-gradient(ellipse 70% 80% at 80% 0%, rgba(221,135,55,0.18), transparent 60%), ' +
                'radial-gradient(ellipse 70% 80% at 20% 100%, rgba(129,174,215,0.18), transparent 60%), ' +
                'radial-gradient(ellipse 100% 100% at 50% 50%, #143054 0%, #0D2240 80%)',
            }}
          >
            <div className="absolute inset-0 bg-dot-grid-dark opacity-25 pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-display text-[1.75rem] md:text-[2rem] font-bold text-white mb-3">
                {t('blog.post.cta.title')}
              </h3>
              <p className="text-white/65 text-[15px] mb-7 max-w-md mx-auto leading-relaxed">
                {t('blog.post.cta.subtitle')}
              </p>
              <BookingButton variant="primary" className="px-8 py-3.5 text-[15px]">
                {t('blog.post.cta.button')}
              </BookingButton>
            </div>
          </div>
        </div>
      </article>
    </>
  )
}

function LinkedInGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function TwitterGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function ShareLink({ href, icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-4 py-2 text-[13px] font-medium text-navy/75 hover:text-navy hover:border-navy/30 transition-colors"
    >
      {icon}
      <span>{label}</span>
    </a>
  )
}

function AdjacentLink({ post, label, direction, lang }) {
  if (!post) {
    return <div className="hidden md:block" aria-hidden="true" />
  }
  const title = localizedField(post, 'title', lang)
  const alignRight = direction === 'next'
  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`group flex flex-col gap-2 rounded-2xl border border-navy/[0.08] bg-white p-5 card-elevated hover:border-steel/40 ${
        alignRight ? 'md:text-right md:items-end' : ''
      }`}
    >
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
        {direction === 'prev' && <ArrowLeft size={12} strokeWidth={2} />}
        {label}
        {direction === 'next' && <ArrowRight size={12} strokeWidth={2} />}
      </span>
      <span className="font-heading font-semibold text-navy text-[15px] leading-snug line-clamp-2 group-hover:text-accent transition-colors">
        {title}
      </span>
    </Link>
  )
}

function NotFoundBlock({ t }) {
  return (
    <section className="pt-36 pb-24 md:pt-40 md:pb-28">
      <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-warm-gray rounded-3xl border border-navy/[0.06] p-12 md:p-16">
          <h1 className="font-heading font-bold text-navy text-2xl md:text-3xl mb-3">
            {t('blog.notFound.title')}
          </h1>
          <p className="text-muted text-[14px] leading-relaxed mb-6">
            {t('blog.notFound.subtitle')}
          </p>
          <Button variant="outline" to="/blog">
            {t('blog.notFound.back')}
          </Button>
        </div>
      </div>
    </section>
  )
}
