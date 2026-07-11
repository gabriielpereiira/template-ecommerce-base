'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Header from '@/components/Header'
import { storeConfig } from '@/config/store'

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
  return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`
}

function getStatusColor(status) {
  const colors = {
    pendente: '#F59E0B',
    confirmado: '#3B82F6',
    preparando: '#D4A574',
    pronto: '#C9A96E',
    saiu_entrega: '#8B4513',
    entregue: '#10B981',
    cancelado: '#EF4444'
  }
  return colors[status] || '#9E9E9E'
}

function getStatusBadgeClass(status) {
  const map = {
    pendente: 'badge badge-warning',
    confirmado: 'badge badge-info',
    preparando: 'badge badge-info',
    pronto: 'badge badge-info',
    saiu_entrega: 'badge badge-info',
    entregue: 'badge badge-success',
    cancelado: 'badge badge-canceled'
  }
  return map[status] || 'badge'
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
      <div style={{ minHeight: '100vh', background: 'var(--color-brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: '"Inter", sans-serif', color: 'var(--color-brand-text-secondary)', fontSize: 18 }}>Verificando permissoes...</p>
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
    <div style={{ minHeight: '100vh', background: 'var(--color-brand-bg)' }}>
      <Header user={user} />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 32,
          color: 'var(--color-brand-dark)',
          marginBottom: 30,
          fontWeight: 700,
          letterSpacing: '0.5px',
        }}>
          Admin - Pedidos
        </h1>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 16,
          marginBottom: 30,
        }}>
          <div className="card" style={{
            padding: 20,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: 3,
              background: 'var(--color-brand-gold)',
            }} />
            <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: 'var(--color-brand-text-secondary)', margin: 0, marginBottom: 8 }}>
              Total
            </p>
            <p style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 32, color: 'var(--color-brand-dark)', margin: 0, fontWeight: 700 }}>
              {stats.total}
            </p>
          </div>
          {STATUS_LIST.map(({ value, label }) => (
            <div key={value} className="card card-hover" style={{
              padding: 20,
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
              onClick={() => setFiltro(value)}
            >
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: 3,
                background: getStatusColor(value),
              }} />
              <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: 'var(--color-brand-text-secondary)', margin: 0, marginBottom: 8 }}>
                {label}
              </p>
              <p style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 32, color: getStatusColor(value), margin: 0, fontWeight: 700 }}>
                {stats[value] || 0}
              </p>
            </div>
          ))}
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          <button
            onClick={() => setFiltro('todos')}
            className="btn"
            style={{
              padding: '8px 18px',
              borderRadius: 999,
              border: `1.5px solid ${filtro === 'todos' ? 'var(--color-brand-dark)' : 'var(--color-brand-border)'}`,
              background: filtro === 'todos' ? 'var(--color-brand-dark)' : 'transparent',
              color: filtro === 'todos' ? 'white' : 'var(--color-brand-text)',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: '"Inter", sans-serif',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => {
              if (filtro !== 'todos') {
                e.currentTarget.style.borderColor = 'var(--color-brand-gold)'
                e.currentTarget.style.color = 'var(--color-brand-gold)'
              }
            }}
            onMouseLeave={e => {
              if (filtro !== 'todos') {
                e.currentTarget.style.borderColor = 'var(--color-brand-border)'
                e.currentTarget.style.color = 'var(--color-brand-text)'
              }
            }}
          >
            Todos ({stats.total})
          </button>
          {STATUS_LIST.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFiltro(value)}
              className="btn"
              style={{
                padding: '8px 18px',
                borderRadius: 999,
                border: `1.5px solid ${filtro === value ? getStatusColor(value) : 'var(--color-brand-border)'}`,
                background: filtro === value ? getStatusColor(value) : 'transparent',
                color: filtro === value ? 'white' : 'var(--color-brand-text)',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: '"Inter", sans-serif',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => {
                if (filtro !== value) {
                  e.currentTarget.style.borderColor = getStatusColor(value)
                  e.currentTarget.style.color = getStatusColor(value)
                }
              }}
              onMouseLeave={e => {
                if (filtro !== value) {
                  e.currentTarget.style.borderColor = 'var(--color-brand-border)'
                  e.currentTarget.style.color = 'var(--color-brand-text)'
                }
              }}
            >
              {label} ({stats[value] || 0})
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div className="skeleton" style={{ width: 200, height: 20, margin: '0 auto 12px' }} />
            <div className="skeleton" style={{ width: 140, height: 16, margin: '0 auto' }} />
          </div>
        )}

        {/* Empty State */}
        {!loading && pedidosFiltrados.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-border)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <p style={{ fontFamily: '"Inter", sans-serif', color: 'var(--color-brand-text-secondary)', fontSize: 18 }}>
              Nenhum pedido encontrado.
            </p>
          </div>
        )}

        {/* Order Cards */}
        {!loading && pedidosFiltrados.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pedidosFiltrados.map((pedido, idx) => (
              <div key={pedido.id} className="card card-hover" style={{
                padding: 24,
                animation: `fadeInUp 0.4s ease forwards`,
                animationDelay: `${Math.min(idx * 0.05, 0.3)}s`,
              }}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 16,
                  marginBottom: 16,
                }}>
                  <div>
                    <p style={{
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      fontSize: 20,
                      color: 'var(--color-brand-dark)',
                      margin: 0,
                      marginBottom: 4,
                      fontWeight: 700,
                    }}>
                      Pedido #{pedido.id?.slice(0, 8)}
                    </p>
                    <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: 'var(--color-brand-text-secondary)', margin: 0 }}>
                      {formatarData(pedido.criado_em || pedido.created_at)}
                    </p>
                  </div>
                  <span className={getStatusBadgeClass(pedido.status)}>
                    {STATUS_LABELS[pedido.status] || pedido.status}
                  </span>
                </div>

                {/* Info Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 12,
                  marginBottom: 16,
                }}>
                  <div>
                    <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, color: 'var(--color-brand-text-secondary)', margin: 0, marginBottom: 4, fontWeight: 500 }}>
                      Cliente
                    </p>
                    <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: 'var(--color-brand-text)', margin: 0 }}>
                      {pedido.nome_cliente || pedido.cliente_nome || '—'}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, color: 'var(--color-brand-text-secondary)', margin: 0, marginBottom: 4, fontWeight: 500 }}>
                      Telefone
                    </p>
                    <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: 'var(--color-brand-text)', margin: 0 }}>
                      {pedido.telefone_cliente || pedido.cliente_telefone || '—'}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, color: 'var(--color-brand-text-secondary)', margin: 0, marginBottom: 4, fontWeight: 500 }}>
                      Total
                    </p>
                    <p style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 18, color: 'var(--color-brand-gold)', margin: 0, fontWeight: 700 }}>
                      {formatarPreco(pedido.total)}
                    </p>
                  </div>
                </div>

                {/* Items */}
                {pedido.itens && (
                  <div style={{
                    background: 'var(--color-brand-bg)',
                    borderRadius: 10,
                    padding: 16,
                    marginBottom: 16,
                    border: '1px solid var(--color-brand-border-light)',
                  }}>
                    <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, color: 'var(--color-brand-text-secondary)', margin: 0, marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Itens
                    </p>
                    {Array.isArray(pedido.itens) ? (
                      pedido.itens.map((item, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontFamily: '"Inter", sans-serif',
                          fontSize: 14,
                          color: 'var(--color-brand-text)',
                          padding: '4px 0',
                          borderBottom: idx < pedido.itens.length - 1 ? '1px solid var(--color-brand-border-light)' : 'none',
                        }}>
                          <span>{item.quantidade}x {item.nome}</span>
                          <span style={{ fontWeight: 600 }}>{formatarPreco(item.preco * item.quantidade)}</span>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: 'var(--color-brand-text)', margin: 0 }}>{pedido.itens}</p>
                    )}
                  </div>
                )}

                {/* Status Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: 'var(--color-brand-text-secondary)' }}>
                    Alterar status:
                  </span>
                  <select
                    value={pedido.status}
                    onChange={(e) => handleAlterarStatus(pedido.id, e.target.value)}
                    disabled={atualizando === pedido.id}
                    className="input"
                    style={{
                      padding: '8px 12px',
                      fontSize: 14,
                      width: 'auto',
                      minWidth: 180,
                      cursor: 'pointer',
                    }}
                  >
                    {STATUS_LIST.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  {atualizando === pedido.id && (
                    <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: 'var(--color-brand-text-secondary)' }}>
                      Atualizando...
                    </span>
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