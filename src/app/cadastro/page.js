'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import HeaderUnificado from '@/components/HeaderUnificado'
import { theme } from '@/theme'

const COLORS = theme.colors
const SERIF = theme.fonts.serif
const SANS = theme.fonts.sans

export default function CadastroPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: ''
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.nome) { setError('Preencha o nome completo.'); return }
    if (form.senha.length < 6) { setError('A senha deve ter no minimo 6 caracteres.'); return }
    if (form.senha !== form.confirmarSenha) { setError('As senhas nao conferem.'); return }

    setSubmitting(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.senha,
        options: {
          data: {
            nome: form.nome,
            telefone: form.telefone
          }
        }
      })

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('Este email ja esta cadastrado.')
        } else {
          setError(signUpError.message)
        }
        return
      }

      if (data?.user) {
        router.push('/login?cadastro=sucesso')
      }
    } catch (err) {
      setError('Erro ao cadastrar. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: SANS }}>
      <HeaderUnificado variante="simples" />

      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{
          background: COLORS.white, borderRadius: 16, padding: '40px 32px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          border: '1px solid ' + COLORS.border
        }}>
          <h1 style={{
            fontFamily: SERIF, fontSize: '24px', color: COLORS.dark,
            margin: '0 0 8px 0', textAlign: 'center'
          }}>
            Criar Conta
          </h1>
          <p style={{
            fontSize: '14px', color: COLORS.textSecondary,
            margin: '0 0 28px 0', textAlign: 'center'
          }}>
            Preencha os dados para se cadastrar
          </p>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 10,
              background: '#FEE2E2', color: '#B91C1C',
              fontSize: '13px', fontWeight: 600, marginBottom: 20
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="input-group">
              <label className="input-label">Nome completo</label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Seu nome"
                required
                className="input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
                className="input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Telefone (opcional)</label>
              <input
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                placeholder="(53) 99999-9999"
                className="input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Senha</label>
              <input
                type="password"
                name="senha"
                value={form.senha}
                onChange={handleChange}
                placeholder="Minimo 6 caracteres"
                required
                className="input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Confirmar senha</label>
              <input
                type="password"
                name="confirmarSenha"
                value={form.confirmarSenha}
                onChange={handleChange}
                placeholder="Repita a senha"
                required
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`btn btn-primary${submitting ? ' btn-loading' : ''}`}
              style={{ width: '100%', marginTop: 8 }}
            >
              {submitting ? 'Cadastrando...' : 'Criar Conta'}
            </button>
          </form>

          <div style={{
            textAlign: 'center', marginTop: 20,
            fontSize: '14px', color: COLORS.textSecondary
          }}>
            Ja tem conta?{' '}
            <Link href="/login" style={{
              color: COLORS.coral, fontWeight: 600, textDecoration: 'none'
            }}>
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}