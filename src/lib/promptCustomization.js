export function scrollPromptSectionIntoView(element, { focus = false, reducedMotion } = {}) {
  if (!element) return false
  if (focus) element.focus({ preventScroll: true })

  const shouldReduceMotion = typeof reducedMotion === 'boolean'
    ? reducedMotion
    : typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  element.scrollIntoView({
    behavior: shouldReduceMotion ? 'auto' : 'smooth',
    block: 'start',
  })
  return true
}
