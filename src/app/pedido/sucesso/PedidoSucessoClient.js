'use client'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { theme } from '@/theme'

const COLORS = theme.colors
const SERIF = theme.fonts.serif
const SANS = theme.fonts.sans

export default function PedidoSucessoClient() {
  const searchParams = useSearchParams()
  const isApproved = searchParams.get('isApproved')
  const externalReference = searchParams.get('externalReference')
  const paymentId = searchParams.get('paymentId')
  const status = searchParams.get('status')

  useEffect(() => {
    if (isApproved && externalReference) {
      fetch('/api/pedido/confirmar-pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId: externalReference,
          paymentId,
          status
        })
      }).catch(err => console.error('Erro ao confirmar pagamento:', err))
    }
  }, [isApproved, externalReference, paymentId, status])

  const statStyle = {
    color: COLORS.textSecondary,
    fontSize: 14,
    margin: 0,
    lineHeight: 1.6
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.bg,
      fontFamily: SANS
    }}>
      <div style={{
        maxWidth: 500,
        margin: '0 auto',
        padding: '80px 24px',
        textAlign: 'center'
      }}>
        <div style={{
          background: COLORS.white,
          borderRadius: 16,
          padding: '48px 32px',
          border: '1px solid ' + COLORS.border
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: isApproved ? '#D1FAE5' : '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            {isApproved ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            )}
          </div>

          <h1 style={{
            fontFamily: SERIF,
            fontSize: 26,
            color: COLORS.dark,
            fontWeight: 700,
            margin: '0 0 8px 0'
          }}>
            {isApproved ? 'Pagamento Confirmado!' : 'Aguardando Confirmacao'}
          </h1>

          <p style={statStyle}>
            {isApproved
              ? 'Seu pedido foi registrado e o pagamento foi confirmado com sucesso.'
              : 'Seu pedido foi registrado. Estamos processando o seu pagamento.'}
          </p>

          <div style={{
            background: COLORS.bg,
            borderRadius: 8,
            padding: 16,
            margin: '24px 0',
            textAlign: 'left'
          }}>
            {externalReference && (
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: '1px solid ' + COLORS.border
              }}>
                <span style={{ color: COLORS.textSecondary, fontSize: 13 }}>Pedido</span>
                <span style={{ color: COLORS.dark, fontWeight: 600, fontSize: 13 }}>
                  #{externalReference.slice(0, 8).toUpperCase()}
                </span>
              </div>
            )}
            {paymentId && (
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: '1px solid ' + COLORS.border
              }}>
                <span style={{ color: COLORS.textSecondary, fontSize: 13 }}>ID do pagamento</span>
                <span style={{ color: COLORS.dark, fontWeight: 600, fontSize: 13 }}>{paymentId}</span>
              </div>
            )}
            {status && (
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: 'none'
              }}>
                <span style={{ color: COLORS.textSecondary, fontSize: 13 }}>Status</span>
                <span style={{ color: COLORS.dark, fontWeight: 600, fontSize: 13 }}>{status}</span>
              </div>
            )}
          </div>

          <Link
            href="/pedidos"
            className="btn btn-primary"
            style={{ textDecoration: 'none', display: 'inline-flex' }}
          >
            Acompanhar status do pedido
          </Link>

          <p style={{
            color: COLORS.textLight,
            fontSize: 12,
            margin: '24px 0 0',
            fontFamily: SANS
          }}>
            Obrigado por escolher nossos produtos.
          </p>
        </div>
      </div>
    </div>
  )
}