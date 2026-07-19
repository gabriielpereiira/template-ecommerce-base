'use client'
import Link from 'next/link'
import HeaderUnificado from '@/components/HeaderUnificado'
import { theme } from '@/theme'

const COLORS = theme.colors
const SERIF = theme.fonts.serif
const SANS = theme.fonts.sans

export default function PedidoFracassoPage() {
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
            background: '#FEE2E2', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>

          <h1 style={{ fontFamily: SERIF, fontSize: '26px', color: COLORS.dark, fontWeight: 700, margin: '0 0 8px 0' }}>
            Pagamento nao confirmado
          </h1>
          <p style={{ fontSize: '14px', color: COLORS.textSecondary, margin: '0 0 32px 0', lineHeight: 1.6 }}>
            O pagamento do seu pedido nao foi concluido. Se o valor foi descontado, ele sera estornado em ate 5 dias uteis.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link href="/cardapio" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Tentar novamente
            </Link>
            <Link href="/pedidos" style={{
              padding: '12px 28px', borderRadius: 999,
              border: '1.5px solid ' + COLORS.border,
              color: COLORS.dark, fontSize: '14px', fontWeight: 600,
              fontFamily: SANS, textDecoration: 'none',
              display: 'inline-block'
            }}>
              Meus pedidos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}