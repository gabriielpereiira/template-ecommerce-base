'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Header from '@/components/Header'
import { storeConfig } from '@/config/store'


const COLORS = {
  background: '#fdf8f3',
  white: '#ffffff',
  primary: '#8b4513',
  primaryDark: '#5c2e0c',
  secondary: '#d4a574',
  accent: '#c9a96e',
  text: '#3d2817',
  textLight: '#7a6a5a',
  border: '#e8ddd0',
  success: '#4caf50',
  warning: '#ff9800',
  danger: '#f44336',
  info: '#2196f3',
  lightGray: '#f5f5f5',
  mediumGray: '#e0e0e0',
  darkGray: '#9e9e9e'
}

const SERIF = 'Georgia, "Times New Roman", serif'
const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

const STATUS_LABELS = {
  pendente: 'Aguardando pagamento',
  confirmado: 'Pagamento confirmado',
  preparando: 'Em preparo',
  pronto: 'Pronto para retirada',
  saiu_entrega: 'Saiu para entrega',
  entregue: 'Entregue',
  cancelado: 'Cancelado'
}

const STATUS_LIST = storeConfig.pedido.orderStatuses.map(status => ({
  value: status,
  label: STATUS_LABELS[status] || status
}))

const emailsAdmin = storeConfig.admin.adminEmails

function formatarData(dataISO) {
  if (!dataISO) return ''
  const data = new Date(dataISO)
  const dia = String(data.getDate()).padStart(2, '0')
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const ano = data.getFullYear()
  const hora = String(data.getHours()).padStart(2, '0')
  const min = String(data.getMinutes()).padStart(2, '0')
  return `${dia}/${mes}/${ano} ${hora}:${min}`
}


function formatarPreco(valor) {
  if (valor == null) return 'R$ 0,00'
  return `R$ ${valor.toFixed(2).replace('.', ',')}`
}

function getStatusColor(status) {
  const colors = {
    pendente: COLORS.warning,
    confirmado: COLORS.info,
    preparando: COLORS.secondary,
    pronto: COLORS.accent,
    saiu_entrega: COLORS.primary,
    entregue: COLORS.success,
    cancelado: COLORS.danger
  }
  return colors[status] || COLORS.darkGray
}

