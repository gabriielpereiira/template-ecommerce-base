'use client'
import Link from 'next/link'
import { useAuth } from '@/app/context/AuthContext'

export default function HeaderCliente() {
  const { usuario, perfil, carregando, logout } = useAuth()
  const nomeExibicao = perfil?.nome || usuario?.email || ''
  const primeiroNome = nomeExibicao.split(' ')[0]

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      width: '100%',
      background: 'var(--color-brand-bg)',
      borderBottom: '1px solid var(--color-brand-border-light)',
      boxShadow: '0 1px 4px rgba(45, 27, 14, 0.04)',
    }}>
      <div style={{
        maxWidth: '72rem',
        margin: '0 auto',
        padding: '0 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        <Link href="/" style={{
          fontSize: '1.35rem',
          fontWeight: 700,
          color: 'var(--color-brand-dark)',
          textDecoration: 'none',
          letterSpacing: '0.3px',
          fontFamily: '"Playfair Display", Georgia, serif',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Tortas da Lika
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link href="/cardapio" style={{
            color: 'var(--color-brand-dark-light)',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: 500,
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand-gold)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-brand-dark-light)'}>
            Cardapio
          </Link>

          {carregando ? (
            <span style={{ color: 'var(--color-brand-text-secondary)', fontSize: '0.95rem' }}>...</span>
          ) : usuario ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link href="/pedidos" style={{
                color: 'var(--color-brand-dark-light)',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand-gold)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-brand-dark-light)'}>
                Meus Pedidos
              </Link>
              <Link href="/perfil" style={{
                color: 'var(--color-brand-dark-light)',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand-gold)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-brand-dark-light)'}>
                Meu Perfil
              </Link>

              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--color-brand-gold-light)',
                border: '2px solid var(--color-brand-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 700,
                color: 'white',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
              }}>
                {primeiroNome.charAt(0).toUpperCase()}
              </div>

              <span style={{
                color: 'var(--color-brand-dark-light)',
                fontSize: '0.9rem',
                fontWeight: 600,
                fontFamily: '"Plus Jakarta Sans", sans-serif',
              }}>
                {primeiroNome}
              </span>

              <button
                type="button"
                onClick={logout}
                className="btn btn-ghost"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--color-brand-border)',
                  color: 'var(--color-brand-text-secondary)',
                  borderRadius: 999,
                  padding: '0.35rem 0.9rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  transition: 'all 0.25s ease',
                }}
              >
                Sair
              </button>
            </div>
          ) : (
            <Link href="/login" style={{
              color: 'var(--color-brand-dark-light)',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand-gold)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-brand-dark-light)'}>
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}