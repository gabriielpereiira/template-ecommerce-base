'use client'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'

export default function LoginPage() {
  const { login, usuario } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [modalResetAberto, setModalResetAberto] = useState(false)
  const [emailReset, setEmailReset] = useState('')
  const [enviandoReset, setEnviandoReset] = useState(false)
  const [mensagemReset, setMensagemReset] = useState(null)

  if (usuario) {
    return (
      <>
        <Header />
        <div style={{ maxWidth: 400, margin: '60px auto', textAlign: 'center', padding: '0 16px' }}>
          <h1 style={{ fontSize: 24, color: 'var(--color-brand-dark-light)', marginBottom: 16, fontFamily: 'Georgia, "Times New Roman", serif' }}>
            Voce ja esta logado
          </h1>
          <p style={{ color: 'var(--color-brand-text-secondary)', marginBottom: 24 }}>{usuario.email}</p>
          <a href="/cardapio" className="btn btn-primary">
            Ir para o cardapio
          </a>
        </div>
      </>
    )
  }

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

  async function handleResetSenha() {
    if (!emailReset) {
      setMensagemReset({ tipo: 'erro', texto: 'Informe seu email.' })
      return
    }
    setEnviandoReset(true)
    setMensagemReset(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailReset, {
        redirectTo: `${window.location.origin}/atualizar-senha`,
      })
      if (error) {
        setMensagemReset({ tipo: 'erro', texto: error.message || 'Erro ao enviar email de redefinicao.' })
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
    <>
      <Header />
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        background: 'var(--color-brand-bg)',
      }}>
        <div className="card anim-fade-in-up" style={{
          width: '100%',
          maxWidth: 420,
          padding: '36px 32px',
        }}>
          <h1 style={{
            fontSize: 26,
            color: 'var(--color-brand-dark)',
            marginBottom: 8,
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 700,
            textAlign: 'center',
          }}>
            Entrar
          </h1>
          <p style={{
            fontSize: 14,
            color: 'var(--color-brand-text-secondary)',
            marginBottom: 24,
            textAlign: 'center',
          }}>
            Acesse sua conta Tortas da Lika
          </p>

          {erro && (
            <div style={{
              fontSize: 13,
              marginBottom: 16,
              padding: '10px 14px',
              borderRadius: 10,
              background: 'var(--color-status-danger-bg)',
              color: '#B91C1C',
              border: '1px solid #FECACA',
            }}>
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Senha</label>
              <input
                type="password"
                required
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="Sua senha"
                className="input"
              />
            </div>

            <div style={{ textAlign: 'right', marginTop: -8 }}>
              <button
                type="button"
                onClick={() => {
                  setEmailReset(email)
                  setModalResetAberto(true)
                  setMensagemReset(null)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-brand-gold)',
                  fontSize: 13,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  padding: 0,
                  fontWeight: 500,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand-gold-dark)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-brand-gold)'}
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="btn btn-primary btn-lg btn-block"
              style={{ marginTop: 4 }}
            >
              {enviando ? 'Entrando...' : 'Entrar'}
            </button>

            <p style={{
              textAlign: 'center',
              fontSize: 14,
              color: 'var(--color-brand-text-secondary)',
              marginTop: 8,
            }}>
              Ainda nao tem conta?{' '}
              <a
                href="/cadastro"
                style={{
                  color: 'var(--color-brand-gold)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand-gold-dark)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-brand-gold)'}
              >
                Cadastre-se
              </a>
            </p>
          </form>
        </div>
      </div>

      {/* Modal de esqueceu a senha */}
      {modalResetAberto && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(45, 27, 14, 0.5)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => setModalResetAberto(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="card anim-scale-in"
            style={{
              padding: '32px', maxWidth: '400px', width: '100%',
            }}
          >
            <h2 style={{
              fontSize: 20,
              color: 'var(--color-brand-dark)',
              marginBottom: 8,
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 700,
            }}>
              Redefinir senha
            </h2>
            <p style={{
              fontSize: 14,
              color: 'var(--color-brand-text-secondary)',
              marginBottom: 20,
            }}>
              Digite seu email para receber o link de redefinicao.
            </p>

            <div className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label">Email</label>
              <input
                type="email"
                value={emailReset}
                onChange={e => setEmailReset(e.target.value)}
                placeholder="seu@email.com"
                className="input"
              />
            </div>

            {mensagemReset && (
              <div style={{
                fontSize: 13,
                marginBottom: 16,
                padding: '10px 14px',
                borderRadius: 10,
                background: mensagemReset.tipo === 'sucesso' ? 'var(--color-status-success-bg)' : 'var(--color-status-danger-bg)',
                color: mensagemReset.tipo === 'sucesso' ? '#047857' : '#B91C1C',
                border: `1px solid ${mensagemReset.tipo === 'sucesso' ? '#A7F3D0' : '#FECACA'}`,
              }}>
                {mensagemReset.texto}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setModalResetAberto(false)
                  setMensagemReset(null)
                }}
                className="btn btn-ghost"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetSenha}
                disabled={enviandoReset}
                className="btn btn-primary"
              >
                {enviandoReset ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}