'use client'
import { useState, useEffect } from 'react'
import { useCarrinho } from '../app/context/CarrinhoContext'
import { useAuth } from '../app/context/AuthContext'
import { supabase } from '@/lib/supabaseClient'

const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
const SERIF = 'Georgia, "Times New Roman", serif'

function formatarPreco(valor) {
  if (valor == null || isNaN(valor)) return 'R$ 0,00'
  return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`
}

export default function CarrinhoSidebar() {
  const { itens, aberto, setAberto, removerItem, limparCarrinho, subtotal, totalItens, adicionarItem } = useCarrinho()
  const { usuario } = useAuth()
  const [cep, setCep] = useState('')
  const [freteData, setFreteData] = useState(null)
  const [freteCarregando, setFreteCarregando] = useState(false)
  const [cupomInput, setCupomInput] = useState('')
  const [cupomData, setCupomData] = useState(null)
  const [cupomErro, setCupomErro] = useState(null)
  const [cupomCarregando, setCupomCarregando] = useState(false)
  const [finalizando, setFinalizando] = useState(false)
  const [toast, setToast] = useState(null)
  const [animatingOut, setAnimatingOut] = useState(false)

  useEffect(() => {
    if (aberto) {
      setAnimatingOut(false)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [aberto])

  useEffect(() => {
    if (!aberto) return
    const handleKey = (e) => {
      if (e.key === 'Escape') handleFechar()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [aberto])

  const desconto = cupomData?.valor || 0
  const total = subtotal + (freteData?.valor_frete || 0) - desconto
  const temFrete = freteData && freteData.valor_frete > 0

  function handleFechar() {
    setAnimatingOut(true)
    setTimeout(() => {
      setAberto(false)
      setAnimatingOut(false)
    }, 300)
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) handleFechar()
  }

  async function handleCalcularFrete() {
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) {
      setToast('Digite um CEP valido com 8 digitos')
      return
    }
    setFreteCarregando(true)
    setFreteData(null)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await res.json()
      if (data.erro) {
        setToast('CEP nao encontrado')
      } else {
        const valorFrete = 15
        setFreteData({
          cep: cepLimpo,
          endereco: `${data.logradouro || ''}, ${data.bairro || ''} - ${data.localidade}/${data.uf}`,
          valor_frete: valorFrete,
          prazo: '5-10 dias uteis'
        })
        setToast('Frete calculado: R$ 15,00')
      }
    } catch {
      setToast('Erro ao consultar CEP')
    }
    setFreteCarregando(false)
  }

  async function handleAplicarCupom() {
    const codigo = cupomInput.trim()
    if (!codigo) {
      setCupomErro('Digite o codigo do cupom')
      return
    }
    setCupomCarregando(true)
    setCupomErro(null)
    setCupomData(null)
    try {
      const res = await fetch('/api/cupom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo }),
      })
      const result = await res.json()
      if (result.success) {
        setCupomData(result.data)
        setCupomErro(null)
      } else {
        setCupomErro(result.erro || 'Cupom invalido')
      }
    } catch {
      setCupomErro('Erro ao validar cupom')
    }
    setCupomCarregando(false)
  }

  function handleRemoverCupom() {
    setCupomData(null)
    setCupomErro(null)
    setCupomInput('')
  }

  async function handleFinalizar() {
    if (!usuario) {
      setToast('Faca login para finalizar o pedido')
      return
    }
    if (itens.length === 0) {
      setToast('Sua sacola esta vazia')
      return
    }

    setFinalizando(true)
    try {
      const orderPayload = {
        user_id: usuario.id,
        nome_cliente: usuario?.user_metadata?.full_name || usuario?.email?.split('@')[0] || '',
        email_cliente: usuario?.email || '',
        telefone_cliente: usuario?.user_metadata?.phone || '',
        itens: itens.map(i => ({
          product_id: i.product_id,
          nome: i.nome,
          descricao: i.descricao || '',
          quantidade: i.quantidade,
          preco: i.preco,
        })),
        subtotal,
        cupom_aplicado: cupomData ? { codigo: cupomData.codigo } : null,
        desconto,
        total: subtotal + (freteData?.valor_frete || 0) - desconto,
        forma_entrega: freteData ? 'entrega' : 'retirada',
        endereco_entrega: freteData?.endereco || '',
        valor_frete: freteData?.valor_frete || 0,
      }

      const saveRes = await fetch('/api/pedido/salvar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })
      const saveResult = await saveRes.json()

      if (!saveResult.success) {
        setToast(saveResult.erro || 'Erro ao salvar pedido')
        setFinalizando(false)
        return
      }

      const pedido_id = saveResult.data.pedido_id

      const payload = {
        itens: itens.map(i => ({
          id: i.product_id,
          nome: i.nome,
          descricao: i.descricao || '',
          quantidade: i.quantidade,
          preco: i.preco,
        })),
        cliente_nome: usuario?.user_metadata?.full_name || usuario?.email?.split('@')[0] || '',
        cliente_email: usuario?.email || '',
        cliente_telefone: usuario?.user_metadata?.phone || '',
        endereco_entrega: freteData?.endereco || '',
        valor_frete: freteData?.valor_frete || 0,
        cupom: cupomData ? { codigo: cupomData.codigo, tipo: cupomData.tipo, valor: cupomData.valor } : null,
        pedido_id,
      }

      const res = await fetch('/api/pagar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()

      if (result && result.success && result.data && result.data.init_point) {
        window.location.href = result.data.init_point
      } else {
        setToast((result && result.erro) || 'Erro ao iniciar pagamento')
        setFinalizando(false)
      }
    } catch {
      setToast('Erro ao iniciar pagamento')
      setFinalizando(false)
    }
  }

  const sidebarAberto = aberto || animatingOut

  return (
    <>
      {/* Overlay */}
      {sidebarAberto && (
        <div
          onClick={handleOverlayClick}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            background: 'rgba(45, 27, 14, 0.4)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            opacity: animatingOut ? 0 : 1,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            background: 'var(--color-brand-dark)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: 999,
            fontFamily: SANS,
            fontSize: 14,
            fontWeight: 500,
            boxShadow: '0 8px 24px rgba(45, 27, 14, 0.3)',
            animation: 'fadeInUp 0.3s ease forwards',
            whiteSpace: 'nowrap',
          }}
          onClick={() => setToast(null)}
        >
          {toast}
        </div>
      )}

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: sidebarAberto ? 0 : '-100%',
          width: 420,
          maxWidth: '100vw',
          height: '100vh',
          zIndex: 9999,
          background: 'white',
          boxShadow: animatingOut
            ? '-4px 0 24px rgba(45, 27, 14, 0.08)'
            : '-4px 0 24px rgba(45, 27, 14, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'right 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily: SANS,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-brand-border-light)',
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--color-brand-dark)',
              fontFamily: SERIF,
              letterSpacing: '0.2px',
            }}
          >
            Sacola{totalItens > 0 ? ` (${totalItens})` : ''}
          </h2>
          <button
            onClick={handleFechar}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              borderRadius: 8,
              color: 'var(--color-brand-text-secondary)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--color-brand-bg-soft)'
              e.currentTarget.style.color = 'var(--color-brand-dark)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--color-brand-text-secondary)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 24px',
          }}
        >
          {itens.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 0',
                color: 'var(--color-brand-text-secondary)',
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-border)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <p style={{ marginTop: 16, fontFamily: SERIF, fontSize: 18, color: 'var(--color-brand-text)', fontWeight: 600 }}>
                Sua sacola esta vazia
              </p>
              <p style={{ marginTop: 4, fontSize: 14, color: 'var(--color-brand-text-secondary)' }}>
                Adicione produtos do cardapio
              </p>
            </div>
          ) : (
            <>
              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {itens.map((item, index) => (
                  <div
                    key={item.product_id || index}
                    style={{
                      display: 'flex',
                      gap: 12,
                      padding: '12px 0',
                      borderBottom: index < itens.length - 1 ? '1px solid var(--color-brand-border-light)' : 'none',
                      animation: 'fadeIn 0.3s ease forwards',
                    }}
                  >
                    {/* Qty control */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        minWidth: 36,
                      }}
                    >
                      <button
                        onClick={() => adicionarItem(item)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          border: '1px solid var(--color-brand-border)',
                          background: 'transparent',
                          color: 'var(--color-brand-text)',
                          fontSize: 16,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          lineHeight: 1,
                          transition: 'all 0.2s',
                          padding: 0,
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'var(--color-brand-gold)'
                          e.currentTarget.style.color = 'var(--color-brand-gold)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'var(--color-brand-border)'
                          e.currentTarget.style.color = 'var(--color-brand-text)'
                        }}
                      >
                        +
                      </button>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-brand-dark)' }}>
                        {item.quantidade}
                      </span>
                      <button
                        onClick={() => removerItem(item.product_id)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          border: '1px solid var(--color-brand-border)',
                          background: 'transparent',
                          color: 'var(--color-brand-text)',
                          fontSize: 16,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          lineHeight: 1,
                          transition: 'all 0.2s',
                          padding: 0,
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = '#EF4444'
                          e.currentTarget.style.color = '#EF4444'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'var(--color-brand-border)'
                          e.currentTarget.style.color = 'var(--color-brand-text)'
                        }}
                      >
                        -
                      </button>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--color-brand-dark)' }}>
                          {item.nome}
                        </p>
                        {item.descricao && (
                          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-brand-text-secondary)' }}>
                            {item.descricao}
                          </p>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--color-brand-gold)', whiteSpace: 'nowrap' }}>
                        {formatarPreco(item.preco * item.quantidade)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CEP */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 600, color: 'var(--color-brand-dark)' }}>
                  Calcular frete
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="00000-000"
                    value={cep}
                    onChange={e => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      fontSize: '14px',
                      border: '1px solid var(--color-brand-border)',
                      borderRadius: '10px',
                      background: 'white',
                      color: 'var(--color-brand-text)',
                      outline: 'none',
                      fontFamily: SANS,
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'var(--color-brand-gold)'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196, 151, 90, 0.15)'
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'var(--color-brand-border)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                  <button
                    onClick={handleCalcularFrete}
                    disabled={freteCarregando}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 999,
                      border: '1px solid var(--color-brand-gold)',
                      background: freteCarregando ? 'var(--color-brand-bg-soft)' : 'transparent',
                      color: 'var(--color-brand-gold)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: freteCarregando ? 'not-allowed' : 'pointer',
                      fontFamily: SANS,
                      transition: 'all 0.25s ease',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => {
                      if (!freteCarregando) {
                        e.currentTarget.style.background = 'var(--color-brand-gold)'
                        e.currentTarget.style.color = 'white'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!freteCarregando) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = 'var(--color-brand-gold)'
                      }
                    }}
                  >
                    {freteCarregando ? '...' : 'Calcular'}
                  </button>
                </div>
                {freteData && (
                  <div style={{
                    marginTop: 8,
                    padding: '10px 12px',
                    background: 'var(--color-brand-bg)',
                    borderRadius: 8,
                    fontSize: 13,
                    color: 'var(--color-brand-text)',
                    animation: 'fadeIn 0.2s ease',
                  }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>Frete: R$ 15,00</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-brand-text-secondary)' }}>
                      {freteData.endereco} — {freteData.prazo}
                    </p>
                  </div>
                )}
              </div>

              {/* Cupom */}
              {!cupomData ? (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 600, color: 'var(--color-brand-dark)' }}>
                    Cupom de desconto
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Digite o codigo"
                      value={cupomInput}
                      onChange={e => setCupomInput(e.target.value.toUpperCase())}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        fontSize: '14px',
                        border: '1px solid var(--color-brand-border)',
                        borderRadius: '10px',
                        background: 'white',
                        color: 'var(--color-brand-text)',
                        outline: 'none',
                        fontFamily: SANS,
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = 'var(--color-brand-gold)'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196, 151, 90, 0.15)'
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = 'var(--color-brand-border)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                    <button
                      onClick={handleAplicarCupom}
                      disabled={cupomCarregando}
                      style={{
                        padding: '10px 18px',
                        borderRadius: 999,
                        border: '1px solid var(--color-brand-gold)',
                        background: cupomCarregando ? 'var(--color-brand-bg-soft)' : 'transparent',
                        color: 'var(--color-brand-gold)',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: cupomCarregando ? 'not-allowed' : 'pointer',
                        fontFamily: SANS,
                        transition: 'all 0.25s ease',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={e => {
                        if (!cupomCarregando) {
                          e.currentTarget.style.background = 'var(--color-brand-gold)'
                          e.currentTarget.style.color = 'white'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!cupomCarregando) {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = 'var(--color-brand-gold)'
                        }
                      }}
                    >
                      {cupomCarregando ? '...' : 'Aplicar'}
                    </button>
                  </div>
                  {cupomErro && (
                    <p style={{
                      margin: '6px 0 0',
                      fontSize: '12px',
                      color: '#EF4444',
                      background: '#FEF2F2',
                      padding: '6px 10px',
                      borderRadius: 6,
                    }}>
                      {cupomErro}
                    </p>
                  )}
                </div>
              ) : (
                <div style={{
                  marginBottom: 16,
                  padding: '12px 14px',
                  background: '#F0FDF4',
                  borderRadius: 10,
                  border: '1px solid #BBF7D0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#166534' }}>
                      Cupom {cupomData.codigo}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#15803D' }}>
                      Desconto de {cupomData.tipo === 'percentual' ? `${cupomData.valor}%` : formatarPreco(cupomData.valor)}
                    </p>
                  </div>
                  <button
                    onClick={handleRemoverCupom}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#DC2626',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: SANS,
                      padding: '4px 8px',
                      borderRadius: 6,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    Remover
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {itens.length > 0 && (
          <div
            style={{
              borderTop: '1px solid var(--color-brand-border-light)',
              padding: '16px 24px',
              flexShrink: 0,
              background: 'var(--color-brand-bg)',
            }}
          >
            {/* Resumo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-brand-text-secondary)' }}>
                <span>Subtotal</span>
                <span>{formatarPreco(subtotal)}</span>
              </div>
              {temFrete && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-brand-text-secondary)' }}>
                  <span>Frete</span>
                  <span>{formatarPreco(freteData.valor_frete)}</span>
                </div>
              )}
              {desconto > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#16A34A' }}>
                  <span>Desconto</span>
                  <span>-{formatarPreco(desconto)}</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--color-brand-dark)',
                paddingTop: 8,
                borderTop: '2px solid var(--color-brand-border)',
                fontFamily: SERIF,
              }}>
                <span>Total</span>
                <span>{formatarPreco(total)}</span>
              </div>
            </div>

            {/* Botoes */}
            <button
              onClick={handleFinalizar}
              disabled={finalizando}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 999,
                border: 'none',
                background: 'var(--color-brand-gold)',
                color: 'white',
                fontSize: '15px',
                fontWeight: 700,
                cursor: finalizando ? 'not-allowed' : 'pointer',
                fontFamily: SANS,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                opacity: finalizando ? 0.7 : 1,
                marginBottom: '10px',
                transition: 'all 0.25s ease',
                boxShadow: finalizando ? 'none' : '0 2px 8px rgba(196, 151, 90, 0.3)',
              }}
              onMouseEnter={e => {
                if (!finalizando) {
                  e.currentTarget.style.background = 'var(--color-brand-gold-dark, #A67B3E)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(196, 151, 90, 0.4)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={e => {
                if (!finalizando) {
                  e.currentTarget.style.background = 'var(--color-brand-gold)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(196, 151, 90, 0.3)'
                  e.currentTarget.style.transform = 'none'
                }
              }}
            >
              {finalizando ? 'Redirecionando...' : 'Finalizar Pedido'}
            </button>

            <button
              onClick={limparCarrinho}
              disabled={finalizando}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 999,
                border: '1px solid var(--color-brand-border)',
                background: 'transparent',
                color: 'var(--color-brand-text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: finalizando ? 'not-allowed' : 'pointer',
                fontFamily: SANS,
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => {
                if (!finalizando) {
                  e.currentTarget.style.borderColor = '#EF4444'
                  e.currentTarget.style.color = '#EF4444'
                }
              }}
              onMouseLeave={e => {
                if (!finalizando) {
                  e.currentTarget.style.borderColor = 'var(--color-brand-border)'
                  e.currentTarget.style.color = 'var(--color-brand-text-secondary)'
                }
              }}
            >
              Limpar Carrinho
            </button>
          </div>
        )}
      </div>
    </>
  )
}