import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import PedidoSucessoClient from './PedidoSucessoClient'

export const dynamic = 'force-dynamic'

export default async function SucessoPage({ searchParams }) {
  const sp = await searchParams
  const status = sp?.status
  const externalReference = sp?.external_reference
  const paymentId = sp?.payment_id

  console.log('=== PAGINA DE SUCESSO ===')
  console.log('status:', status)
  console.log('externalReference:', externalReference)
  console.log('paymentId:', paymentId)

  let atualizou = false

  if (status === 'approved' && externalReference) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      console.log('SUPABASE_URL definida:', !!supabaseUrl)
      console.log('SUPABASE_KEY definida:', !!supabaseKey)

      if (!supabaseUrl || !supabaseKey) {
        console.error('ERRO: Variaveis do Supabase nao estao configuradas na Vercel!')
      } else {
        const supabase = createClient(supabaseUrl, supabaseKey)

        console.log('Tentando atualizar pedido:', externalReference)

        const { data: selectTest, error: selectError } = await supabase
          .from('pedidos')
          .select('id, status')
          .eq('id', externalReference)
          .maybeSingle()

        if (selectError) {
          console.error('ERRO ao buscar pedido:', selectError)
        } else if (!selectTest) {
          console.error('PEDIDO NAO ENCONTRADO com id:', externalReference)
        } else {
          console.log('Pedido encontrado, status atual:', selectTest.status)

          const { error: updateError } = await supabase
            .from('pedidos')
            .update({
              status: 'confirmado',
              pagamento_status: status,
              atualizado_em: new Date().toISOString()
            })
            .eq('id', externalReference)

          if (updateError) {
            console.error('ERRO ao atualizar pedido:', JSON.stringify(updateError))
          } else {
            console.log('Pedido atualizado com sucesso!')
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
                console.log('Payment insert feito com sucesso')
              } catch (_) {
                console.log('Payment insert fallback (ignorado)')
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('Erro server-side ao confirmar pagamento:', e)
    }
  } else {
    console.log('Condicao nao atendida: status=', status, 'externalRef=', externalReference)
  }

  if (atualizou) {
    console.log('Redirecionando para /pedidos')
    redirect('/pedidos')
  }

  console.log('Renderizando PedidoSucessoClient')
  return <PedidoSucessoClient />
}