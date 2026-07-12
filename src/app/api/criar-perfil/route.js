import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const dados = await request.json()

    if (!dados.id) {
      return Response.json({ success: false, error: 'ID do usuario e obrigatorio' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (serviceRoleKey) {
      // Modo admin: usa service role pra bypassar RLS
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .upsert({
          ...dados,
          updated_at: new Date().toISOString()
        })

      if (error) {
        return Response.json({ success: false, error: error.message }, { status: 400 })
      }

      return Response.json({ success: true, data })
    } else {
      // Service role key nao configurada
      return Response.json({
        success: false,
        error: 'SUPABASE_SERVICE_ROLE_KEY nao configurada'
      }, { status: 500 })
    }
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}