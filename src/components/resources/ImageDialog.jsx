import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { handleImageDialogKeyDown } from '@/lib/imageDialogFocus'

export default function ImageDialog({ alt, closeLabel, onClose, src }) {
  const closeButtonRef = useRef(null)
  const dialogRef = useRef(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previouslyFocused = document.activeElement
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event) => handleImageDialogKeyDown(event, {
      container: dialogRef.current,
      onClose,
    })
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [onClose])

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      tabIndex={-1}
      className="fixed inset-0 z-[9999] overflow-y-auto overflow-x-hidden bg-navy/95"
      onClick={onClose}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={(event) => { event.stopPropagation(); onClose() }}
        className="fixed top-4 right-4 z-10 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy shadow-lg hover:bg-warm-gray focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <X size={17} aria-hidden="true" />
        {closeLabel}
      </button>
      <div className="flex min-h-full w-full items-start justify-center px-3 py-20 sm:px-6">
        <img
          src={src}
          alt={alt}
          decoding="async"
          onClick={(event) => event.stopPropagation()}
          className="h-auto max-w-full rounded-xl bg-white object-contain shadow-2xl"
        />
      </div>
    </div>,
    document.body,
  )
}
