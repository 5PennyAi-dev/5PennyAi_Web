import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ExcalidrawEditModal({ scene, saving, onSave, onCancel }) {
  const { t } = useTranslation()
  const [ExcalidrawComp, setExcalidrawComp] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const apiRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      import('@excalidraw/excalidraw'),
      import('@excalidraw/excalidraw/index.css').catch(() => null),
    ])
      .then(([mod]) => {
        if (cancelled) return
        const comp = mod.Excalidraw || mod.default?.Excalidraw
        if (!comp) {
          setLoadError('component_not_found')
          return
        }
        setExcalidrawComp(() => comp)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err?.message || 'load_failed')
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !saving) onCancel()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onCancel, saving])

  const handleSave = () => {
    if (!apiRef.current || saving) return
    const elements = apiRef.current.getSceneElements()
    const appState = apiRef.current.getAppState()
    const files = apiRef.current.getFiles()
    onSave({
      type: 'excalidraw',
      version: 2,
      source: 'https://excalidraw.com',
      elements,
      appState: {
        viewBackgroundColor: '#ffffff',
        ...appState,
      },
      files: files || {},
    })
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-navy/90 flex flex-col p-3 md:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-between gap-4 mb-3">
        <h2 className="font-heading font-bold text-white text-lg">
          {t('admin.diagram.editModalTitle')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-full border border-white/20 bg-white/10 text-white px-4 py-2 text-[13px] font-medium hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            {t('admin.diagram.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !ExcalidrawComp}
            className="inline-flex items-center gap-2 rounded-full bg-accent text-white px-5 py-2 text-[13px] font-heading font-semibold hover:brightness-95 transition-all disabled:opacity-50"
          >
            <Save size={14} strokeWidth={2} />
            {saving ? t('admin.diagram.saving') : t('admin.diagram.saveChanges')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            aria-label="Close"
            className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="flex-1 rounded-xl bg-white overflow-hidden">
        {loadError ? (
          <div className="h-full flex items-center justify-center text-navy/60 text-[14px]">
            {t('admin.diagram.editLoadError')}
          </div>
        ) : !ExcalidrawComp ? (
          <div className="h-full flex items-center justify-center text-navy/60 text-[14px]">
            {t('admin.diagram.editLoading')}
          </div>
        ) : (
          <ExcalidrawComp
            initialData={{
              elements: scene?.elements || [],
              appState: {
                viewBackgroundColor: '#ffffff',
                ...(scene?.appState || {}),
              },
              files: scene?.files || {},
              scrollToContent: true,
            }}
            excalidrawAPI={(api) => {
              apiRef.current = api
            }}
          />
        )}
      </div>
    </div>,
    document.body
  )
}
