"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Building, Users, LogOut } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    companies: 0,
    admins: 0,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Check if user is logged in
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/")
          return
        }

        // Get user info
        const { data: userData, error: userError } = await supabase
          .from("admin_users")
          .select("*")
          .eq("email", session.user.email)
          .single()

        if (userError || !userData || !userData.is_super_admin) {
          toast({
            title: "Access denied",
            description: "Only super administrators can access this area",
            variant: "destructive",
          })
          await supabase.auth.signOut()
          router.push("/")
          return
        }

        setUser(userData)

        // Get stats
        const { data: companies, error: companiesError } = await supabase
          .from("companies")
          .select("id")
          .eq("active", true)

        const { data: admins, error: adminsError } = await supabase
          .from("admin_users")
          .select("id")
          .eq("is_active", true)

        setStats({
          companies: companies?.length || 0,
          admins: admins?.length || 0,
        })
      } catch (error) {
        console.error("Error loading dashboard:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router, supabase, toast])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
            <p className="text-sm text-gray-500">
              Welcome, {user.first_name} {user.last_name}
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.companies}</div>
              <p className="text-xs text-muted-foreground">Total active companies</p>
              <Button asChild className="w-full mt-4" variant="outline" size="sm">
                <Link href="/admin/companies">Manage Companies</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Administrators</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.admins}</div>
              <p className="text-xs text-muted-foreground">Total active administrators</p>
              <Button asChild className="w-full mt-4" variant="outline" size="sm">
                <Link href="/admin/users">Manage Administrators</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for system administration</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline">
              <Link href="/admin/companies/new">
                <Building className="h-4 w-4 mr-2" />
                Add New Company
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/users/new">
                <Users className="h-4 w-4 mr-2" />
                Add New Administrator
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/settings">Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
