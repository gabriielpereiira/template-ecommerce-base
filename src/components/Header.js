'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useCarrinho } from '../app/context/CarrinhoContext'
import { useAuth } from '../app/context/AuthContext'
import { storeConfig } from '@/config/store'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { totalItens, setAberto } = useCarrinho()
  const { usuario, logout } = useAuth()
  const emailsAdmin = storeConfig.admin.adminEmails
  const isAdmin = usuario && emailsAdmin.includes(usuario.email)
  const [isMobile, setIsMobile] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const isActive = (href) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const navLinks = [
    { href: '/cardapio', label: 'Cardapio' },
    { href: '/pedidos', label: 'Meus Pedidos' },
  ]

  if (isAdmin) {
    navLinks.push({
      href: '/admin/pedidos',
      label: 'Admin',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    })
  }

  const handleCarrinho = () => setAberto(true)

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
      background: 'var(--color-brand-bg)',
      borderBottom: '1px solid var(--color-brand-border-light)',
      boxShadow: '0 1px 4px rgba(45, 27, 14, 0.04)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Logo */}
        <Link href="/" style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--color-brand-dark)',
          textDecoration: 'none',
          fontFamily: '"Playfair Display", Georgia, serif',
          letterSpacing: '0.3px',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Tortas da Lika
        </Link>

        {!isMobile && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {navLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 999,
                    color: active ? 'var(--color-brand-gold)' : 'var(--color-brand-dark-light)',
                    background: active ? 'rgba(196, 151, 90, 0.1)' : 'transparent',
                    fontSize: '14px',
                    fontWeight: active ? 600 : 500,
                    textDecoration: 'none',
                    transition: 'all 0.25s ease',
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'rgba(196, 151, 90, 0.06)'
                      e.currentTarget.style.color = 'var(--color-brand-gold)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--color-brand-dark-light)'
                    }
                  }}
                >
                  {link.icon && link.icon}
                  {link.label}
                  {active && (
                    <span style={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: 'var(--color-brand-gold)',
                      display: 'inline-block',
                    }} />
                  )}
                </Link>
              )
            })}
          </nav>
        )}

        {/* Direita */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {usuario && isMobile && (
            <Link href="/pedidos" style={{
              color: 'var(--color-brand-text-secondary)',
              fontSize: 13,
              textDecoration: 'none',
              fontWeight: 500,
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}>
              Pedidos
            </Link>
          )}

          {/* Botao Sacolinha */}
          <button
            onClick={handleCarrinho}
            className="btn btn-ghost-gold"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 20px',
              borderRadius: 999,
              border: '1.5px solid var(--color-brand-gold)',
              color: 'var(--color-brand-gold)',
              background: 'transparent',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              transition: 'all 0.25s ease',
              textDecoration: 'none',
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Sacola
            {totalItens > 0 && (
              <span style={{
                background: 'var(--color-brand-gold)',
                color: 'white',
                borderRadius: '50%',
                width: 22,
                height: 22,
                fontSize: 11,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                transition: 'transform 0.2s',
              }}>
                {totalItens}
              </span>
            )}
          </button>

          {/* Usuario */}
          {usuario ? (
            <button
              onClick={logout}
              className="btn btn-ghost"
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                border: '1px solid var(--color-brand-border)',
                color: 'var(--color-brand-text-secondary)',
                background: 'transparent',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                transition: 'all 0.25s ease',
              }}
            >
              Sair
            </button>
          ) : (
            <Link href="/login" className="btn btn-primary" style={{
              padding: '8px 20px',
              borderRadius: 999,
              border: 'none',
              background: 'var(--color-brand-dark)',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              textDecoration: 'none',
              transition: 'all 0.25s ease',
              letterSpacing: '0.3px',
              boxShadow: '0 2px 8px rgba(45, 27, 14, 0.15)',
            }}>
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}