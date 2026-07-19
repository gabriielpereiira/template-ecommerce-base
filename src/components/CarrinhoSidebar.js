'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCarrinho } from '../app/context/CarrinhoContext'
import { useAuth } from '../app/context/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { storeConfig } from '@/config/store'
import { theme } from '@/theme'

const COLORS = theme.colors
const SERIF = theme.fonts.serif
const SANS = theme.fonts.sans

function formatarPreco(valor) {
  if (valor == null) return 'R$ 0,00'
  return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`
}

export default function CarrinhoSidebar() {
  const router = useRouter()
  const { itens, removerItem, atualizarQuantidade, limparCarrinho } = useCarrinho()
  const { usuario } = useAuth()
  const [aberto, setAberto] = useState(false)
  const [cep, setCep] = useState('')
  const [freteData, setFreteData] = useState(null)
  const [calculandoFrete, setCalculandoFrete] = useState(false)
  const [finalizando, setFinalizando] = useState(false)
  const [cupom, setCupom] = useState('')
  const [cupomData, setCupomData] = useState(null)
  const [aplicandoCupom, setAplicandoCupom] = useState(false)
  const [erroCupom, setErroCupom] = useState('')
  const [toast, setToast] = useState(null)

  const total = itens.reduce((acc, item) => acc + (item.preco || 0) * (item.quantidade || 1), 0)
  const desconto = cupomData
    ? cupomData.tipo === 'percentual'
      ? total * (cupomData.valor / 100)
      : cupomData.valor
    : 0
  const totalComDesconto = Math.max(0, total - desconto)
  const totalFinal = freteData ? totalComDesconto + freteData.valor_frete : totalComDesconto

  useEffect(() => {
    const savedCep = localStorage.getItem('deliveryCep')
    if (savedCep) setCep(savedCep)
  }, [])

  const calcularFrete = useCallback(async () => {
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return
    setCalculandoFrete(true)
    try {
      const res = await fetch('/api/calcular-frete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep: cepLimpo, total: total })
      })
      const data = await res.json()
      if (data.valor_frete !== undefined) {
        setFreteData(data)
        localStorage.setItem('deliveryCep', cep)
      } else {
        setToast('CEP nao atendido pela regiao de entrega.')
      }
    } catch {
      setToast('Erro ao calcular frete.')
    } finally {
      setCalculandoFrete(false)
    }
  }, [cep, total])

  async function aplicarCupom() {
    if (!cupom.trim()) return
    setAplicandoCupom(true)
    setErroCupom('')
    try {
      const res = await fetch('/api/validar-cupom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: cupom, total: total })
      })
      const data = await res.json()
      if (data.valido) {
        setCupomData(data)
        setToast(`Cupom aplicado! ${data.tipo === 'percentual' ? `${data.valor}% off` : `R$ ${data.valor.toFixed(2).replace('.', ',')} off`}`)
      } else {
        setErroCupom(data.erro || 'Cupom invalido.')
      }
    } catch {
      setErroCupom('Erro ao validar cupom.')
    } finally {
      setAplicandoCupom(false)
    }
  }

  async function handleFinalizar() {
    if (itens.length === 0) return
    if (!usuario) {
      router.push('/login')
      return
    }
    setFinalizando(true)
    try {
      const itensFormatados = itens.map(item => ({
        product_id: item.product_id,
        nome: item.nome,
        preco: item.preco,
        quantidade: item.quantidade || 1,
        imagem_url: item.imagem_url || null
      }))
      const { data, error } = await supabase
        .from('pedidos')
        .insert({
          cliente_nome: usuario.user_metadata?.nome || usuario.email,
          email_cliente: usuario.email,
          itens: itensFormatados,
          subtotal: total,
          valor_frete: freteData?.valor_frete || 0,
          desconto: desconto,
          total: totalFinal,
          forma_entrega: freteData ? 'entrega' : 'retirar',
          status: 'pendente',
          cupom_aplicado: cupomData ? { codigo: cupom, ...cupomData } : null
        })
        .select()
        .single()
      if (error) throw error
      limparCarrinho()
      setAberto(false)
      router.push(`/pedido/sucesso?pedidoId=${data.id}`)
    } catch (err) {
      setToast('Erro ao finalizar pedido. Tente novamente.')
    } finally {
      setFinalizando(false)
    }
  }

  return (
    <>
      {/* Botao flutuante */}
      <button
        onClick={() => setAberto(true)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          width: 60, height: 60, borderRadius: '50%',
          background: theme.gradients.coral, border: 'none',
          color: COLORS.white, cursor: 'pointer',
          boxShadow: theme.shadows.button,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        {itens.length > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            background: COLORS.white, color: COLORS.coral,
            fontSize: 11, fontWeight: 700, minWidth: 20, height: 20,
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center'
          }}>
            {itens.reduce((a, i) => a + (i.quantidade || 1), 0)}
          </span>
        )}
      </button>

      {/* Overlay */}
      {aberto && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(45,52,54,0.4)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)'
        }} onClick={() => setAberto(false)} />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'fixed', top: 0, right: aberto ? 0 : '-100%',
        width: '420px', maxWidth: '100vw', height: '100vh',
        background: COLORS.white, zIndex: 9999,
        boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column',
        transition: 'right 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        {/* Header da sidebar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid ' + COLORS.border
        }}>
          <h2 style={{ fontFamily: SERIF, fontSize: '20px', color: COLORS.dark, fontWeight: 700, margin: 0 }}>
            Sacola
          </h2>
          <button onClick={() => setAberto(false)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
color: COLORS.textSecondary, fontSize: '24px', padding: '4px'          }}>
            &times;
          </button>
        </div>

        {/* Itens */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {itens.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: COLORS.textSecondary }}>
              <p style={{ margin: 0, fontSize: '15px', fontFamily: SANS }}>Sua sacola esta vazia.</p>
            </div>
          ) : (
            itens.map((item, index) => (
              <div key={index} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', borderBottom: '1px solid ' + COLORS.border
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: COLORS.dark, fontFamily: SANS }}>
                    {item.quantidade}x {item.nome}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: COLORS.coral, fontWeight: 600, fontFamily: SANS }}>
                    {formatarPreco(item.preco * item.quantidade)}
                  </p>
                </div>
                <button
                  onClick={() => removerItem(item.product_id)}
                  style={{
                    background: 'none', border: 'none', color: COLORS.textSecondary,
                    cursor: 'pointer', padding: '4px', fontSize: '18px', lineHeight: 1
                  }}
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer da sidebar */}
        {itens.length > 0 && (
          <div style={{ padding: '24px', borderTop: '1px solid ' + COLORS.border }}>
            {/* CEP */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '12px', color: COLORS.textSecondary, fontWeight: 600, marginBottom: 6, fontFamily: SANS }}>
                Calcular frete (opcional)
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={cep}
                  onChange={e => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="00000-000"
                  className="input"
                  style={{ flex: 1 }}
                />
                <button
                  onClick={calcularFrete}
                  disabled={calculandoFrete || cep.replace(/\D/g, '').length !== 8}
                  style={{
                    padding: '10px 16px', borderRadius: 999,
                    border: 'none', background: COLORS.coral,
                    color: COLORS.white, fontSize: '13px', fontWeight: 600,
                    fontFamily: SANS, cursor: 'pointer',
                    opacity: cep.replace(/\D/g, '').length !== 8 ? 0.5 : 1
                  }}
                >
                  {calculandoFrete ? '...' : 'Calcular'}
                </button>
              </div>
            </div>

            {/* Cupom */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '12px', color: COLORS.textSecondary, fontWeight: 600, marginBottom: 6, fontFamily: SANS }}>
                Cupom de desconto
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={cupom}
                  onChange={e => { setCupom(e.target.value.toUpperCase()); setErroCupom('') }}
                  placeholder="CUPOM10"
                  className="input"
                  style={{ flex: 1, textTransform: 'uppercase' }}
                />
                <button
                  onClick={aplicarCupom}
                  disabled={aplicandoCupom || !cupom.trim()}
                  style={{
                    padding: '10px 16px', borderRadius: 999,
                    border: '1.5px solid ' + COLORS.coral,
                    background: cupomData ? '#D1FAE5' : 'transparent',
                    color: cupomData ? '#047857' : COLORS.coral,
                    fontSize: '13px', fontWeight: 600, fontFamily: SANS,
                    cursor: 'pointer', opacity: !cupom.trim() ? 0.5 : 1,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {aplicandoCupom ? '...' : cupomData ? 'Aplicado' : 'Aplicar'}
                </button>
              </div>
              {erroCupom && (
                <p style={{ fontSize: '12px', color: COLORS.danger, margin: '4px 0 0', fontFamily: SANS }}>
                  {erroCupom}
                </p>
              )}
            </div>

            {/* Resumo */}
            <div style={{ marginBottom: 16, fontFamily: SANS }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px', color: COLORS.textSecondary }}>
                <span>Subtotal</span><span>{formatarPreco(total)}</span>
              </div>
              {freteData && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px', color: COLORS.textSecondary }}>
                  <span>Frete</span><span>{formatarPreco(freteData.valor_frete)}</span>
                </div>
              )}
              {desconto > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px', color: '#2E7D32' }}>
                  <span>Desconto ({cupomData?.codigo})</span><span>-{formatarPreco(desconto)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', fontSize: '16px', fontWeight: 700, color: COLORS.dark, borderTop: '2px solid ' + COLORS.border, marginTop: '4px' }}>
                <span>Total</span><span>{formatarPreco(totalFinal)}</span>
              </div>
            </div>

            {/* Botao finalizar */}
            <button
              onClick={handleFinalizar}
              disabled={finalizando || !freteData}
              className={`btn btn-primary${finalizando ? ' btn-loading' : ''}`}
              style={{ width: '100%' }}
            >
              {finalizando ? 'Finalizando...' : 'Finalizar pedido'}
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          zIndex: 10000, background: COLORS.dark, color: COLORS.white,
          padding: '12px 24px', borderRadius: 999, fontSize: '14px', fontFamily: SANS,
          boxShadow: theme.shadows.toast
        }}>
          {toast}
        </div>
      )}
    </>
  )
}