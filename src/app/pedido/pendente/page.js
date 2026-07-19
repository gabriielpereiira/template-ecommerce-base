'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import HeaderUnificado from '@/components/HeaderUnificado'
import { theme } from '@/theme'

const COLORS = theme.colors
const SERIF = theme.fonts.serif
const SANS = theme.fonts.sans

function PedidoPendenteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pedidoId = searchParams.get('pedidoId')

  useEffect(() => {
    async function verificarPagamento() {
      if (!pedidoId) return
      const { data } = await supabase
        .from('pedidos')
        .select('status, pagamento_status')
        .eq('id', pedidoId)
        .single()

      if (data && (data.status === 'confirmado' || data.pagamento_status === 'approved')) {
        router.push(`/pedido/sucesso?pedidoId=${pedidoId}`)
      }
    }

    const interval = setInterval(verificarPagamento, 5000)
    return () => clearInterval(interval)
  }, [pedidoId, router])

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: SANS }}>
      <HeaderUnificado variante="simples" />
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{
          background: COLORS.white, borderRadius: 16, padding: '48px 32px',
          border: '1px solid ' + COLORS.border
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: '#FEF3C7', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>

          <h1 style={{ fontFamily: SERIF, fontSize: '26px', color: COLORS.dark, fontWeight: 700, margin: '0 0 8px 0' }}>
            Aguardando pagamento
          </h1>
          <p style={{ fontSize: '14px', color: COLORS.textSecondary, margin: '0 0 8px 0', lineHeight: 1.6 }}>
            Seu pedido foi registrado e estamos aguardando a confirmacao do pagamento.
          </p>
          {pedidoId && (
            <p style={{ fontSize: '13px', color: COLORS.textLight, margin: '0 0 32px 0' }}>
              Pedido: <strong style={{ color: COLORS.dark }}>#{pedidoId.slice(0, 8).toUpperCase()}</strong>
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link href="/pedidos" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Acompanhar pedido
            </Link>
            <Link href="/cardapio" style={{
              padding: '12px 28px', borderRadius: 999,
              border: '1.5px solid ' + COLORS.border,
              color: COLORS.dark, fontSize: '14px', fontWeight: 600,
              fontFamily: SANS, textDecoration: 'none',
              display: 'inline-block'
            }}>
              Voltar ao cardapio
            </Link>
          </div>

          <p style={{ fontSize: '12px', color: COLORS.textLight, marginTop: 24 }}>
            Esta pagina atualiza automaticamente quando o pagamento for confirmado.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PedidoPendentePage() {
  return <PedidoPendenteContent />
}