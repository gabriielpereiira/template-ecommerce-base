import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { emailSaiuEntrega } from '@/lib/emailSaiuEntrega'

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

    // Atualiza o status do pedido
    await supabase
      .from('pedidos')
      .update({
        status: novoStatus,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', pedidoId)

    // Se for "saiu_entrega", dispara email
    if (novoStatus === 'saiu_entrega') {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)

        const { data: pedido } = await supabase
          .from('pedidos')
          .select('nome_cliente, email_cliente')
          .eq('id', pedidoId)
          .single()

        if (pedido?.email_cliente) {
          await resend.emails.send({
            from: 'Tortas da Lika <onboarding@resend.dev>',
            to: pedido.email_cliente,
            subject: 'Seu pedido saiu para entrega - Tortas da Lika',
            html: emailSaiuEntrega({
              nomeCliente: pedido.nome_cliente || pedido.email_cliente.split('@')[0],
              pedidoId
            })
          })
        }
      } catch (emailError) {
        console.error('Erro ao enviar email de saiu_entrega:', emailError)
      }
    }

    return Response.json({ success: true, status: novoStatus })
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}