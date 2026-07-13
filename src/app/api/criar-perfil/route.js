import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const dados = await request.json()

    if (!dados.id) {
      return Response.json({ success: false, error: 'ID do usuario e obrigatorio' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
      return Response.json({ success: false, error: 'SUPABASE_SERVICE_ROLE_KEY nao configurada' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: dados.id,
        nome: dados.nome || '',
        telefone: dados.telefone || '',
        cep: dados.cep || '',
        logradouro: dados.logradouro || '',
        numero: dados.numero || '',
        complemento: dados.complemento || '',
        bairro: dados.bairro || '',
        cidade: dados.cidade || '',
        estado: dados.estado || '',
        updated_at: new Date().toISOString()
      })

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 400 })
    }

    return Response.json({ success: true, data })
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}