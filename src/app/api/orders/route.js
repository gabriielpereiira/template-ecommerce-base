import { createServerSupabaseClient } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const supabase = createServerSupabaseClient()

    // --- Validações ---
    if (!body.cliente_nome || body.cliente_nome.trim().length < 3) {
      return Response.json(
        { erro: 'Nome do cliente deve ter pelo menos 3 caracteres.' },
        { status: 400 }
      )
    }

    if (!body.cliente_telefone || body.cliente_telefone.trim().length < 10) {
      return Response.json(
        { erro: 'Telefone invalido. Informe com DDD (minimo 10 digitos).' },
        { status: 400 }
      )
    }

    if (!['retirada', 'entrega'].includes(body.forma_entrega)) {
      return Response.json(
        { erro: 'Forma de entrega invalida. Use "retirada" ou "entrega".' },
        { status: 400 }
      )
    }

    if (body.forma_entrega === 'entrega' && !body.endereco_entrega) {
      return Response.json(
        { erro: 'Endereco de entrega obrigatorio para entrega.' },
        { status: 400 }
      )
    }

    if (!body.itens || !Array.isArray(body.itens) || body.itens.length === 0) {
      return Response.json(
        { erro: 'Adicione pelo menos um item ao pedido.' },
        { status: 400 }
      )
    }

    for (const item of body.itens) {
      if (!item.product_id || !item.quantidade || item.quantidade < 1) {
        return Response.json(
          { erro: 'Cada item deve ter product_id e quantidade maior que zero.' },
          { status: 400 }
        )
      }
    }

    if (!['pix', 'dinheiro', 'cartao_credito', 'cartao_debito', 'mercadopago'].includes(body.metodo_pagamento)) {
      return Response.json(
        { erro: 'Metodo de pagamento invalido.' },
        { status: 400 }
      )
    }

    // Buscar dados atuais dos produtos
    const productIds = body.itens.map(item => item.product_id)
    const { data: produtos, error: produtosError } = await supabase
      .from('products')
      .select('id, nome, preco')
      .in('id', productIds)

    if (produtosError || !produtos || produtos.length !== productIds.length) {
      return Response.json(
        { erro: 'Um ou mais produtos nao encontrados.' },
        { status: 400 }
      )
    }

    // Mapear produtos por id
    const produtosMap = {}
    for (const p of produtos) {
      produtosMap[p.id] = p
    }

    // Montar itens com dados atuais do produto
    const itensPedido = body.itens.map(item => {
      const produto = produtosMap[item.product_id]
      return {
        product_id: item.product_id,
        produto_nome: produto.nome,
        quantidade: item.quantidade,
        preco_unitario: Number(produto.preco),
        subtotal: Number(produto.preco) * item.quantidade,
      }
    })

    const subtotal = itensPedido.reduce((acc, item) => acc + item.subtotal, 0)
    const valor_frete = body.valor_frete ? Number(body.valor_frete) : 0
    const total = subtotal + valor_frete

    // Inserir pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        cliente_nome: body.cliente_nome.trim(),
        cliente_telefone: body.cliente_telefone.trim(),
        cliente_email: body.cliente_email?.trim() || null,
        endereco_entrega: body.endereco_entrega?.trim() || null,
        forma_entrega: body.forma_entrega,
        status: 'pendente',
        observacao: body.observacao?.trim() || null,
        subtotal,
        taxa_entrega: valor_frete,
        total,
      })
      .select()
      .single()

    if (orderError) {
      return Response.json(
        { erro: 'Erro ao criar pedido.' },
        { status: 500 }
      )
    }

    // Inserir itens do pedido
    const orderItemsData = itensPedido.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      produto_nome: item.produto_nome,
      quantidade: item.quantidade,
      preco_unitario: item.preco_unitario,
      subtotal: item.subtotal,
    }))

    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData)
      .select()

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', order.id)
      return Response.json(
        { erro: 'Erro ao registrar itens do pedido.' },
        { status: 500 }
      )
    }

    // Inserir pagamento
    const paymentData = {
      order_id: order.id,
      metodo: body.metodo_pagamento,
      status: 'pendente',
      valor: total,
      troco_para:
        body.metodo_pagamento === 'dinheiro' ? body.troco_para || null : null,
    }

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single()

    if (paymentError) {
      await supabase.from('order_items').delete().eq('order_id', order.id)
      await supabase.from('orders').delete().eq('id', order.id)
      return Response.json(
        { erro: 'Erro ao registrar pagamento.' },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      data: {
        order,
        items: orderItems,
        payment,
      },
    })
  } catch (err) {
    console.error('Erro ao criar pedido:', err)
    return Response.json(
      { erro: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}