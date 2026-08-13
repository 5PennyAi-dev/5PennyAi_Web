import { ArrowLeft, LoaderCircle, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PromptContent from '@/components/resources/PromptContent'
import ResourceShareActions from '@/components/resources/ResourceShareActions'
import { loadPublishedPromptBySlug } from '@/lib/publicPrompts'
import {
  buildPromptBreadcrumbStructuredData,
  buildPromptSeoMetadata,
  serializeJsonLd,
} from '@/lib/promptSeo'

const RESOURCES_PATH = '/ressources-ia'

export default function PromptDetail() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const [result, setResult] = useState({ state: 'loading' })

  useEffect(() => {
    let cancelled = false
    loadPublishedPromptBySlug(slug).then((next) => {
      if (!cancelled) setResult({ ...next, requestedSlug: slug })
    })
    return () => { cancelled = true }
  }, [slug])

  const currentResult = result.requestedSlug === slug ? result : { state: 'loading' }
  if (currentResult.state === 'loading') return <PromptPageState loading t={t} />
  if (currentResult.state !== 'found') return <PromptPageState t={t} />

  const { prompt, thumbnailUrl } = currentResult
  const metadata = buildPromptSeoMetadata(prompt)
  const breadcrumbData = buildPromptBreadcrumbStructuredData(prompt, metadata)
  const shareActions = (
    <ResourceShareActions
      resourceType="prompt"
      title={metadata.headline}
      shareText={prompt.summary}
      canonicalUrl={metadata.canonicalUrl}
      className="mt-5 !mx-0 !max-w-none"
    />
  )

  return (
    <>
      <Helmet>
        <html lang={metadata.language} />
        <title>{metadata.pageTitle}</title>
        <meta name="description" content={metadata.description} />
        <meta name="robots" content={metadata.robots} />
        <link rel="canonical" href={metadata.canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={metadata.siteName} />
        <meta property="og:title" content={metadata.socialTitle} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:url" content={metadata.canonicalUrl} />
        <meta property="og:image" content={metadata.imageUrl} />
        <meta property="og:image:alt" content={metadata.imageAlt} />
        <meta property="og:locale" content={metadata.ogLocale} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.socialTitle} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content={metadata.imageUrl} />
        <meta name="twitter:image:alt" content={metadata.imageAlt} />
        <script type="application/ld+json">{serializeJsonLd(breadcrumbData)}</script>
      </Helmet>
      <section className="min-h-[90vh] bg-warm-gray pb-20 pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Link to={RESOURCES_PATH} className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep">
            <ArrowLeft size={16} aria-hidden="true" />{t('resourcesAi.prompt.back')}
          </Link>
          <PromptContent prompt={prompt} thumbnailUrl={thumbnailUrl} shareActions={shareActions} t={t} />
        </div>
      </section>
    </>
  )
}

function PromptPageState({ loading = false, t }) {
  return (
    <>
      {!loading && <Helmet><title>{t('resourcesAi.prompt.unavailableSeoTitle')}</title></Helmet>}
      <section className="flex min-h-[75vh] items-center bg-warm-gray pb-20 pt-28">
        <div className="mx-auto max-w-xl px-4 text-center sm:px-6">
          {loading
            ? <LoaderCircle size={32} className="mx-auto animate-spin text-steel" aria-hidden="true" />
            : <Sparkles size={32} className="mx-auto text-steel" aria-hidden="true" />}
          <h1 className="mt-5 font-heading text-3xl font-bold text-navy">
            {loading ? t('resourcesAi.prompt.loading') : t('resourcesAi.prompt.unavailableTitle')}
          </h1>
          {!loading && <p className="mt-4 leading-relaxed text-muted">{t('resourcesAi.prompt.unavailableDescription')}</p>}
          {!loading && <Link to={RESOURCES_PATH} className="mt-8 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"><ArrowLeft size={16} aria-hidden="true" />{t('resourcesAi.prompt.back')}</Link>}
        </div>
      </section>
    </>
  )
}
