import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { emailPedidoConfirmado } from '@/lib/emailPedidoConfirmado'

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

    await supabase
      .from('pedidos')
      .update({
        status: orderStatus,
        pagamento_status: status,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', pedidoId)

    // Disparar email se o pagamento foi aprovado
    if (status === 'approved') {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)

        const { data: pedido } = await supabase
          .from('pedidos')
          .select('cliente_nome, cliente_email, total, itens')
          .eq('id', pedidoId)
          .single()

        if (pedido?.cliente_email) {
          const nomeCliente = pedido.cliente_nome || pedido.cliente_email.split('@')[0]
          const itens = Array.isArray(pedido.itens) ? pedido.itens : []
          const total = pedido.total || 0

          await resend.emails.send({
            from: 'Tortas da Lika <onboarding@resend.dev>',
            to: pedido.cliente_email,
            subject: 'Pedido Confirmado - Tortas da Lika',
            html: emailPedidoConfirmado({ nomeCliente, pedidoId, total, itens })
          })
        }
      } catch (emailError) {
        console.error('Erro ao enviar email de confirmacao:', emailError)
      }
    }

    if (paymentId) {
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('mercado_pago_id', String(paymentId))
        .single()

      const paymentRecord = {
        order_id: pedidoId,
        metodo: 'mercadopago',
        status: status || 'approved',
        valor: null,
        mercado_pago_id: String(paymentId),
        mercado_pago_status: status || 'approved',
        atualizado_em: new Date().toISOString()
      }

      if (existingPayment) {
        await supabase.from('payments').update(paymentRecord).eq('id', existingPayment.id)
      } else {
        await supabase.from('payments').insert({
          ...paymentRecord,
          criado_em: new Date().toISOString()
        })
      }
    }

    return Response.json({ success: true, status: orderStatus })
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}