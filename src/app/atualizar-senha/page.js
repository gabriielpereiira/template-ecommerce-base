'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AtualizarSenhaPage() {
  const router = useRouter()
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mensagem, setMensagem] = useState(null)
  const [processando, setProcessando] = useState(true)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const handleRecovery = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setMensagem({ tipo: 'erro', texto: 'Link inválido ou expirado. Solicite uma nova redefinição de senha.' })
        setProcessando(false)
        return
      }

      setProcessando(false)
    }

    handleRecovery()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setMensagem(null)

    if (novaSenha.length < 6) {
      setMensagem({ tipo: 'erro', texto: 'A senha deve ter no mínimo 6 caracteres.' })
      return
    }

    if (novaSenha !== confirmarSenha) {
      setMensagem({ tipo: 'erro', texto: 'As senhas não conferem.' })
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
        <p style={{ color: '#666' }}>Processando link de redefinição...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', fontSize: 24, color: '#2D1B0E', marginBottom: 32 }}>
        Redefinir senha
      </h1>

      {mensagem && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 20,
          fontSize: 14,
          background: mensagem.tipo === 'erro' ? '#FEE2E2' : '#D1FAE5',
          color: mensagem.tipo === 'erro' ? '#991B1B' : '#065F46',
          textAlign: 'center'
        }}>
          {mensagem.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#2D1B0E' }}>
            Nova senha
          </label>
          <input
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid #E8E0D8',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#2D1B0E' }}>
            Confirmar nova senha
          </label>
          <input
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            placeholder="Repita a senha"
            required
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid #E8E0D8',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={enviando}
          style={{
            padding: '14px 28px',
            borderRadius: 8,
            border: 'none',
            background: enviando ? '#999' : '#C4975A',
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            cursor: enviando ? 'not-allowed' : 'pointer',
            marginTop: 8
          }}
        >
          {enviando ? 'Redefinindo...' : 'Redefinir senha'}
        </button>
      </form>
    </div>
  )
}