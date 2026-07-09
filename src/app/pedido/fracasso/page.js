'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function PagamentoFracassoContent() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')
  const message = searchParams.get('message') || 'Ocorreu um erro ao processar o seu pagamento. Por favor, tente novamente.'

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f5ede0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Arial, Helvetica, sans-serif',
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      padding: '40px',
      maxWidth: '480px',
      width: '100%',
      textAlign: 'center',
    },
    title: {
      color: '#4a3728',
      fontSize: '28px',
      fontWeight: 'bold',
      margin: '0 0 16px 0',
    },
    messageText: {
      color: '#5a4a3a',
      fontSize: '16px',
      lineHeight: '1.5',
      margin: '0 0 24px 0',
    },
    detail: {
      color: '#7a6a5a',
      fontSize: '14px',
      margin: '0 0 8px 0',
    },
    detailValue: {
      fontWeight: 'bold',
      color: '#4a3728',
    },
    detailsContainer: {
      backgroundColor: '#faf6f0',
      borderRadius: '8px',
      padding: '16px',
      margin: '0 0 24px 0',
    },
    link: {
      display: 'inline-block',
      backgroundColor: '#4a3728',
      color: '#ffffff',
      textDecoration: 'none',
      padding: '12px 28px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 'bold',
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Pagamento nao aprovado</h1>
        <p style={styles.messageText}>{message}</p>

        {(paymentId || status) && (
          <div style={styles.detailsContainer}>
            {paymentId && (
              <p style={styles.detail}>
                ID do pagamento: <span style={styles.detailValue}>{paymentId}</span>
              </p>
            )}
            {status && (
              <p style={styles.detail}>
                Status: <span style={styles.detailValue}>{status}</span>
              </p>
            )}
          </div>
        )}

        <Link href="/cardapio" style={styles.link}>
          Tentar novamente
        </Link>
      </div>
    </div>
  )
}

export default function PagamentoFracassoPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>Carregando...</div>}>
      <PagamentoFracassoContent />
    </Suspense>
  )
}