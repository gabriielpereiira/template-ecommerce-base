'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import Header from '../../components/Header'

export default function CadastroPage() {
  const router = useRouter()
  const { cadastrar } = useAuth()
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  })
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const maskTelefone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  const maskCep = (value) => value.replace(/\D/g, '').slice(0, 8)

  const handleChange = (e) => {
    const { name, value } = e.target
    setError('')

    if (name === 'telefone') {
      setForm((prev) => ({ ...prev, telefone: maskTelefone(value) }))
      return
    }

    if (name === 'cep') {
      const digits = maskCep(value)
      setForm((prev) => ({ ...prev, cep: digits, logradouro: '', bairro: '', cidade: '', estado: '' }))
      setCepError('')
      if (digits.length === 8) lookupCep(digits)
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const lookupCep = async (cep) => {
    setCepLoading(true)
    setCepError('')
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (data && !data.erro) {
        setForm((prev) => ({ ...prev, logradouro: data.logradouro || '', bairro: data.bairro || '', cidade: data.localidade || '', estado: data.uf || '' }))
      } else {
        setCepError('CEP nao encontrado. Verifique e tente novamente.')
      }
    } catch {
      setCepError('Erro ao buscar o CEP. Tente novamente.')
    } finally {
      setCepLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.nome) { setError('Preencha o nome completo.'); return }
    if (form.senha.length < 6) { setError('A senha deve ter no minimo 6 caracteres.'); return }
    if (form.senha !== form.confirmarSenha) { setError('As senhas nao conferem.'); return }

    setSubmitting(true)

    try {
      const { data: authData, error: authError } = await cadastrar(form.email, form.senha)

      if (authError || !authData?.user) {
        setError(authError?.message || 'Nao foi possivel criar a conta.')
        setSubmitting(false)
        return
      }

      const userId = authData.user.id
      const telefoneDigits = form.telefone.replace(/\D/g, '')

      // Tenta salvar via API route (service role key)
      try {
        const res = await fetch('/api/criar-perfil', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: userId,
            nome: form.nome,
            telefone: telefoneDigits,
            cep: form.cep,
            logradouro: form.logradouro,
            numero: form.numero,
            complemento: form.complemento,
            bairro: form.bairro,
            cidade: form.cidade,
            estado: form.estado
          })
        })
        const result = await res.json()
        if (result.success) {
          console.log('[cadastro] Perfil salvo no banco com sucesso')
        } else {
          console.warn('[cadastro] API route falhou:', result.error)
        }
      } catch (errApi) {
        console.warn('[cadastro] Erro ao chamar API route:', errApi)
      }

      // Salva SEMPRE no localStorage como backup (garantia dupla)
      localStorage.setItem('dadosPerfilPendentes', JSON.stringify({
        id: userId,
        nome: form.nome,
        telefone: telefoneDigits,
        cep: form.cep,
        logradouro: form.logradouro,
        numero: form.numero,
        complemento: form.complemento,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.estado
      }))

      setSuccess(true)
    } catch (err) {
      setError(err?.message || 'Nao foi possivel concluir o cadastro. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
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
            maxWidth: 480,
            padding: '40px 32px',
            textAlign: 'center',
          }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h1 style={{
              color: 'var(--color-brand-dark)',
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 12,
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}>
              Cadastro realizado
            </h1>
            <p style={{
              color: 'var(--color-brand-text-secondary)',
              fontSize: 15,
              lineHeight: '1.6',
              marginBottom: 24,
            }}>
              Sua conta foi criada com sucesso. Enviamos um email de confirmacao para <strong>{form.email}</strong>.
              Apos confirmar seu email, faca login e seus dados estarao prontos no perfil.
            </p>
            <button onClick={() => router.push('/login')} className="btn btn-primary btn-lg">
              Ir para o login
            </button>
            <p style={{ marginTop: 16, fontSize: 14, color: 'var(--color-brand-text-secondary)' }}>
              <button
                onClick={() => router.push('/login')}
                style={{
                  color: 'var(--color-brand-gold)',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  padding: 0,
                  textDecoration: 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand-gold-dark)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-brand-gold)'}
              >
                Ja tenho conta, fazer login
              </button>
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background: 'var(--color-brand-bg)',
      }}>
        <div className="card anim-fade-in-up" style={{
          width: '100%',
          maxWidth: 480,
          padding: '36px 28px',
        }}>
          <h1 style={{
            color: 'var(--color-brand-dark)',
            fontSize: 26,
            fontWeight: 700,
            textAlign: 'center',
            margin: '0 0 6px 0',
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
            Tortas da Lika
          </h1>
          <p style={{
            color: 'var(--color-brand-text-secondary)',
            fontSize: 14,
            textAlign: 'center',
            margin: '0 0 24px 0',
          }}>
            Criar sua conta
          </p>

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
              <label className="input-label">Telefone</label>
              <input
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                placeholder="(53) 99999-9999"
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

            <div style={{ display: 'flex', gap: 12 }}>
              <div className="input-group" style={{ flex: 1 }}>
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
              <div className="input-group" style={{ flex: 1 }}>
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
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div className="input-group" style={{ flex: '0 0 140px' }}>
                <label className="input-label">CEP</label>
                <input
                  name="cep"
                  value={form.cep}
                  onChange={handleChange}
                  placeholder="96200000"
                  maxLength={8}
                  className="input"
                />
                {cepLoading && <p style={{ fontSize: 12, color: 'var(--color-brand-text-secondary)', margin: '4px 0 0' }}>Buscando...</p>}
                {cepError && <p style={{ fontSize: 12, color: '#EF4444', margin: '4px 0 0' }}>{cepError}</p>}
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Numero</label>
                <input
                  name="numero"
                  value={form.numero}
                  onChange={handleChange}
                  placeholder="S/N"
                  className="input"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Logradouro</label>
              <input
                name="logradouro"
                value={form.logradouro}
                readOnly
                placeholder="Preencha o CEP primeiro"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: 14,
                  border: '1px solid var(--color-brand-border)',
                  borderRadius: 10,
                  background: form.logradouro ? 'var(--color-brand-bg-soft)' : 'white',
                  color: form.logradouro ? 'var(--color-brand-text)' : 'var(--color-brand-text-secondary)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Complemento</label>
              <input
                name="complemento"
                value={form.complemento}
                onChange={handleChange}
                placeholder="Apto, Bloco, etc."
                className="input"
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Bairro</label>
                <input
                  name="bairro"
                  value={form.bairro}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: 14,
                    border: '1px solid var(--color-brand-border)',
                    borderRadius: 10,
                    background: 'var(--color-brand-bg-soft)',
                    color: 'var(--color-brand-text)',
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Cidade</label>
                <input
                  name="cidade"
                  value={form.cidade}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: 14,
                    border: '1px solid var(--color-brand-border)',
                    borderRadius: 10,
                    background: 'var(--color-brand-bg-soft)',
                    color: 'var(--color-brand-text)',
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div className="input-group" style={{ flex: '0 0 80px' }}>
                <label className="input-label">Estado</label>
                <input
                  name="estado"
                  value={form.estado}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: 14,
                    border: '1px solid var(--color-brand-border)',
                    borderRadius: 10,
                    background: 'var(--color-brand-bg-soft)',
                    color: 'var(--color-brand-text)',
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {error && (
              <div style={{
                fontSize: 13,
                padding: '10px 14px',
                borderRadius: 10,
                background: 'var(--color-status-danger-bg)',
                color: '#B91C1C',
                border: '1px solid #FECACA',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg btn-block"
              style={{ marginTop: 4 }}
            >
              {submitting ? 'Cadastrando...' : 'Criar conta'}
            </button>

            <p style={{
              textAlign: 'center',
              fontSize: 14,
              color: 'var(--color-brand-text-secondary)',
              marginTop: 8,
            }}>
              Ja tem conta?{' '}
              <a
                href="/login"
                style={{
                  color: 'var(--color-brand-gold)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand-gold-dark)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-brand-gold)'}
              >
                Fazer login
              </a>
            </p>
          </form>
        </div>
      </div>
    </>
  )
}