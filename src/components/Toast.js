'use client'
import { theme } from '@/theme'

const COLORS = theme.colors

export default function Toast({ mensagem, visivel, cor }) {
  if (!mensagem) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: cor || COLORS.dark,
      color: COLORS.textOnDark,
      padding: '14px 28px',
      borderRadius: '999px',
      border: '1px solid ' + (cor || COLORS.gold),
      fontSize: '14px',
      fontWeight: 600,
      zIndex: 9999,
      boxShadow: '0 8px 24px rgba(45,27,14,0.25)',
      transition: 'opacity 0.3s ease',
      opacity: visivel === false ? 0 : 1
    }}>
      {mensagem}
    </div>
  )
}