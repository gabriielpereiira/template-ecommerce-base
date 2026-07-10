'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function PagamentoFracassoContent() {
  const searchParams = useSearchParams()
  const [atualizando, setAtualizando] = useState(true)

  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')
  const externalReference = searchParams.get('external_reference')

  useEffect(() => {
    if (externalReference) {
      fetch('/api/pedido/atualizar-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedido_id: externalReference,
          payment_id: paymentId,
          status_pagamento: status || 'rejected'
        })
      }).finally(() => setAtualizando(false))
    } else {
      setAtualizando(false)
    }
  }, [externalReference, paymentId, status])

  const containerStyle = {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: '24px',
    backgroundColor: '#fff8f0', fontFamily: 'Arial, Helvetica, sans-serif',
    color: '#4a3728', textAlign: 'center'
  }

  const cardStyle = {
    backgroundColor: '#ffffff', borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(74, 55, 40, 0.15)',
    padding: '40px', maxWidth: '480px', width: '100%'
  }

  return (
    <main style={containerStyle}>
      <section style={cardStyle}>
        {atualizando ? (
          <p style={{ color: '#6b5644', fontSize: '16px' }}>Atualizando pagamento...</p>
        ) : (
          <>
            <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 16px 0', color: '#4a3728' }}>
              Pagamento nao aprovado
            </h1>
            <p style={{ fontSize: '16px', lineHeight: '1.6', margin: '0 0 24px 0', color: '#6b5644' }}>
              Infelizmente seu pagamento nao foi aprovado. Tente novamente ou escolha outra forma de pagamento.
            </p>
            {externalReference && (
              <div style={{ backgroundColor: '#f7efe6', borderRadius: '8px', padding: '16px', margin: '0 0 24px 0' }}>
                <p style={{ fontSize: '14px', color: '#6b5644', margin: 0 }}>
                  Pedido: <strong style={{ color: '#4a3728' }}>{externalReference}</strong>
                </p>
              </div>
            )}
            <Link href="/carrinho" style={{
              display: 'inline-block', backgroundColor: '#4a3728', color: '#ffffff',
              textDecoration: 'none', padding: '12px 24px', borderRadius: '8px',
              fontWeight: 600, fontSize: '15px'
            }}>
              Tentar novamente
            </Link>
          </>
        )}
      </section>
    </main>
  )
}

export default function PagamentoFracassoPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Carregando...</div>}>
      <PagamentoFracassoContent />
    </Suspense>
  )
}