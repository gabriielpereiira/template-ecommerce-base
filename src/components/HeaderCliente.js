'use client'
import Link from 'next/link'
import { useAuth } from '@/app/context/AuthContext'
import { theme } from '@/theme'

const COLORS = theme.colors
const SERIF = theme.fonts.serif
const SANS = theme.fonts.sans

export default function HeaderCliente() {
  const { usuario, perfil, carregando, logout } = useAuth()
  const nomeExibicao = perfil?.nome || usuario?.email || ''
  const primeiroNome = nomeExibicao.split(' ')[0]

  const estilos = {
    header: {
      background: COLORS.white,
      borderBottom: '1px solid ' + COLORS.border,
      padding: '0 32px', height: 64,
      display: 'flex', alignItems: 'center',
      fontFamily: SANS
    },
    container: {
      maxWidth: 1200, margin: '0 auto', width: '100%',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    marca: {
      fontFamily: SERIF, fontSize: 22, fontWeight: 700,
      color: COLORS.dark, textDecoration: 'none',
      letterSpacing: '-0.5px', whiteSpace: 'nowrap'
    },
    nav: { display: 'flex', alignItems: 'center', gap: 24 },
    linkNav: {
      color: COLORS.textSecondary, textDecoration: 'none',
      fontSize: '0.95rem', fontWeight: 500,
      fontFamily: SANS, transition: 'color 0.2s'
    },
    grupoUsuario: { display: 'flex', alignItems: 'center', gap: 16 },
    avatarLink: {
      display: 'flex', alignItems: 'center', gap: 8,
      textDecoration: 'none', color: 'inherit',
      cursor: 'pointer', transition: 'opacity 0.2s'
    },
    nomeUsuario: {
      fontSize: '0.95rem', fontWeight: 600,
      color: COLORS.dark, fontFamily: SANS
    },
    botaoSair: {
      background: 'none', border: '1px solid ' + COLORS.coral,
      borderRadius: 6, padding: '6px 14px',
      color: COLORS.coral, cursor: 'pointer',
      fontSize: '0.85rem', fontWeight: 500,
      fontFamily: SANS, transition: 'all 0.2s'
    }
  }

  return (
    <header style={estilos.header}>
      <div style={estilos.container}>
        <Link href="/" style={estilos.marca}>
          {perfil?.nome ? perfil.nome.split(' ')[0] : 'Inicio'}
        </Link>

        <nav style={estilos.nav}>
          <Link href="/cardapio" style={estilos.linkNav}>Cardapio</Link>

          {carregando ? (
            <span style={{ color: COLORS.textSecondary, fontSize: '0.95rem' }}>...</span>
          ) : usuario ? (
            <div style={estilos.grupoUsuario}>
              <Link href="/pedidos" style={estilos.linkNav}>Meus Pedidos</Link>

              <Link href="/perfil" style={estilos.avatarLink}>
                <svg width={32} height={32} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="15" fill={COLORS.coral} stroke="#E55A5A" strokeWidth="1" />
                  <text x="16" y="21" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white" fontFamily="Arial, sans-serif">
                    {primeiroNome.charAt(0).toUpperCase()}
                  </text>
                </svg>
                <span style={estilos.nomeUsuario}>{primeiroNome}</span>
              </Link>

              <button type="button" onClick={logout} style={estilos.botaoSair}
                onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.coral; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLORS.coral }}
              >Sair</button>
            </div>
          ) : (
            <Link href="/login" style={estilos.linkNav}>Entrar</Link>
          )}
        </nav>
      </div>
    </header>
  )
}