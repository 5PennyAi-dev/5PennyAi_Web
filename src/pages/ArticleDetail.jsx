import { useEffect, useState } from 'react'
import { ArrowLeft, BookOpenText, Clock3, Image as ImageIcon } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArticleMarkdownContent } from '@/components/admin/resources/ArticlePreview'
import { calculateArticleReadingTime } from '@/lib/articleMarkdown'
import { loadPublishedArticleBySlug } from '@/lib/publicArticles'

const RESOURCES_PATH = '/ressources-ia'

export default function ArticleDetail() {
  const { slug } = useParams()
  return <ArticleDetailBySlug key={slug} slug={slug} />
}

function ArticleDetailBySlug({ slug }) {
  const { t, i18n } = useTranslation()
  const [result, setResult] = useState({ state: 'loading' })

  useEffect(() => {
    let cancelled = false
    loadPublishedArticleBySlug(slug)
      .then((next) => {
        if (!cancelled) setResult(next)
      })
      .catch((error) => {
        console.error('Unable to load published article:', error.message)
        if (!cancelled) setResult({ state: 'error' })
      })
    return () => { cancelled = true }
  }, [slug])

  if (result.state === 'loading') return <LoadingState t={t} />
  if (result.state === 'not-found') return <UnavailableState t={t} />
  if (result.state === 'error') {
    if (result.error) console.error('Unable to load published article:', result.error.message)
    return <UnavailableState isError t={t} />
  }

  return <ArticleContent result={result} t={t} locale={i18n.language?.startsWith('en') ? 'en-CA' : 'fr-CA'} />
}

