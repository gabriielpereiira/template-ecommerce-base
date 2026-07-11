'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import Header from '../../components/Header'
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

function formatarData(dataISO) {
  if (!dataISO) return ''
  const data = new Date(dataISO)
  const dia = String(data.getDate()).padStart(2, '0')
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const ano = data.getFullYear()
  return `${dia}/${mes}/${ano}`
}

function formatarPreco(valor) {
  if (valor == null) return 'R$ 0,00'
  return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`
}

function getStatusLabel(status) {
  if (!storeConfig.pedido.orderStatuses.includes(status)) {
    console.warn('Status desconhecido:', status)
    return status
  }
  return STATUS_LABELS[status] || status
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

export default function PedidosPage() {
  const { usuario } = useAuth()
  const router = useRouter()
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [pedidoExpandido, setPedidoExpandido] = useState(null)

  useEffect(() => {
    if (!usuario) {
      router.push('/login')
      return
    }
    async function carregarPedidos() {
      try {
        const { data, error } = await supabase
          .from('pedidos')
          .select('*')
          .eq('user_id', usuario.id)
          .order('criado_em', { ascending: false })
        if (error) {
          console.error('Erro ao carregar pedidos:', error)
          setPedidos([])
        } else {
          setPedidos(data || [])
        }
      } catch (err) {
        console.error('Erro inesperado:', err)
        setPedidos([])
      } finally {
        setCarregando(false)
      }
    }
    carregarPedidos()
  }, [usuario, router])

  function formatarEndereco(endereco) {
    if (!endereco) return null
    if (typeof endereco === 'string') return endereco
    try {
      if (typeof endereco === 'object') {
        const parts = [endereco.logradouro, endereco.numero, endereco.bairro, endereco.cidade, endereco.estado].filter(Boolean)
        return parts.join(', ')
      }
    } catch { }
    return String(endereco)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-brand-bg)' }}>
      <Header />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 28,
          color: 'var(--color-brand-dark)',
          marginBottom: 32,
          fontWeight: 700,
        }}>
          Meus Pedidos
        </h1>

        {carregando ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div className="skeleton" style={{ width: 200, height: 20, margin: '0 auto 12px' }} />
            <div className="skeleton" style={{ width: 140, height: 16, margin: '0 auto' }} />
          </div>
        ) : pedidos.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-border)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <p style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 20, color: 'var(--color-brand-dark)', marginBottom: 8, fontWeight: 600 }}>
              Nenhum pedido ainda
            </p>
            <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: 'var(--color-brand-text-secondary)', marginBottom: 24 }}>
              Seu historico de pedidos aparecera aqui.
            </p>
            <button
              onClick={() => router.push('/cardapio')}
              className="btn btn-gold btn-lg"
            >
              Ver Cardapio
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pedidos.map((pedido, idx) => (
              <div key={pedido.id} className="card" style={{
                overflow: 'hidden',
                animation: `fadeInUp 0.4s ease forwards`,
                animationDelay: `${Math.min(idx * 0.05, 0.25)}s`,
              }}>
                {/* Header clicavel */}
                <div
                  onClick={() => setPedidoExpandido(
                    pedidoExpandido === pedido.id ? null : pedido.id
                  )}
                  style={{
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-brand-bg-soft)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <p style={{
                      fontFamily: '"Inter", sans-serif',
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--color-brand-dark)',
                      margin: 0,
                    }}>
                      Pedido #{pedido.id?.slice(0, 8)}
                    </p>
                    <p style={{
                      fontFamily: '"Inter", sans-serif',
                      fontSize: 13,
                      color: 'var(--color-brand-text-secondary)',
                      margin: '4px 0 0',
                    }}>
                      {formatarData(pedido.criado_em)}
                      {pedido.forma_entrega === 'entrega' ? ' • Entrega' : ' • Retirada'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className={getStatusBadgeClass(pedido.status)}>
                      {getStatusLabel(pedido.status)}
                    </span>
                    <p style={{
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      fontSize: 18,
                      fontWeight: 700,
                      color: 'var(--color-brand-gold)',
                      margin: 0,
                    }}>
                      {formatarPreco(pedido.total)}
                    </p>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--color-brand-text-secondary)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transition: 'transform 0.3s ease',
                        transform: pedidoExpandido === pedido.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Content */}
                {pedidoExpandido === pedido.id && (
                  <div style={{
                    padding: '0 24px 20px',
                    borderTop: '1px solid var(--color-brand-border-light)',
                    animation: 'fadeIn 0.3s ease',
                  }}>
                    <h3 style={{
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      fontSize: 14,
                      color: 'var(--color-brand-dark)',
                      margin: '16px 0 12px',
                      fontWeight: 600,
                    }}>
                      Itens do pedido
                    </h3>

                    {(pedido.itens || []).map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: idx < pedido.itens.length - 1 ? '1px solid var(--color-brand-border-light)' : 'none',
                      }}>
                        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: 'var(--color-brand-text)', margin: 0 }}>
                          {item.quantidade || 1}x {item.nome || item.title}
                        </p>
                        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: 'var(--color-brand-text)', margin: 0, fontWeight: 600 }}>
                          {formatarPreco(
                            (item.preco || item.unit_price || 0) * (item.quantidade || 1)
                          )}
                        </p>
                      </div>
                    ))}

                    {(pedido.valor_frete || 0) > 0 && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                      }}>
                        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: 'var(--color-brand-text-secondary)', margin: 0 }}>Frete</p>
                        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: 'var(--color-brand-text-secondary)', margin: 0 }}>{formatarPreco(pedido.valor_frete)}</p>
                      </div>
                    )}

                    {(pedido.desconto || 0) > 0 && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                      }}>
                        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: '#16A34A', margin: 0 }}>Desconto</p>
                        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: '#16A34A', margin: 0 }}>-{formatarPreco(pedido.desconto)}</p>
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '12px 0 0',
                      borderTop: '2px solid var(--color-brand-border)',
                      marginTop: 8,
                    }}>
                      <p style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 16, fontWeight: 700, color: 'var(--color-brand-dark)', margin: 0 }}>
                        Total
                      </p>
                      <p style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 16, fontWeight: 700, color: 'var(--color-brand-gold)', margin: 0 }}>
                        {formatarPreco(pedido.total)}
                      </p>
                    </div>

                    {pedido.endereco_entrega && (
                      <div style={{ marginTop: 16, padding: 14, background: 'var(--color-brand-bg)', borderRadius: 10, border: '1px solid var(--color-brand-border-light)' }}>
                        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: 700, color: 'var(--color-brand-text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                          {pedido.forma_entrega === 'retirar' || pedido.forma_entrega === 'retirada'
                            ? 'Retirada no local'
                            : 'Endereco de entrega'}
                        </p>
                        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: 'var(--color-brand-text)', margin: 0, whiteSpace: 'pre-line' }}>
                          {formatarEndereco(pedido.endereco_entrega)}
                        </p>
                      </div>
                    )}

                    {pedido.observacoes && (
                      <div style={{ marginTop: 12 }}>
                        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: 700, color: 'var(--color-brand-text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                          Observacoes
                        </p>
                        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: 'var(--color-brand-text)', margin: 0 }}>
                          {pedido.observacoes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}