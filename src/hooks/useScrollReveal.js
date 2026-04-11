import { useCallback, useRef } from 'react'

export default function useScrollReveal() {
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
      { threshold: 0.1 }
    )

    observer.observe(node)
    observerRef.current = observer
  }, [])
}
