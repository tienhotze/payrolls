import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export const createServerClient = () => {
  const cookieStore = cookies()
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  // Check if we're in a Vercel environment
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials missing in server context. Using fallback client.")
    // Return a minimal client that won't throw errors
    return createClient("https://placeholder-url.supabase.co", "placeholder-key", {
      auth: {
        persistSession: false,
      },
    })
  }

  return createClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}
