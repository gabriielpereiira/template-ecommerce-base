'use client'
import { useEffect, useState } from 'react'

export default function DividerAnimado() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(prev => (prev + 1) % 100)
    }, 120)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      width: '100%',
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'transparent',
      margin: '4px 0',
    }}>
      {/* Linha base fina */}
      <div style={{
        position: 'absolute',
        width: '60%',
        height: 1,
        background: 'rgba(196,151,90,0.25)',
      }} />

      {/* Glow se movendo — um ponto de luz que percorre a linha */}
      <div style={{
        position: 'absolute',
        width: '60%',
        height: 1.5,
        background: `linear-gradient(90deg,
          transparent 0%,
          transparent ${15 + (offset * 0.6) - 12}%,
          rgba(196,151,90,0.3) ${15 + (offset * 0.6) - 6}%,
          #C4975A ${15 + (offset * 0.6)}%,
          rgba(196,151,90,0.3) ${15 + (offset * 0.6) + 6}%,
          transparent ${15 + (offset * 0.6) + 12}%,
          transparent 100%
        )`,
        transition: 'background 0.12s linear',
      }} />
    </div>
  )
}