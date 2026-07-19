'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import HeaderUnificado from '@/components/HeaderUnificado'
import { theme } from '@/theme'

const COLORS = theme.colors
const SERIF = theme.fonts.serif
const SANS = theme.fonts.sans

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const [modalResetAberto, setModalResetAberto] = useState(false)
  const [emailReset, setEmailReset] = useState('')
  const [mensagemReset, setMensagemReset] = useState(null)
  const [enviandoReset, setEnviandoReset] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)

    const { error } = await login(email, senha)
    setEnviando(false)

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setErro('Seu email ainda nao foi confirmado. Verifique sua caixa de entrada ou spam.')
      } else {
        setErro(error.message)
      }
      return
    }

    router.push('/')
  }

  async function handleResetSenha(e) {
    e.preventDefault()
    if (!emailReset.trim()) return

    setEnviandoReset(true)
    setMensagemReset(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailReset, {
        redirectTo: `${window.location.origin}/atualizar-senha`,
      })

      if (error) {
        setMensagemReset({ tipo: 'erro', texto: error.message || 'Erro ao enviar email.' })
      } else {
        setMensagemReset({ tipo: 'sucesso', texto: 'Email de redefinicao enviado! Verifique sua caixa de entrada.' })
      }
    } catch {
      setMensagemReset({ tipo: 'erro', texto: 'Erro ao enviar email. Tente novamente.' })
    } finally {
      setEnviandoReset(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: SANS }}>
      <HeaderUnificado variante="simples" />

      <div style={{
        maxWidth: '400px', margin: '0 auto', padding: '60px 24px'
      }}>
        <div style={{
          background: COLORS.white, borderRadius: 16, padding: '40px 32px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          border: '1px solid ' + COLORS.border
        }}>
          <h1 style={{
            fontFamily: SERIF, fontSize: '24px', color: COLORS.dark,
            margin: '0 0 8px 0', textAlign: 'center'
          }}>
            Entrar
          </h1>
          <p style={{
            fontSize: '14px', color: COLORS.textSecondary,
            margin: '0 0 28px 0', textAlign: 'center'
          }}>
            Acesse sua conta para continuar
          </p>

          {erro && (
            <div style={{
              padding: '12px 16px', borderRadius: 10,
              background: '#FEE2E2', color: '#B91C1C',
              fontSize: '13px', fontWeight: 600, marginBottom: 20
            }}>
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="input"
              />
            </div>

            <div className="input-group" style={{ marginBottom: 12 }}>
              <label className="input-label">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
                required
                className="input"
              />
            </div>

            <button
              type="button"
              onClick={() => setModalResetAberto(true)}
              style={{
                background: 'none', border: 'none', padding: 0,
                fontSize: '13px', color: COLORS.coral, fontWeight: 600,
                cursor: 'pointer', fontFamily: SANS, marginBottom: 24,
                display: 'inline-block'
              }}
            >
              Esqueceu a senha?
            </button>

            <button
              type="submit"
              disabled={enviando}
              className={`btn btn-primary${enviando ? ' btn-loading' : ''}`}
              style={{ width: '100%' }}
            >
              {enviando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div style={{
            textAlign: 'center', marginTop: 20,
            fontSize: '14px', color: COLORS.textSecondary
          }}>
            Nao tem conta?{' '}
            <Link href="/cadastro" style={{
              color: COLORS.coral, fontWeight: 600, textDecoration: 'none'
            }}>
              Cadastre-se
            </Link>
          </div>
        </div>
      </div>

      {/* Modal esqueceu a senha */}
      {modalResetAberto && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(45, 52, 54, 0.5)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px'
          }}
          onClick={() => setModalResetAberto(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: COLORS.white, borderRadius: 16, padding: 32,
              maxWidth: 400, width: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
            }}
          >
            <h2 style={{
              fontFamily: SERIF, fontSize: '20px', color: COLORS.dark,
              margin: '0 0 8px 0'
            }}>
              Redefinir senha
            </h2>
            <p style={{
              fontSize: '14px', color: COLORS.textSecondary,
              margin: '0 0 20px 0', lineHeight: 1.5
            }}>
              Digite seu email para receber o link de redefinicao.
            </p>

            {mensagemReset && (
              <div style={{
                padding: '10px 14px', borderRadius: 10,
                fontSize: '13px', fontWeight: 600, marginBottom: 16,
                background: mensagemReset.tipo === 'sucesso' ? '#D1FAE5' : '#FEE2E2',
                color: mensagemReset.tipo === 'sucesso' ? '#047857' : '#B91C1C'
              }}>
                {mensagemReset.texto}
              </div>
            )}

            <form onSubmit={handleResetSenha}>
              <div className="input-group" style={{ marginBottom: 20 }}>
                <label className="input-label">Email</label>
                <input
                  type="email"
                  value={emailReset}
                  onChange={(e) => setEmailReset(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="input"
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => {
                    setModalResetAberto(false)
                    setMensagemReset(null)
                    setEmailReset('')
                  }}
                  style={{
                    flex: 1, padding: '10px 24px', borderRadius: 999,
                    border: '1.5px solid ' + COLORS.border,
                    background: 'transparent', color: COLORS.textSecondary,
                    fontSize: '14px', fontWeight: 600, fontFamily: SANS,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviandoReset}
                  className={`btn btn-primary${enviandoReset ? ' btn-loading' : ''}`}
                  style={{ flex: 1 }}
                >
                  {enviandoReset ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}