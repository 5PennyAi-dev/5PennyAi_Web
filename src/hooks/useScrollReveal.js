import { useCallback, useRef } from 'react'

export default function useScrollReveal(threshold = 0.15) {
  const observerRef = useRef(null)
  const timerRef = useRef(null)

  return useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (!node) return

    const reveal = () => {
      node.classList.add('revealed')
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal()
          observer.unobserve(node)
          if (timerRef.current) clearTimeout(timerRef.current)
        }
      },
      { threshold }
    )

    observer.observe(node)
    observerRef.current = observer

    // Fallback: if observer hasn't fired after 1.5s, reveal anyway
    // (fixes edge cases on some mobile browsers where the initial
    // intersection callback is missed for above-the-fold elements)
    timerRef.current = setTimeout(() => {
      if (!node.classList.contains('revealed')) {
        reveal()
      }
    }, 1500)
  }, [threshold])
}
