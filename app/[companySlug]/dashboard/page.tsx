"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Users, FileText, Calendar, DollarSign, LogOut } from "lucide-react"
import Link from "next/link"

export default function CompanyDashboard({ params }) {
  const { companySlug } = params
  const [user, setUser] = useState(null)
  const [company, setCompany] = useState(null)
  const [stats, setStats] = useState({
    employees: 0,
    payslips: 0,
    workRecords: 0,
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
          router.push(`/${companySlug}/login`)
          return
        }

        // Get company info
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .eq("slug", companySlug)
          .eq("active", true)
          .single()

        if (companyError || !companyData) {
          toast({
            title: "Company not found",
            description: "The requested company does not exist or is not active",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        // Get user info
        const { data: userData, error: userError } = await supabase
          .from("admin_users")
          .select("*")
          .eq("email", session.user.email)
          .single()

        if (userError || !userData) {
          toast({
            title: "User not found",
            description: "Your user account could not be found",
            variant: "destructive",
          })
          await supabase.auth.signOut()
          router.push(`/${companySlug}/login`)
          return
        }

        // Check if user belongs to this company
        if (userData.company_id !== companyData.id) {
          toast({
            title: "Access denied",
            description: "You don't have access to this company",
            variant: "destructive",
          })
          await supabase.auth.signOut()
          router.push(`/${companySlug}/login`)
          return
        }

        setUser(userData)
        setCompany(companyData)

        // Get company-specific stats from the company schema
        // In a real implementation, you would query the company-specific schema
        // For now, we'll use mock data
        setStats({
          employees: 0,
          payslips: 0,
          workRecords: 0,
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
  }, [companySlug, router, supabase, toast])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push(`/${companySlug}/login`)
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
            <h1 className="text-2xl font-bold">{company.name} Dashboard</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.employees}</div>
              <p className="text-xs text-muted-foreground">Total employees</p>
              <Button asChild className="w-full mt-4" variant="outline" size="sm">
                <Link href={`/${companySlug}/employees`}>Manage Employees</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Payslips</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.payslips}</div>
              <p className="text-xs text-muted-foreground">Total payslips</p>
              <Button asChild className="w-full mt-4" variant="outline" size="sm">
                <Link href={`/${companySlug}/payslips`}>Manage Payslips</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Work Records</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.workRecords}</div>
              <p className="text-xs text-muted-foreground">Total work records</p>
              <Button asChild className="w-full mt-4" variant="outline" size="sm">
                <Link href={`/${companySlug}/work-records`}>View Work Records</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Payroll</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground">Total payroll this month</p>
              <Button asChild className="w-full mt-4" variant="outline" size="sm">
                <Link href={`/${companySlug}/reports`}>View Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
