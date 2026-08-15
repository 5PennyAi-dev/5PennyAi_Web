import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Image as ImageIcon, LoaderCircle, Sparkles, Trash2, Upload } from 'lucide-react'
import {
  isAllowedThumbnailMime,
  isThumbnailSizeAllowed,
  validateInfographicThumbnail,
} from '@/lib/infographicThumbnails'
import { createSeriesSlug } from '@/lib/resourceSeries'
import {
  buildSeriesThumbnailPath,
  isPersistedSeriesName,
  isSeriesThumbnailPathForSlug,
} from '@/lib/seriesThumbnails'
import { supabase } from '@/lib/supabase'

const BUCKET = 'infographics'

export default function SeriesThumbnailField({
  currentSeriesName,
  fallbackUrl,
  onThumbnailChange,
  persistedSeriesName,
  resourceSaved,
  saveFirstMessage,
  seriesId,
  seriesName,
  seriesSlug: directSeriesSlug,
  t,
}) {
  const directSeries = Boolean(seriesId)
  const seriesSlug = useMemo(
    () => createSeriesSlug(directSeries ? directSeriesSlug : persistedSeriesName),
    [directSeries, directSeriesSlug, persistedSeriesName],
  )
  const displaySeriesName = directSeries
    ? seriesName?.trim() || ''
    : persistedSeriesName?.trim() || currentSeriesName?.trim() || ''
  const seriesSaved = directSeries || Boolean(resourceSaved)
  const [thumbnailPath, setThumbnailPath] = useState(null)
  const [state, setState] = useState(seriesSaved && seriesSlug ? 'loading' : 'ready')
  const [busy, setBusy] = useState(null)
  const busyRef = useRef(null)
  const [feedback, setFeedback] = useState(null)
  const actionsEnabled = directSeries
    ? Boolean(seriesId && seriesSlug)
    : Boolean(resourceSaved) && isPersistedSeriesName(currentSeriesName, persistedSeriesName)

  const querySeries = useCallback(() => {
    const query = supabase
      .from('resource_series')
      .select('id, slug, name, thumbnail_path, thumbnail_generated_at')
    return directSeries ? query.eq('id', seriesId) : query.eq('slug', seriesSlug)
  }, [directSeries, seriesId, seriesSlug])

  const persistThumbnail = useCallback(async (path) => {
    if (directSeries) {
      const { data, error } = await supabase
        .from('resource_series')
        .update({ thumbnail_path: path, thumbnail_generated_at: null })
        .eq('id', seriesId)
        .select('id')
        .maybeSingle()
      if (error) throw error
      if (!data) throw new Error('series_not_found')
      return
    }

    const { error } = await supabase.from('resource_series').upsert(
      {
        slug: seriesSlug,
        name: persistedSeriesName.trim(),
        thumbnail_path: path,
        thumbnail_generated_at: null,
      },
      { onConflict: 'slug' },
    )
    if (error) throw error
  }, [directSeries, persistedSeriesName, seriesId, seriesSlug])

  const loadSeries = useCallback(async () => {
    if (!seriesSaved || !seriesSlug) {
      setThumbnailPath(null)
      setState('ready')
      return
    }
    setState('loading')
    setFeedback(null)
    const { data, error } = await querySeries().maybeSingle()

    if (error) {
      console.error('Unable to load series thumbnail:', error.message)
      setState('error')
      return
    }
    setThumbnailPath(data?.thumbnail_path || null)
    setState('ready')
  }, [querySeries, seriesSaved, seriesSlug])

  useEffect(() => {
    let cancelled = false
    if (!seriesSaved || !seriesSlug) {
      setThumbnailPath(null)
      setState('ready')
      return undefined
    }

    setState('loading')
    querySeries()
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('Unable to load series thumbnail:', error.message)
          setState('error')
          return
        }
        setThumbnailPath(data?.thumbnail_path || null)
        setState('ready')
      })

    return () => {
      cancelled = true
    }
  }, [querySeries, seriesSaved, seriesSlug])

  const thumbnailUrl = useMemo(
    () => thumbnailPath
      ? supabase.storage.from(BUCKET).getPublicUrl(thumbnailPath).data.publicUrl
      : null,
    [thumbnailPath],
  )

  const handleGenerate = async () => {
    if (!actionsEnabled || busyRef.current) return
    if (thumbnailPath && !window.confirm(t('admin.resourcesAi.infographicForm.seriesThumbnail.regenerateConfirm'))) {
      return
    }

    busyRef.current = 'generate'
    setBusy('generate')
    setFeedback({ type: 'status', text: t('admin.resourcesAi.infographicForm.seriesThumbnail.generating') })
    try {
      const { data } = await supabase.auth.getSession()
      const accessToken = data.session?.access_token
      if (!accessToken) throw new Error('unauthenticated')

      const response = await fetch('/api/generate-series-thumbnail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ seriesSlug }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || typeof result.thumbnailPath !== 'string') {
        throw new Error(result.error || 'generation_failed')
      }

      setThumbnailPath(result.thumbnailPath)
      onThumbnailChange?.(result.thumbnailPath)
      setFeedback({
        type: 'status',
        text: result.cleanupWarning
          ? t('admin.resourcesAi.infographicForm.seriesThumbnail.generatedCleanupWarning')
          : t('admin.resourcesAi.infographicForm.seriesThumbnail.generated'),
      })
    } catch (error) {
      console.error('Unable to generate series thumbnail:', error.message)
      const errorKey = error.message === 'no_usable_references'
        ? 'noUsableReferences'
        : ['series_missing', 'series_not_found', 'series_has_no_episodes'].includes(error.message)
          ? 'seriesRequired'
          : 'generationFailed'
      setFeedback({
        type: 'error',
        text: t(`admin.resourcesAi.infographicForm.seriesThumbnail.${errorKey}`),
      })
    } finally {
      busyRef.current = null
      setBusy(null)
    }
  }

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !actionsEnabled || busyRef.current) return

    if (!isAllowedThumbnailMime(file.type) || !isThumbnailSizeAllowed(file.size)) {
      const key = !isAllowedThumbnailMime(file.type) ? 'unsupportedType' : 'tooLarge'
      setFeedback({ type: 'error', text: t(`admin.resourcesAi.infographicForm.thumbnail.errors.${key}`) })
      return
    }
    const dimensions = await readImageDimensions(file)
    const validation = validateInfographicThumbnail({
      mimeType: file.type,
      sizeBytes: file.size,
      ...dimensions,
    })
    if (!validation.valid) {
      setFeedback({
        type: 'error',
        text: t(`admin.resourcesAi.infographicForm.thumbnail.errors.${validation.error}`),
      })
      return
    }

    busyRef.current = 'upload'
    setBusy('upload')
    setFeedback({ type: 'status', text: t('admin.resourcesAi.infographicForm.seriesThumbnail.uploading') })
    const newPath = buildSeriesThumbnailPath(seriesSlug, crypto.randomUUID(), file.type)
    let uploaded = false
    try {
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(newPath, file, {
        contentType: file.type,
        cacheControl: '31536000',
        upsert: false,
      })
      if (uploadError) throw uploadError
      uploaded = true

      await persistThumbnail(newPath)

      const oldPath = thumbnailPath
      setThumbnailPath(newPath)
      onThumbnailChange?.(newPath)
      let cleanupWarning = false
      if (oldPath && oldPath !== newPath) {
        if (isSeriesThumbnailPathForSlug(oldPath, seriesSlug)) {
          const { error } = await supabase.storage.from(BUCKET).remove([oldPath])
          cleanupWarning = Boolean(error)
          if (error) console.warn('Unable to remove previous series thumbnail:', error.message)
        } else {
          cleanupWarning = true
          console.warn('Previous series thumbnail path was outside the series prefix.')
        }
      }
      setFeedback({
        type: 'status',
        text: cleanupWarning
          ? t('admin.resourcesAi.infographicForm.seriesThumbnail.uploadedCleanupWarning')
          : t('admin.resourcesAi.infographicForm.seriesThumbnail.uploaded'),
      })
    } catch (error) {
      console.error('Unable to upload series thumbnail:', error.message)
      if (uploaded) {
        const { error: cleanupError } = await supabase.storage.from(BUCKET).remove([newPath])
        if (cleanupError) console.warn('Unable to clean up new series thumbnail:', cleanupError.message)
      }
      setFeedback({ type: 'error', text: t('admin.resourcesAi.infographicForm.seriesThumbnail.uploadFailed') })
    } finally {
      busyRef.current = null
      setBusy(null)
    }
  }

  const handleRemove = async () => {
    if (!thumbnailPath || !actionsEnabled || busyRef.current) return
    if (!window.confirm(t('admin.resourcesAi.infographicForm.seriesThumbnail.removeConfirm'))) return

    busyRef.current = 'remove'
    setBusy('remove')
    setFeedback(null)
    const oldPath = thumbnailPath
    try {
      await persistThumbnail(null)

      setThumbnailPath(null)
      onThumbnailChange?.(null)
      let cleanupWarning = false
      if (isSeriesThumbnailPathForSlug(oldPath, seriesSlug)) {
        const { error: removeError } = await supabase.storage.from(BUCKET).remove([oldPath])
        cleanupWarning = Boolean(removeError)
        if (removeError) console.warn('Unable to remove series thumbnail:', removeError.message)
      } else {
        cleanupWarning = true
      }
      setFeedback({
        type: 'status',
        text: cleanupWarning
          ? t('admin.resourcesAi.infographicForm.seriesThumbnail.removedCleanupWarning')
          : t('admin.resourcesAi.infographicForm.seriesThumbnail.removed'),
      })
    } catch (error) {
      console.error('Unable to remove series thumbnail:', error.message)
      setFeedback({ type: 'error', text: t('admin.resourcesAi.infographicForm.seriesThumbnail.removeFailed') })
    } finally {
      busyRef.current = null
      setBusy(null)
    }
  }

  if (state === 'loading') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted" role="status">
        <LoaderCircle className="animate-spin text-accent" size={17} aria-hidden="true" />
        {t('admin.resourcesAi.infographicForm.seriesThumbnail.loading')}
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm text-navy" role="alert">
        <p>{t('admin.resourcesAi.infographicForm.seriesThumbnail.loadFailed')}</p>
        <button type="button" onClick={loadSeries} className="mt-3 font-semibold underline underline-offset-4">
          {t('admin.resourcesAi.infographicForm.seriesThumbnail.retry')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-navy">{displaySeriesName}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          {t('admin.resourcesAi.infographicForm.seriesThumbnail.help')}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-navy/10 bg-surface">
        <div className="aspect-video">
          {thumbnailUrl || fallbackUrl ? (
            <img
              src={thumbnailUrl || fallbackUrl}
              alt=""
              className={`h-full w-full ${thumbnailUrl ? 'object-contain object-center' : 'object-cover object-top'}`}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-navy/40">
              <ImageIcon size={30} strokeWidth={1.5} aria-hidden="true" />
              <p className="text-sm">{t('admin.resourcesAi.infographicForm.seriesThumbnail.noPreview')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="text-sm text-muted">
        <p className="font-semibold text-navy">
          {thumbnailPath
            ? t('admin.resourcesAi.infographicForm.seriesThumbnail.saved')
            : t('admin.resourcesAi.infographicForm.seriesThumbnail.none')}
        </p>
        {!thumbnailPath && <p>{t('admin.resourcesAi.infographicForm.seriesThumbnail.fallbackUsed')}</p>}
      </div>

      {feedback && (
        <p
          role={feedback.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className={`rounded-lg border px-3 py-2 text-sm ${
            feedback.type === 'error'
              ? 'border-accent/35 bg-accent/10 text-navy'
              : 'border-steel/40 bg-steel/10 text-navy'
          }`}
        >
          {feedback.text}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!actionsEnabled || Boolean(busy)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {busy === 'generate' ? <LoaderCircle className="animate-spin" size={15} aria-hidden="true" /> : <Sparkles size={15} aria-hidden="true" />}
          {busy === 'generate'
            ? t('admin.resourcesAi.infographicForm.seriesThumbnail.generating')
            : thumbnailPath
              ? t('admin.resourcesAi.infographicForm.seriesThumbnail.regenerate')
              : t('admin.resourcesAi.infographicForm.seriesThumbnail.generate')}
        </button>

        <label className={`inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 ${!actionsEnabled || busy ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-accent-deep'}`}>
          {busy === 'upload' ? <LoaderCircle className="animate-spin" size={15} aria-hidden="true" /> : <Upload size={15} aria-hidden="true" />}
          {thumbnailPath
            ? t('admin.resourcesAi.infographicForm.seriesThumbnail.replace')
            : t('admin.resourcesAi.infographicForm.seriesThumbnail.upload')}
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
            onChange={handleUpload}
            disabled={!actionsEnabled || Boolean(busy)}
            className="sr-only"
          />
        </label>

        {thumbnailPath && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={!actionsEnabled || Boolean(busy)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-accent hover:text-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            {busy === 'remove' ? <LoaderCircle className="animate-spin" size={15} aria-hidden="true" /> : <Trash2 size={15} aria-hidden="true" />}
            {t('admin.resourcesAi.infographicForm.seriesThumbnail.remove')}
          </button>
        )}
      </div>

      {!actionsEnabled && (
        <p className="text-xs font-medium text-navy/65" role="status">
          {saveFirstMessage || t('admin.resourcesAi.infographicForm.seriesThumbnail.saveSeriesFirst')}
        </p>
      )}
    </div>
  )
}

function readImageDimensions(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
      URL.revokeObjectURL(url)
    }
    image.onerror = () => {
      resolve({ width: null, height: null })
      URL.revokeObjectURL(url)
    }
    image.src = url
  })
}
