import { NextResponse } from 'next/server'

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
    const { codigo } = await request.json()

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
    return NextResponse.json(
      { success: false, erro: 'Erro ao validar cupom.' },
      { status: 500 }
    )
  }
}