export default function AdminPedidosPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [adminVerificado, setAdminVerificado] = useState(false)
  const [filtro, setFiltro] = useState('todos')
  const [atualizando, setAtualizando] = useState(null)

  useEffect(() => {
    async function verificarAdmin() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/admin/login')
        return
      }
      const email = session.user.email
      if (!emailsAdmin.includes(email)) {
        router.push('/')
        return
      }
      setUser(session.user)
      setAdminVerificado(true)
    }
    verificarAdmin()
  }, [router])

  useEffect(() => {
    if (!adminVerificado) return
    async function carregarPedidos() {
      setLoading(true)
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('criado_em', { ascending: false })
      if (error) {
        console.error('Erro ao carregar pedidos:', error)
      } else {
        setPedidos(data || [])
      }
      setLoading(false)
    }
    carregarPedidos()
  }, [adminVerificado])

  async function handleAlterarStatus(pedidoId, novoStatus) {
    setAtualizando(pedidoId)
    const { error } = await supabase
      .from('pedidos')
      .update({ status: novoStatus })
      .eq('id', pedidoId)
    if (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status do pedido')
    } else {
      setPedidos(pedidos.map(p =>
        p.id === pedidoId ? { ...p, status: novoStatus } : p
      ))
    }
    setAtualizando(null)
  }

  if (!adminVerificado) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: SANS, color: COLORS.textLight, fontSize: 18 }}>Verificando permissões...</p>
      </div>
    )
  }

  const pedidosFiltrados = filtro === 'todos'
    ? pedidos
    : pedidos.filter(p => p.status === filtro)

  const stats = {
    total: pedidos.length,
    pendente: pedidos.filter(p => p.status === 'pendente').length,
    confirmado: pedidos.filter(p => p.status === 'confirmado').length,
    preparando: pedidos.filter(p => p.status === 'preparando').length,
    pronto: pedidos.filter(p => p.status === 'pronto').length,
    saiu_entrega: pedidos.filter(p => p.status === 'saiu_entrega').length,
    entregue: pedidos.filter(p => p.status === 'entregue').length,
    cancelado: pedidos.filter(p => p.status === 'cancelado').length
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.background }}>
      <Header user={user} />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 36, color: COLORS.primary, marginBottom: 30 }}>
          Admin - Pedidos
        </h1>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16, marginBottom: 30 }}>
          <div style={{ background: COLORS.white, borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <p style={{ fontFamily: SANS, fontSize: 13, color: COLORS.textLight, margin: 0, marginBottom: 8 }}>Total</p>
            <p style={{ fontFamily: SERIF, fontSize: 28, color: COLORS.text, margin: 0 }}>{stats.total}</p>
          </div>
          {STATUS_LIST.map(({ value, label }) => (
            <div key={value} style={{ background: COLORS.white, borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderTop: `3px solid ${getStatusColor(value)}` }}>
              <p style={{ fontFamily: SANS, fontSize: 13, color: COLORS.textLight, margin: 0, marginBottom: 8 }}>{label}</p>
              <p style={{ fontFamily: SERIF, fontSize: 28, color: getStatusColor(value), margin: 0 }}>{stats[value] || 0}</p>
            </div>
          ))}
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          <button
            onClick={() => setFiltro('todos')}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: `1px solid ${filtro === 'todos' ? COLORS.primary : COLORS.border}`,
              background: filtro === 'todos' ? COLORS.primary : COLORS.white,
              color: filtro === 'todos' ? COLORS.white : COLORS.text,
              fontFamily: SANS,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Todos ({stats.total})
          </button>
          {STATUS_LIST.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFiltro(value)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: `1px solid ${filtro === value ? getStatusColor(value) : COLORS.border}`,
                background: filtro === value ? getStatusColor(value) : COLORS.white,
                color: filtro === value ? COLORS.white : COLORS.text,
                fontFamily: SANS,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {label} ({stats[value] || 0})
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <p style={{ fontFamily: SANS, color: COLORS.textLight, fontSize: 18 }}>Carregando pedidos...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && pedidosFiltrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, background: COLORS.white, borderRadius: 12 }}>
            <p style={{ fontFamily: SANS, color: COLORS.textLight, fontSize: 18 }}>Nenhum pedido encontrado.</p>
          </div>
        )}

        {/* Order Cards */}
        {!loading && pedidosFiltrados.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pedidosFiltrados.map((pedido) => (
              <div key={pedido.id} style={{ background: COLORS.white, borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                  <div>
                    <p style={{ fontFamily: SERIF, fontSize: 20, color: COLORS.text, margin: 0, marginBottom: 4 }}>
                      Pedido #{pedido.id.slice(0, 8)}
                    </p>
                    <p style={{ fontFamily: SANS, fontSize: 14, color: COLORS.textLight, margin: 0 }}>
                      {formatarData(pedido.created_at)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      padding: '6px 14px',
                      borderRadius: 20,
                      background: getStatusColor(pedido.status),
                      color: COLORS.white,
                      fontFamily: SANS,
                      fontSize: 13,
                      fontWeight: 600
                    }}>
                      {STATUS_LABELS[pedido.status] || pedido.status}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
                  <div>
                    <p style={{ fontFamily: SANS, fontSize: 12, color: COLORS.textLight, margin: 0, marginBottom: 4 }}>Cliente</p>
                    <p style={{ fontFamily: SANS, fontSize: 14, color: COLORS.text, margin: 0 }}>{pedido.cliente_nome || '—'}</p>
                  </div>
                  <div>
                    <p style={{ fontFamily: SANS, fontSize: 12, color: COLORS.textLight, margin: 0, marginBottom: 4 }}>Telefone</p>
                    <p style={{ fontFamily: SANS, fontSize: 14, color: COLORS.text, margin: 0 }}>{pedido.cliente_telefone || '—'}</p>
                  </div>
                  <div>
                    <p style={{ fontFamily: SANS, fontSize: 12, color: COLORS.textLight, margin: 0, marginBottom: 4 }}>Total</p>
                    <p style={{ fontFamily: SERIF, fontSize: 16, color: COLORS.primary, margin: 0 }}>{formatarPreco(pedido.total)}</p>
                  </div>
                </div>

                {pedido.itens && (
                  <div style={{ background: COLORS.lightGray, borderRadius: 8, padding: 16, marginBottom: 16 }}>
                    <p style={{ fontFamily: SANS, fontSize: 12, color: COLORS.textLight, margin: 0, marginBottom: 8 }}>Itens</p>
                    {Array.isArray(pedido.itens) ? (
                      pedido.itens.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 14, color: COLORS.text, marginBottom: 4 }}>
                          <span>{item.quantidade}x {item.nome}</span>
                          <span>{formatarPreco(item.preco * item.quantidade)}</span>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontFamily: SANS, fontSize: 14, color: COLORS.text, margin: 0 }}>{pedido.itens}</p>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: SANS, fontSize: 13, color: COLORS.textLight }}>Alterar status:</span>
                  <select
                    value={pedido.status}
                    onChange={(e) => handleAlterarStatus(pedido.id, e.target.value)}
                    disabled={atualizando === pedido.id}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: `1px solid ${COLORS.border}`,
                      background: COLORS.white,
                      color: COLORS.text,
                      fontFamily: SANS,
                      fontSize: 14,
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    {STATUS_LIST.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  {atualizando === pedido.id && (
                    <span style={{ fontFamily: SANS, fontSize: 13, color: COLORS.textLight }}>Atualizando...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}