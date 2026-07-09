'use client'
import { useEffect, useRef, useState } from 'react'

export default function useAnimacaoScroll(opcoes = {}) {
  const ref = useRef(null)
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    const elemento = ref.current
    if (!elemento) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisivel(true)
          observer.unobserve(elemento)
        }
      },
      {
        threshold: opcoes.threshold || 0.1,
        rootMargin: opcoes.rootMargin || '0px 0px -40px 0px',
      }
    )

    observer.observe(elemento)
    return () => observer.disconnect()
  }, [])

  return [ref, visivel]
}