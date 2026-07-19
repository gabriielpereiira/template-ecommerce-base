'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import HeaderUnificado from '@/components/HeaderUnificado'
import { theme } from '@/theme'

const COLORS = theme.colors
const SERIF = theme.fonts.serif
const SANS = theme.fonts.sans

export default function AtualizarSenhaPage() {
  const router = useRouter()
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // continua na pagina
      }
    })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (senha.length < 6) {
      setErro('A senha deve ter no minimo 6 caracteres.')
      return
    }
    if (senha !== confirmar) {
      setErro('As senhas nao conferem.')
      return
    }

    setEnviando(true)
    const { error } = await supabase.auth.updateUser({ password: senha })
    setEnviando(false)

    if (error) {
      setErro(error.message || 'Erro ao redefinir senha.')
      return
    }

    setSucesso(true)
    setTimeout(() => router.push('/login'), 3000)
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: SANS }}>
      <HeaderUnificado variante="simples" />

      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '80px 24px' }}>
        <div style={{
          background: COLORS.white, borderRadius: 16, padding: '40px 32px',
          border: '1px solid ' + COLORS.border,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
        }}>
          {sucesso ? (
            <>
              <h1 style={{ fontFamily: SERIF, fontSize: '22px', color: COLORS.dark, margin: '0 0 12px 0', textAlign: 'center' }}>
                Senha redefinida!
              </h1>
              <p style={{ fontSize: '14px', color: COLORS.textSecondary, textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
                Sua senha foi alterada com sucesso. Redirecionando para o login...
              </p>
            </>
          ) : (
            <>
              <h1 style={{ fontFamily: SERIF, fontSize: '22px', color: COLORS.dark, margin: '0 0 8px 0', textAlign: 'center' }}>
                Redefinir senha
              </h1>
              <p style={{ fontSize: '14px', color: COLORS.textSecondary, margin: '0 0 28px 0', textAlign: 'center' }}>
                Escolha uma nova senha para sua conta.
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
                  <label className="input-label">Nova senha</label>
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Minimo 6 caracteres"
                    required
                    className="input"
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 24 }}>
                  <label className="input-label">Confirmar nova senha</label>
                  <input
                    type="password"
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    placeholder="Repita a senha"
                    required
                    className="input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={enviando}
                  className={`btn btn-primary${enviando ? ' btn-loading' : ''}`}
                  style={{ width: '100%' }}
                >
                  {enviando ? 'Redefinindo...' : 'Redefinir senha'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}