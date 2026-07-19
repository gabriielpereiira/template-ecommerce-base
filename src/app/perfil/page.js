'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import HeaderUnificado from '@/components/HeaderUnificado'
import { theme } from '@/theme'

const COLORS = theme.colors
const SERIF = theme.fonts.serif
const SANS = theme.fonts.sans

function CardAnimado({ atraso, style, children }) {
  return (
    <div style={{
      animation: 'fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      animationDelay: `${atraso * 0.05}s`,
      opacity: 0,
      ...style
    }}>
      {children}
    </div>
  )
}

export default function PerfilPage() {
  const router = useRouter()
  const { usuario } = useAuth()

  const [formData, setFormData] = useState({
    nome: '', email: '', telefone: '',
    cep: '', numero: '', logradouro: '', complemento: '',
    bairro: '', cidade: '', estado: ''
  })
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [carregando, setCarregando] = useState(true)

  const [modalSenhaAberto, setModalSenhaAberto] = useState(false)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')
  const [erroSenha, setErroSenha] = useState('')
  const [enviandoSenha, setEnviandoSenha] = useState(false)

  const [focusedField, setFocusedField] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!usuario) {
      setCarregando(false)
      return
    }
    async function carregarPerfil() {
      try {
        const { data, error } = await supabase
          .from('perfis')
          .select('*')
          .eq('email', usuario.email)
          .single()

        if (data) {
          setFormData({
            nome: data.nome || '',
            email: data.email || usuario.email || '',
            telefone: data.telefone || '',
            cep: data.cep || '',
            numero: data.numero || '',
            logradouro: data.logradouro || '',
            complemento: data.complemento || '',
            bairro: data.bairro || '',
            cidade: data.cidade || '',
            estado: data.estado || ''
          })
        } else {
          setFormData(prev => ({ ...prev, email: usuario.email || '' }))
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err)
      } finally {
        setCarregando(false)
      }
    }
    carregarPerfil()
  }, [usuario])

  function handleChange(campo, valor) {
    setFormData(prev => ({ ...prev, [campo]: valor }))
  }

  function handleFocus(e) {
    setFocusedField(e.target.name || e.target.id)
  }

  function handleBlur() {
    setFocusedField(null)
  }

  function getInitial() {
    return (formData.nome || 'U').charAt(0).toUpperCase()
  }

  async function handleSalvar(e) {
    e.preventDefault()
    if (!formData.nome || !formData.telefone) {
      setErro('Preencha nome e telefone.')
      return
    }
    setErro('')
    setSalvando(true)

    try {
      const { error } = await supabase
        .from('perfis')
        .upsert({
          email: usuario.email,
          nome: formData.nome,
          telefone: formData.telefone,
          cep: formData.cep,
          numero: formData.numero,
          logradouro: formData.logradouro,
          complemento: formData.complemento,
          bairro: formData.bairro,
          cidade: formData.cidade,
          estado: formData.estado,
          updated_at: new Date().toISOString()
        }, { onConflict: 'email' })

      if (error) throw error
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch (err) {
      setErro(err.message || 'Erro ao salvar perfil.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleAlterarSenha(e) {
    e.preventDefault()
    setErroSenha('')

    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
      setErroSenha('Preencha todos os campos.')
      return
    }
    if (novaSenha.length < 6) {
      setErroSenha('A nova senha deve ter no minimo 6 caracteres.')
      return
    }
    if (novaSenha !== confirmarNovaSenha) {
      setErroSenha('As senhas nao conferem.')
      return
    }

    setEnviandoSenha(true)
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    setEnviandoSenha(false)

    if (error) {
      setErroSenha(error.message || 'Erro ao alterar senha.')
      return
    }

    setModalSenhaAberto(false)
    setSenhaAtual('')
    setNovaSenha('')
    setConfirmarNovaSenha('')
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    fontFamily: SANS,
    color: COLORS.dark,
    background: COLORS.white,
    border: focusedField
      ? `1.5px solid ${COLORS.coral}`
      : `1.5px solid ${COLORS.border}`,
    borderRadius: 10,
    outline: 'none',
    transition: 'all 0.25s ease',
    boxSizing: 'border-box',
    boxShadow: focusedField ? `0 0 0 3px rgba(255,107,107,0.12)` : 'none'
  }

  const labelStyle = {
    display: 'block', fontSize: '13px',
    color: COLORS.textSecondary, fontWeight: 600,
    marginBottom: '6px', fontFamily: SANS
  }

  if (!usuario) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: SANS }}>
        <HeaderUnificado />
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '100px 24px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: SERIF, fontSize: '24px', color: COLORS.dark, margin: '0 0 12px 0' }}>
            Faca login para acessar seu perfil
          </h2>
          <p style={{ fontSize: '14px', color: COLORS.textSecondary, margin: '0 0 32px 0' }}>
            Acesse sua conta para editar seus dados.
          </p>
          <button onClick={() => router.push('/login')} className="btn btn-primary">
            Fazer login
          </button>
        </div>
      </div>
    )
  }

  if (carregando) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: SANS }}>
        <HeaderUnificado />
        <div style={{ textAlign: 'center', padding: '100px 24px', color: COLORS.textSecondary }}>
          Carregando perfil...
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: SANS }}>
      <HeaderUnificado />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <CardAnimado atraso={1}>
          <h1 style={{
            fontFamily: SERIF, fontSize: '28px', color: COLORS.dark,
            fontWeight: 700, margin: '0 0 8px 0'
          }}>
            Meu Perfil
          </h1>
          <p style={{
            fontSize: '14px', color: COLORS.textSecondary,
            margin: '0 0 32px 0'
          }}>
            Gerencie seus dados pessoais e endereco
          </p>
        </CardAnimado>

        {/* Card avatar + nome */}
        <CardAnimado atraso={2} style={{
          background: COLORS.white, borderRadius: 16, padding: '32px',
          marginBottom: 24, border: '1px solid ' + COLORS.border
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: COLORS.coral,
              color: COLORS.white,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 700, fontFamily: SERIF
            }}>
              {getInitial()}
            </div>
            <div>
              <h2 style={{
                fontFamily: SERIF, fontSize: '20px', color: COLORS.dark,
                fontWeight: 700, margin: 0
              }}>
                {formData.nome || 'Sem nome'}
              </h2>
              <p style={{
                fontSize: '14px', color: COLORS.textSecondary, margin: '4px 0 0'
              }}>
                {formData.email}
              </p>
            </div>
          </div>

          {sucesso && (
            <div style={{
              padding: '12px 16px', borderRadius: 10,
              background: '#D1FAE5', color: '#047857',
              fontSize: '13px', fontWeight: 600, marginBottom: 20
            }}>
              Dados salvos com sucesso!
            </div>
          )}

          {erro && (
            <div style={{
              padding: '12px 16px', borderRadius: 10,
              background: '#FEE2E2', color: '#B91C1C',
              fontSize: '13px', fontWeight: 600, marginBottom: 20
            }}>
              {erro}
            </div>
          )}

          <form onSubmit={handleSalvar}>
            {/* Dados pessoais */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16
            }}>
              <div>
                <label style={labelStyle}>Nome completo *</label>
                <input value={formData.nome}
                  onChange={e => handleChange('nome', e.target.value)}
                  onFocus={handleFocus} onBlur={handleBlur}
                  style={inputStyle} placeholder="Seu nome" />
              </div>
              <div>
                <label style={labelStyle}>Telefone *</label>
                <input value={formData.telefone}
                  onChange={e => handleChange('telefone', e.target.value)}
                  onFocus={handleFocus} onBlur={handleBlur}
                  style={inputStyle} placeholder="(53) 99999-9999" />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Email</label>
                <input value={formData.email} disabled
                  style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
            </div>

            <hr style={{
              border: 'none', borderTop: '1px solid ' + COLORS.border,
              margin: '28px 0'
            }} />

            <h3 style={{
              fontFamily: SERIF, fontSize: '18px', color: COLORS.dark,
              fontWeight: 700, margin: '0 0 20px 0'
            }}>
              Endereco
            </h3>

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16
            }}>
              <div>
                <label style={labelStyle}>CEP *</label>
                <input value={formData.cep}
                  onChange={e => handleChange('cep', e.target.value)}
                  onFocus={handleFocus} onBlur={handleBlur}
                  style={inputStyle} placeholder="00000-000" />
              </div>
              <div>
                <label style={labelStyle}>Numero *</label>
                <input value={formData.numero}
                  onChange={e => handleChange('numero', e.target.value)}
                  onFocus={handleFocus} onBlur={handleBlur}
                  style={inputStyle} placeholder="123" />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Logradouro</label>
                <input value={formData.logradouro}
                  onChange={e => handleChange('logradouro', e.target.value)}
                  onFocus={handleFocus} onBlur={handleBlur}
                  style={inputStyle} placeholder="Rua, Avenida..." />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Complemento</label>
                <input value={formData.complemento}
                  onChange={e => handleChange('complemento', e.target.value)}
                  onFocus={handleFocus} onBlur={handleBlur}
                  style={inputStyle} placeholder="Apto, bloco..." />
              </div>
              <div>
                <label style={labelStyle}>Bairro</label>
                <input value={formData.bairro}
                  onChange={e => handleChange('bairro', e.target.value)}
                  onFocus={handleFocus} onBlur={handleBlur}
                  style={inputStyle} placeholder="Seu bairro" />
              </div>
              <div>
                <label style={labelStyle}>Cidade</label>
                <input value={formData.cidade}
                  onChange={e => handleChange('cidade', e.target.value)}
                  onFocus={handleFocus} onBlur={handleBlur}
                  style={inputStyle} placeholder="Sua cidade" />
              </div>
              <div>
                <label style={labelStyle}>Estado</label>
                <input value={formData.estado}
                  onChange={e => handleChange('estado', e.target.value)}
                  onFocus={handleFocus} onBlur={handleBlur}
                  style={inputStyle} placeholder="RS" />
              </div>
            </div>

            {/* Botoes */}
            <CardAnimado atraso={5} style={{
              display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28
            }}>
              <button
                onClick={() => router.push('/')}
                style={{
                  background: 'transparent',
                  border: '1px solid ' + COLORS.border,
                  borderRadius: '999px', padding: '12px 28px',
                  fontSize: '14px', fontWeight: 600, fontFamily: SANS,
                  color: COLORS.textSecondary, cursor: 'pointer'
                }}
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className={`btn btn-primary${salvando ? ' btn-loading' : ''}`}
              >
                {salvando ? 'Salvando...' : 'Salvar alteracoes'}
              </button>
            </CardAnimado>
          </form>

          {/* Botao alterar senha */}
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid ' + COLORS.border }}>
            <button
              onClick={() => setModalSenhaAberto(true)}
              style={{
                background: 'transparent',
                border: '1px solid ' + COLORS.border,
                borderRadius: '999px', padding: '12px 28px',
                fontSize: '14px', fontWeight: 600, fontFamily: SANS,
                color: COLORS.dark, cursor: 'pointer'
              }}
            >
              Alterar senha
            </button>
          </div>
        </CardAnimado>
      </div>

      {/* Modal alterar senha */}
      {modalSenhaAberto && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(45,52,54,0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px'
        }} onClick={() => setModalSenhaAberto(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: COLORS.white, borderRadius: 16, padding: 32,
            maxWidth: 400, width: '100%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }}>
            <h2 style={{
              fontFamily: SERIF, fontSize: '20px', color: COLORS.dark,
              margin: '0 0 20px 0'
            }}>
              Alterar senha
            </h2>

            {erroSenha && (
              <div style={{
                padding: '10px 14px', borderRadius: 10,
                background: '#FEE2E2', color: '#B91C1C',
                fontSize: '13px', fontWeight: 600, marginBottom: 16
              }}>
                {erroSenha}
              </div>
            )}

            <form onSubmit={handleAlterarSenha}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Senha atual</label>
                  <input type="password" value={senhaAtual}
                    onChange={e => setSenhaAtual(e.target.value)}
                    style={inputStyle} placeholder="Sua senha atual" />
                </div>
                <div>
                  <label style={labelStyle}>Nova senha</label>
                  <input type="password" value={novaSenha}
                    onChange={e => setNovaSenha(e.target.value)}
                    style={inputStyle} placeholder="Minimo 6 caracteres" />
                </div>
                <div>
                  <label style={labelStyle}>Confirmar nova senha</label>
                  <input type="password" value={confirmarNovaSenha}
                    onChange={e => setConfirmarNovaSenha(e.target.value)}
                    style={inputStyle} placeholder="Repita a nova senha" />
                </div>

                <div style={{
                  display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8
                }}>
                  <button
                    onClick={() => {
                      setModalSenhaAberto(false)
                      setSenhaAtual('')
                      setNovaSenha('')
                      setConfirmarNovaSenha('')
                      setErroSenha('')
                    }}
                    style={{
                      padding: '10px 24px', borderRadius: 999,
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
                    disabled={enviandoSenha}
                    className={`btn btn-primary${enviandoSenha ? ' btn-loading' : ''}`}
                  >
                    {enviandoSenha ? 'Alterando...' : 'Alterar senha'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}