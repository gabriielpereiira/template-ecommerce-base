import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const { pedidoId, paymentId, status } = await request.json()
    if (!pedidoId) return Response.json({ error: 'pedidoId obrigatorio' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    let orderStatus = 'pendente'
    if (status === 'approved') orderStatus = 'confirmado'
    else if (['rejected', 'refused', 'cancelled', 'refunded'].includes(status)) orderStatus = 'cancelado'

    await supabase.from('pedidos').update({
      status: orderStatus,
      pagamento_status: status,
      atualizado_em: new Date().toISOString()
    }).eq('id', pedidoId)

    if (paymentId) {
      const { data: existingPayment } = await supabase.from('payments')
        .select('id').eq('mercado_pago_id', String(paymentId)).single()

      const paymentRecord = {
        order_id: pedidoId, metodo: 'mercadopago', status: status || 'approved',
        valor: null, mercado_pago_id: String(paymentId),
        mercado_pago_status: status || 'approved', atualizado_em: new Date().toISOString()
      }

      if (existingPayment) {
        await supabase.from('payments').update(paymentRecord).eq('id', existingPayment.id)
      } else {
        await supabase.from('payments').insert({ ...paymentRecord, criado_em: new Date().toISOString() })
      }
    }

    return Response.json({ success: true, status: orderStatus })
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

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

      await supabase
        .from('pedidos')
        .update({
          status: 'confirmado',
          pagamento_status: status,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', externalReference)

      if (paymentId) {
        await supabase.from('payments').insert({
          order_id: externalReference,
          metodo: 'mercadopago',
          status: 'approved',
          valor: null,
          mercado_pago_id: String(paymentId),
          mercado_pago_status: 'approved',
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString()
        }).catch(() => {})
      }
    } catch (e) {
      console.error('Erro no GET confirmar pagamento:', e)
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
  const redirectUrl = new URL(`${baseUrl}/pedido/sucesso`)
  if (status) redirectUrl.searchParams.set('status', status)
  if (externalReference) redirectUrl.searchParams.set('external_reference', externalReference)
  if (paymentId) redirectUrl.searchParams.set('payment_id', paymentId)

  return Response.redirect(redirectUrl.toString(), 302)
}