export function ArticleContent({ result, t, locale }) {
  const { article, assets, assetUrls, coverUrl } = result
  const [coverFailed, setCoverFailed] = useState(false)
  const title = article.title || t('resourcesAi.article.fallbackTitle')
  const seoTitle = article.seo?.seoTitle || title
  const description = article.seo?.metaDescription || article.summary || t('resourcesAi.seo.listDescription')
  const readingTime = calculateArticleReadingTime(article.contentMarkdown)
  const publishedDate = formatDate(article.publishedAt, locale)
  const level = article.level ? t(`resourcesAi.levels.${article.level}`, { defaultValue: article.level }) : ''
  const series = formatSeries(article, t)

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={description} />
      </Helmet>
      <article className="min-h-[75vh] overflow-x-hidden bg-warm-gray pt-24 pb-20 md:pt-28 md:pb-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav aria-label={t('resourcesAi.article.breadcrumbLabel')} className="mb-8 flex flex-wrap items-center gap-2 text-sm text-navy/55">
            <Link to="/" className="font-medium hover:text-accent-deep">{t('nav.home')}</Link>
            <span aria-hidden="true">/</span>
            <Link to={RESOURCES_PATH} className="font-medium hover:text-accent-deep">{t('resourcesAi.title')}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="max-w-full truncate text-navy/75">{title}</span>
          </nav>

          <header className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
              {article.theme ? t('resourcesAi.article.typeWithTheme', { theme: article.theme }) : t('resourcesAi.article.type')}
            </p>
            <h1 className="text-display mt-4 text-4xl font-bold text-navy md:text-5xl">{title}</h1>
            {article.subtitle && <p className="mt-5 text-lg leading-relaxed text-muted md:text-xl">{article.subtitle}</p>}
            {article.summary && <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-navy/75">{article.summary}</p>}
            {(series || level || readingTime || publishedDate) && (
              <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-sm text-navy/65">
                {series && <span className="rounded-full bg-white px-3.5 py-1.5">{series}</span>}
                {level && <span className="rounded-full bg-lavender/35 px-3.5 py-1.5">{level}</span>}
                {readingTime > 0 && <span className="inline-flex items-center gap-1.5 rounded-full bg-steel/15 px-3.5 py-1.5"><Clock3 size={14} aria-hidden="true" />{t('resourcesAi.article.readingTime', { count: readingTime })}</span>}
                {publishedDate && <time dateTime={article.publishedAt} className="rounded-full bg-white px-3.5 py-1.5">{t('resourcesAi.article.publishedOn', { date: publishedDate })}</time>}
              </div>
            )}
          </header>

          <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-2xl border border-navy/[0.08] bg-white">
            <div className="aspect-video">
              {coverUrl && !coverFailed ? <img src={coverUrl} alt={article.cover?.altText || ''} onError={() => setCoverFailed(true)} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center bg-lavender/25 text-navy/35"><ImageIcon size={52} strokeWidth={1.3} aria-hidden="true" /></div>}
            </div>
          </div>

          {(article.learningObjectives.length > 0 || article.prerequisites.length > 0) && (
            <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
              <LearningList title={t('resourcesAi.article.objectives')} values={article.learningObjectives} />
              <LearningList title={t('resourcesAi.article.prerequisites')} values={article.prerequisites} />
            </div>
          )}

          <div className="mx-auto mt-10 max-w-3xl space-y-9 rounded-2xl border border-gray-200 bg-white p-5 sm:p-8 md:p-10">
            <ArticleMarkdownContent assets={assets} assetUrls={assetUrls} form={article} mode="public" t={t} />
          </div>

          <div className="mt-10 text-center">
            <Link to={RESOURCES_PATH} className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:border-accent hover:text-accent-deep"><ArrowLeft size={16} aria-hidden="true" />{t('resourcesAi.article.back')}</Link>
          </div>
        </div>
      </article>
    </>
  )
}

function LearningList({ title, values }) {
  if (!values.length) return null
  return <section className="rounded-xl border border-gray-200 bg-white p-5"><h2 className="font-heading text-lg font-semibold text-navy">{title}</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-navy/75">{values.map((value, index) => <li key={index}>{value}</li>)}</ul></section>
}

function LoadingState({ t }) {
  return <section className="min-h-[75vh] bg-warm-gray pt-32 pb-24" aria-live="polite" aria-busy="true"><p className="sr-only">{t('resourcesAi.article.loading')}</p><div className="mx-auto max-w-3xl animate-pulse px-4 text-center"><div className="mx-auto h-3 w-28 rounded bg-gray-200" /><div className="mx-auto mt-6 h-11 w-4/5 rounded bg-gray-200" /><div className="mx-auto mt-4 h-5 w-2/3 rounded bg-gray-100" /><div className="mt-12 aspect-video rounded-2xl bg-gray-200" /></div></section>
}

function UnavailableState({ isError = false, t }) {
  return <><Helmet><title>{t('resourcesAi.article.unavailableSeoTitle')}</title><meta name="robots" content="noindex, follow" /></Helmet><section className="flex min-h-[75vh] items-center bg-warm-gray pt-24 pb-20"><div className="mx-auto max-w-xl px-4 text-center sm:px-6"><BookOpenText size={30} className="mx-auto text-steel" aria-hidden="true" /><h1 className="mt-5 text-3xl font-bold text-navy">{isError ? t('resourcesAi.article.errorTitle') : t('resourcesAi.article.unavailableTitle')}</h1><p className="mt-4 leading-relaxed text-muted">{isError ? t('resourcesAi.article.errorDescription') : t('resourcesAi.article.unavailableDescription')}</p><Link to={RESOURCES_PATH} className="mt-8 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep"><ArrowLeft size={16} aria-hidden="true" />{t('resourcesAi.article.back')}</Link></div></section></>
}

function formatSeries(article, t) {
  const episode = Number.isInteger(article.series?.episodeNumber) && article.series.episodeNumber > 0 ? t('resourcesAi.episode', { number: article.series.episodeNumber }) : ''
  return [article.series?.name, episode].filter(Boolean).join(' · ')
}

function formatDate(value, locale) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date)
}
