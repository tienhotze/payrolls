import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  // Sign out the user
  await supabase.auth.signOut()

  // Redirect to the login page
  return NextResponse.redirect(new URL("/", request.url))
}
