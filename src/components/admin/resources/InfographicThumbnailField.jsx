import { Image as ImageIcon, Trash2, Undo2, Upload, X } from 'lucide-react'

const INPUT_ID = 'infographic-thumbnail-file'

export default function InfographicThumbnailField({
  feedback,
  metadata,
  onCancelSelection,
  onChange,
  onRemove,
  onUndoRemove,
  pending,
  previewUrl,
  removalPending,
  savedThumbnail,
  t,
}) {
  const usesFallback = !pending && (!savedThumbnail || removalPending)

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-navy/10 bg-surface">
        <div className="aspect-video">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt=""
              className={`h-full w-full object-cover ${usesFallback ? 'object-top' : 'object-center'}`}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-5 text-center text-navy/40">
              <ImageIcon size={30} strokeWidth={1.5} aria-hidden="true" />
              <p className="text-sm">{t('admin.resourcesAi.infographicForm.thumbnail.noPreview')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1 text-sm text-muted">
        <p className="font-semibold text-navy">
          {pending
            ? t('admin.resourcesAi.infographicForm.thumbnail.pending')
            : removalPending
              ? t('admin.resourcesAi.infographicForm.thumbnail.removalPending')
              : savedThumbnail
                ? t('admin.resourcesAi.infographicForm.thumbnail.saved')
                : t('admin.resourcesAi.infographicForm.thumbnail.none')}
        </p>
        {usesFallback && (
          <p>
            {removalPending
              ? t('admin.resourcesAi.infographicForm.thumbnail.fallbackAfterSave')
              : t('admin.resourcesAi.infographicForm.thumbnail.fallbackUsed')}
          </p>
        )}
        <p>{t('admin.resourcesAi.infographicForm.thumbnail.help')}</p>
        <ul className="list-disc space-y-0.5 pl-5 text-xs">
          <li>{t('admin.resourcesAi.infographicForm.thumbnail.formats')}</li>
          <li>{t('admin.resourcesAi.infographicForm.thumbnail.maxSize')}</li>
          <li>{t('admin.resourcesAi.infographicForm.thumbnail.expectedRatio')}</li>
        </ul>
      </div>

      {metadata && (
        <dl className="grid gap-1 text-xs text-navy/65 sm:grid-cols-2">
          <MetadataRow
            label={t('admin.resourcesAi.infographicForm.image.name')}
            value={metadata.originalName}
          />
          <MetadataRow
            label={t('admin.resourcesAi.infographicForm.image.size')}
            value={formatBytes(metadata.sizeBytes)}
          />
          <MetadataRow
            label={t('admin.resourcesAi.infographicForm.image.dimensions')}
            value={`${metadata.width} × ${metadata.height} px`}
          />
          <MetadataRow
            label={t('admin.resourcesAi.infographicForm.image.type')}
            value={metadata.mimeType}
          />
        </dl>
      )}

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
        {!removalPending && (
          <label
            htmlFor={INPUT_ID}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-deep focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2"
          >
            <Upload size={15} aria-hidden="true" />
            {savedThumbnail || pending
              ? t('admin.resourcesAi.infographicForm.thumbnail.replace')
              : t('admin.resourcesAi.infographicForm.thumbnail.upload')}
            <input
              id={INPUT_ID}
              type="file"
              accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
              onChange={onChange}
              className="sr-only"
            />
          </label>
        )}

        {pending && (
          <button
            type="button"
            onClick={onCancelSelection}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-accent hover:text-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <X size={15} aria-hidden="true" />
            {t('admin.resourcesAi.infographicForm.thumbnail.cancelSelection')}
          </button>
        )}

        {!pending && savedThumbnail && !removalPending && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-accent hover:text-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <Trash2 size={15} aria-hidden="true" />
            {t('admin.resourcesAi.infographicForm.thumbnail.remove')}
          </button>
        )}

        {removalPending && (
          <button
            type="button"
            onClick={onUndoRemove}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-accent hover:text-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <Undo2 size={15} aria-hidden="true" />
            {t('admin.resourcesAi.infographicForm.thumbnail.cancelRemoval')}
          </button>
        )}
      </div>
    </div>
  )
}

function MetadataRow({ label, value }) {
  if (!value) return null

  return (
    <div className="flex min-w-0 gap-2">
      <dt className="shrink-0 font-semibold">{label}:</dt>
      <dd className="truncate">{value}</dd>
    </div>
  )
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
