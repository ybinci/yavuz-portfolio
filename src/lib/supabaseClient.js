import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)
export const supabaseConfigErrorMessage = 'Supabase bağlantı bilgileri eksik veya hatalı.'

if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL is undefined. Supabase URL environment variable is missing.')
}

if (!supabaseAnonKey) {
  console.error(
    'VITE_SUPABASE_ANON_KEY is undefined. Supabase anon key environment variable is missing.',
  )
}

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
