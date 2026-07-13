'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import Header from '../../components/Header'
import useAnimacaoScroll from '../../hooks/useAnimacaoScroll'

const COLORS = {
  dark: '#2D1B0E',
  gold: '#C4975A',
  bg: '#FAF7F2',
  white: '#FFFFFF',
  textSecondary: '#6B4F3A',
  border: '#E8E0D8',
  textOnDark: '#F0EBE4'
}
const SERIF = 'Georgia, "Times New Roman", serif'
const SANS = 'Inter, Arial, sans-serif'

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '8px',
  border: '1px solid ' + COLORS.border,
  fontSize: '14px',
  fontFamily: SANS,
  color: COLORS.dark,
  background: COLORS.white,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s'
}

function CardAnimado({ children, atraso = 1, style }) {
  const [ref, visivel] = useAnimacaoScroll({ threshold: 0.1 })
  return (
    <div
      ref={ref}
      style={{
        opacity: visivel ? 1 : 0,
        transform: visivel ? 'translateY(0)' : 'translateY(30px)',
        transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${atraso * 0.1}s`,
        ...style
      }}
    >
      {children}
    </div>
  )
}

export default function PerfilPage() {
  const router = useRouter()
  const { usuario, perfil } = useAuth()
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  })
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState(null)

  // Estado para alteracao de senha
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')
  const [alterandoSenha, setAlterandoSenha] = useState(false)
  const [erroSenha, setErroSenha] = useState('')

  useEffect(() => {
    if (!usuario) {
      router.push('/login')
      return
    }

    const fetchProfile = async () => {
      try {
        // Tenta buscar do banco
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', usuario.id)
          .maybeSingle()

        if (error) {
          console.error('Erro ao buscar perfil:', error)
        }

        if (data) {
          // Achou no banco, usa os dados
          setFormData({
            nome: data.nome || '',
            telefone: data.telefone || '',
            cep: data.cep || '',
            logradouro: data.logradouro || '',
            numero: data.numero || '',
            complemento: data.complemento || '',
            bairro: data.bairro || '',
            cidade: data.cidade || '',
            estado: data.estado || ''
          })
        } else if (perfil) {
          // Nao achou no banco, usa o perfil do AuthContext (veio do localStorage)
          setFormData({
            nome: perfil.nome || '',
            telefone: perfil.telefone || '',
            cep: perfil.cep || '',
            logradouro: perfil.logradouro || '',
            numero: perfil.numero || '',
            complemento: perfil.complemento || '',
            bairro: perfil.bairro || '',
            cidade: perfil.cidade || '',
            estado: perfil.estado || ''
          })
        }
      } catch (err) {
        console.error('Erro ao buscar perfil:', err)
      } finally {
        setCarregando(false)
      }
    }

    fetchProfile()
  }, [usuario, router, perfil])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSalvar = async () => {
    if (!usuario) return
    setSalvando(true)
    setMensagem(null)

    try {
      const payload = {
        id: usuario.id,
        nome: formData.nome,
        telefone: formData.telefone,
        cep: formData.cep,
        logradouro: formData.logradouro,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })

      if (error) {
        setMensagem({ tipo: 'erro', texto: 'Erro ao salvar perfil. Tente novamente.' })
      } else {
        setMensagem({ tipo: 'sucesso', texto: 'Perfil atualizado com sucesso!' })
        localStorage.removeItem('dadosPerfilPendentes')
      }
    } catch (err) {
      console.error('Erro ao salvar perfil:', err)
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar perfil. Tente novamente.' })
    } finally {
      setSalvando(false)
      setTimeout(() => setMensagem(null), 4000)
    }
  }

  const handleAlterarSenha = async () => {
    setErroSenha('')
    if (!novaSenha || novaSenha.length < 6) {
      setErroSenha('A nova senha deve ter no minimo 6 caracteres.')
      return
    }
    if (novaSenha !== confirmarNovaSenha) {
      setErroSenha('As senhas nao conferem.')
      return
    }
    setAlterandoSenha(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: novaSenha
      })
      if (error) {
        setErroSenha(error.message || 'Erro ao alterar senha.')
      } else {
        setModalSenhaAberto(false)
        setSenhaAtual('')
        setNovaSenha('')
        setConfirmarNovaSenha('')
        setMensagem({ tipo: 'sucesso', texto: 'Senha alterada com sucesso!' })
        setTimeout(() => setMensagem(null), 4000)
      }
    } catch (err) {
      setErroSenha('Erro ao alterar senha. Tente novamente.')
    } finally {
      setAlterandoSenha(false)
    }
  }

  const getInitial = () => {
    if (formData.nome) return formData.nome.charAt(0).toUpperCase()
    if (usuario?.email) return usuario.email.charAt(0).toUpperCase()
    return '?'
  }

  const handleFocus = e => { e.currentTarget.style.borderColor = COLORS.gold }
  const handleBlur = e => { e.currentTarget.style.borderColor = COLORS.border }

  if (carregando) {
    return (
      <div style={{ background: COLORS.bg, minHeight: '100vh', fontFamily: SANS }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '80px 0', color: COLORS.textSecondary }}>
          Carregando...
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', fontFamily: SANS }}>
      <Header />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px' }}>
        {/* Page title */}
        <div className="animar-fade-up animar-atraso-1" style={{ marginBottom: '40px' }}>
          <h1 style={{ fontFamily: SERIF, fontSize: '28px', color: COLORS.dark, margin: '0 0 8px 0', fontWeight: 700 }}>
            Meu Perfil
          </h1>
          <div style={{ width: '48px', height: '3px', background: COLORS.gold, borderRadius: '2px' }} />
        </div>

        {/* Card 1: Dados Pessoais */}
        <CardAnimado atraso={2} style={{ background: COLORS.white, borderRadius: '16px', padding: '32px', marginBottom: '24px', border: '1px solid ' + COLORS.border }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', background: COLORS.gold,
              color: COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '26px', fontWeight: 700, fontFamily: SERIF
            }}>
              {getInitial()}
            </div>
            <div>
              <h2 style={{ fontFamily: SERIF, fontSize: '20px', color: COLORS.dark, margin: '0 0 4px 0', fontWeight: 700 }}>
                {formData.nome || 'Seu nome'}
              </h2>
              <p style={{ fontSize: '14px', color: COLORS.textSecondary, margin: 0 }}>
                {usuario?.email || ''}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: COLORS.textSecondary, fontWeight: 600, marginBottom: '6px' }}>
                Nome completo *
              </label>
              <input
                value={formData.nome}
                onChange={e => handleChange('nome', e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={inputStyle}
                placeholder="Seu nome completo"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: COLORS.textSecondary, fontWeight: 600, marginBottom: '6px' }}>
                Telefone *
              </label>
              <input
                value={formData.telefone}
                onChange={e => handleChange('telefone', e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={inputStyle}
                placeholder="(53) 99999-9999"
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '13px', color: COLORS.textSecondary, fontWeight: 600, marginBottom: '6px' }}>
                Email
              </label>
              <input
                value={usuario?.email || ''}
                disabled
                style={{ ...inputStyle, background: COLORS.bg, color: COLORS.textSecondary, cursor: 'not-allowed' }}
              />
            </div>
          </div>
        </CardAnimado>

        {/* Card 2: Endereco */}
        <CardAnimado atraso={3} style={{ background: COLORS.white, borderRadius: '16px', padding: '32px', marginBottom: '24px', border: '1px solid ' + COLORS.border }}>
          <h2 style={{ fontFamily: SERIF, fontSize: '20px', color: COLORS.dark, margin: '0 0 24px 0', fontWeight: 700 }}>
            Endereco
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: COLORS.textSecondary, fontWeight: 600, marginBottom: '6px' }}>
                CEP *
              </label>
              <input
                value={formData.cep}
                onChange={e => handleChange('cep', e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={inputStyle}
                placeholder="00000-000"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: COLORS.textSecondary, fontWeight: 600, marginBottom: '6px' }}>
                Numero *
              </label>
              <input
                value={formData.numero}
                onChange={e => handleChange('numero', e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={inputStyle}
                placeholder="123"
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '13px', color: COLORS.textSecondary, fontWeight: 600, marginBottom: '6px' }}>
                Logradouro
              </label>
              <input
                value={formData.logradouro}
                onChange={e => handleChange('logradouro', e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={inputStyle}
                placeholder="Rua, avenida..."
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: COLORS.textSecondary, fontWeight: 600, marginBottom: '6px' }}>
                Complemento
              </label>
              <input
                value={formData.complemento}
                onChange={e => handleChange('complemento', e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={inputStyle}
                placeholder="Apto, bloco..."
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: COLORS.textSecondary, fontWeight: 600, marginBottom: '6px' }}>
                Bairro
              </label>
              <input
                value={formData.bairro}
                onChange={e => handleChange('bairro', e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={inputStyle}
                placeholder="Seu bairro"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: COLORS.textSecondary, fontWeight: 600, marginBottom: '6px' }}>
                Cidade
              </label>
              <input
                value={formData.cidade}
                onChange={e => handleChange('cidade', e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={inputStyle}
                placeholder="Sua cidade"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: COLORS.textSecondary, fontWeight: 600, marginBottom: '6px' }}>
                Estado
              </label>
              <input
                value={formData.estado}
                onChange={e => handleChange('estado', e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={inputStyle}
                placeholder="RS"
              />
            </div>
          </div>
        </CardAnimado>

        {/* Card 3: Seguranca */}
        <CardAnimado atraso={4} style={{ background: COLORS.white, borderRadius: '16px', padding: '32px', marginBottom: '24px', border: '1px solid ' + COLORS.border }}>
          <h2 style={{ fontFamily: SERIF, fontSize: '20px', color: COLORS.dark, margin: '0 0 16px 0', fontWeight: 700 }}>
            Seguranca
          </h2>
          <button
            onClick={() => setModalSenhaAberto(true)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.gold }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border }}
            style={{
              padding: '12px 24px', borderRadius: '8px', border: '1px solid ' + COLORS.border,
              background: COLORS.white, cursor: 'pointer', fontSize: '14px', fontWeight: 600,
              color: COLORS.dark, fontFamily: SANS, transition: 'all 0.2s ease'
            }}
          >
            Alterar senha
          </button>
        </CardAnimado>

        {/* Botoes */}
        <CardAnimado atraso={5} style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'transparent',
              border: '1px solid ' + COLORS.border,
              borderRadius: '999px',
              padding: '12px 28px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              color: COLORS.textSecondary,
              fontFamily: SANS,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.gold; e.currentTarget.style.color = COLORS.gold }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textSecondary }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={salvando}
            style={{
              background: COLORS.gold,
              color: COLORS.white,
              border: 'none',
              borderRadius: '999px',
              padding: '12px 28px',
              cursor: salvando ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 700,
              fontFamily: SANS,
              opacity: salvando ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { if (!salvando) e.currentTarget.style.opacity = '0.85' }}
            onMouseLeave={e => { if (!salvando) e.currentTarget.style.opacity = '1' }}
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </CardAnimado>

        {/* Feedback message */}
        {mensagem && (
          <div className="animar-fade-up" style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: mensagem.tipo === 'sucesso' ? '#4CAF50' : '#c00',
            color: COLORS.white,
            padding: '14px 28px',
            borderRadius: '999px',
            fontSize: '14px',
            fontWeight: 600,
            zIndex: 9999,
            boxShadow: '0 8px 24px rgba(45,27,14,0.25)'
          }}>
            {mensagem.texto}
          </div>
        )}
      </div>

      {/* Modal de alterar senha */}
      {modalSenhaAberto && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(45,27,14,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px'
          }}
          onClick={() => setModalSenhaAberto(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: COLORS.white, borderRadius: '16px',
              padding: '32px', maxWidth: '420px', width: '100%',
              boxShadow: '0 16px 48px rgba(45,27,14,0.2)',
              border: '1px solid ' + COLORS.border
            }}
          >
            <h3 style={{ fontFamily: SERIF, fontSize: '20px', color: COLORS.dark, margin: '0 0 24px 0', fontWeight: 700 }}>
              Alterar senha
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: COLORS.textSecondary, fontWeight: 600, marginBottom: '6px' }}>
                  Nova senha
                </label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={e => setNovaSenha(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={inputStyle}
                  placeholder="Minimo 6 caracteres"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: COLORS.textSecondary, fontWeight: 600, marginBottom: '6px' }}>
                  Confirmar nova senha
                </label>
                <input
                  type="password"
                  value={confirmarNovaSenha}
                  onChange={e => setConfirmarNovaSenha(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={inputStyle}
                  placeholder="Repita a nova senha"
                />
              </div>
              {erroSenha && (
                <div style={{
                  background: '#f8e1dd', color: '#8a2b1f',
                  border: '1px solid #e6b8b0', borderRadius: '8px',
                  padding: '10px 12px', fontSize: '13px'
                }}>
                  {erroSenha}
                </div>
              )}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  onClick={() => {
                    setModalSenhaAberto(false)
                    setSenhaAtual('')
                    setNovaSenha('')
                    setConfirmarNovaSenha('')
                    setErroSenha('')
                  }}
                  style={{
                    background: 'transparent', border: '1px solid ' + COLORS.border,
                    borderRadius: '999px', padding: '10px 24px',
                    cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                    color: COLORS.textSecondary, fontFamily: SANS
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAlterarSenha}
                  disabled={alterandoSenha}
                  style={{
                    background: COLORS.gold, color: COLORS.white, border: 'none',
                    borderRadius: '999px', padding: '10px 24px',
                    cursor: alterandoSenha ? 'not-allowed' : 'pointer',
                    fontSize: '14px', fontWeight: 700, fontFamily: SANS,
                    opacity: alterandoSenha ? 0.7 : 1
                  }}
                >
                  {alterandoSenha ? 'Alterando...' : 'Alterar senha'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}