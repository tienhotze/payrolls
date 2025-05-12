import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export const createServerClient = () => {
  try {
    const cookieStore = cookies()
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Check if we have the required environment variables
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
  } catch (error) {
    console.error("Error creating server client:", error)
    // Return a minimal client that won't throw errors
    return createClient("https://placeholder-url.supabase.co", "placeholder-key", {
      auth: {
        persistSession: false,
      },
    })
  }
}
