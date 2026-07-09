'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AtualizarSenhaPage() {
  const router = useRouter()
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState(null)
  const [processando, setProcessando] = useState(true)

  useEffect(() => {
    // O Supabase coloca o token de recuperacao na URL hash
    // O client do Supabase consegue extrair isso automaticamente
    const handleRecovery = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setMensagem({ tipo: 'erro', texto: 'Link invalido ou expirado. Solicite uma nova redefinicao de senha.' })
        setProcessando(false)
        return
      }

      // Se ja tem sessao, pode seguir
      setProcessando(false)
    }

    handleRecovery()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setMensagem(null)

    if (novaSenha.length < 6) {
      setMensagem({ tipo: 'erro', texto: 'A senha deve ter no minimo 6 caracteres.' })
      return
    }

    if (novaSenha !== confirmarSenha) {
      setMensagem({ tipo: 'erro', texto: 'As senhas nao conferem.' })
      return
    }

    setEnviando(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: novaSenha
      })

      if (error) {
        setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao redefinir senha.' })
      } else {
        setMensagem({ tipo: 'sucesso', texto: 'Senha redefinida com sucesso! Redirecionando...' })
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao redefinir senha. Tente novamente.' })
    } finally {
      setEnviando(false)
    }
  }

  if (processando) {
    return (
      <div style={{ maxWidth: 400, margin: '80px auto', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        <p style={{ color: '#666' }}>Processando link de redefinicao...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: 24, color: '#4a3728', marginBottom: 8 }}>Redefinir senha</h1>
      <p style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>Digite sua nova senha.</p>

      {mensagem && (
        <p style={{
          fontSize: 13, marginBottom: 16, padding: '10px 12px', borderRadius: 6,
          background: mensagem.tipo === 'sucesso' ? '#e8f5e9' : '#ffe8e8',
          color: mensagem.tipo === 'sucesso' ? '#2e7d32' : '#c00',
        }}>
          {mensagem.texto}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>Nova senha</label>
          <input
            type="password"
            required
            value={novaSenha}
            onChange={e => setNovaSenha(e.target.value)}
            placeholder="Minimo 6 caracteres"
            style={{
              width: '100%', padding: '10px 12px', border: '1px solid #ddd',
              borderRadius: 6, fontSize: 14, boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>Confirmar nova senha</label>
          <input
            type="password"
            required
            value={confirmarSenha}
            onChange={e => setConfirmarSenha(e.target.value)}
            placeholder="Repita a nova senha"
            style={{
              width: '100%', padding: '10px 12px', border: '1px solid #ddd',
              borderRadius: 6, fontSize: 14, boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={enviando}
          style={{
            width: '100%', background: enviando ? '#999' : '#4a3728', color: '#fff',
            border: 'none', padding: '12px', borderRadius: 6, fontSize: 15,
            cursor: enviando ? 'not-allowed' : 'pointer',
          }}
        >
          {enviando ? 'Redefinindo...' : 'Redefinir senha'}
        </button>
      </form>
    </div>
  )
}