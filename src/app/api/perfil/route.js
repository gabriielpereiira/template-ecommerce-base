import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ success: false, erro: 'userId obrigatorio' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error } = await supabase
      .from('profiles')
      .select('id, nome, telefone, cep, logradouro, bairro, cidade, estado, numero, complemento')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ success: false, erro: 'Erro ao buscar perfil' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data ? { nome: data.nome || '', telefone: data.telefone || '' } : { nome: '', telefone: '' }
    })
  } catch (error) {
    return NextResponse.json({ success: false, erro: error.message }, { status: 500 })
  }
}