import { createClient } from '@supabase/supabase-js'
import PedidoSucessoClient from './PedidoSucessoClient'

// FORCA renderizacao dinamica - sem isso o Next.js pre-renderiza como estatico
export const dynamic = 'force-dynamic'

export default async function SucessoPage({ searchParams }) {
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

      // Atualiza o status do pedido no banco
      await supabase
        .from('pedidos')
        .update({
          status: 'confirmado',
          pagamento_status: status,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', externalReference)

      // Registra o pagamento na tabela payments
      if (paymentId) {
        try {
          const { data: existingPayment } = await supabase
            .from('payments')
            .select('id')
            .eq('mercado_pago_id', String(paymentId))
            .single()

          const paymentRecord = {
            order_id: externalReference,
            metodo: 'mercadopago',
            status: 'approved',
            valor: null,
            mercado_pago_id: String(paymentId),
            mercado_pago_status: 'approved',
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
