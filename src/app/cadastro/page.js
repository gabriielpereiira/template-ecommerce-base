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

  const styles = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#f5ede3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'Arial, Helvetica, sans-serif'
    },
    card: {
      width: '100%',
      maxWidth: '480px',
      backgroundColor: '#fffaf3',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(74, 55, 40, 0.15)',
      padding: '32px 28px',
      border: '1px solid #e8d9c5'
    },
    title: {
      color: '#4a3728',
      fontSize: '26px',
      fontWeight: '700',
      textAlign: 'center',
      margin: '0 0 6px 0'
    },
    subtitle: {
      color: '#7a6a55',
      fontSize: '14px',
      textAlign: 'center',
      margin: '0 0 24px 0'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    },
    row: {
      display: 'flex',
      gap: '12px'
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1
    },
    label: {
      color: '#4a3728',
      fontSize: '13px',
      fontWeight: '600',
      marginBottom: '5px'
    },
    input: {
      padding: '10px 12px',
      fontSize: '14px',
      border: '1px solid #d8c4ad',
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      color: '#3d2f24',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    inputReadOnly: {
      padding: '10px 12px',
      fontSize: '14px',
      border: '1px solid #e0d2bf',
      borderRadius: '8px',
      backgroundColor: '#f3ead9',
      color: '#6b5a47'
    },
    button: {
      marginTop: '8px',
      padding: '12px 16px',
      fontSize: '15px',
      fontWeight: '700',
      color: '#ffffff',
      backgroundColor: '#4a3728',
      border: 'none',
      borderRadius: '8px',
      cursor: submitting ? 'not-allowed' : 'pointer',
      opacity: submitting ? 0.7 : 1
    },
    errorBox: {
      backgroundColor: '#f8e1dd',
      color: '#8a2b1f',
      border: '1px solid #e6b8b0',
      borderRadius: '8px',
      padding: '10px 12px',
      fontSize: '13px'
    },
    helper: {
      fontSize: '12px',
      color: '#9a8a73',
      margin: '4px 0 0 0'
    },
    linkRow: {
      textAlign: 'center',
      marginTop: '18px',
      fontSize: '14px',
      color: '#5a4a38'
    },
    link: {
      color: '#4a3728',
      fontWeight: '700',
      textDecoration: 'underline',
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      padding: 0,
      fontSize: '14px'
    },
    successBox: {
      textAlign: 'center'
    },
    successTitle: {
      color: '#4a3728',
      fontSize: '22px',
      fontWeight: '700',
      marginBottom: '12px'
    },
    successText: {
      color: '#5a4a38',
      fontSize: '15px',
      lineHeight: '1.6',
      marginBottom: '20px'
    }
  }

  const maskTelefone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  const maskCep = (value) => {
    return value.replace(/\D/g, '').slice(0, 8)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setError('')

    if (name === 'telefone') {
      setForm((prev) => ({ ...prev, telefone: maskTelefone(value) }))
      return
    }

    if (name === 'cep') {
      const digits = maskCep(value)
      setForm((prev) => ({
        ...prev,
        cep: digits,
        logradouro: '',
        bairro: '',
        cidade: '',
        estado: ''
      }))
      setCepError('')
      if (digits.length === 8) {
        lookupCep(digits)
      }
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
        setForm((prev) => ({
          ...prev,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || ''
        }))
      } else {
        setCepError('CEP nao encontrado. Verifique e tente novamente.')
      }
    } catch (err) {
      setCepError('Erro ao buscar o CEP. Tente novamente.')
    } finally {
      setCepLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.senha.length < 6) {
      setError('A senha deve ter no minimo 6 caracteres.')
      return
    }

    if (form.senha !== form.confirmarSenha) {
      setError('As senhas nao conferem.')
      return
    }

    if (form.cep.length !== 8) {
      setError('Informe um CEP valido com 8 digitos.')
      return
    }

    setSubmitting(true)

    try {
      const { data: authData, error: authError } = await cadastrar(form.email, form.senha)

      if (authError || !authData?.user) {
        setError(authError?.message || 'Nao foi possivel criar a conta.')
        setSubmitting(false)
        return
      }

      const res = await fetch('/api/criar-perfil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: authData.user.id,
          nome: form.nome,
          telefone: form.telefone,
          cep: form.cep,
          logradouro: form.logradouro,
          numero: form.numero,
          complemento: form.complemento,
          bairro: form.bairro,
          cidade: form.cidade,
          estado: form.estado
        })
      })

      const profileResult = await res.json()
      if (!profileResult.success) {
        console.error('Erro ao salvar perfil:', profileResult.error)
      }

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
        <div style={styles.page}>
          <div style={styles.card}>
            <div style={styles.successBox}>
              <h1 style={styles.successBox}>Cadastro realizado</h1>
              <p style={styles.successText}>
                Seu cadastro foi criado com sucesso. Um email de confirmacao foi enviado para o seu endereco. Verifique sua caixa de entrada para confirmar sua conta.
              </p>
              <button onClick={() => router.push('/login')} style={styles.button}>
                Ir para o login
              </button>
              <p style={styles.linkRow}>
                <button onClick={() => router.push('/login')} style={styles.link}>
                  Ja tenho conta, voltar ao login
                </button>
              </p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Tortas da Lika</h1>
          <p style={styles.subtitle}>Criar sua conta</p>

          <form style={styles.form} onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Nome completo</label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Seu nome"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Telefone</label>
              <input
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                placeholder="(53) 99999-9999"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Senha</label>
                <input
                  type="password"
                  name="senha"
                  value={form.senha}
                  onChange={handleChange}
                  placeholder="Minimo 6 caracteres"
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Confirmar senha</label>
                <input
                  type="password"
                  name="confirmarSenha"
                  value={form.confirmarSenha}
                  onChange={handleChange}
                  placeholder="Repita a senha"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={{ ...styles.field, flex: '0 0 140px' }}>
                <label style={styles.label}>CEP</label>
                <input
                  name="cep"
                  value={form.cep}
                  onChange={handleChange}
                  placeholder="96200000"
                  maxLength={8}
                  style={styles.input}
                />
                {cepLoading && <p style={styles.helper}>Buscando...</p>}
                {cepError && <p style={{ ...styles.helper, color: '#c00' }}>{cepError}</p>}
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Numero</label>
                <input
                  name="numero"
                  value={form.numero}
                  onChange={handleChange}
                  placeholder="S/N"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Logradouro</label>
              <input
                name="logradouro"
                value={form.logradouro}
                readOnly
                placeholder="Preencha o CEP primeiro"
                style={form.logradouro ? styles.inputReadOnly : styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Complemento</label>
              <input
                name="complemento"
                value={form.complemento}
                onChange={handleChange}
                placeholder="Apto, Bloco, etc."
                style={styles.input}
              />
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Bairro</label>
                <input
                  name="bairro"
                  value={form.bairro}
                  readOnly
                  style={styles.inputReadOnly}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Cidade</label>
                <input
                  name="cidade"
                  value={form.cidade}
                  readOnly
                  style={styles.inputReadOnly}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Estado</label>
                <input
                  name="estado"
                  value={form.estado}
                  readOnly
                  style={styles.inputReadOnly}
                />
              </div>
            </div>

            {error && (
              <div style={styles.errorBox}>
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting} style={styles.button}>
              {submitting ? 'Cadastrando...' : 'Criar conta'}
            </button>
          </form>

          <p style={styles.linkRow}>
            Ja tem uma conta?{' '}
            <button onClick={() => router.push('/login')} style={styles.link}>
              Entrar
            </button>
          </p>
        </div>
      </div>
    </>
  )
}