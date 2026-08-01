import { Image as ImageIcon, LoaderCircle, Trash2, Upload } from 'lucide-react'
import {
  ARTICLE_MEDIA_KEY_PATTERN,
  readImageMetadata,
  removeArticleCover,
  removeArticleMedia,
  uploadArticleCover,
  uploadArticleMedia,
  validateArticleImage,
} from '@/lib/articleAssets'
import { useState } from 'react'

export default function ArticleAssetField({ articleId, asset, coverPath, kind, media, onChanged, t, url }) {
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const saved = kind === 'cover' ? Boolean(coverPath) : Boolean(asset)
  const keyValid = kind === 'cover' || ARTICLE_MEDIA_KEY_PATTERN.test(media?.key || '')
  const enabled = Boolean(articleId) && keyValid && !busy
  const metadata = kind === 'media' ? asset?.file_metadata : null

  const chooseFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !enabled) return
    setBusy(true)
    setFeedback(null)
    try {
      const nextMetadata = await readImageMetadata(file)
      const validation = validateArticleImage({
        kind,
        ...nextMetadata,
        preferredAspectRatio: kind === 'cover' ? '16:9' : media?.preferredAspectRatio,
      })
      if (!validation.valid) {
        setFeedback({ type: 'error', text: t(`admin.resourcesAi.articleForm.assets.errors.${validation.error}`) })
        return
      }
      const result = kind === 'cover'
        ? await uploadArticleCover({ articleId, oldPath: coverPath, file, metadata: nextMetadata })
        : await uploadArticleMedia({ articleId, mediaKey: media.key, oldPath: asset?.storage_path, file, metadata: nextMetadata })
      await onChanged({ coverPath: kind === 'cover' ? result.path : coverPath })
      const warnings = validation.warnings || []
      setFeedback({
        type: 'status',
        text: result.cleanupFailed
          ? t('admin.resourcesAi.articleForm.assets.cleanupWarning')
          : warnings.length
            ? warnings.map((code) => t(`admin.resourcesAi.articleForm.assets.warnings.${code}`)).join(' ')
            : t('admin.resourcesAi.articleForm.assets.uploaded'),
      })
    } catch (error) {
      console.error('Unable to upload article asset:', error.message)
      setFeedback({
        type: 'error',
        text: t(`admin.resourcesAi.articleForm.assets.errors.${error.assetCleanupFailed ? 'uploadCleanupFailed' : 'upload'}`),
      })
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!saved || busy || !window.confirm(t('admin.resourcesAi.articleForm.assets.removeConfirm'))) return
    setBusy(true)
    setFeedback(null)
    try {
      const result = kind === 'cover'
        ? await removeArticleCover({ articleId, path: coverPath })
        : await removeArticleMedia({ articleId, mediaKey: asset.media_key, path: asset.storage_path })
      await onChanged({ coverPath: kind === 'cover' ? null : coverPath })
      setFeedback({
        type: 'status',
        text: result.cleanupFailed
          ? t('admin.resourcesAi.articleForm.assets.cleanupWarning')
          : t('admin.resourcesAi.articleForm.assets.removed'),
      })
    } catch (error) {
      console.error('Unable to remove article asset:', error.message)
      setFeedback({ type: 'error', text: t('admin.resourcesAi.articleForm.assets.errors.remove') })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
      <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-start">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-surface">
          <div className="aspect-video">
            {url ? <img src={url} alt={kind === 'cover' ? '' : media?.altText || ''} className="h-full w-full object-contain" /> : (
              <div className="flex h-full items-center justify-center text-navy/35"><ImageIcon size={28} aria-hidden="true" /></div>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-navy">
            {t(`admin.resourcesAi.articleForm.assets.${saved ? 'present' : 'missing'}`)}
          </p>
          {kind === 'media' && (
            <div className="flex flex-wrap gap-2 text-xs">
              <span className={`rounded-full px-2.5 py-1 ${media?.required ? 'bg-amber-100 text-amber-900' : 'bg-gray-100 text-gray-700'}`}>
                {t(`admin.resourcesAi.articleForm.assets.${media?.required ? 'required' : 'optional'}`)}
              </span>
            </div>
          )}
          {metadata && (
            <p className="text-xs text-navy/60">
              {metadata.width} × {metadata.height} px · {formatBytes(metadata.sizeBytes)} · {metadata.mimeType}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <label className={`inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white ${enabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
              {busy ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : <Upload size={14} aria-hidden="true" />}
              {t(`admin.resourcesAi.articleForm.assets.${saved ? 'replace' : 'upload'}`)}
              <input type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp" disabled={!enabled} onChange={chooseFile} className="sr-only" />
            </label>
            {saved && (
              <button type="button" disabled={busy} onClick={remove} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-700 disabled:opacity-50">
                <Trash2 size={14} aria-hidden="true" />{t('admin.resourcesAi.articleForm.assets.remove')}
              </button>
            )}
          </div>
          {!articleId && <p className="text-xs text-navy/60">{t('admin.resourcesAi.articleForm.assets.saveFirst')}</p>}
          {articleId && !keyValid && <p className="text-xs text-amber-800">{t('admin.resourcesAi.articleForm.assets.invalidKey')}</p>}
          {feedback && <p role={feedback.type === 'error' ? 'alert' : 'status'} className={`text-xs ${feedback.type === 'error' ? 'text-red-700' : 'text-navy/65'}`}>{feedback.text}</p>}
        </div>
      </div>
    </div>
  )
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
