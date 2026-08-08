const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function handleImageDialogKeyDown(event, { container, documentObject = globalThis.document, onClose }) {
  if (event.key === 'Escape') {
    event.preventDefault()
    onClose()
    return
  }
  if (event.key !== 'Tab') return

  const focusable = [...(container?.querySelectorAll?.(FOCUSABLE_SELECTOR) || [])]
    .filter((element) => !element.hidden && element.getAttribute?.('aria-hidden') !== 'true')
  if (!focusable.length) {
    event.preventDefault()
    container?.focus?.()
    return
  }

  const first = focusable[0]
  const last = focusable.at(-1)
  if (event.shiftKey && (documentObject.activeElement === first || !container?.contains?.(documentObject.activeElement))) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && (documentObject.activeElement === last || !container?.contains?.(documentObject.activeElement))) {
    event.preventDefault()
    first.focus()
  }
}
