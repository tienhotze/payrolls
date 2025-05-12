"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [companySlug, setCompanySlug] = useState("")
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const handleSuperAdminLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Check if user is a super admin
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("is_super_admin")
        .eq("email", email)
        .single()

      if (adminError || !adminUser || !adminUser.is_super_admin) {
        toast({
          title: "Access denied",
          description: "Only super administrators can access this area",
          variant: "destructive",
        })
        // Sign out if not a super admin
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // Redirect to admin dashboard
      router.push("/admin/dashboard")
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleCompanyAccess = (e) => {
    e.preventDefault()
    if (!companySlug) {
      toast({
        title: "Company required",
        description: "Please enter a company name",
        variant: "destructive",
      })
      return
    }

    // Navigate to company login page
    router.push(`/${companySlug.toLowerCase().trim()}/login`)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Payroll Management System</h1>
          <p className="mt-2 text-gray-600">Manage your company payroll efficiently</p>
        </div>

        <div className="grid gap-6">
          {/* Super Admin Login */}
          <Card>
            <CardHeader>
              <CardTitle>Super Admin Login</CardTitle>
              <CardDescription>Login as a super administrator to manage all companies</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSuperAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login as Super Admin"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Company Access */}
          <Card>
            <CardHeader>
              <CardTitle>Company Access</CardTitle>
              <CardDescription>Enter your company name to access your payroll system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCompanyAccess} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="e.g., eh_immigration"
                    value={companySlug}
                    onChange={(e) => setCompanySlug(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" variant="outline" className="w-full">
                  Go to Company Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
