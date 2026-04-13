import { useCallback, useRef } from 'react'

export default function useScrollReveal(threshold = 0.15) {
  const observerRef = useRef(null)

  return useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('revealed')
          observer.unobserve(node)
        }
      },
      { threshold }
    )

    observer.observe(node)
    observerRef.current = observer
  }, [threshold])
}
