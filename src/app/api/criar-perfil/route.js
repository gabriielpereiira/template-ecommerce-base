import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const dados = await request.json()

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

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
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}