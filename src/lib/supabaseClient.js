import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nqjkcqloenliiftcgvro.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xamtjcWxvZW5saWlmdGNndnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4Nzk0ODUsImV4cCI6MjA5NzQ1NTQ4NX0.lnqoY32fPB9eQP0xKlDeetw4iOUblsoy_mDQk4UpJPg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function createServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}