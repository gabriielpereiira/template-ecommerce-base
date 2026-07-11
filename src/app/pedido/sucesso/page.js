import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import PedidoSucessoClient from './PedidoSucessoClient'

export const dynamic = 'force-dynamic'

export default async function SucessoPage({ searchParams }) {
  const sp = await searchParams
  const status = sp?.status
  const externalReference = sp?.external_reference
  const paymentId = sp?.payment_id

  let atualizou = false

  if (status === 'approved' && externalReference) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )

      const { error } = await supabase
        .from('pedidos')
        .update({
          status: 'confirmado',
          pagamento_status: status,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', externalReference)

      if (!error) {
        atualizou = true

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
      } catch (_) {
        // fallback silencioso - se der erro no insert do pagamento,
        // o pedido ja foi atualizado como confirmado
      }
    }
      }
    } catch (e) {
      console.error('Erro server-side ao confirmar pagamento:', e)
    }
  }

  // Se atualizou com sucesso, redireciona direto pros pedidos
  if (atualizou) {
    redirect('/pedidos')
  }

  return <PedidoSucessoClient />
}
