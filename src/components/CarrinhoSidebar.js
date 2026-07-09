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

    setFinalizando(true)

    try {
      const pedido_id = Date.now().toString(36) + Math.random().toString(36).substr(2, 4)

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
        cliente_telefone: '',
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
    adicionarItem({ id: item.product_id, nome: item.nome, preco: item.preco })
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
          onClick={handleFechar}
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(45,27,14,0.3)',
          }}
        />
      )}

      <div style={{
        position: 'fixed', top: 0, right: aberto ? 0 : '-400px',
        width: '380px', height: '100vh', zIndex: 9999,
        background: COLORS.white, boxShadow: '-4px 0 24px rgba(45,27,14,0.12)',
        transition: 'right 0.3s ease',
        display: 'flex', flexDirection: 'column',
        fontFamily: SANS,
      }}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid ' + COLORS.border,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: COLORS.dark, fontFamily: SERIF, fontWeight: 700 }}>
            Sacola{totalItens > 0 ? ' (' + totalItens + ')' : ''}
          </h2>
          <button
            onClick={handleFechar}
            style={{
              background: 'none', border: 'none', fontSize: '22px',
              cursor: 'pointer', color: COLORS.textSecondary, padding: '4px 8px',
            }}
          >
            x
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {itens.length === 0 ? (
            <p style={{ textAlign: 'center', color: COLORS.textSecondary, marginTop: '60px', fontSize: '14px' }}>
              Sua sacola esta vazia
            </p>
          ) : (
            itens.map((item, index) => (
              <div
                key={item.product_id || index}
                style={{
                  display: 'flex', gap: '12px', padding: '12px 0',
                  borderBottom: index < itens.length - 1 ? '1px solid ' + COLORS.border : 'none',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: COLORS.dark }}>
                    {item.nome}
                  </p>
                  <p style={{ margin: '0 0 8px', fontSize: '13px', color: COLORS.textSecondary }}>
                    {formatarPreco(item.preco)}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleDecrementar(item)}
                      style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        border: '1px solid ' + COLORS.border, background: COLORS.white,
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '14px', fontWeight: 600,
                        color: COLORS.dark,
                      }}
                    >
                      -
                    </button>
                    <span style={{
                      fontSize: '14px', fontWeight: 600, color: COLORS.dark,
                      minWidth: '20px', textAlign: 'center'
                    }}>
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() => handleIncrementar(item)}
                      style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        border: '1px solid ' + COLORS.border, background: COLORS.white,
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '14px', fontWeight: 600,
                        color: COLORS.dark,
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0', fontSize: '14px', fontWeight: 600, color: COLORS.dark }}>
                    {formatarPreco(item.preco * item.quantidade)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {itens.length > 0 && (
          <div style={{ borderTop: '1px solid ' + COLORS.border, padding: '16px 24px 20px' }}>
            {/* Frete */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  value={cep}
                  onChange={e => handleCepChange(e.target.value)}
                  placeholder="CEP para entrega"
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: '8px',
                    border: '1px solid ' + COLORS.border, fontSize: '14px',
                    fontFamily: SANS, color: COLORS.dark, outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={() => handleBuscarFrete()}
                  disabled={freteCarregando}
                  style={{
                    padding: '10px 16px', borderRadius: '8px', border: 'none',
                    background: COLORS.gold, color: COLORS.white, fontSize: '13px',
                    fontWeight: 600, cursor: 'pointer', fontFamily: SANS,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {freteCarregando ? '...' : 'Calcular'}
                </button>
              </div>

              {freteCarregando && (
                <p style={{ fontSize: '12px', color: COLORS.textSecondary, margin: '4px 0' }}>
                  Calculando frete...
                </p>
              )}

              {freteErro && (
                <p style={{
                  fontSize: '12px', color: '#c00', margin: '4px 0',
                  background: '#fff0f0', padding: '6px 10px', borderRadius: '6px',
                }}>
                  {freteErro}
                </p>
              )}

              {freteData && (
                <>
                  <p style={{ fontSize: '13px', color: COLORS.textSecondary, margin: '4px 0' }}>
                    {freteData.endereco}
                  </p>
                  {freteData.bairro && (
                    <p style={{ fontSize: '12px', color: COLORS.gold, margin: '4px 0', fontStyle: 'italic' }}>
                      Bairro: {freteData.bairro}
                    </p>
                  )}
                  <p style={{ fontSize: '14px', fontWeight: 600, color: COLORS.dark, margin: '4px 0 8px' }}>
                    Frete: {formatarPreco(freteData.valor_frete)}
                    {freteData.distancia_km && ` (${freteData.distancia_km} km)`}
                  </p>
                </>
              )}
            </div>

            {/* Cupom */}
            <div style={{ marginBottom: '16px', padding: '12px', background: COLORS.bg, borderRadius: '8px' }}>
              {!cupomData ? (
                <>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: COLORS.dark, margin: '0 0 8px' }}>
                    Cupom de desconto
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      value={cupomInput}
                      onChange={e => setCupomInput(e.target.value.toUpperCase())}
                      placeholder="Digite o codigo"
                      style={{
                        flex: 1, padding: '10px 14px', borderRadius: '8px',
                        border: '1px solid ' + COLORS.border, fontSize: '14px',
                        fontFamily: SANS, color: COLORS.dark, outline: 'none',
                        textTransform: 'uppercase', boxSizing: 'border-box',
                      }}
                    />
                    <button
                      onClick={handleAplicarCupom}
                      disabled={cupomCarregando}
                      style={{
                        padding: '10px 16px', borderRadius: '8px', border: 'none',
                        background: COLORS.dark, color: COLORS.white, fontSize: '13px',
                        fontWeight: 600, cursor: 'pointer', fontFamily: SANS,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cupomCarregando ? '...' : 'Aplicar'}
                    </button>
                  </div>
                  {cupomErro && (
                    <p style={{ fontSize: '12px', color: '#c00', margin: '6px 0 0' }}>
                      {cupomErro}
                    </p>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#2e7d32', margin: '0 0 2px' }}>
                      Cupom aplicado!
                    </p>
                    <p style={{ fontSize: '12px', color: COLORS.textSecondary, margin: 0 }}>
                      {cupomData.codigo} — {cupomData.descricao}
                    </p>
                  </div>
                  <button
                    onClick={handleRemoverCupom}
                    style={{
                      background: 'none', border: 'none', fontSize: '13px',
                      color: '#c00', cursor: 'pointer', textDecoration: 'underline',
                      padding: '4px', fontFamily: SANS,
                    }}
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>

            {/* Totais */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px', color: COLORS.textSecondary }}>Subtotal</span>
                <span style={{ fontSize: '14px', color: COLORS.dark, fontWeight: 600 }}>{formatarPreco(subtotal)}</span>
              </div>

              {freteData && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', color: COLORS.textSecondary }}>Frete</span>
                  <span style={{ fontSize: '14px', color: COLORS.dark, fontWeight: 600 }}>{formatarPreco(freteData.valor_frete)}</span>
                </div>
              )}

              {desconto > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#2e7d32' }}>Desconto ({cupomData?.codigo})</span>
                  <span style={{ fontSize: '14px', color: '#2e7d32', fontWeight: 600 }}>-{formatarPreco(desconto)}</span>
                </div>
              )}

              <div style={{
                display: 'flex', justifyContent: 'space-between',
                borderTop: '1px solid ' + COLORS.border, paddingTop: '8px', marginTop: '4px',
              }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: COLORS.dark }}>Total</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: COLORS.dark }}>{formatarPreco(total)}</span>
              </div>
            </div>

            <button
              onClick={handleFinalizar}
              disabled={finalizando}
              style={{
                width: '100%',
                background: finalizando ? '#999' : COLORS.gold,
                color: COLORS.white, border: 'none', borderRadius: '999px',
                padding: '14px', fontSize: '15px', fontWeight: 700,
                cursor: finalizando ? 'not-allowed' : 'pointer',
                fontFamily: SANS, marginBottom: '8px',
              }}
            >
              {finalizando ? 'Redirecionando...' : 'Finalizar Pedido'}
            </button>

            <button
              onClick={limparCarrinho}
              style={{
                width: '100%', background: 'transparent',
                border: '1px solid ' + COLORS.border, borderRadius: '999px',
                padding: '10px', fontSize: '13px', fontWeight: 600,
                color: COLORS.textSecondary, cursor: 'pointer', fontFamily: SANS,
              }}
            >
              Limpar sacola
            </button>
          </div>
        )}

        {toast && (
          <div style={{
            position: 'fixed', bottom: '24px', left: '50%',
            transform: 'translateX(-50%)',
            background: '#4CAF50', color: COLORS.white,
            padding: '12px 24px', borderRadius: '999px',
            fontSize: '14px', fontWeight: 600, zIndex: 99999,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}>
            {toast}
          </div>
        )}
      </div>
    </>
  )
}