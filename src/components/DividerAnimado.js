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
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'transparent',
      margin: '8px 0',
    }}>
      {/* Linha base dourada com degradê nas pontas */}
      <div style={{
        position: 'absolute',
        width: '60%',
        height: 1.5,
        background: 'linear-gradient(90deg, transparent, #C4975A 20%, #C4975A 80%, transparent)',
      }} />

      {/* Gota de chocolate animada */}
      <div style={{
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: '#8B4513',
        left: `${20 + (offset * 0.6)}%`,
        top: '50%',
        transform: 'translateY(-50%)',
        boxShadow: '0 0 4px rgba(139, 69, 19, 0.3)',
        transition: 'left 0.05s linear',
      }} />

      {/* Brilho especular na gota */}
      <div style={{
        position: 'absolute',
        width: 3,
        height: 3,
        borderRadius: '50%',
        background: '#D4A574',
        left: `${19.5 + (offset * 0.6)}%`,
        top: '42%',
        transform: 'translateY(-50%)',
        transition: 'left 0.05s linear',
      }} />
    </div>
  )
}