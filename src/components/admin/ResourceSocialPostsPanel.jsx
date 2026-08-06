import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Image as ImageIcon,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { buildDefaultSocialImageUrl } from '@/lib/siteConfig'
import {
  buildSocialPostCopyText,
  getSocialHashtagState,
  getSocialPostLengthState,
  hashtagsToInput,
  requestResourceSocialPosts,
  SOCIAL_POST_LIMITS,
} from '@/lib/resourceSocialPosts'

const EMPTY_POSTS = Object.freeze({ facebook: null, linkedin: null })
const PLATFORMS = ['facebook', 'linkedin']

export default function ResourceSocialPostsPanel({
  disabledReason = '',
  publicUrl = '',
  resourceId,
  resourceType,
  socialImageUrl,
  status = 'draft',
  title = '',
}) {
  const { t } = useTranslation()
  const [posts, setPosts] = useState(EMPTY_POSTS)
  const [loadingInitial, setLoadingInitial] = useState(false)
  const [loadingPlatform, setLoadingPlatform] = useState({ facebook: false, linkedin: false })
  const [errorInitial, setErrorInitial] = useState('')
  const [platformErrors, setPlatformErrors] = useState({ facebook: '', linkedin: '' })
  const [copiedPlatform, setCopiedPlatform] = useState('')
  const [manualCopyPlatform, setManualCopyPlatform] = useState('')
  const [imageFailureStage, setImageFailureStage] = useState(0)
  const manualCopyRefs = useRef({})
  const copyTimer = useRef(null)
  const requestLocks = useRef({ initial: false, facebook: false, linkedin: false })
  const available = Boolean(resourceId && publicUrl && !disabledReason)
  const hasPosts = PLATFORMS.some((platform) => posts[platform])

  useEffect(() => {
    setPosts(EMPTY_POSTS)
    setErrorInitial('')
    setPlatformErrors({ facebook: '', linkedin: '' })
    setCopiedPlatform('')
    setManualCopyPlatform('')
    setImageFailureStage(0)
  }, [resourceId, resourceType])

  useEffect(() => setImageFailureStage(0), [socialImageUrl])

  useEffect(() => {
    if (!manualCopyPlatform) return
    const field = manualCopyRefs.current[manualCopyPlatform]
    field?.focus()
    field?.select()
  }, [manualCopyPlatform])

  useEffect(() => () => clearTimeout(copyTimer.current), [])

  const getAccessToken = async () => {
    try {
      const { data } = await supabase.auth.getSession()
      return data.session?.access_token || ''
    } catch {
      return ''
    }
  }

  const generateInitial = async () => {
    if (!available || requestLocks.current.initial || loadingPlatform.facebook || loadingPlatform.linkedin) return
    requestLocks.current.initial = true
    setLoadingInitial(true)
    setErrorInitial('')
    try {
      const result = await requestResourceSocialPosts({
        getAccessToken,
        resourceId,
        resourceType,
      })
      setPosts({
        facebook: toEditablePost(result.facebook),
        linkedin: toEditablePost(result.linkedin),
      })
    } catch (error) {
      setErrorInitial(error?.code || 'generation_failed')
    } finally {
      requestLocks.current.initial = false
      setLoadingInitial(false)
    }
  }

  const regeneratePlatform = async (platform) => {
    if (!available || loadingInitial || requestLocks.current[platform]) return
    requestLocks.current[platform] = true
    setLoadingPlatform((current) => ({ ...current, [platform]: true }))
    setPlatformErrors((current) => ({ ...current, [platform]: '' }))
    try {
      const result = await requestResourceSocialPosts({
        getAccessToken,
        platform,
        resourceId,
        resourceType,
      })
      setPosts((current) => ({ ...current, [platform]: toEditablePost(result[platform]) }))
    } catch (error) {
      setPlatformErrors((current) => ({
        ...current,
        [platform]: error?.code || 'generation_failed',
      }))
    } finally {
      requestLocks.current[platform] = false
      setLoadingPlatform((current) => ({ ...current, [platform]: false }))
    }
  }

  const updatePost = (platform, field, value) => {
    setPosts((current) => ({
      ...current,
      [platform]: { ...current[platform], [field]: value },
    }))
    setCopiedPlatform('')
    setManualCopyPlatform('')
  }

  const copyPost = async (platform) => {
    const post = posts[platform]
    if (!available || !post) return
    const copyText = buildSocialPostCopyText({ ...post, publicUrl })
    setManualCopyPlatform('')
    try {
      if (!globalThis.navigator?.clipboard?.writeText) throw new Error('clipboard_unavailable')
      await globalThis.navigator.clipboard.writeText(copyText)
      setCopiedPlatform(platform)
      clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopiedPlatform(''), 2000)
    } catch {
      setCopiedPlatform('')
      setManualCopyPlatform(platform)
    }
  }

  const fallbackImage = buildDefaultSocialImageUrl()
  const previewImage = imageFailureStage === 2
    ? ''
    : imageFailureStage === 1
      ? fallbackImage
      : socialImageUrl || fallbackImage
  const typeLabel = t(`admin.resourcesAi.socialPosts.resourceTypes.${resourceType}`)
  const statusLabel = t(`admin.resourcesAi.socialPosts.statuses.${status === 'published' ? 'published' : 'draft'}`)

  return (
    <div className="space-y-5">
      <div className="grid overflow-hidden rounded-2xl border border-navy/10 bg-surface/60 md:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.2fr)]">
        <div className="aspect-video min-h-44 bg-navy/5 md:aspect-auto">
          {previewImage ? (
            <img
              src={previewImage}
              alt={t('admin.resourcesAi.socialPosts.previewImageAlt', { title: title || typeLabel })}
              onError={() => setImageFailureStage(previewImage === fallbackImage ? 2 : 1)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-44 items-center justify-center text-navy/45">
              <ImageIcon size={34} aria-hidden="true" />
              <span className="sr-only">{t('admin.resourcesAi.socialPosts.imageUnavailable')}</span>
            </div>
          )}
        </div>
        <div className="min-w-0 p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-navy px-3 py-1 text-white">{typeLabel}</span>
            <span className="rounded-full border border-navy/15 bg-white px-3 py-1 text-navy">{statusLabel}</span>
          </div>
          <h3 className="mt-4 break-words font-heading text-lg font-bold text-navy">
            {title || t('admin.resourcesAi.socialPosts.untitled')}
          </h3>
          {publicUrl && status === 'published' ? (
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block break-all text-sm text-accent-deep underline decoration-accent/40 underline-offset-2">
              {publicUrl}
            </a>
          ) : publicUrl ? (
            <p className="mt-2 break-all text-sm text-accent-deep">{publicUrl}</p>
          ) : (
            <p className="mt-2 text-sm text-muted">{t('admin.resourcesAi.socialPosts.urlUnavailable')}</p>
          )}
        </div>
      </div>

      {status !== 'published' && resourceId && (
        <div className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950" role="status">
          <AlertTriangle className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
          <p>{t('admin.resourcesAi.socialPosts.draftWarning')}</p>
        </div>
      )}

      {disabledReason && (
        <div className="flex gap-3 rounded-xl border border-navy/15 bg-white p-4 text-sm text-navy" role="status">
          <AlertTriangle className="mt-0.5 shrink-0 text-accent" size={18} aria-hidden="true" />
          <p>{t(`admin.resourcesAi.socialPosts.disabled.${disabledReason}`)}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">{t('admin.resourcesAi.socialPosts.localOnly')}</p>
        <button
          type="button"
          disabled={!available || loadingInitial || loadingPlatform.facebook || loadingPlatform.linkedin}
          onClick={generateInitial}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingInitial ? <LoaderCircle className="animate-spin" size={17} aria-hidden="true" /> : <RefreshCw size={17} aria-hidden="true" />}
          {t(`admin.resourcesAi.socialPosts.${loadingInitial ? 'generating' : hasPosts ? 'generateAgain' : 'generate'}`)}
        </button>
      </div>

      <div aria-live="polite" className="sr-only">
        {loadingInitial ? t('admin.resourcesAi.socialPosts.generating') : ''}
      </div>
      {errorInitial && <GenerationError code={errorInitial} t={t} />}

      {hasPosts && (
        <div className="grid gap-5 xl:grid-cols-2">
          {PLATFORMS.map((platform) => posts[platform] && (
            <PlatformEditor
              key={platform}
              copyText={buildSocialPostCopyText({ ...posts[platform], publicUrl })}
              error={platformErrors[platform]}
              loading={loadingPlatform[platform]}
              manualCopy={manualCopyPlatform === platform}
              manualCopyRef={(node) => { manualCopyRefs.current[platform] = node }}
              onCopy={() => copyPost(platform)}
              onRegenerate={() => regeneratePlatform(platform)}
              onUpdate={(field, value) => updatePost(platform, field, value)}
              platform={platform}
              post={posts[platform]}
              copied={copiedPlatform === platform}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function PlatformEditor({
  copied,
  copyText,
  error,
  loading,
  manualCopy,
  manualCopyRef,
  onCopy,
  onRegenerate,
  onUpdate,
  platform,
  post,
  t,
}) {
  const limits = SOCIAL_POST_LIMITS[platform]
  const length = getSocialPostLengthState(platform, post.body)
  const hashtags = getSocialHashtagState(platform, post.hashtags)
  const bodyId = `social-post-${platform}-body`
  const hashtagId = `social-post-${platform}-hashtags`

  return (
    <section className="min-w-0 rounded-2xl border border-navy/10 bg-white p-5 shadow-sm" aria-labelledby={`${platform}-title`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 id={`${platform}-title`} className="font-heading text-xl font-bold text-navy">
          {t(`admin.resourcesAi.socialPosts.platforms.${platform}`)}
        </h3>
        <button type="button" disabled={loading} onClick={onRegenerate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-navy/15 px-3 py-2 text-sm font-semibold text-navy hover:border-accent hover:text-accent-deep disabled:opacity-50">
          {loading ? <LoaderCircle className="animate-spin" size={15} aria-hidden="true" /> : <RefreshCw size={15} aria-hidden="true" />}
          {t(`admin.resourcesAi.socialPosts.regenerate.${platform}`)}
        </button>
      </div>

      <label htmlFor={bodyId} className="mt-5 block text-xs font-bold text-navy/70">
        {t('admin.resourcesAi.socialPosts.body')}
      </label>
      <textarea id={bodyId} rows={9} value={post.body} onChange={(event) => onUpdate('body', event.target.value)} className="mt-1.5 w-full rounded-lg border border-navy/15 bg-white px-3.5 py-3 text-sm leading-relaxed text-navy focus:border-accent focus:ring-2 focus:ring-accent/20" />
      <p className={`mt-2 text-xs ${length.state === 'overMaximum' ? 'font-semibold text-red-700' : length.state === 'inTarget' ? 'text-green-800' : 'text-amber-800'}`}>
        {t('admin.resourcesAi.socialPosts.characterCount', { count: length.count, min: limits.min, max: limits.targetMax })}
        {' · '}
        {t(`admin.resourcesAi.socialPosts.lengthStates.${length.state}`)}
      </p>

      <label htmlFor={hashtagId} className="mt-4 block text-xs font-bold text-navy/70">
        {t('admin.resourcesAi.socialPosts.hashtags')}
      </label>
      <input id={hashtagId} type="text" value={post.hashtags} onChange={(event) => onUpdate('hashtags', event.target.value)} className="mt-1.5 w-full rounded-lg border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy focus:border-accent focus:ring-2 focus:ring-accent/20" />
      <p className={`mt-2 text-xs ${hashtags.state === 'inTarget' ? 'text-green-800' : 'text-amber-800'}`}>
        {t('admin.resourcesAi.socialPosts.hashtagCount', { count: hashtags.count, min: limits.hashtagMin, max: limits.hashtagMax })}
      </p>

      {error && <GenerationError code={error} t={t} className="mt-4" />}

      <button type="button" onClick={onCopy} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep">
        {copied ? <CheckCircle2 size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
        {t(`admin.resourcesAi.socialPosts.${copied ? 'copied' : 'copy'}`)}
      </button>
      {copied && <p role="status" className="mt-2 text-center text-xs font-semibold text-green-800">{t('admin.resourcesAi.socialPosts.copiedStatus', { platform: t(`admin.resourcesAi.socialPosts.platforms.${platform}`) })}</p>}

      {manualCopy && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4" role="alert">
          <label htmlFor={`${platform}-manual-copy`} className="block text-sm font-semibold text-amber-950">
            {t('admin.resourcesAi.socialPosts.manualCopy')}
          </label>
          <p className="mt-1 text-xs text-amber-900">{t('admin.resourcesAi.socialPosts.manualCopyHelp')}</p>
          <textarea id={`${platform}-manual-copy`} ref={manualCopyRef} readOnly rows={8} value={copyText} className="mt-3 w-full rounded-lg border border-amber-300 bg-white p-3 text-sm text-navy focus:ring-2 focus:ring-accent/30" />
        </div>
      )}
    </section>
  )
}

function GenerationError({ className = '', code, t }) {
  const knownCode = [
    'invalid_request', 'unauthenticated', 'forbidden', 'resource_not_found', 'resource_not_ready',
    'insufficient_content', 'server_not_configured', 'provider_failed', 'invalid_provider_output',
  ].includes(code) ? code : 'generation_failed'
  return (
    <div role="alert" className={`${className} flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900`}>
      <AlertTriangle className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
      <p>{t(`admin.resourcesAi.socialPosts.errors.${knownCode}`)}</p>
    </div>
  )
}

function toEditablePost(post) {
  return { body: post.body, hashtags: hashtagsToInput(post.hashtags) }
}
