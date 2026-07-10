import { createClient } from '@supabase/supabase-js'
import { MercadoPagoConfig, Payment } from 'mercadopago'

export async function GET(request) {
  const { searchParams } = request.nextUrl
  const status = searchParams.get('status') || searchParams.get('collection_status')
  const externalReference = searchParams.get('external_reference')
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id')

  if (status === 'approved' && externalReference) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )

      // Busca dados do pagamento no Mercado Pago pra ter o valor
      let transactionAmount = null
      try {
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
        if (accessToken && paymentId) {
          const client = new MercadoPagoConfig({ accessToken })
          const payment = new Payment(client)
          const paymentData = await payment.get({ id: paymentId })
          transactionAmount = paymentData.transaction_amount
        }
      } catch (e) {
        console.error('Erro ao buscar payment data no MP:', e)
      }

      // Atualiza o pedido
      const { error: updateError } = await supabase
        .from('pedidos')
        .update({
          status: 'confirmado',
          pagamento_status: status,
          metodo_pagamento: 'mercadopago',
          atualizado_em: new Date().toISOString()
        })
        .eq('id', externalReference)

      if (updateError) {
        console.error('Erro ao atualizar pedido:', updateError)
      }

      // Registra o pagamento
      if (paymentId) {
        const paymentRecord = {
          order_id: externalReference,
          metodo: 'mercadopago',
          status: 'approved',
          valor: transactionAmount,
          mercado_pago_id: String(paymentId),
          mercado_pago_status: 'approved',
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString()
        }

        const { data: existingPayment } = await supabase
          .from('payments')
          .select('id')
          .eq('mercado_pago_id', String(paymentId))
          .single()

        if (existingPayment) {
          await supabase.from('payments').update(paymentRecord).eq('id', existingPayment.id)
        } else {
          await supabase.from('payments').insert(paymentRecord)
        }
      }
    } catch (e) {
      console.error('Erro na API de sucesso:', e)
    }
  }

  // Redireciona pro frontend
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tortas-da-lika.vercel.app'
  return Response.redirect(`${baseUrl}/pedidos`, 302)
}
