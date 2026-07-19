'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useCarrinho } from '../app/context/CarrinhoContext'
import { useAuth } from '../app/context/AuthContext'
import { storeConfig } from '@/config/store'
import { theme } from '@/theme'

const COLORS = theme.colors
const SERIF = theme.fonts.serif
const SANS = theme.fonts.sans
const { identidade, navegacao } = storeConfig

function useMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768) }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

const styles = {
  wrapper: {
    background: COLORS.white,
    borderBottom: '1px solid ' + COLORS.border,
    position: 'sticky', top: 0, zIndex: 9999
  },
  inner: {
    maxWidth: '1200px', margin: '0 auto', padding: '0 24px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    height: '68px'
  },
  leftSection: {
    display: 'flex', alignItems: 'center', gap: 14
  },
  logoText: {
    fontFamily: SERIF, fontSize: '20px', fontWeight: 700,
    color: COLORS.dark, lineHeight: 1.2, letterSpacing: '-0.3px'
  },
  logoSublime: {
    fontFamily: SANS, fontSize: '11px', color: COLORS.turquoise,
    fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase'
  },
  navLink: {
    padding: '8px 16px', borderRadius: '999px',
    fontSize: '14px', fontWeight: 600, color: COLORS.textSecondary,
    textDecoration: 'none', transition: 'all 0.2s'
  },
  navLinkActive: {
    background: COLORS.bg, color: COLORS.dark
  },
  actions: {
    display: 'flex', alignItems: 'center', gap: 12
  },
  iconButton: {
    position: 'relative', width: '40px', height: '40px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '50%', border: 'none', background: 'transparent',
    cursor: 'pointer', color: COLORS.dark, transition: 'all 0.2s'
  },
  badge: {
    position: 'absolute', top: 4, right: 4,
    background: COLORS.coral, color: COLORS.white,
    fontSize: '10px', fontWeight: 700, minWidth: '18px', height: '18px',
    borderRadius: '999px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '0 4px'
  },
  userMenu: { position: 'relative' },
  userButton: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 14px', borderRadius: '999px',
    border: '1.5px solid ' + COLORS.border,
    background: COLORS.white, cursor: 'pointer',
    fontFamily: SANS, fontSize: '13px', fontWeight: 600,
    color: COLORS.dark, transition: 'all 0.2s'
  },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
    background: COLORS.white, borderRadius: 12,
    border: '1px solid ' + COLORS.border,
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    minWidth: '180px', overflow: 'hidden', zIndex: 10000
  },
  dropdownItem: {
    display: 'block', width: '100%', padding: '12px 16px',
    fontSize: '14px', color: COLORS.dark, textDecoration: 'none',
    border: 'none', background: 'none', textAlign: 'left',
    fontFamily: SANS, fontWeight: 500, cursor: 'pointer',
    transition: 'background 0.15s'
  },
  hamburger: {
    width: '40px', height: '40px', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    border: 'none', background: 'transparent', cursor: 'pointer',
    color: COLORS.dark
  }
}

