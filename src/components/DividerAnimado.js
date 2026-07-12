'use client'
import { useEffect, useState } from 'react'

export default function DividerAnimado() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(prev => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      width: '100%',
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'transparent',
      margin: '4px 0',
    }}>
      {/* Linha base dourada com degrade nas pontas */}
      <div style={{
        position: 'absolute',
        width: '60%',
        height: 1.5,
        background: 'linear-gradient(90deg, transparent, #C4975A 20%, #C4975A 80%, transparent)',
      }} />

      {/* Fatia de torta animada (substitui a bolinha) */}
      <div style={{
        position: 'absolute',
        left: `${20 + (offset * 0.6)}%`,
        top: '50%',
        transform: 'translateY(-50%)',
        transition: 'left 0.05s linear',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base da fatia - triangulo */}
          <path d="M12 3 L20 19 L4 19 Z" fill="#A0522D" />
          {/* Cobertura */}
          <path d="M12 3 L18 16 L6 16 Z" fill="#C4975A" />
          {/* Detalhe do glacê no topo */}
          <path d="M12 3 L14 8 L10 8 Z" fill="#D4A574" />
          {/* Frutinha no topo */}
          <circle cx="12" cy="5" r="1.5" fill="#8B4513" />
          {/* Garfo ao lado */}
          <line x1="20" y1="8" x2="22" y2="18" stroke="#A0522D" strokeWidth="1" strokeLinecap="round" />
          <line x1="19" y1="6" x2="20" y2="8" stroke="#A0522D" strokeWidth="1" strokeLinecap="round" />
          <line x1="21" y1="7" x2="22" y2="9" stroke="#A0522D" strokeWidth="1" strokeLinecap="round" />
          <line x1="22.5" y1="6" x2="22.5" y2="18" stroke="#A0522D" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}