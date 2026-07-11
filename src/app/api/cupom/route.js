import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const CUPONS = {
  PRIMEIRA_FATIA: {
    tipo: 'percentual',
    valor: 15,
    descricao: '15% de desconto na primeira compra',
    uso_unico: true,
  },
}

export async function POST(request) {
  try {
    const { codigo, email_cliente } = await request.json()

    if (!codigo || typeof codigo !== 'string') {
      return NextResponse.json(
        { success: false, erro: 'Codigo do cupom invalido' },
        { status: 400 }
      )
    }

    const cupom = CUPONS[codigo.toUpperCase().trim()]

    if (!cupom) {
      return NextResponse.json(
        { success: false, erro: 'Cupom nao encontrado ou invalido.' },
        { status: 404 }
      )
    }

    // Verifica uso unico se o cupom exigir e tivermos o email do cliente
    if (cupom.uso_unico && email_cliente) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )

      const { data: pedidosExistentes } = await supabase
        .from('pedidos')
        .select('id')
        .eq('email_cliente', email_cliente)
        .not('cupom_aplicado', 'is', null)

      if (pedidosExistentes && pedidosExistentes.length > 0) {
        // Verifica se algum pedido usou este cupom especifico
        const jaUsou = pedidosExistentes.some(p => {
          // cupom_aplicado pode ser JSON com { codigo: 'PRIMEIRA_FATIA' }
          // ou pode ser string com o codigo
          const cupomAplicado = p.cupom_aplicado
          if (!cupomAplicado) return false
          if (typeof cupomAplicado === 'string') return cupomAplicado.toUpperCase() === codigo.toUpperCase().trim()
          if (typeof cupomAplicado === 'object') return cupomAplicado.codigo?.toUpperCase() === codigo.toUpperCase().trim()
          return false
        })

        if (jaUsou) {
          return NextResponse.json(
            { success: false, erro: 'Este cupom ja foi utilizado por voce em um pedido anterior.' },
            { status: 409 }
          )
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        codigo: codigo.toUpperCase().trim(),
        tipo: cupom.tipo,
        valor: cupom.valor,
        descricao: cupom.descricao,
      },
    })
  } catch (error) {
    console.error('Erro ao validar cupom:', error)
    return NextResponse.json(
      { success: false, erro: 'Erro ao validar cupom.' },
      { status: 500 }
    )
  }
}