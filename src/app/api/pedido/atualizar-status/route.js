import { createClient } from '@supabase/supabase-js'
import Brevo from '@getbrevo/brevo'
import { emailSaiuEntrega } from '@/lib/emailSaiuEntrega'

async function enviarEmailBrevo({ para, assunto, html }) {
  try {
    const apiInstance = new Brevo.TransactionalEmailsApi()
    apiInstance.setApiKey(
      Brevo.ApiClient.instance.authentications['api-key'],
      process.env.BREVO_API_KEY
    )

    const sendSmtpEmail = {
      sender: { name: 'Tortas da Lika', email: 'tortasdalika@outlook.com' },
      to: [{ email: para }],
      subject: assunto,
      htmlContent: html
    }

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log('Email enviado com sucesso via Brevo:', result)
    return true
  } catch (err) {
    console.error('Erro ao enviar email via Brevo:', err)
    return false
  }
}

export async function POST(request) {
  try {
    const { pedidoId, novoStatus } = await request.json()
    if (!pedidoId || !novoStatus) {
      return Response.json({ error: 'pedidoId e novoStatus obrigatorios' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Busca dados do pedido antes de atualizar
    const { data: pedido } = await supabase
      .from('pedidos')
      .select('nome_cliente, email_cliente')
      .eq('id', pedidoId)
      .single()

    // Atualiza o status
    await supabase
      .from('pedidos')
      .update({
        status: novoStatus,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', pedidoId)

    // Se for "saiu_entrega", dispara email
    if (novoStatus === 'saiu_entrega') {
      if (pedido?.email_cliente) {
        const html = emailSaiuEntrega({
          nomeCliente: pedido.nome_cliente || pedido.email_cliente.split('@')[0],
          pedidoId
        })

        await enviarEmailBrevo({
          para: pedido.email_cliente,
          assunto: 'Seu pedido saiu para entrega - Tortas da Lika',
          html
        })
      }
    }

    return Response.json({ success: true, status: novoStatus })
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}