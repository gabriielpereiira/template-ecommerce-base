import { createClient } from '@supabase/supabase-js'
import PedidoSucessoClient from './PedidoSucessoClient'

export default async function Page({ searchParams }) {
  const sp = await searchParams
  const status = sp?.status
  const externalReference = sp?.external_reference
  const paymentId = sp?.payment_id

  if (status === 'approved' && externalReference) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )

      const orderStatus = 'confirmado'

      await supabase
        .from('pedidos')
        .update({
          status: orderStatus,
          pagamento_status: status,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', externalReference)

      // Tambem registra o pagamento na tabela payments
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
        } catch (e) {
          console.error('Erro ao salvar payment record:', e)
        }
      }
    } catch (e) {
      console.error('Erro server-side ao confirmar pagamento:', e)
    }
  }

  return <PedidoSucessoClient />
}
