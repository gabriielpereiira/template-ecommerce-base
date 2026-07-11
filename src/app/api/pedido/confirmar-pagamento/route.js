import { createClient } from '@supabase/supabase-js'
import { emailPedidoConfirmado } from '@/lib/emailPedidoConfirmado'

async function enviarEmailBrevo({ para, assunto, html }) {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: 'Tortas da Lika', email: 'tortasdalika@outlook.com' },
        to: [{ email: para }],
        subject: assunto,
        htmlContent: html
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro no Brevo:', response.status, errorText)
      return false
    }

    console.log('Email enviado com sucesso via Brevo')
    return true
  } catch (err) {
    console.error('Erro ao enviar email via Brevo:', err)
    return false
  }
}

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

    // Disparar email se pagamento aprovado
    if (status === 'approved') {
      const { data: pedido } = await supabase
        .from('pedidos')
        .select('nome_cliente, email_cliente, total, itens')
        .eq('id', pedidoId)
        .single()

      if (pedido?.email_cliente) {
        const html = emailPedidoConfirmado({
          nomeCliente: pedido.nome_cliente || pedido.email_cliente.split('@')[0],
          pedidoId,
          total: pedido.total || 0,
          itens: Array.isArray(pedido.itens) ? pedido.itens : []
        })

        await enviarEmailBrevo({
          para: pedido.email_cliente,
          assunto: 'Pedido Confirmado - Tortas da Lika',
          html
        })
      } else {
        console.log('Pedido sem email_cliente, email nao enviado')
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

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl
    const status = searchParams.get('status') || searchParams.get('collection_status')
    const externalReference = searchParams.get('external_reference')
    const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id')
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin

    if (status === 'approved' && externalReference) {
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

      // Enviar email
      const { data: pedido } = await supabase
        .from('pedidos')
        .select('nome_cliente, email_cliente, total, itens')
        .eq('id', externalReference)
        .single()

      if (pedido?.email_cliente) {
        const html = emailPedidoConfirmado({
          nomeCliente: pedido.nome_cliente || pedido.email_cliente.split('@')[0],
          pedidoId: externalReference,
          total: pedido.total || 0,
          itens: Array.isArray(pedido.itens) ? pedido.itens : []
        })

        await enviarEmailBrevo({
          para: pedido.email_cliente,
          assunto: 'Pedido Confirmado - Tortas da Lika',
          html
        })
      }

      // Salva na tabela payments
      if (paymentId) {
        try {
          await supabase.from('payments').insert({
            order_id: externalReference,
            metodo: 'mercadopago',
            status: 'approved',
            valor: null,
            mercado_pago_id: String(paymentId),
            mercado_pago_status: 'approved',
            criado_em: new Date().toISOString(),
            atualizado_em: new Date().toISOString()
          })
        } catch (_) {}
      }
    }

    // Redireciona pra pagina de sucesso
    const redirectUrl = new URL(`${baseUrl}/pedido/sucesso`)
    if (status) redirectUrl.searchParams.set('status', status)
    if (externalReference) redirectUrl.searchParams.set('external_reference', externalReference)
    if (paymentId) redirectUrl.searchParams.set('payment_id', paymentId)

    return Response.redirect(redirectUrl.toString(), 302)
  } catch (error) {
    console.error('Erro no GET:', error)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
    return Response.redirect(`${baseUrl}/pedidos`, 302)
  }
}