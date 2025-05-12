import type { Metadata } from "next"
import Link from "next/link"
import { Building, FileText, Plus, Users } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DeletePayslipButton } from "@/components/delete-payslip-button"

export const metadata: Metadata = {
  title: "Dashboard | Payroll Management System",
}

export default async function DashboardPage() {
  const supabase = createServerClient()

  // Get employee count
  const { count: employeeCount } = await supabase.from("employees").select("*", { count: "exact", head: true })

  // Get payslip count
  const { count: payslipCount } = await supabase.from("payslips").select("*", { count: "exact", head: true })

  // Get total paid amount this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: payslips } = await supabase
    .from("payslips")
    .select("gross_amount")
    .gte("payment_date", startOfMonth.toISOString())

  const totalPaid = payslips?.reduce((sum, payslip) => sum + Number(payslip.gross_amount), 0) || 0

  // Get recent payslips
  const { data: recentPayslips } = await supabase
    .from("payslips")
    .select(`
      id,
      work_period_start,
      work_period_end,
      payment_date,
      gross_amount,
      status,
      employees (
        id,
        first_name,
        last_name
      )
    `)
    .order("payment_date", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/employees/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Link>
          </Button>
          <Button asChild>
            <Link href="/payslips/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Payslip
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeCount || 0}</div>
            <p className="text-xs text-muted-foreground">Manage your workforce</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/employees">View All Employees</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payslips</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payslipCount || 0}</div>
            <p className="text-xs text-muted-foreground">Track payment history</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/payslips">View All Payslips</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid This Month</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">Monthly payroll expenses</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Recent Payslips</h2>
        {recentPayslips && recentPayslips.length > 0 ? (
          <div className="rounded-md border">
            <div className="grid grid-cols-6 gap-4 p-4 font-medium">
              <div>Employee</div>
              <div>Period</div>
              <div>Payment Date</div>
              <div>Amount</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>
            {recentPayslips.map((payslip: any) => (
              <div key={payslip.id} className="grid grid-cols-6 gap-4 border-t p-4">
                <div>
                  {payslip.employees.first_name} {payslip.employees.last_name}
                </div>
                <div>
                  {formatDate(payslip.work_period_start)} - {formatDate(payslip.work_period_end)}
                </div>
                <div>{formatDate(payslip.payment_date)}</div>
                <div>{formatCurrency(payslip.gross_amount)}</div>
                <div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      payslip.status === "paid"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : payslip.status === "issued"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                    }`}
                  >
                    {payslip.status.charAt(0).toUpperCase() + payslip.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-end items-center gap-2">
                  <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                    <Link href={`/payslips/${payslip.id}`}>
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">View payslip</span>
                    </Link>
                  </Button>
                  <DeletePayslipButton payslipId={payslip.id} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border p-8 text-center">
            <h3 className="text-lg font-medium">No payslips yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new payslip.</p>
            <Button className="mt-4" asChild>
              <Link href="/payslips/new">Create Payslip</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
