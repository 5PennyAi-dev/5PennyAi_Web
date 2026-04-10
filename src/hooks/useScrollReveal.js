import { useEffect, useRef } from 'react'

export default function useScrollReveal(options = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('revealed')
          observer.unobserve(node)
        }
      },
      { threshold: 0.1, ...options }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return ref
}
