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
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'transparent',
      margin: '2px 0',
    }}>
      {/* Linha base com glow dinamico — a linha brilha onde a fatia passa */}
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

      {/* Sombra da fatia — rastro sutil */}
      <div style={{
        position: 'absolute',
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(196,151,90,0.15) 0%, transparent 70%)',
        left: `${20 + (offset * 0.6)}%`,
        top: '50%',
        transform: 'translate(-50%, -50%)',
        transition: 'left 0.12s linear',
        pointerEvents: 'none',
      }} />

      {/* Fatia de torta detalhada — 36x36 */}
      <div style={{
        position: 'absolute',
        left: `${20 + (offset * 0.6)}%`,
        top: '50%',
        transform: 'translate(-50%, -50%)',
        transition: 'left 0.12s linear',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'drop-shadow(0 2px 4px rgba(139,69,19,0.2))',
      }}>
        <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Sombra da base da fatia */}
          <path d="M24 4 L40 36 L8 36 Z" fill="rgba(0,0,0,0.06)" transform="translate(1, 2)" />

          {/* Base da torta — camada de chocolate */}
          <path d="M24 4 L40 36 L8 36 Z" fill="#6B3A2A" />
          <path d="M24 4 L38 34 L10 34 Z" fill="#7A4A3A" />

          {/* Recheio cremoso */}
          <path d="M24 4 L37 30 L11 30 Z" fill="#D4A574" />

          {/* Cobertura de ganache */}
          <path d="M24 4 L36 24 L12 24 Z" fill="#8B5E3C" />
          <path d="M24 4 L35 20 L13 20 Z" fill="#A0724A" />

          {/* Glace topo com brilho */}
          <path d="M24 4 L34 16 L14 16 Z" fill="#C4975A" />
          <path d="M24 4 L33 12 L15 12 Z" fill="#D4A574" />

          {/* Pingos de chocolate descendo */}
          <path d="M14 16 Q13 20 14 22 Q15 20 14 16Z" fill="#6B3A2A" />
          <path d="M34 16 Q35 19 34 21 Q33 19 34 16Z" fill="#6B3A2A" />
          <path d="M20 16 Q19 19 20 22 Q21 19 20 16Z" fill="#6B3A2A" />

          {/* Morango no topo */}
          <ellipse cx="24" cy="6" rx="4" ry="4.5" fill="#CC3344" />
          <ellipse cx="24" cy="5" rx="3.5" ry="4" fill="#DD4455" />
          {/* Brilho do morango */}
          <ellipse cx="22.5" cy="4.5" rx="1.2" ry="1.8" fill="rgba(255,255,255,0.3)" />

          {/* Folhas do morango */}
          <path d="M24 2 Q22 0 20 1 Q22 1 24 2Z" fill="#2D7D46" />
          <path d="M24 2 Q26 0 28 1 Q26 1 24 2Z" fill="#2D7D46" />
          <path d="M24 2 Q23 0 22 1 Q23 1 24 2Z" fill="#3A9D5A" />
          <path d="M24 2 Q25 0 26 1 Q25 1 24 2Z" fill="#3A9D5A" />
          {/* Cabinha */}
          <path d="M24 1.5 L24 0.5" stroke="#2D7D46" strokeWidth="1" strokeLinecap="round" />

          {/* Calda de chocolate escorrendo do morango */}
          <path d="M22 9 Q20 11 19 12" stroke="#6B3A2A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M26 9 Q28 11 29 12" stroke="#6B3A2A" strokeWidth="1.5" strokeLinecap="round" fill="none" />

          {/* Garfo ao lado direito */}
          <g transform="translate(40, 12)">
            {/* Cabo */}
            <rect x="-1" y="6" width="2" height="20" rx="1" fill="#A0A0A0" />
            {/* Pontas */}
            <rect x="-3" y="0" width="1.2" height="8" rx="0.5" fill="#B0B0B0" />
            <rect x="-0.6" y="0" width="1.2" height="8" rx="0.5" fill="#C0C0C0" />
            <rect x="1.8" y="0" width="1.2" height="8" rx="0.5" fill="#B0B0B0" />
            {/* Base das pontas */}
            <rect x="-3.5" y="5" width="6.5" height="2.5" rx="0.8" fill="#A8A8A8" />
            {/* Brilho do cabo */}
            <rect x="-0.6" y="8" width="1" height="12" rx="0.5" fill="rgba(255,255,255,0.25)" />
          </g>

          {/* Brilho especular na cobertura */}
          <path d="M18 8 Q21 6 24 8 Q21 9 18 8Z" fill="rgba(255,255,255,0.2)" />
        </svg>
      </div>
    </div>
  )
}