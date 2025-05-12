import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Client-side utility for accessing company-specific schema
export function getCompanyClient(companySlug: string) {
  const supabase = createClientComponentClient()

  // Return a function that executes queries with the company schema
  return {
    from: (table: string) => {
      return supabase.from(`${companySlug}.${table}`)
    },
    // Add other methods as needed
    rpc: (fn: string, params: any) => {
      return supabase.rpc(fn, { ...params, _company_schema: companySlug })
    },
  }
}

// Server-side utility for accessing company-specific schema
export function getCompanyServer(companySlug: string) {
  const supabase = createServerComponentClient({ cookies })

  // Return a function that executes queries with the company schema
  return {
    from: (table: string) => {
      return supabase.from(`${companySlug}.${table}`)
    },
    // Add other methods as needed
    rpc: (fn: string, params: any) => {
      return supabase.rpc(fn, { ...params, _company_schema: companySlug })
    },
  }
}
