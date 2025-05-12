import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { FileText, Pencil, Clock, Plus } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DeletePayslipButton } from "@/components/delete-payslip-button"
import { DeleteEmployeeButton } from "@/components/delete-employee-button"
import { EditableEmployeeDetails } from "@/components/editable-employee-details"

export const metadata: Metadata = {
  title: "Employee Details | Payroll Management System",
}

export default async function EmployeeDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerClient()

  // Fetch employee details
  const { data: employee, error } = await supabase.from("employees").select("*").eq("id", params.id).single()

  if (error || !employee) {
    notFound()
  }

  // Fetch employee's payslips
  const { data: payslips } = await supabase
    .from("payslips")
    .select("*")
    .eq("employee_id", params.id)
    .order("payment_date", { ascending: false })

  // Fetch employee's work records
  const { data: workRecords } = await supabase
    .from("work_records")
    .select("*")
    .eq("employee_id", params.id)
    .order("work_date", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {employee.first_name} {employee.last_name}
        </h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/employees/${params.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Employee
            </Link>
          </Button>
          <DeleteEmployeeButton employeeId={params.id} variant="destructive" showIcon={true} redirectTo="/employees" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
            <CardDescription>Personal and employment details</CardDescription>
          </CardHeader>
          <CardContent>
            <EditableEmployeeDetails employee={employee} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Manage this employee</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button asChild className="w-full">
              <Link href={`/payslips/new?employee=${params.id}`}>
                <FileText className="mr-2 h-4 w-4" />
                Create New Payslip
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href={`/employees/${params.id}/work-records`}>
                <Clock className="mr-2 h-4 w-4" />
                Manage Work Records
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href={`/employees/${params.id}/work-records/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Work Record
              </Link>
            </Button>
            <DeleteEmployeeButton
              employeeId={params.id}
              variant="destructive"
              className="w-full"
              showIcon={true}
              redirectTo="/employees"
            >
              Delete Employee
            </DeleteEmployeeButton>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Recent Work Records</h2>
          <Button asChild>
            <Link href={`/employees/${params.id}/work-records`}>
              <Clock className="mr-2 h-4 w-4" />
              View All Records
            </Link>
          </Button>
        </div>

        {workRecords && workRecords.length > 0 ? (
          <div className="rounded-md border">
            <div className="grid grid-cols-5 gap-4 p-4 font-medium">
              <div>Date</div>
              <div>Scheduled Hours</div>
              <div>Break Time</div>
              <div>Payable Hours</div>
              <div>Type</div>
            </div>
            {workRecords.map((record) => (
              <div key={record.id} className="grid grid-cols-5 gap-4 border-t p-4">
                <div>{formatDate(record.work_date)}</div>
                <div>{record.scheduled_hours || 0} hrs</div>
                <div>{record.break_time_minutes || 0} mins</div>
                <div>{record.payable_hours || 0} hrs</div>
                <div>
                  {record.is_holiday && (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 mr-1">
                      Holiday
                    </span>
                  )}
                  {record.is_overtime && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      Overtime
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border p-8 text-center">
            <h3 className="text-lg font-medium">No work records yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Record work hours for this employee.</p>
            <Button className="mt-4" asChild>
              <Link href={`/employees/${params.id}/work-records/new`}>Add Work Record</Link>
            </Button>
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Payslips</h2>
          <Button asChild>
            <Link href={`/payslips/new?employee=${params.id}`}>
              <FileText className="mr-2 h-4 w-4" />
              Create New Payslip
            </Link>
          </Button>
        </div>

        {payslips && payslips.length > 0 ? (
          <div className="rounded-md border">
            <div className="grid grid-cols-6 gap-4 p-4 font-medium">
              <div>Period</div>
              <div>Payment Date</div>
              <div>Gross Amount</div>
              <div>Net Amount</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>
            {payslips.map((payslip) => (
              <div key={payslip.id} className="grid grid-cols-6 gap-4 border-t p-4">
                <div>
                  {formatDate(payslip.work_period_start)} - {formatDate(payslip.work_period_end)}
                </div>
                <div>{formatDate(payslip.payment_date)}</div>
                <div>{formatCurrency(payslip.gross_amount)}</div>
                <div>{formatCurrency(payslip.net_amount)}</div>
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
            <p className="mt-1 text-sm text-muted-foreground">Create a new payslip for this employee.</p>
            <Button className="mt-4" asChild>
              <Link href={`/payslips/new?employee=${params.id}`}>Create Payslip</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
