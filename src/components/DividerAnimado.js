'use client'
import { useState, useEffect, useRef } from 'react'
import { theme } from '@/theme'

const COLORS = theme.colors

export default function DividerAnimado() {
  const [offset, setOffset] = useState(0)
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    let frame
    function animar() {
      setOffset(prev => (prev + 0.3) % 100)
      frame = requestAnimationFrame(animar)
    }
    frame = requestAnimationFrame(animar)
    return () => cancelAnimationFrame(frame)
  }, [visible])

  return (
    <div ref={ref} style={{
      position: 'relative',
      width: '80%',
      maxWidth: '400px',
      height: '1px',
      margin: '40px auto',
      background: `linear-gradient(90deg, transparent 0%, ${COLORS.border} 50%, transparent 100%)`,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.6s ease'
    }}>
      {/* Glow se movendo */}
      <div style={{
        position: 'absolute',
        width: '60%',
        height: 1.5,
        background: `linear-gradient(90deg,
          transparent 0%,
          transparent ${15 + (offset * 0.6) - 12}%,
          ${COLORS.coral}33 ${15 + (offset * 0.6) - 6}%,
          ${COLORS.coral}99 ${15 + (offset * 0.6) - 2}%,
          ${COLORS.coral} ${15 + (offset * 0.6)}%,
          ${COLORS.coral}99 ${15 + (offset * 0.6) + 2}%,
          ${COLORS.coral}33 ${15 + (offset * 0.6) + 6}%,
          transparent ${15 + (offset * 0.6) + 12}%,
          transparent 100%
        )`,
        transition: 'background 0.05s linear',
        pointerEvents: 'none'
      }} />
    </div>
  )
}