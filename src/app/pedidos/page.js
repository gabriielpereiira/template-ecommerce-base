'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import Header from '../../components/Header'
import { storeConfig } from '@/config/store'

const SERIF = '"Playfair Display", Georgia, serif'
const SANS = '"Plus Jakarta Sans", sans-serif'

const COLORS = {
  dark: '#2D1B0E',
  gold: '#C4975A',
  bg: '#FAF7F2',
  white: '#FFFFFF',
  textSecondary: '#6B4F3A',
  border: '#E8E0D8',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#c00'
}

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

function getStatusColor(status) {
  const colors = {
    pendente: COLORS.warning,
    confirmado: COLORS.gold,
    preparando: '#2196F3',
    pronto: '#9C27B0',
    saiu_entrega: '#FF9800',
    entregue: COLORS.success,
    cancelado: COLORS.danger
  }
  return colors[status] || COLORS.textSecondary
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
    <div style={{ minHeight: '100vh', background: COLORS.bg }}>
      <Header />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 28, color: COLORS.dark, marginBottom: 32 }}>
          Meus Pedidos
        </h1>

        {carregando ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <p style={{ fontFamily: SANS, color: COLORS.textSecondary }}>
              Carregando pedidos...
            </p>
          </div>
        ) : pedidos.length === 0 ? (
          <div style={{
            background: COLORS.white,
            borderRadius: 16,
            padding: 60,
            textAlign: 'center',
            boxShadow: '0 2px 12px rgba(45,27,14,0.06)'
          }}>
            <p style={{ fontFamily: SERIF, fontSize: 20, color: COLORS.dark, marginBottom: 8 }}>
              Nenhum pedido ainda
            </p>
            <p style={{ fontFamily: SANS, fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 }}>
              Seu historico de pedidos aparecera aqui.
            </p>
            <button
              onClick={() => router.push('/cardapio')}
              style={{
                padding: '12px 28px',
                borderRadius: '999px',
                border: 'none',
                background: COLORS.gold,
                color: COLORS.white,
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: SANS
              }}
            >
              Ver Cardapio
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pedidos.map(pedido => (
              <div key={pedido.id} style={{
                background: COLORS.white,
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(45,27,14,0.06)'
              }}>
                <div
                  onClick={() => setPedidoExpandido(
                    pedidoExpandido === pedido.id ? null : pedido.id
                  )}
                  style={{
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <p style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: COLORS.dark, margin: 0 }}>
                      Pedido #{String(pedido.id).slice(0, 8)}
                    </p>
                    <p style={{ fontFamily: SANS, fontSize: 13, color: COLORS.textSecondary, margin: '4px 0 0' }}>
                      {formatarData(pedido.criado_em)}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      background: getStatusColor(pedido.status),
                      color: COLORS.white,
                      fontFamily: SANS
                    }}>
                      {getStatusLabel(pedido.status)}
                    </span>
                    <p style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: COLORS.gold, margin: 0 }}>
                      {formatarPreco(pedido.total)}
                    </p>
                  </div>
                </div>

                {pedidoExpandido === pedido.id && (
                  <div style={{
                    padding: '20px 24px',
                    borderTop: '1px solid ' + COLORS.border
                  }}>
                    <h3 style={{ fontFamily: SERIF, fontSize: 14, color: COLORS.dark, marginBottom: 12 }}>
                      Itens do pedido
                    </h3>

                    {(pedido.itens || []).map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: idx < pedido.itens.length - 1 ? '1px solid ' + COLORS.border : 'none'
                      }}>
                        <p style={{ fontFamily: SANS, fontSize: 14, color: COLORS.dark, margin: 0 }}>
                          {item.quantidade || 1}x {item.nome || item.title}
                        </p>
                        <p style={{ fontFamily: SANS, fontSize: 14, color: COLORS.dark, margin: 0 }}>
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
                        padding: '8px 0'
                      }}>
                        <p style={{ fontFamily: SANS, fontSize: 14, color: COLORS.textSecondary, margin: 0 }}>Frete</p>
                        <p style={{ fontFamily: SANS, fontSize: 14, color: COLORS.textSecondary, margin: 0 }}>{formatarPreco(pedido.valor_frete)}</p>
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '12px 0 0',
                      borderTop: '2px solid ' + COLORS.border,
                      marginTop: 8
                    }}>
                      <p style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: COLORS.dark, margin: 0 }}>Total</p>
                      <p style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: COLORS.gold, margin: 0 }}>{formatarPreco(pedido.total)}</p>
                    </div>

                    {pedido.endereco_entrega && (
                      <div style={{ marginTop: 16, padding: 12, background: COLORS.bg, borderRadius: 8 }}>
                        <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 4 }}>
                          {pedido.forma_entrega === 'retirar'
                            ? 'Retirada no local'
                            : 'Endereco de entrega'}
                        </p>
                        <p style={{ fontFamily: SANS, fontSize: 13, color: COLORS.dark, margin: 0, whiteSpace: 'pre-line' }}>
                          {formatarEndereco(pedido.endereco_entrega)}
                        </p>
                      </div>
                    )}

                    {pedido.observacoes && (
                      <div style={{ marginTop: 12 }}>
                        <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 4 }}>
                          Observacoes
                        </p>
                        <p style={{ fontFamily: SANS, fontSize: 13, color: COLORS.dark, margin: 0 }}>
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