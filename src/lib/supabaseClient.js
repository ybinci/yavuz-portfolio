import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export const hasSupabaseConfig = isSupabaseConfigured
export const supabaseConfigErrorMessage = 'Supabase bağlantı bilgileri eksik veya hatalı.'
export const supabaseEnvReadErrorMessage = (
  'VITE_SUPABASE_URL veya VITE_SUPABASE_ANON_KEY okunamıyor. '
  + 'Vercel env değişkenlerini ve redeploy işlemini kontrol edin.'
)

console.info('Supabase URL var mı:', Boolean(supabaseUrl))
console.info('Supabase anon key var mı:', Boolean(supabaseAnonKey))

if (!isSupabaseConfigured) {
  console.error(supabaseEnvReadErrorMessage)
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
