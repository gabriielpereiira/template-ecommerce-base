'use client'
import { useState, useEffect } from 'react'
import { useCarrinho } from '../app/context/CarrinhoContext'
import { useAuth } from '../app/context/AuthContext'
import { supabase } from '@/lib/supabaseClient'

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

export default function CarrinhoSidebar() {
  const { itens, aberto, setAberto, removerItem, limparCarrinho, subtotal, totalItens, adicionarItem } = useCarrinho()
  const { usuario } = useAuth()
  const [cep, setCep] = useState('')
  const [freteData, setFreteData] = useState(null)
  const [freteCarregando, setFreteCarregando] = useState(false)
  const [freteErro, setFreteErro] = useState(null)
  const [cupomInput, setCupomInput] = useState('')
  const [cupomData, setCupomData] = useState(null)
  const [cupomCarregando, setCupomCarregando] = useState(false)
  const [cupomErro, setCupomErro] = useState(null)
  const [finalizando, setFinalizando] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let active = true
    async function carregarCepSalvo() {
      if (aberto && usuario) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('cep')
            .eq('id', usuario.id)
            .single()
          if (!active) return
          if (profile && profile.cep) {
            const digits = String(profile.cep).replace(/\D/g, '').slice(0, 8)
            setCep(formatarCep(digits))
            setFreteData(null)
            setFreteErro(null)
            handleBuscarFrete(digits)
          }
        } catch (e) {}
      }
    }
    carregarCepSalvo()
    return () => { active = false }
  }, [aberto, usuario])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  function formatarCep(digits) {
    const d = String(digits).replace(/\D/g, '').slice(0, 8)
    if (d.length <= 5) return d
    return d.slice(0, 5) + '-' + d.slice(5)
  }

  function handleFechar() {
    setAberto(false)
  }

  function handleCepChange(value) {
    const digits = String(value).replace(/\D/g, '').slice(0, 8)
    setCep(formatarCep(digits))
    setFreteData(null)
    setFreteErro(null)
  }

  async function handleBuscarFrete(cepParam) {
    const cleanCep = String(cepParam !== undefined ? cepParam : cep).replace(/\D/g, '')
    if (cleanCep.length < 8) {
      setFreteErro('CEP invalido')
      setFreteData(null)
      return
    }
    setFreteCarregando(true)
    setFreteErro(null)
    try {
      const res = await fetch('/api/frete?cep=' + cleanCep)
      const json = await res.json()
      if (res.ok && json && json.data) {
        setFreteData(json.data)
      } else {
        setFreteErro((json && json.erro) || 'Erro ao calcular frete')
        setFreteData(null)
      }
    } catch (e) {
      setFreteErro('Erro ao calcular frete')
      setFreteData(null)
    } finally {
      setFreteCarregando(false)
    }
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
      const json = await res.json()
      if (res.ok && json.success && json.data) {
        setCupomData(json.data)
        setCupomInput('')
      } else {
        setCupomErro(json?.erro || 'Cupom invalido')
      }
    } catch (e) {
      setCupomErro('Erro ao validar cupom')
    } finally {
      setCupomCarregando(false)
    }
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
      // 1. Salva o pedido no Supabase
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

      // 2. Cria pagamento no Mercado Pago
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
    } catch (e) {
      setToast('Erro ao iniciar pagamento')
      setFinalizando(false)
    }
  }

  function handleIncrementar(item) {
    adicionarItem({
      product_id: item.product_id,
      nome: item.nome,
      preco: item.preco,
      descricao: item.descricao || '',
      imagem_url: item.imagem_url || ''
    })
  }

  function handleDecrementar(item) {
    removerItem(item.product_id)
  }

  function formatarPreco(valor) {
    return 'R$ ' + Number(valor || 0).toFixed(2)
  }

  const desconto = cupomData
    ? cupomData.tipo === 'percentual'
      ? subtotal * (cupomData.valor / 100)
      : cupomData.valor
    : 0

  const total = subtotal + (freteData?.valor_frete || 0) - desconto

  return (
    <>
      {aberto && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 9998,
          }}
          onClick={handleFechar}
        />
      )}

      <div
        style={{
          position: 'fixed',
          top: 0,
          right: aberto ? 0 : '-400px',
          width: '380px',
          maxWidth: '100vw',
          height: '100vh',
          background: COLORS.white,
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          transition: 'right 0.35s ease',
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
            borderBottom: '1px solid ' + COLORS.border,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 700,
              color: COLORS.dark,
              fontFamily: SERIF,
            }}
          >
            Sacola{totalItens > 0 ? ' (' + totalItens + ')' : ''}
          </h2>
          <button
            onClick={handleFechar}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: COLORS.textSecondary,
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            x
          </button>
        </div>

        {/* Itens */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {itens.length === 0 ? (
            <p
              style={{
                textAlign: 'center',
                color: COLORS.textSecondary,
                fontSize: '14px',
                marginTop: '40px',
              }}
            >
              Sua sacola esta vazia
            </p>
          ) : (
            itens.map((item, index) => (
              <div
                key={item.product_id || index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: index < itens.length - 1 ? '1px solid ' + COLORS.border : 'none',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: '0 0 4px 0',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: COLORS.dark,
                    }}
                  >
                    {item.nome}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: COLORS.textSecondary }}>
                    {formatarPreco(item.preco)}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
                  <button
                    onClick={() => handleDecrementar(item)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: '1px solid ' + COLORS.border,
                      background: COLORS.white,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: COLORS.dark,
                    }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>
                    {item.quantidade}
                  </span>
                  <button
                    onClick={() => handleIncrementar(item)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: '1px solid ' + COLORS.border,
                      background: COLORS.white,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: COLORS.dark,
                    }}
                  >
                    +
                  </button>
                </div>

                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: COLORS.gold,
                    marginLeft: '12px',
                    minWidth: '70px',
                    textAlign: 'right',
                  }}
                >
                  {formatarPreco(item.preco * item.quantidade)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer com totais e acoes */}
        {itens.length > 0 && (
          <div
            style={{
              borderTop: '1px solid ' + COLORS.border,
              padding: '20px 24px',
            }}
          >
            {/* Frete */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  placeholder="CEP para entrega"
                  maxLength={9}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid ' + COLORS.border,
                    fontSize: '14px',
                    fontFamily: SANS,
                    color: COLORS.dark,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={() => handleBuscarFrete()}
                  disabled={freteCarregando}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: COLORS.gold,
                    color: COLORS.white,
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: SANS,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {freteCarregando ? '...' : 'Calcular'}
                </button>
              </div>
              {freteCarregando && (
                <p style={{ margin: '4px 0', fontSize: '12px', color: COLORS.textSecondary }}>
                  Calculando frete...
                </p>
              )}
              {freteErro && (
                <p style={{ margin: '4px 0', fontSize: '12px', color: '#D32F2F' }}>{freteErro}</p>
              )}
              {freteData && (
                <div style={{ padding: '8px 12px', background: COLORS.bg, borderRadius: '8px', marginTop: '4px' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: COLORS.dark }}>{freteData.endereco}</p>
                  {freteData.bairro && (
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: COLORS.textSecondary }}>
                      Bairro: {freteData.bairro}
                    </p>
                  )}
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', fontWeight: 600, color: COLORS.gold }}>
                    Frete: {formatarPreco(freteData.valor_frete)}
                    {freteData.distancia_km && ` (${freteData.distancia_km} km)`}
                  </p>
                </div>
              )}
            </div>

            {/* Cupom */}
            {!cupomData ? (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 600, color: COLORS.dark }}>
                  Cupom de desconto
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={cupomInput}
                    onChange={(e) => setCupomInput(e.target.value.toUpperCase())}
                    placeholder="Digite o codigo"
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid ' + COLORS.border,
                      fontSize: '14px',
                      fontFamily: SANS,
                      color: COLORS.dark,
                      outline: 'none',
                      textTransform: 'uppercase',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    onClick={handleAplicarCupom}
                    disabled={cupomCarregando}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: COLORS.gold,
                      color: COLORS.white,
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: SANS,
                    }}
                  >
                    {cupomCarregando ? '...' : 'Aplicar'}
                  </button>
                </div>
                {cupomErro && (
                  <p style={{ margin: '4px 0', fontSize: '12px', color: '#D32F2F' }}>{cupomErro}</p>
                )}
              </div>
            ) : (
              <div
                style={{
                  padding: '10px 14px',
                  background: '#E8F5E9',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#2E7D32' }}>
                    Cupom aplicado!
                  </p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#4CAF50' }}>
                    {cupomData.codigo} &mdash; {cupomData.descricao}
                  </p>
                </div>
                <button
                  onClick={handleRemoverCupom}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '12px',
                    color: '#D32F2F',
                    cursor: 'pointer',
                    fontWeight: 600,
                    textDecoration: 'underline',
                  }}
                >
                  Remover
                </button>
              </div>
            )}

            {/* Totais */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '4px 0',
                  fontSize: '14px',
                  color: COLORS.textSecondary,
                }}
              >
                <span>Subtotal</span>
                <span>{formatarPreco(subtotal)}</span>
              </div>
              {freteData && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '4px 0',
                    fontSize: '14px',
                    color: COLORS.textSecondary,
                  }}
                >
                  <span>Frete</span>
                  <span>{formatarPreco(freteData.valor_frete)}</span>
                </div>
              )}
              {desconto > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '4px 0',
                    fontSize: '14px',
                    color: '#2E7D32',
                  }}
                >
                  <span>Desconto ({cupomData?.codigo})</span>
                  <span>-{formatarPreco(desconto)}</span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0 0 0',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: COLORS.dark,
                  borderTop: '2px solid ' + COLORS.border,
                  marginTop: '4px',
                }}
              >
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
                borderRadius: '999px',
                border: 'none',
                background: COLORS.gold,
                color: COLORS.white,
                fontSize: '15px',
                fontWeight: 700,
                cursor: finalizando ? 'not-allowed' : 'pointer',
                fontFamily: SANS,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                opacity: finalizando ? 0.7 : 1,
                marginBottom: '10px',
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
                borderRadius: '999px',
                border: '1px solid ' + COLORS.border,
                background: 'transparent',
                color: COLORS.textSecondary,
                fontSize: '13px',
                fontWeight: 600,
                cursor: finalizando ? 'not-allowed' : 'pointer',
                fontFamily: SANS,
              }}
            >
              Limpar sacola
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: COLORS.dark,
            color: COLORS.textOnDark,
            padding: '14px 28px',
            borderRadius: '999px',
            border: '1px solid ' + COLORS.gold,
            fontSize: '14px',
            fontWeight: 600,
            zIndex: 10000,
            boxShadow: '0 8px 24px rgba(45,27,14,0.25)',
            whiteSpace: 'nowrap',
          }}
        >
          {toast}
        </div>
      )}
    </>
  )
}