import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { pathname } = req.nextUrl

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Public routes
  const isPublicRoute = pathname === "/" || pathname.match(/^\/[^/]+\/login\/?$/) || pathname === "/admin/login"

  // Admin routes
  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login"

  // Company routes
  const isCompanyRoute = pathname.match(/^\/[^/]+\/(?!login).+$/)

  // If accessing admin routes without session, redirect to admin login
  if (isAdminRoute && !session) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // If accessing company routes without session, redirect to company login
  if (isCompanyRoute && !session) {
    const companySlug = pathname.split("/")[1]
    return NextResponse.redirect(new URL(`/${companySlug}/login`, req.url))
  }

  // If logged in and trying to access login page, redirect to appropriate dashboard
  if (session && (pathname === "/" || pathname.match(/^\/[^/]+\/login\/?$/))) {
    // Check if user is admin
    const adminResponse = await supabase
      .from("admin_users")
      .select("is_super_admin, company_id")
      .eq("email", session.user.email)
      .single()

    if (adminResponse.error) {
      // If error, sign out and stay on login page
      await supabase.auth.signOut()
      return res
    }

    const adminUser = adminResponse.data

    // If super admin, redirect to admin dashboard
    if (adminUser.is_super_admin) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    }

    // If company admin, get company slug and redirect to company dashboard
    if (adminUser.company_id) {
      const companyResponse = await supabase.from("companies").select("slug").eq("id", adminUser.company_id).single()

      if (!companyResponse.error && companyResponse.data) {
        const companySlug = companyResponse.data.slug
        return NextResponse.redirect(new URL(`/${companySlug}/dashboard`, req.url))
      }
    }
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
}
