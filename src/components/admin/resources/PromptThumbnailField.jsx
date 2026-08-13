import { Image as ImageIcon, LoaderCircle, Sparkles, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
import {
  createPromptThumbnailUrl,
  generatePromptThumbnail,
  getPromptThumbnailGenerationState,
  readPromptThumbnailMetadata,
  removePromptThumbnail,
  uploadPromptThumbnail,
  validatePromptThumbnail,
} from '@/lib/promptThumbnails'

export default function PromptThumbnailField({
  dirty,
  generationBrief,
  onBusyChange,
  onChanged,
  promptId,
  thumbnailPath,
  thumbnailUrl,
  t,
}) {
  const [busy, setBusy] = useState(false)
  const [operation, setOperation] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [metadata, setMetadata] = useState(null)

  const setOperationBusy = (value, nextOperation = null) => {
    setBusy(value)
    setOperation(value ? nextOperation : null)
    onBusyChange?.(value)
  }

  const generationState = getPromptThumbnailGenerationState({
    promptId, dirty, generationBrief, busy,
  })

  const handleGenerate = async () => {
    if (generationState !== 'ready') return
    if (thumbnailPath && !window.confirm(t('admin.resourcesAi.promptThumbnail.regenerateConfirm'))) return
    setOperationBusy(true, 'generate')
    setFeedback({ type: 'status', text: t('admin.resourcesAi.promptThumbnail.generating') })
    try {
      const result = await generatePromptThumbnail(promptId)
      const url = await createPromptThumbnailUrl(result.thumbnailPath, promptId)
      setMetadata({
        originalName: result.thumbnailPath.split('/').at(-1),
        width: result.width,
        height: result.height,
      })
      onChanged({ path: result.thumbnailPath, url })
      setFeedback({
        type: 'status',
        text: t(`admin.resourcesAi.promptThumbnail.${result.cleanupWarning ? 'generatedCleanupWarning' : 'generated'}`),
      })
    } catch (error) {
      setFeedback({
        type: 'error',
        text: t(`admin.resourcesAi.promptThumbnail.errors.${knownGenerationError(error.code || error.message)}`),
      })
    } finally {
      setOperationBusy(false)
    }
  }

  const handleSelection = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !promptId || busy) return
    setOperationBusy(true, 'upload')
    setFeedback(null)
    try {
      const nextMetadata = await readPromptThumbnailMetadata(file)
      const validation = validatePromptThumbnail(nextMetadata)
      if (!validation.valid) {
        const error = new Error(validation.error)
        error.code = validation.error
        throw error
      }
      const result = await uploadPromptThumbnail({ promptId, oldPath: thumbnailPath, file, metadata: nextMetadata })
      const url = await createPromptThumbnailUrl(result.path, promptId)
      setMetadata(nextMetadata)
      onChanged({ path: result.path, url })
      setFeedback({
        type: 'status',
        text: t(`admin.resourcesAi.promptThumbnail.${result.cleanupFailed ? 'uploadedCleanupWarning' : 'uploaded'}`),
      })
    } catch (error) {
      setFeedback({ type: 'error', text: t(`admin.resourcesAi.promptThumbnail.errors.${knownError(error.code || error.message)}`) })
    } finally {
      setOperationBusy(false)
    }
  }

  const handleRemove = async () => {
    if (!promptId || !thumbnailPath || busy) return
    if (!window.confirm(t('admin.resourcesAi.promptThumbnail.removeConfirm'))) return
    setOperationBusy(true, 'remove')
    setFeedback(null)
    try {
      const result = await removePromptThumbnail({ promptId, path: thumbnailPath })
      setMetadata(null)
      onChanged({ path: null, url: null })
      setFeedback({
        type: 'status',
        text: t(`admin.resourcesAi.promptThumbnail.${result.cleanupFailed ? 'removedCleanupWarning' : 'removed'}`),
      })
    } catch {
      setFeedback({ type: 'error', text: t('admin.resourcesAi.promptThumbnail.errors.removeFailed') })
    } finally {
      setOperationBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="aspect-video overflow-hidden rounded-xl border border-navy/10 bg-surface">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-lavender/45 via-white to-steel/20 text-navy/55">
            <Sparkles size={34} strokeWidth={1.5} aria-hidden="true" />
            <span className="text-sm font-bold">{t('admin.resourcesAi.promptThumbnail.fallback')}</span>
          </div>
        )}
      </div>

      <div className="text-sm leading-relaxed text-muted">
        <p className="font-semibold text-navy">{thumbnailPath ? t('admin.resourcesAi.promptThumbnail.saved') : t('admin.resourcesAi.promptThumbnail.none')}</p>
        <p>{t('admin.resourcesAi.promptThumbnail.help')}</p>
      </div>

      {metadata && (
        <dl className="grid gap-1 text-xs text-navy/65 sm:grid-cols-2">
          <div><dt className="inline font-semibold">{t('admin.resourcesAi.promptThumbnail.file')} : </dt><dd className="inline">{metadata.originalName}</dd></div>
          <div><dt className="inline font-semibold">{t('admin.resourcesAi.promptThumbnail.dimensions')} : </dt><dd className="inline">{metadata.width} × {metadata.height} px</dd></div>
        </dl>
      )}

      {feedback && <p role={feedback.type === 'error' ? 'alert' : 'status'} aria-live="polite" className={`rounded-lg border px-3 py-2 text-sm ${feedback.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-steel/40 bg-steel/10 text-navy'}`}>{feedback.text}</p>}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={handleGenerate} disabled={generationState !== 'ready'} className="inline-flex items-center gap-2 rounded-lg border border-accent/35 bg-white px-4 py-2.5 text-sm font-semibold text-accent-deep transition-colors hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50">
          {operation === 'generate' ? <LoaderCircle className="animate-spin" size={15} aria-hidden="true" /> : <Sparkles size={15} aria-hidden="true" />}
          {operation === 'generate' ? t('admin.resourcesAi.promptThumbnail.generating') : thumbnailPath ? t('admin.resourcesAi.promptThumbnail.regenerate') : t('admin.resourcesAi.promptThumbnail.generate')}
        </button>
        <label className={`inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white ${!promptId || busy ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-accent-deep'}`}>
          {operation === 'upload' ? <LoaderCircle className="animate-spin" size={15} aria-hidden="true" /> : <Upload size={15} aria-hidden="true" />}
          {thumbnailPath ? t('admin.resourcesAi.promptThumbnail.replace') : t('admin.resourcesAi.promptThumbnail.upload')}
          <input type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp" onChange={handleSelection} disabled={!promptId || busy} className="sr-only" />
        </label>
        {thumbnailPath && (
          <button type="button" onClick={handleRemove} disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-navy disabled:opacity-50">
            <Trash2 size={15} aria-hidden="true" />{t('admin.resourcesAi.promptThumbnail.remove')}
          </button>
        )}
      </div>
      {generationState !== 'ready' && generationState !== 'generating' && <p role="status" className="flex items-center gap-2 text-xs font-medium text-navy/65"><ImageIcon size={14} aria-hidden="true" />{t(`admin.resourcesAi.promptThumbnail.${generationState}`)}</p>}
    </div>
  )
}

function knownGenerationError(code) {
  return ['generation_brief_required', 'prompt_not_found', 'unauthenticated', 'forbidden'].includes(code)
    ? code
    : 'generationFailed'
}

function knownError(code) {
  return ['unsupportedType', 'unsupportedExtension', 'extensionMismatch', 'signatureMismatch', 'tooLarge', 'unreadable', 'invalidCoverRatio'].includes(code)
    ? code
    : 'uploadFailed'
}
