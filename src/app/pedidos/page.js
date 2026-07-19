'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import HeaderUnificado from '@/components/HeaderUnificado'
import { storeConfig } from '@/config/store'
import { theme } from '@/theme'
import { formatarPreco, formatarData, getStatusLabel, getStatusColor } from '@/lib/utils'

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

export default function MeusPedidosPage() {
  const router = useRouter()
  const { usuario } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [pedidoExpandido, setPedidoExpandido] = useState(null)

  useEffect(() => {
    if (!usuario) {
      setLoading(false)
      return
    }

    async function carregarPedidos() {
      try {
        const { data, error } = await supabase
          .from('pedidos')
          .select('*')
          .eq('email_cliente', usuario.email)
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
        setLoading(false)
      }
    }

    carregarPedidos()
  }, [usuario])

  function getStatusColorLocal(status) {
    const cores = {
      pendente: COLORS.warning,
      confirmado: COLORS.info,
      preparando: COLORS.secondary,
      pronto: COLORS.accent,
      saiu_entrega: COLORS.primary,
      entregue: COLORS.success,
      cancelado: COLORS.danger
    }
    return cores[status] || COLORS.darkGray
  }

  if (!usuario) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: SANS }}>
        <HeaderUnificado />
        <div style={{
          maxWidth: '500px', margin: '0 auto', padding: '100px 24px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontFamily: SERIF, fontSize: '24px', color: COLORS.dark, margin: '0 0 12px 0' }}>
            Faça login para ver seus pedidos
          </h2>
          <p style={{ fontSize: '14px', color: COLORS.textSecondary, margin: '0 0 32px 0', lineHeight: 1.6 }}>
            Acesse sua conta para visualizar o historico de pedidos.
          </p>
          <Link href="/login" style={{
            padding: '14px 36px', borderRadius: '999px',
            background: theme.gradients.coral, color: COLORS.white,
            fontSize: '15px', fontWeight: 700, fontFamily: SANS,
            textDecoration: 'none', display: 'inline-block',
            boxShadow: theme.shadows.button
          }}>
            Fazer login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: SANS }}>
      <HeaderUnificado />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{
          fontFamily: SERIF, fontSize: '28px', color: COLORS.dark,
          fontWeight: 700, margin: '0 0 8px 0'
        }}>
          Meus Pedidos
        </h1>
        <p style={{
          fontSize: '14px', color: COLORS.textSecondary,
          margin: '0 0 32px 0'
        }}>
          Acompanhe o status dos seus pedidos
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: COLORS.textSecondary }}>
            Carregando pedidos...
          </div>
        ) : pedidos.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 24px',
            background: COLORS.white, borderRadius: 16,
            border: '1px solid ' + COLORS.border
          }}>
            <p style={{ fontSize: '16px', color: COLORS.textSecondary, margin: '0 0 24px 0' }}>
              Nenhum pedido encontrado.
            </p>
            <p style={{ fontSize: '14px', color: COLORS.textLight, margin: '0 0 32px 0' }}>
              Seu historico de pedidos aparecera aqui.
            </p>
            <Link href="/cardapio" style={{
              padding: '12px 28px', borderRadius: '999px',
              background: theme.gradients.coral, color: COLORS.white,
              fontSize: '14px', fontWeight: 700, fontFamily: SANS,
              textDecoration: 'none', display: 'inline-block',
              boxShadow: theme.shadows.button
            }}>
              Ver cardapio
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pedidos.map(pedido => {
              const expandido = pedidoExpandido === pedido.id
              return (
                <div
                  key={pedido.id}
                  onClick={() => setPedidoExpandido(expandido ? null : pedido.id)}
                  style={{
                    background: COLORS.white, borderRadius: 12, padding: 20,
                    border: '1px solid ' + COLORS.border,
                    borderLeft: `4px solid ${getStatusColorLocal(pedido.status)}`,
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {/* Cabecalho */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', flexWrap: 'wrap', gap: 12,
                    marginBottom: 8
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{
                          fontFamily: SERIF, fontSize: '16px', color: COLORS.dark, fontWeight: 700
                        }}>
                          Pedido #{pedido.id ? pedido.id.slice(0, 8).toUpperCase() : '---'}
                        </span>
                        <span style={{
                          padding: '4px 12px', borderRadius: 20,
                          background: getStatusColorLocal(pedido.status),
                          color: COLORS.white, fontSize: '11px', fontWeight: 700, fontFamily: SANS
                        }}>
                          {STATUS_LABELS[pedido.status] || pedido.status}
                        </span>
                      </div>
                      <p style={{
                        fontFamily: SANS, fontSize: '13px', color: COLORS.textSecondary,
                        margin: '4px 0 0'
                      }}>
                        {formatarData(pedido.criado_em || pedido.created_at)}
                      </p>
                    </div>
                    <span style={{
                      fontFamily: SERIF, fontSize: '20px',
                      color: COLORS.dark, fontWeight: 700
                    }}>
                      {formatarPreco(pedido.total)}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex', gap: 16, flexWrap: 'wrap',
                    fontSize: '13px', fontFamily: SANS, color: COLORS.textSecondary
                  }}>
                    {pedido.forma_entrega && (
                      <span>
                        <strong style={{ color: COLORS.dark }}>Entrega:</strong>{' '}
                        {pedido.forma_entrega === 'retirar' ? 'Retirada no local' : pedido.forma_entrega}
                      </span>
                    )}
                    {Array.isArray(pedido.itens) && (
                      <span>
                        <strong style={{ color: COLORS.dark }}>Itens:</strong>{' '}
                        {pedido.itens.length} produto(s)
                      </span>
                    )}
                    <span style={{ color: expandido ? COLORS.coral : COLORS.textLight }}>
                      {expandido ? 'Clique para recolher' : 'Clique para detalhes'}
                    </span>
                  </div>

                  {/* Detalhes expandidos */}
                  {expandido && (
                    <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 20 }}>
                      {/* Itens */}
                      {Array.isArray(pedido.itens) && pedido.itens.length > 0 && (
                        <div style={{
                          background: COLORS.bg, borderRadius: 8, padding: 16,
                          marginBottom: 16
                        }}>
                          <p style={{
                            fontFamily: SANS, fontSize: '11px', color: COLORS.textSecondary,
                            textTransform: 'uppercase', letterSpacing: 1,
                            margin: '0 0 10px', fontWeight: 700
                          }}>
                            Itens
                          </p>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: SANS, fontSize: '13px' }}>
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
                      )}

                      {/* Dados do pedido */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                        {pedido.endereco_entrega && (
                          <div style={{ background: COLORS.bg, borderRadius: 8, padding: 14 }}>
                            <p style={{
                              fontFamily: SANS, fontSize: '11px', color: COLORS.textSecondary,
                              textTransform: 'uppercase', letterSpacing: 1,
                              margin: '0 0 8px', fontWeight: 700
                            }}>
                              {pedido.forma_entrega === 'retirar' ? 'Retirada no local' : 'Endereco de entrega'}
                            </p>
                            <p style={{ fontFamily: SANS, fontSize: '13px', color: COLORS.dark, margin: 0, lineHeight: 1.6 }}>
                              {pedido.endereco_entrega}
                              {pedido.bairro_entrega && <><br />{pedido.bairro_entrega}</>}
                              {pedido.complemento && <><br />{pedido.complemento}</>}
                            </p>
                          </div>
                        )}
                        <div style={{ background: COLORS.bg, borderRadius: 8, padding: 14 }}>
                          <p style={{
                            fontFamily: SANS, fontSize: '11px', color: COLORS.textSecondary,
                            textTransform: 'uppercase', letterSpacing: 1,
                            margin: '0 0 8px', fontWeight: 700
                          }}>
                            Pagamento
                          </p>
                          <p style={{ fontFamily: SANS, fontSize: '13px', color: COLORS.dark, margin: 0, lineHeight: 1.6 }}>
                            <strong>Status:</strong> {pedido.pagamento_status || 'pendente'}<br />
                            {pedido.desconto > 0 && <><strong>Desconto:</strong> -{formatarPreco(pedido.desconto)}<br /></>}
                            <strong>Frete:</strong> {pedido.valor_frete ? formatarPreco(pedido.valor_frete) : '---'}<br />
                            <strong>Total:</strong> {formatarPreco(pedido.total)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}