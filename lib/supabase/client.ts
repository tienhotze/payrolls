import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// Create a singleton to avoid multiple instances
let supabase: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabase) {
    // Check if we're in a Vercel environment
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase credentials missing. Using fallback client.")
      // Return a minimal client that won't throw errors
      return createClient("https://placeholder-url.supabase.co", "placeholder-key", {
        auth: {
          persistSession: false,
        },
      })
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabase
}
