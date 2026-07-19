'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Header from '@/components/Header'
import { storeConfig } from '@/config/store'
import { theme } from '@/theme'

const COLORS = theme.colors
const SERIF = theme.fonts.serif
const SANS = theme.fonts.sans

const STATUS_LABELS = {
  pendente: 'Aguardando pagamento',
  confirmado: 'Pagamento confirmado',
  preparando: 'Em preparo',
  pronto: 'Pronto para retirada',
  saiu_entrega: 'Saiu para entrega',
  entregue: 'Entregue',
  cancelado: 'Cancelado'
}

function formatarPreco(valor) {
  if (valor == null) return 'R$ 0,00'
  return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`
}

function getStatusColor(status) {
  const colors = {
    pendente: '#F59E0B',
    confirmado: '#3B82F6',
    preparando: '#A78BFA',
    pronto: '#10B981',
    saiu_entrega: '#FF6B6B',
    entregue: '#059669',
    cancelado: '#EF4444'
  }
  return colors[status] || '#9CA3AF'
}

export default function AdminPedidosPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [confirmPedidoId, setConfirmPedidoId] = useState(null)
  const [confirmNovoStatus, setConfirmNovoStatus] = useState(null)
  const [confirmEnviando, setConfirmEnviando] = useState(false)
  const [atualizando, setAtualizando] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data?.user?.email
      const admins = storeConfig.admin?.adminEmails || []
      if (!email || !admins.includes(email)) {
        router.push('/')
        return
      }
      setUser(data.user)
      carregarPedidos()
    })
  }, [])

  async function carregarPedidos() {
    try {
      const { data } = await supabase
        .from('pedidos')
        .select('*')
        .order('criado_em', { ascending: false })
      setPedidos(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const pedidosFiltrados = filtroStatus === 'todos'
    ? pedidos
    : pedidos.filter(p => p.status === filtroStatus)

  async function handleConfirmarAlteracao() {
    if (!confirmPedidoId || !confirmNovoStatus) return
    setConfirmEnviando(true)
    setAtualizando(confirmPedidoId)
    try {
      const res = await fetch('/api/pedido/atualizar-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId: confirmPedidoId,
          novoStatus: confirmNovoStatus
        })
      })
      const data = await res.json()
      if (data.success) {
        setPedidos(pedidos.map(p =>
          p.id === confirmPedidoId ? { ...p, status: confirmNovoStatus } : p
        ))
      } else {
        alert('Erro ao atualizar status: ' + (data.error || 'Erro desconhecido'))
      }
    } catch (err) {
      console.error('Erro ao alterar status:', err)
    } finally {
      setConfirmEnviando(false)
      setAtualizando(null)
      setConfirmPedidoId(null)
      setConfirmNovoStatus(null)
    }
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: SANS, color: COLORS.textSecondary }}>Verificando acesso...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg }}>
      <Header variante="completo" />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 32, color: COLORS.dark, marginBottom: 24 }}>
          Admin - Pedidos
        </h1>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {['todos', 'pendente', 'confirmado', 'preparando', 'pronto', 'saiu_entrega', 'entregue', 'cancelado'].map(status => (
            <button key={status} onClick={() => setFiltroStatus(status)} style={{
              padding: '8px 16px', borderRadius: 999, cursor: 'pointer',
              background: filtroStatus === status ? COLORS.coral : COLORS.white,
              color: filtroStatus === status ? COLORS.white : COLORS.textSecondary,
              fontWeight: 600, fontSize: 13, fontFamily: SANS,
              border: filtroStatus === status ? 'none' : '1px solid ' + COLORS.border
            }}>
              {status === 'todos' ? 'Todos' : STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: COLORS.textSecondary }}>Carregando...</div>
        ) : pedidosFiltrados.length === 0 ? (
          <div style={{ background: COLORS.white, borderRadius: 12, padding: 40, textAlign: 'center', border: '1px solid ' + COLORS.border }}>
            <p style={{ color: COLORS.textSecondary, fontFamily: SANS, margin: 0 }}>Nenhum pedido encontrado.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pedidosFiltrados.map(pedido => (
              <div key={pedido.id} style={{
                background: COLORS.white, borderRadius: 12, padding: 20,
                border: '1px solid ' + COLORS.border,
                borderLeft: `4px solid ${getStatusColor(pedido.status)}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: SERIF, fontSize: 16, color: COLORS.dark, fontWeight: 700 }}>
                        Pedido #{pedido.id ? pedido.id.slice(0, 8).toUpperCase() : '---'}
                      </span>
                      <span style={{
                        padding: '4px 10px', borderRadius: 20,
                        background: getStatusColor(pedido.status),
                        color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: SANS
                      }}>{STATUS_LABELS[pedido.status] || pedido.status}</span>
                    </div>
                    <p style={{ fontFamily: SANS, fontSize: 13, color: COLORS.textSecondary, margin: '4px 0 0' }}>
                      {new Date(pedido.criado_em || pedido.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span style={{ fontFamily: SERIF, fontSize: 20, color: COLORS.dark, fontWeight: 700 }}>
                    {formatarPreco(pedido.total)}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, fontFamily: SANS, color: COLORS.textSecondary }}>
                  <span><strong style={{ color: COLORS.dark }}>Cliente:</strong> {pedido.cliente_nome || pedido.email_cliente}</span>
                  {pedido.forma_entrega && (
                    <span><strong style={{ color: COLORS.dark }}>Entrega:</strong> {pedido.forma_entrega === 'retirar' ? 'Retirada' : 'Entrega'}</span>
                  )}
                  {Array.isArray(pedido.itens) && (
                    <span><strong style={{ color: COLORS.dark }}>Itens:</strong> {pedido.itens.length}</span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                  {pedido.status !== 'cancelado' && pedido.status !== 'entregue' && (
                    <>
                      {pedido.status === 'pendente' && (
                        <button onClick={() => { setConfirmPedidoId(pedido.id); setConfirmNovoStatus('confirmado') }}
                          style={{ padding: '8px 16px', borderRadius: 999, border: 'none', background: '#3B82F6', color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: SANS, cursor: 'pointer' }}>
                          Confirmar pagamento
                        </button>
                      )}
                      {pedido.status === 'confirmado' && (
                        <button onClick={() => { setConfirmPedidoId(pedido.id); setConfirmNovoStatus('preparando') }}
                          style={{ padding: '8px 16px', borderRadius: 999, border: 'none', background: '#A78BFA', color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: SANS, cursor: 'pointer' }}>
                          Iniciar preparo
                        </button>
                      )}
                      {pedido.status === 'preparando' && (
                        <button onClick={() => { setConfirmPedidoId(pedido.id); setConfirmNovoStatus('pronto') }}
                          style={{ padding: '8px 16px', borderRadius: 999, border: 'none', background: '#10B981', color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: SANS, cursor: 'pointer' }}>
                          Marcar como pronto
                        </button>
                      )}
                      {pedido.status === 'pronto' && (
                        <button onClick={() => { setConfirmPedidoId(pedido.id); setConfirmNovoStatus('saiu_entrega') }}
                          style={{ padding: '8px 16px', borderRadius: 999, border: 'none', background: '#FF6B6B', color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: SANS, cursor: 'pointer' }}>
                          Saiu para entrega
                        </button>
                      )}
                      {pedido.status === 'saiu_entrega' && (
                        <button onClick={() => { setConfirmPedidoId(pedido.id); setConfirmNovoStatus('entregue') }}
                          style={{ padding: '8px 16px', borderRadius: 999, border: 'none', background: '#059669', color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: SANS, cursor: 'pointer' }}>
                          Confirmar entrega
                        </button>
                      )}
                      <button onClick={() => { setConfirmPedidoId(pedido.id); setConfirmNovoStatus('cancelado') }}
                        style={{ padding: '8px 16px', borderRadius: 999, border: '1px solid #EF4444', background: 'transparent', color: '#EF4444', fontSize: 13, fontWeight: 600, fontFamily: SANS, cursor: 'pointer' }}>
                        Cancelar
                      </button>
                    </>
                  )}
                </div>

                {pedido.itens && Array.isArray(pedido.itens) && pedido.itens.length > 0 && (
                  <details style={{ marginTop: 16 }}>
                    <summary style={{ fontFamily: SANS, fontSize: 13, color: COLORS.coral, fontWeight: 600, cursor: 'pointer' }}>
                      Ver detalhes do pedido
                    </summary>
                    <div style={{ marginTop: 12, background: COLORS.bg, borderRadius: 8, padding: 16 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: SANS, fontSize: 13 }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid ' + COLORS.border }}>
                            <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: COLORS.textSecondary }}>Produto</th>
                            <th style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 600, color: COLORS.textSecondary }}>Qtd</th>
                            <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600, color: COLORS.textSecondary }}>Preco</th>
                            <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600, color: COLORS.textSecondary }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pedido.itens.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid ' + COLORS.border }}>
                              <td style={{ padding: '8px', color: COLORS.dark }}>{item.nome || item.title}</td>
                              <td style={{ textAlign: 'center', padding: '8px', color: COLORS.dark }}>{item.quantidade || item.quantity || 1}</td>
                              <td style={{ textAlign: 'right', padding: '8px', color: COLORS.dark }}>{formatarPreco(item.preco || item.unit_price)}</td>
                              <td style={{ textAlign: 'right', padding: '8px', color: COLORS.dark, fontWeight: 700 }}>
                                {formatarPreco((item.preco || item.unit_price || 0) * (item.quantidade || item.quantity || 1))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmPedidoId && confirmNovoStatus && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(45,52,54,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
        }} onClick={() => { setConfirmPedidoId(null); setConfirmNovoStatus(null) }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: COLORS.white, borderRadius: 16, padding: 32,
            maxWidth: 480, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }}>
            <h2 style={{ fontFamily: SERIF, fontSize: 20, color: COLORS.dark, margin: '0 0 12px 0' }}>
              Confirmar alteracao de status
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 14, color: COLORS.textSecondary, margin: '0 0 24px 0', lineHeight: 1.6 }}>
              Tem certeza que deseja alterar o status do pedido <strong>#{String(confirmPedidoId || '').slice(0, 8).toUpperCase()}</strong> para <strong style={{ color: getStatusColor(confirmNovoStatus) }}>{STATUS_LABELS[confirmNovoStatus] || confirmNovoStatus}</strong>?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => { setConfirmPedidoId(null); setConfirmNovoStatus(null) }} style={{
                padding: '10px 24px', borderRadius: 999,
                border: '1.5px solid ' + COLORS.border,
                background: 'transparent', color: COLORS.textSecondary,
                fontSize: 14, fontWeight: 600, fontFamily: SANS, cursor: 'pointer'
              }}>Cancelar</button>
              <button onClick={handleConfirmarAlteracao} disabled={confirmEnviando}
                className={`btn btn-primary${confirmEnviando ? ' btn-loading' : ''}`}>
                {confirmEnviando ? 'Alterando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}