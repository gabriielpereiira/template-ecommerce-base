'use client'

import Link from 'next/link'
import { useAuth } from '@/app/context/AuthContext'

export default function HeaderCliente() {
  const { usuario, perfil, carregando, logout } = useAuth()

  const nomeExibicao = perfil?.nome || usuario?.email || ''
  const primeiroNome = nomeExibicao.split(' ')[0]

  const estilos = {
    header: {
      position: 'sticky',
      top: 0,
      zIndex: 50,
      width: '100%',
      backgroundColor: '#FBF6EF',
      borderBottom: '1px solid #E8D9C5',
      boxShadow: '0 2px 8px rgba(74, 55, 40, 0.08)'
    },
    container: {
      maxWidth: '72rem',
      margin: '0 auto',
      padding: '0 1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px'
    },
    marca: {
      fontSize: '1.35rem',
      fontWeight: 700,
      color: '#4a3728',
      textDecoration: 'none',
      letterSpacing: '0.3px',
      fontFamily: "Georgia, 'Times New Roman', serif"
    },
    nav: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem'
    },
    linkNav: {
      color: '#4a3728',
      textDecoration: 'none',
      fontSize: '0.95rem',
      fontWeight: 500,
    },
    grupoUsuario: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    nomeUsuario: {
      color: '#4a3728',
      fontSize: '0.9rem',
      fontWeight: 600
    },
    botaoSair: {
      backgroundColor: 'transparent',
      border: '1px solid #8B5E3C',
      color: '#8B5E3C',
      borderRadius: '999px',
      padding: '0.35rem 0.9rem',
      fontSize: '0.85rem',
      fontWeight: 600,
      cursor: 'pointer',
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
            Cardapio
          </Link>

          {carregando ? (
            <span style={{ color: '#4a3728', fontSize: '0.95rem' }}>...</span>
          ) : usuario ? (
            <div style={estilos.grupoUsuario}>
              <Link href="/pedidos" style={estilos.linkNav}>
                Meus Pedidos
              </Link>
              <Link href="/perfil" style={estilos.linkNav}>
                Meu Perfil
              </Link>

              <svg width={32} height={32} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="15" fill="#D4A574" stroke="#8B5E3C" strokeWidth="1" />
                <path d="M3 13 Q16 4 29 13 L29 11 Q16 2 3 11 Z" fill="#8B5E3C" />
                <circle cx="12" cy="17" r="1.4" fill="#3B2417" />
                <circle cx="20" cy="17" r="1.4" fill="#3B2417" />
                <path d="M12 21 Q16 24 20 21" fill="none" stroke="#3B2417" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="9" cy="11" r="1" fill="#E63946" />
                <circle cx="15" cy="8" r="1" fill="#F4A261" />
                <circle cx="21" cy="9" r="1" fill="#2A9D8F" />
                <circle cx="25" cy="12" r="1" fill="#9B5DE5" />
              </svg>

              <span style={estilos.nomeUsuario}>{primeiroNome}</span>

              <button
                type="button"
                onClick={logout}
                style={estilos.botaoSair}
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