import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Lightbox() {
  const [current, setCurrent] = useState(null)

  useEffect(() => {
    const handler = (event) => {
      const detail = event?.detail
      console.log('[lightbox] open event', detail)
      if (detail && typeof detail.src === 'string' && detail.src.length > 0) {
        setCurrent(detail)
      }
    }
    window.addEventListener('lightbox:open', handler)
    return () => window.removeEventListener('lightbox:open', handler)
  }, [])

  useEffect(() => {
    if (!current) return
    const onKey = (e) => {
      if (e.key === 'Escape') setCurrent(null)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [current])

  if (!current || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-navy/90 flex items-center justify-center cursor-zoom-out"
      onClick={() => setCurrent(null)}
      role="dialog"
      aria-modal="true"
      aria-label={current.alt || 'Image'}
    >
      <img
        src={current.src}
        alt={current.alt || ''}
        style={{ maxWidth: '95vw', maxHeight: '95vh', width: 'auto', height: 'auto' }}
        className="object-contain rounded-xl shadow-2xl cursor-default bg-white"
        onClick={(e) => e.stopPropagation()}
        onLoad={() => console.log('[lightbox] image loaded', current.src)}
        onError={() => console.error('[lightbox] image failed to load', current.src)}
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setCurrent(null)
        }}
        aria-label="Close"
        className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
      >
        <X size={18} strokeWidth={2.5} />
      </button>
    </div>,
    document.body
  )
}
