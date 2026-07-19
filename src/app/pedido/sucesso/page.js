'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import HeaderUnificado from '@/components/HeaderUnificado'
import { theme } from '@/theme'

const COLORS = theme.colors
const SERIF = theme.fonts.serif
const SANS = theme.fonts.sans

function PedidoSucessoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pedidoId = searchParams.get('pedidoId')

  useEffect(() => {
    async function confirmarPagamento() {
      if (!pedidoId) return
      try {
        await fetch('/api/pedido/confirmar-pagamento', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pedidoId })
        })
      } catch (err) {
        console.error('Erro ao confirmar pagamento:', err)
      }
    }
    confirmarPagamento()
  }, [pedidoId])

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
            background: '#D1FAE5', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 style={{ fontFamily: SERIF, fontSize: '26px', color: COLORS.dark, fontWeight: 700, margin: '0 0 8px 0' }}>
            Pedido Confirmado!
          </h1>
          <p style={{ fontSize: '14px', color: COLORS.textSecondary, margin: '0 0 8px 0', lineHeight: 1.6 }}>
            Seu pedido foi registrado com sucesso.
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
        </div>
      </div>
    </div>
  )
}

export default function PedidoSucessoPage() {
  return (
    <PedidoSucessoContent />
  )
}