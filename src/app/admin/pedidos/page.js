'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import HeaderUnificado from '@/components/HeaderUnificado'
import { storeConfig } from '@/config/store'
import { theme } from '@/theme'
import { formatarPreco, formatarData, formatarTelefone, getStatusLabel, getStatusColor } from '@/lib/utils'

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
const STATUS_LIST = storeConfig.pedido.orderStatuses.map(status => ({
  value: status,
  label: STATUS_LABELS[status] || status
}))
const emailsAdmin = storeConfig.admin.adminEmails

function hoje() {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

export default function AdminPedidosPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [adminVerificado, setAdminVerificado] = useState(false)
  const [filtro, setFiltro] = useState('todos')
  const [atualizando, setAtualizando] = useState(null)
  const [pedidoExpandido, setPedidoExpandido] = useState(null)
  const [filtroData, setFiltroData] = useState('')
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [confirmPedidoId, setConfirmPedidoId] = useState(null)
  const [confirmNovoStatus, setConfirmNovoStatus] = useState(null)
  const [confirmEnviando, setConfirmEnviando] = useState(false)

  useEffect(() => {
    async function verificarAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !emailsAdmin.includes(user.email)) {
        router.push('/login')
        return
      }
      setUser(user)
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

  function handleSolicitarAlteracao(pedidoId, novoStatus) {
    setConfirmPedidoId(pedidoId)
    setConfirmNovoStatus(novoStatus)
    setConfirmModalOpen(true)
  }

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
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Erro ao atualizar status.')
        return
      }
      setPedidos(prev => prev.map(p =>
        p.id === confirmPedidoId ? { ...p, status: confirmNovoStatus } : p
      ))
    } catch {
      alert('Erro ao conectar com o servidor. Tente novamente.')
    } finally {
      setConfirmEnviando(false)
      setAtualizando(null)
      setConfirmModalOpen(false)
      setConfirmPedidoId(null)
      setConfirmNovoStatus(null)
    }
  }

  function handleCancelarAlteracao() {
    setConfirmModalOpen(false)
    setConfirmPedidoId(null)
    setConfirmNovoStatus(null)
  }

  function exportarParaCSV() {
    const dados = pedidosFiltrados
    if (dados.length === 0) {
      alert('Nenhum pedido para exportar.')
      return
    }
    const linhas = []
    linhas.push([
      'Pedido', 'Data', 'Cliente', 'Telefone', 'Email', 'Status', 'Itens',
      'Cupom', 'Subtotal', 'Frete', 'Desconto', 'Total', 'Forma Entrega',
      'Pagamento', 'Endereco', 'Bairro'
    ].join(';'))
    for (const p of dados) {
      const itensStr = Array.isArray(p.itens)
        ? p.itens.map(i => `${i.quantidade || i.quantity || 1}x ${i.nome || i.title}`).join(' | ')
        : (p.itens || '')
      const cupomStr = p.cupom_aplicado
        ? (typeof p.cupom_aplicado === 'object' ? p.cupom_aplicado.codigo : p.cupom_aplicado)
        : ''
      const linha = [
        `#${String(p.id).slice(0, 8).toUpperCase()}`,
        formatarData(p.criado_em || p.created_at),
        p.cliente_nome || p.nome_cliente || '',
        p.cliente_telefone || p.telefone_cliente || '',
        p.email_cliente || '',
        STATUS_LABELS[p.status] || p.status,
        `"${(itensStr || '').replace(/"/g, '""')}"`,
        cupomStr,
        Number(p.subtotal || 0).toFixed(2).replace('.', ','),
        Number(p.valor_frete || 0).toFixed(2).replace('.', ','),
        Number(p.desconto || 0).toFixed(2).replace('.', ','),
        Number(p.total || 0).toFixed(2).replace('.', ','),
        p.forma_entrega || '',
        p.pagamento_status || '',
        `"${(p.endereco_entrega || '').replace(/"/g, '""')}"`,
        p.bairro_entrega || ''
      ]
      linhas.push(linha.join(';'))
    }
    const csvString = '\uFEFF' + linhas.join('\n')
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const dataStr = new Date().toISOString().split('T')[0]
    link.setAttribute('download', `pedidos-${dataStr}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (!adminVerificado) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: SANS, color: COLORS.textLight, fontSize: 18 }}>Verificando permissoes...</p>
      </div>
    )
  }

  const pedidosFiltrados = pedidos.filter(p => {
    if (filtro !== 'todos' && p.status !== filtro) return false
    if (filtroData) {
      const dataPedido = p.criado_em ? p.criado_em.split('T')[0] : (p.created_at ? p.created_at.split('T')[0] : '')
      if (dataPedido !== filtroData) return false
    }
    return true
  })

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

  function getStatusColorLocal(status) {
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

  return (
    <div style={{ background: COLORS.background, minHeight: '100vh', fontFamily: SANS }}>
      <HeaderUnificado />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <h1 style={{ fontFamily: SERIF, fontSize: '28px', color: COLORS.text, marginBottom: 24 }}>
          Admin — Pedidos
        </h1>

        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16, marginBottom: 30 }}>
          <div style={{ background: COLORS.white, borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <p style={{ fontFamily: SANS, fontSize: 13, color: COLORS.textLight, margin: 0, marginBottom: 8 }}>Total</p>
            <p style={{ fontFamily: SERIF, fontSize: 28, color: COLORS.text, margin: 0 }}>{stats.total}</p>
          </div>
          {STATUS_LIST.map(({ value, label }) => (
            <div key={value} style={{
              background: COLORS.white, borderRadius: 12, padding: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              borderTop: `3px solid ${getStatusColorLocal(value)}`
            }}>
              <p style={{ fontFamily: SANS, fontSize: 13, color: COLORS.textLight, margin: 0, marginBottom: 8 }}>{label}</p>
              <p style={{ fontFamily: SERIF, fontSize: 28, color: getStatusColorLocal(value), margin: 0 }}>{stats[value] || 0}</p>
            </div>
          ))}
        </div>

        {/* Filtro data */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <label style={{ fontFamily: SANS, fontSize: 14, color: COLORS.text, fontWeight: 600 }}>Filtrar por data:</label>
          <input type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid ' + COLORS.border, fontFamily: SANS, fontSize: 14, color: COLORS.text, background: COLORS.white, outline: 'none' }} />
          <button onClick={() => setFiltroData(hoje())}
            style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid ' + COLORS.primary, background: COLORS.primary, color: COLORS.white, fontFamily: SANS, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Hoje
          </button>
          {filtroData && (
            <button onClick={() => setFiltroData('')}
              style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid ' + COLORS.danger, background: 'transparent', color: COLORS.danger, fontFamily: SANS, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Limpar filtro
            </button>
          )}
        </div>

        {/* Filtro status + export */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button onClick={() => setFiltro('todos')}
              style={{
                padding: '8px 16px', borderRadius: 20, border: 'none',
                background: filtro === 'todos' ? COLORS.primary : COLORS.lightGray,
                color: filtro === 'todos' ? COLORS.white : COLORS.textLight,
                fontFamily: SANS, fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}>
              Todos ({stats.total})
            </button>
            {STATUS_LIST.map(({ value, label }) => (
              <button key={value} onClick={() => setFiltro(value)}
                style={{
                  padding: '8px 16px', borderRadius: 20, border: 'none',
                  background: filtro === value ? getStatusColorLocal(value) : COLORS.lightGray,
                  color: filtro === value ? COLORS.white : COLORS.textLight,
                  fontFamily: SANS, fontSize: 13, fontWeight: 600, cursor: 'pointer'
                }}>
                {label} ({stats[value] || 0})
              </button>
            ))}
          </div>
          <button onClick={exportarParaCSV}
            style={{
              padding: '10px 24px', borderRadius: 8, border: '1px solid ' + COLORS.primary,
              background: COLORS.primary, color: COLORS.white, fontFamily: SANS,
              fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar Excel ({pedidosFiltrados.length})
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <p style={{ fontFamily: SANS, color: COLORS.textLight, fontSize: 18 }}>Carregando pedidos...</p>
          </div>
        )}

        {/* Vazio */}
        {!loading && pedidosFiltrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, background: COLORS.white, borderRadius: 12 }}>
            <p style={{ fontFamily: SANS, color: COLORS.textLight, fontSize: 18 }}>Nenhum pedido encontrado.</p>
          </div>
        )}

        {/* Lista */}
        {!loading && pedidosFiltrados.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pedidosFiltrados.map((pedido) => {
              const expandido = pedidoExpandido === pedido.id
              return (
                <div key={pedido.id}
                  style={{
                    background: COLORS.white, borderRadius: 12, padding: 24,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer',
                    borderLeft: `4px solid ${getStatusColorLocal(pedido.status)}`
                  }}
                  onClick={() => setPedidoExpandido(expandido ? null : pedido.id)}>
                  {/* Cabecalho */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <p style={{ fontFamily: SERIF, fontSize: 20, color: COLORS.text, margin: 0 }}>
                          Pedido #{pedido.id ? pedido.id.slice(0, 8).toUpperCase() : '\u2014'}
                        </p>
                        <span style={{
                          padding: '4px 12px', borderRadius: 20,
                          background: getStatusColorLocal(pedido.status),
                          color: COLORS.white, fontFamily: SANS, fontSize: 12, fontWeight: 600
                        }}>
                          {STATUS_LABELS[pedido.status] || pedido.status}
                        </span>
                      </div>
                      <p style={{ fontFamily: SANS, fontSize: 13, color: COLORS.textLight, margin: '4px 0 0' }}>
                        {formatarData(pedido.criado_em || pedido.created_at)}
                      </p>
                    </div>
                    <p style={{ fontFamily: SERIF, fontSize: 22, color: COLORS.primary, margin: 0, fontWeight: 700 }}>
                      {formatarPreco(pedido.total)}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, fontFamily: SANS, color: COLORS.textLight }}>
                    <span><strong style={{ color: COLORS.text }}>Cliente:</strong> {pedido.cliente_nome || pedido.nome_cliente || '\u2014'}</span>
                    <span><strong style={{ color: COLORS.text }}>Email:</strong> {pedido.email_cliente || '\u2014'}</span>
                    <span style={{ color: expandido ? COLORS.primary : COLORS.textLight }}>
                      {expandido ? '\u25b2 Clique para recolher' : '\u25bc Clique para detalhes'}
                    </span>
                  </div>

                  {/* Detalhes expandidos */}
                  {expandido && (
                    <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 20 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 20 }}>
                        <div style={{ background: COLORS.lightGray, borderRadius: 8, padding: 14 }}>
                          <p style={{ fontFamily: SANS, fontSize: 11, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px', fontWeight: 700 }}>Dados do Cliente</p>
                          <div style={{ fontFamily: SANS, fontSize: 13, color: COLORS.text, lineHeight: 1.8 }}>
                            <div><strong>Nome:</strong> {pedido.cliente_nome || pedido.nome_cliente || '\u2014'}</div>
                            <div><strong>Email:</strong> {pedido.email_cliente || '\u2014'}</div>
                            <div><strong>Telefone:</strong> {formatarTelefone(pedido.cliente_telefone || pedido.telefone_cliente)}</div>
                          </div>
                        </div>
                        <div style={{ background: COLORS.lightGray, borderRadius: 8, padding: 14 }}>
                          <p style={{ fontFamily: SANS, fontSize: 11, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px', fontWeight: 700 }}>Endereco de Entrega</p>
                          <div style={{ fontFamily: SANS, fontSize: 13, color: COLORS.text, lineHeight: 1.8 }}>
                            <div><strong>Endereco:</strong> {pedido.endereco_entrega || '\u2014'}</div>
                            <div><strong>Bairro:</strong> {pedido.bairro_entrega || '\u2014'}</div>
                            {pedido.complemento && <div><strong>Complemento:</strong> {pedido.complemento}</div>}
                            {pedido.instrucoes_entrega && (
                              <div style={{ marginTop: 8, padding: 8, background: '#FFF8E1', borderRadius: 6, border: '1px solid #FFE082' }}>
                                <strong>Instrucoes:</strong> {pedido.instrucoes_entrega}
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ background: COLORS.lightGray, borderRadius: 8, padding: 14 }}>
                          <p style={{ fontFamily: SANS, fontSize: 11, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px', fontWeight: 700 }}>Financeiro</p>
                          <div style={{ fontFamily: SANS, fontSize: 13, color: COLORS.text, lineHeight: 1.8 }}>
                            <div><strong>Subtotal:</strong> {formatarPreco(pedido.subtotal)}</div>
                            <div><strong>Frete:</strong> {pedido.valor_frete ? formatarPreco(pedido.valor_frete) : '\u2014'}</div>
                            {pedido.desconto > 0 && <div><strong>Desconto:</strong> -{formatarPreco(pedido.desconto)}</div>}
                            <div style={{ borderTop: '1px solid ' + COLORS.border, paddingTop: 4, marginTop: 4, fontWeight: 700 }}>
                              <strong>Total:</strong> {formatarPreco(pedido.total)}
                            </div>
                            {pedido.cupom_aplicado && (
                              <div style={{ marginTop: 4 }}>
                                <strong>Cupom:</strong> {typeof pedido.cupom_aplicado === 'object' ? pedido.cupom_aplicado.codigo : pedido.cupom_aplicado}
                              </div>
                            )}
                            <div><strong>Pagamento:</strong> {pedido.pagamento_status || 'pendente'}</div>
                            <div><strong>Forma entrega:</strong> {pedido.forma_entrega || '\u2014'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Tabela de itens */}
                      {pedido.itens && (
                        <div style={{ background: COLORS.lightGray, borderRadius: 8, padding: 16, marginBottom: 20 }}>
                          <p style={{ fontFamily: SANS, fontSize: 11, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px', fontWeight: 700 }}>Itens do Pedido</p>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: SANS, fontSize: 13 }}>
                            <thead>
                              <tr style={{ borderBottom: '2px solid ' + COLORS.border, color: COLORS.textLight }}>
                                <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}>Produto</th>
                                <th style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 600 }}>Qtd</th>
                                <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600 }}>Preco</th>
                                <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600 }}>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Array.isArray(pedido.itens) ? (
                                pedido.itens.map((item, idx) => (
                                  <tr key={idx} style={{ borderBottom: '1px solid ' + COLORS.border }}>
                                    <td style={{ padding: '8px', color: COLORS.text }}>{item.nome || item.title}</td>
                                    <td style={{ textAlign: 'center', padding: '8px', color: COLORS.text }}>{item.quantidade || item.quantity || 1}</td>
                                    <td style={{ textAlign: 'right', padding: '8px', color: COLORS.text }}>{formatarPreco(item.preco || item.unit_price)}</td>
                                    <td style={{ textAlign: 'right', padding: '8px', color: COLORS.text, fontWeight: 600 }}>
                                      {formatarPreco((item.preco || item.unit_price || 0) * (item.quantidade || item.quantity || 1))}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr><td colSpan={4} style={{ padding: '8px', color: COLORS.textLight }}>{pedido.itens}</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Alterar status */}
                      <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid ' + COLORS.border }}>
                        <span style={{ fontFamily: SANS, fontSize: 13, color: COLORS.textLight, fontWeight: 600 }}>Alterar status:</span>
                        <select
                          value={pedido.status}
                          onChange={(e) => handleSolicitarAlteracao(pedido.id, e.target.value)}
                          disabled={atualizando === pedido.id}
                          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid ' + COLORS.border, background: COLORS.white, color: COLORS.text, fontFamily: SANS, fontSize: 14, cursor: 'pointer', outline: 'none' }}>
                          {STATUS_LIST.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                        {atualizando === pedido.id && (
                          <span style={{ fontFamily: SANS, fontSize: 13, color: COLORS.textLight }}>Atualizando...</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de confirmacao */}
      {confirmModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(45, 27, 14, 0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }} onClick={handleCancelarAlteracao}>
          <div style={{
            background: COLORS.white, borderRadius: 16, padding: 32,
            maxWidth: 480, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: SERIF, fontSize: 20, color: COLORS.text, margin: '0 0 8px' }}>
              Alterar Status
            </h3>
            <p style={{ fontFamily: SANS, fontSize: 14, color: COLORS.textLight, margin: '0 0 24px', lineHeight: 1.5 }}>
              Tem certeza que deseja alterar o status do pedido <strong>#{String(confirmPedidoId || '').slice(0, 8).toUpperCase()}</strong> para <strong style={{ color: getStatusColorLocal(confirmNovoStatus) }}>{STATUS_LABELS[confirmNovoStatus] || confirmNovoStatus}</strong>?
            </p>
            {confirmNovoStatus === 'saiu_entrega' && (
              <p style={{ fontFamily: SANS, fontSize: 13, color: '#B45309', background: '#FEF3C7', padding: '10px 14px', borderRadius: 8, margin: '0 0 16px', lineHeight: 1.4 }}>
                O cliente recebera uma notificacao de que o pedido saiu para entrega.
              </p>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={handleCancelarAlteracao} disabled={confirmEnviando}
                style={{ padding: '10px 24px', borderRadius: 999, border: '1.5px solid ' + COLORS.border, background: 'transparent', color: COLORS.textLight, fontSize: 14, fontWeight: 600, fontFamily: SANS, cursor: 'pointer', opacity: confirmEnviando ? 0.5 : 1 }}>
                Cancelar
              </button>
              <button onClick={handleConfirmarAlteracao} disabled={confirmEnviando}
                style={{ padding: '10px 24px', borderRadius: 999, border: 'none', background: getStatusColorLocal(confirmNovoStatus), color: 'white', fontSize: 14, fontWeight: 600, fontFamily: SANS, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', opacity: confirmEnviando ? 0.6 : 1 }}>
                {confirmEnviando ? 'Alterando...' : 'Sim, alterar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}