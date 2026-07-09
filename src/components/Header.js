'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useCarrinho } from '../app/context/CarrinhoContext'
import { useAuth } from '../app/context/AuthContext'
import { storeConfig } from '@/config/store'

export default function Header({ onCartClick }) {
  const [scrolled, setScrolled] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const { totalItens, setAberto } = useCarrinho()
  const { usuario, logout } = useAuth()

  // Lista de emails que podem acessar o admin
  const emailsAdmin = storeConfig.admin.adminEmails
  const isAdmin = usuario && emailsAdmin.includes(usuario.email)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleCarrinho = () => {
    if (onCartClick) {
      onCartClick()
    } else {
      setAberto(true)
    }
  }

  const handleSair = () => {
    logout()
    router.push('/')
  }

  const isActive = (path) => pathname === path

  const getInitial = () => {
    if (usuario && usuario.email) {
      return usuario.email.charAt(0).toUpperCase()
    }
    return '?'
  }

  const navLinks = [
    {
      href: '/cardapio',
      label: 'Cardapio',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A3B2F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 3v8a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3" />
          <path d="M7 13v8" />
          <path d="M19 3c-1.5 1-2 3-2 5s0.5 4 2 5v8" />
        </svg>
      )
    },
    {
      href: '/pedidos',
      label: 'Meus Pedidos',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A3B2F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="M3.27 6.96 12 12.01l8.73-5.05" />
          <path d="M12 22.08V12" />
        </svg>
      )
    }
  ]

  // So adiciona o link Admin se o usuario logado for administrador
  if (isAdmin) {
    navLinks.push({
      href: '/admin/pedidos',
      label: 'Admin',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A3B2F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    })
  }

  const styles = {
    wrapper: {
      opacity: loaded ? 1 : 0,
      transition: 'opacity 0.4s ease, box-shadow 0.3s ease',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      height: '72px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid rgba(196,151,90,0.15)',
      boxShadow: scrolled ? '0 6px 20px rgba(45,27,14,0.12)' : '0 2px 8px rgba(45,27,14,0.04)'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      height: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 40px',
      boxSizing: 'border-box'
    },
    brand: {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      fontWeight: 700,
      color: '#2D1B0E',
      textDecoration: 'none',
      letterSpacing: '-0.5px'
    },
    nav: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      flex: 1,
      justifyContent: 'center'
    },
    avatarCircle: {
      width: '42px',
      height: '42px',
      borderRadius: '50%',
      background: '#C4975A',
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: 700,
      cursor: 'pointer',
      position: 'relative',
      textDecoration: 'none',
      transition: 'all 0.2s ease',
      border: '2px solid transparent'
    },
    pill: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 16px',
      borderRadius: '999px',
      border: '1.5px solid #C4975A',
      color: '#C4975A',
      background: 'transparent',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'all 0.2s ease',
      textDecoration: 'none'
    },
    cartButton: {
      display: 'inline-flex',
      alignItems: 'center',
      position: 'relative',
      background: '#C4975A',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '999px',
      padding: '9px 18px',
      fontSize: '13px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'background 0.2s ease'
    },
    badge: {
      position: 'absolute',
      top: '-6px',
      right: '-6px',
      minWidth: '20px',
      height: '20px',
      borderRadius: '999px',
      background: '#2D1B0E',
      color: '#FFFFFF',
      fontSize: '11px',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 4px',
      boxSizing: 'border-box'
    }
  }

  const renderIcon = (icon, active) => {
    if (!icon) return null
    const stroke = active ? '#C4975A' : '#4A3B2F'
    return (
      <svg
        width="16"
        height="16"
        viewBox={icon.props.viewBox}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon.props.children}
      </svg>
    )
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <Link href="/" style={styles.brand}>{storeConfig.identidade.name}</Link>

        <nav style={styles.nav}>
          {navLinks.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: active ? '#C4975A' : '#4A3B2F',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  borderBottom: active ? '2px solid #C4975A' : '2px solid transparent',
                  paddingBottom: '4px',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {renderIcon(link.icon, active)} {link.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {usuario ? (
            <>
              <Link
                href="/perfil"
                style={styles.avatarCircle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2D1B0E'
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                {getInitial()}
              </Link>

              <button
                onClick={handleSair}
                style={styles.pill}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#C4975A'
                  e.currentTarget.style.color = '#FFFFFF'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#C4975A'
                }}
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              href="/login"
              style={styles.pill}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#C4975A'
                e.currentTarget.style.color = '#FFFFFF'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#C4975A'
              }}
            >
              Entrar
            </Link>
          )}

          <button onClick={handleCarrinho} style={styles.cartButton}>
            Sua Sacolinha
            {totalItens > 0 && <span style={styles.badge}>{totalItens}</span>}
          </button>
        </div>
      </div>
    </div>
  )
}