export default function Header({ variante = 'completo' }) {
  const router = useRouter()
  const pathname = usePathname()
  const { itens } = useCarrinho()
  const { usuario, logout } = useAuth()
  const isMobile = useMobile()

  const totalItens = itens.reduce((acc, item) => acc + (item.quantidade || 1), 0)
  const [menuAberto, setMenuAberto] = useState(false)
  const [mobileAberto, setMobileAberto] = useState(false)
  const [logoHover, setLogoHover] = useState(false)

  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest('[data-user-menu]')) setMenuAberto(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  useEffect(() => { setMobileAberto(false) }, [pathname])

  if (variante === 'simples') {
    return (
      <header style={styles.wrapper}>
        <div style={styles.inner}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: SERIF, fontSize: '20px', fontWeight: 700, color: COLORS.dark }}>
              {identidade.name}
            </span>
          </Link>
        </div>
      </header>
    )
  }

  const navLinks = navegacao?.navLinks || [
    { href: '/cardapio', label: 'Cardapio' },
    { href: '/pedidos', label: 'Meus Pedidos' }
  ]

  return (
    <header style={styles.wrapper}>
      <div style={styles.inner}>
        <div style={styles.leftSection}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: 14,
            textDecoration: 'none',
            opacity: logoHover ? 0.85 : 1,
            transform: logoHover ? 'scale(0.98)' : 'scale(1)',
            transition: 'all 0.3s ease'
          }}
            onMouseEnter={() => setLogoHover(true)}
            onMouseLeave={() => setLogoHover(false)}
          >
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: `linear-gradient(135deg, ${COLORS.coral} 0%, #E55A5A 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={styles.logoText}>{identidade.name}</span>
              <span style={styles.logoSublime}>{identidade.subtitle}</span>
            </div>
          </Link>
        </div>

        {!isMobile && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {navLinks.map(link => {
              const isActive = pathname === link.href || pathname?.startsWith(link.href + '/')
              return (
                <Link key={link.href} href={link.href} style={{
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? COLORS.dark : COLORS.textSecondary
                }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = COLORS.bg; e.currentTarget.style.color = COLORS.dark } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLORS.textSecondary } }}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        )}

        <div style={styles.actions}>
          <button onClick={() => router.push('/carrinho')} style={styles.iconButton}
            onMouseEnter={e => { e.currentTarget.style.background = COLORS.bg }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {totalItens > 0 && <span style={styles.badge}>{totalItens > 9 ? '9+' : totalItens}</span>}
          </button>

          <div data-user-menu style={styles.userMenu}>
            {usuario ? (
              <>
                <button onClick={() => setMenuAberto(!menuAberto)} style={styles.userButton}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.coral }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {usuario.email?.split('@')[0] || 'Conta'}
                  </span>
                </button>

                {menuAberto && (
                  <div style={styles.dropdown}>
                    <Link href="/pedidos" style={styles.dropdownItem}
                      onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >Meus Pedidos</Link>
                    {storeConfig.admin?.adminEmails?.includes(usuario.email) && (
                      <Link href="/admin/pedidos" style={styles.dropdownItem}
                        onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >Admin</Link>
                    )}
                    <button onClick={() => { logout(); router.push('/') }} style={styles.dropdownItem}
                      onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >Sair</button>
                  </div>
                )}
              </>
            ) : (
              <button onClick={() => router.push('/login')} style={styles.userButton}
                onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.coral; e.currentTarget.style.background = COLORS.bg }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.background = COLORS.white }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                Entrar
              </button>
            )}
          </div>

          {isMobile && (
            <button onClick={() => setMobileAberto(!mobileAberto)} style={styles.hamburger}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileAberto ? (
                  <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                ) : (
                  <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {isMobile && mobileAberto && (
        <div style={{
          borderTop: '1px solid ' + COLORS.border,
          background: COLORS.white, padding: '16px 24px',
          display: 'flex', flexDirection: 'column', gap: 8
        }}>
          {navLinks.map(link => {
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href} style={{
                padding: '12px 16px', borderRadius: '10px',
                fontSize: '15px', fontWeight: isActive ? 700 : 600,
                color: isActive ? COLORS.dark : COLORS.textSecondary,
                background: isActive ? COLORS.bg : 'transparent',
                textDecoration: 'none', fontFamily: SANS
              }}>{link.label}</Link>
            )
          })}
          {usuario && storeConfig.admin?.adminEmails?.includes(usuario.email) && (
            <Link href="/admin/pedidos" style={{
              padding: '12px 16px', borderRadius: '10px',
              fontSize: '15px', fontWeight: 600,
              color: COLORS.turquoise, textDecoration: 'none', fontFamily: SANS
            }}>Admin</Link>
          )}
        </div>
      )}
    </header>
  )
}