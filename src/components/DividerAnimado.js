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
      height: 72,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'transparent',
      margin: '2px 0',
    }}>
      {/* Linha base com glow dinamico */}
      <div style={{
        position: 'absolute',
        width: '60%',
        height: 1.5,
        background: `linear-gradient(90deg,
          transparent 0%,
          transparent ${15 + (offset * 0.6) - 8}%,
          rgba(196,151,90,0.6) ${15 + (offset * 0.6) - 2}%,
          #C4975A ${15 + (offset * 0.6)}%,
          rgba(196,151,90,0.6) ${15 + (offset * 0.6) + 2}%,
          transparent ${15 + (offset * 0.6) + 8}%,
          transparent 100%
        )`,
        transition: 'background 0.12s linear',
      }} />

      {/* Sombra/glow ao redor da fatia */}
      <div style={{
        position: 'absolute',
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(196,151,90,0.15) 0%, transparent 70%)',
        left: `${20 + (offset * 0.6)}%`,
        top: '50%',
        transform: 'translate(-50%, -50%)',
        transition: 'left 0.12s linear',
        pointerEvents: 'none',
      }} />

      {/* Imagem da fatia de torta */}
      <div style={{
        position: 'absolute',
        left: `${20 + (offset * 0.6)}%`,
        top: '50%',
        transform: 'translate(-50%, -50%)',
        transition: 'left 0.12s linear',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'drop-shadow(0 3px 6px rgba(139,69,19,0.25))',
      }}>
        <img
          src="/images/fatia-torta.png"
          alt=""
          style={{
            height: 44,
            width: 'auto',
            display: 'block',
          }}
        />
      </div>
    </div>
  )
}