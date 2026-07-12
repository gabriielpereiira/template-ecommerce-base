'use client'
import Link from 'next/link'
import { useAuth } from '@/app/context/AuthContext'

export default function HeaderCliente() {
  const { usuario, perfil, carregando, logout } = useAuth()

  const nomeExibicao = perfil?.nome || usuario?.email || ''
  const primeiroNome = nomeExibicao.split(' ')[0]

  const estilos = {
    header: {
      background: '#FAF7F2',
      borderBottom: '1px solid #E8D9C8',
      padding: '0 32px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      fontFamily: '"Inter", Arial, sans-serif'
    },
    container: {
      maxWidth: 1200,
      margin: '0 auto',
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    marca: {
      fontFamily: 'Georgia, serif',
      fontSize: 22,
      fontWeight: 700,
      color: '#2D1B0E',
      textDecoration: 'none',
      letterSpacing: '-0.5px',
      whiteSpace: 'nowrap'
    },
    nav: {
      display: 'flex',
      alignItems: 'center',
      gap: 24,
    },
    linkNav: {
      color: '#4a3728',
      textDecoration: 'none',
      fontSize: '0.95rem',
      fontWeight: 500,
      transition: 'color 0.2s',
      fontFamily: '"Inter", Arial, sans-serif'
    },
    grupoUsuario: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    },
    avatarLink: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      textDecoration: 'none',
      color: 'inherit',
      cursor: 'pointer',
      transition: 'opacity 0.2s'
    },
    nomeUsuario: {
      fontSize: '0.95rem',
      fontWeight: 600,
      color: '#2D1B0E',
      fontFamily: '"Inter", Arial, sans-serif'
    },
    botaoSair: {
      background: 'none',
      border: '1px solid #D4A574',
      borderRadius: 6,
      padding: '6px 14px',
      color: '#8B5E3C',
      cursor: 'pointer',
      fontSize: '0.85rem',
      fontWeight: 500,
      fontFamily: '"Inter", Arial, sans-serif',
      transition: 'all 0.2s'
    }
  }

  return (
    <header style={estilos.header}>
      <div style={estilos.container}>
        <Link href="/" style={estilos.marca}>
          Tortas da Lika
        </Link>

        <nav style={estilos.nav}>
          <Link href="/cardapio" style={estilos.linkNav}>
            Cardápio
          </Link>

          {carregando ? (
            <span style={{ color: '#4a3728', fontSize: '0.95rem' }}>...</span>
          ) : usuario ? (
            <div style={estilos.grupoUsuario}>
              <Link href="/pedidos" style={estilos.linkNav}>
                Meus Pedidos
              </Link>

              <Link href="/perfil" style={estilos.avatarLink}>
                <svg width={32} height={32} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="15" fill="#D4A574" stroke="#8B5E3C" strokeWidth="1" />
                  <text x="16" y="21" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#3A2318" fontFamily="Arial, sans-serif">
                    {primeiroNome.charAt(0).toUpperCase()}
                  </text>
                </svg>
                <span style={estilos.nomeUsuario}>{primeiroNome}</span>
              </Link>

              <button
                type="button"
                onClick={logout}
                style={estilos.botaoSair}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#D4A574'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#8B5E3C'
                }}
              >
                Sair
              </button>
            </div>
          ) : (
            <Link href="/login" style={estilos.linkNav}>
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}