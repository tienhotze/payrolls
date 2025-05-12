import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, Users, FileText, Settings } from "lucide-react"

export const metadata: Metadata = {
  title: "Admin Dashboard | Payroll System",
  description: "Super admin dashboard for the payroll system",
}

export default function AdminDashboardPage() {
  // Mock data for the dashboard
  const stats = {
    companies: 3,
    adminUsers: 4,
    employees: 11,
    payslips: 6,
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.companies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.employees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Payslips</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.payslips}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Manage Companies</CardTitle>
            <CardDescription>Add, edit, and manage companies in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <Building className="h-12 w-12 text-primary mb-2" />
            <p className="text-sm text-muted-foreground">
              Create and manage companies, assign admins, and configure company settings.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/admin/companies">Manage Companies</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Users</CardTitle>
            <CardDescription>Add, edit, and manage admin users.</CardDescription>
          </CardHeader>
          <CardContent>
            <Users className="h-12 w-12 text-primary mb-2" />
            <p className="text-sm text-muted-foreground">
              Create and manage super admins and company admins with different access levels.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/admin/users">Manage Users</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>Configure system-wide settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Settings className="h-12 w-12 text-primary mb-2" />
            <p className="text-sm text-muted-foreground">
              Configure global settings, security options, and system preferences.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/admin/settings">System Settings</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
