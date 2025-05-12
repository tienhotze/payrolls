import type { Metadata } from "next"
import Link from "next/link"
import { Building, Plus, Users } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Admin Dashboard | Payroll Management System",
}

export default async function AdminDashboardPage() {
  const supabase = createServerClient()

  // Get company count
  const { count: companyCount } = await supabase.from("companies").select("*", { count: "exact", head: true })

  // Get admin users count
  const { count: adminCount } = await supabase.from("admin_users").select("*", { count: "exact", head: true })

  // Get total employees count across all companies
  const { count: employeeCount } = await supabase.from("employees").select("*", { count: "exact", head: true })

  // Get recent companies
  const { data: recentCompanies } = await supabase
    .from("companies")
    .select(`
      id,
      name,
      slug,
      created_at,
      admin_users (
        id,
        first_name,
        last_name,
        email,
        mobile_phone
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/admin/companies/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/users/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Admin User
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companyCount || 0}</div>
            <p className="text-xs text-muted-foreground">Manage your client companies</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/admin/companies">View All Companies</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admin Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount || 0}</div>
            <p className="text-xs text-muted-foreground">Manage system administrators</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/admin/users">View All Admins</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeCount || 0}</div>
            <p className="text-xs text-muted-foreground">Across all companies</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Recent Companies</h2>
        {recentCompanies && recentCompanies.length > 0 ? (
          <div className="rounded-md border">
            <div className="grid grid-cols-4 gap-4 p-4 font-medium">
              <div>Company Name</div>
              <div>Admin Name</div>
              <div>Admin Contact</div>
              <div className="text-right">Actions</div>
            </div>
            {recentCompanies.map((company: any) => {
              const admin = company.admin_users?.[0] || {}
              return (
                <div key={company.id} className="grid grid-cols-4 gap-4 border-t p-4">
                  <div>{company.name}</div>
                  <div>{admin.first_name ? `${admin.first_name} ${admin.last_name}` : "No admin assigned"}</div>
                  <div>
                    {admin.email && <div>{admin.email}</div>}
                    {admin.mobile_phone && <div>{admin.mobile_phone}</div>}
                  </div>
                  <div className="flex justify-end items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/companies/${company.id}`}>View</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/companies/${company.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-md border p-8 text-center">
            <h3 className="text-lg font-medium">No companies yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new company.</p>
            <Button className="mt-4" asChild>
              <Link href="/admin/companies/new">Add Company</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
