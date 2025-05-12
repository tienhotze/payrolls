import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simplified middleware that doesn't cause redirect loops
export async function middleware(request: NextRequest) {
  // For now, let's allow all requests to pass through
  // This will help us diagnose if the middleware is causing the issue
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
