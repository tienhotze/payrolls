import React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Download, Pencil } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Payslip Details | Payroll Management System",
}

export default async function PayslipDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerClient()

  // Fetch payslip details with employee information
  const { data: payslip, error } = await supabase
    .from("payslips")
    .select(`
      *,
      employees (
        id,
        first_name,
        last_name,
        email,
        mobile_phone,
        employment_type,
        hourly_rate,
        monthly_salary,
        contractual_hours_per_week
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !payslip) {
    notFound()
  }

  // Calculate basic pay
  const basicPay =
    payslip.employees.employment_type === "full-time"
      ? payslip.employees.monthly_salary
      : (payslip.regular_hours || 0) * payslip.employees.hourly_rate

  // Calculate overtime pay
  const overtimePay =
    payslip.employees.employment_type === "full-time"
      ? (payslip.employees.monthly_salary / (40 * 4.33)) * 1.5 * (payslip.overtime_hours || 0)
      : payslip.employees.hourly_rate * 1.5 * (payslip.overtime_hours || 0)

  // Calculate holiday pay
  const holidayPay =
    payslip.employees.employment_type === "full-time"
      ? (payslip.employees.monthly_salary / (40 * 4.33)) * 2 * (payslip.holiday_hours || 0)
      : payslip.employees.hourly_rate * 2 * (payslip.holiday_hours || 0)

  // Ensure allowances is an array
  const allowances = Array.isArray(payslip.allowances) ? payslip.allowances : []
  const totalAllowances = allowances.reduce((sum: number, allowance: any) => sum + (Number(allowance.amount) || 0), 0)

  // Ensure deductions is an array
  const deductions = Array.isArray(payslip.deductions) ? payslip.deductions : []
  const totalDeductions = deductions.reduce((sum: number, deduction: any) => sum + (Number(deduction.amount) || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Payslip #{payslip.id}</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/payslips/${params.id}/print`} target="_blank">
              <Download className="mr-2 h-4 w-4" />
              Print Payslip
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/payslips/${params.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Payslip
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
            <CardDescription>Details of the employee</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-1">
              <div className="text-sm font-medium text-muted-foreground">Name</div>
              <div>
                <Link href={`/employees/${payslip.employees.id}`} className="hover:underline">
                  {payslip.employees.first_name} {payslip.employees.last_name}
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="text-sm font-medium text-muted-foreground">Email</div>
              <div>{payslip.employees.email || "N/A"}</div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="text-sm font-medium text-muted-foreground">Mobile Phone</div>
              <div>{payslip.employees.mobile_phone || "N/A"}</div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="text-sm font-medium text-muted-foreground">Employment Type</div>
              <div className="capitalize">{payslip.employees.employment_type.replace("-", " ")}</div>
            </div>

            {payslip.employees.employment_type === "full-time" && (
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium text-muted-foreground">Monthly Salary</div>
                <div>{formatCurrency(payslip.employees.monthly_salary)}</div>
              </div>
            )}

            {payslip.employees.employment_type === "part-time" && (
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium text-muted-foreground">Hourly Rate</div>
                <div>{formatCurrency(payslip.employees.hourly_rate)}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payslip Details</CardTitle>
            <CardDescription>Payment information</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-1">
              <div className="text-sm font-medium text-muted-foreground">Work Period</div>
              <div>
                {formatDate(payslip.work_period_start)} - {formatDate(payslip.work_period_end)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="text-sm font-medium text-muted-foreground">Payment Date</div>
              <div>{formatDate(payslip.payment_date)}</div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="text-sm font-medium text-muted-foreground">Status</div>
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
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Payment Breakdown</h2>

        <div className="rounded-md border">
          <div className="grid grid-cols-2 gap-4 p-4">
            {payslip.employees.employment_type === "part-time" && payslip.regular_hours && (
              <>
                <div className="text-sm font-medium">Regular Hours</div>
                <div className="text-right">
                  {payslip.regular_hours} hours × {formatCurrency(payslip.employees.hourly_rate)} ={" "}
                  {formatCurrency(payslip.regular_hours * payslip.employees.hourly_rate)}
                </div>
              </>
            )}

            {payslip.employees.employment_type === "full-time" && (
              <>
                <div className="text-sm font-medium">Base Salary</div>
                <div className="text-right">{formatCurrency(payslip.employees.monthly_salary)}</div>
              </>
            )}

            {payslip.overtime_hours > 0 && (
              <>
                <div className="text-sm font-medium">Overtime Pay</div>
                <div className="text-right">
                  {payslip.overtime_hours} hours = {formatCurrency(overtimePay)}
                </div>
              </>
            )}

            {payslip.holiday_hours > 0 && (
              <>
                <div className="text-sm font-medium">Holiday Pay</div>
                <div className="text-right">
                  {payslip.holiday_hours} hours = {formatCurrency(holidayPay)}
                </div>
              </>
            )}

            {allowances.length > 0 && (
              <>
                <div className="text-sm font-medium">Allowances</div>
                <div className="text-right">{formatCurrency(totalAllowances)}</div>
              </>
            )}

            {allowances.map((allowance: any, index: number) => (
              <React.Fragment key={index}>
                <div className="text-sm font-medium pl-4">- {allowance.name}</div>
                <div className="text-right">{formatCurrency(Number(allowance.amount) || 0)}</div>
              </React.Fragment>
            ))}

            <div className="border-t pt-2 text-base font-medium">Gross Pay</div>
            <div className="border-t pt-2 text-right text-base font-medium">{formatCurrency(payslip.gross_amount)}</div>

            {deductions.length > 0 && (
              <>
                <div className="text-sm font-medium">Deductions</div>
                <div className="text-right">{formatCurrency(totalDeductions)}</div>
              </>
            )}

            {deductions.map((deduction: any, index: number) => (
              <React.Fragment key={index}>
                <div className="text-sm font-medium pl-4">- {deduction.name}</div>
                <div className="text-right">{formatCurrency(Number(deduction.amount) || 0)}</div>
              </React.Fragment>
            ))}

            <div className="border-t pt-2 text-lg font-bold">Net Pay</div>
            <div className="border-t pt-2 text-right text-lg font-bold">{formatCurrency(payslip.net_amount)}</div>

            {payslip.employer_cpf_contribution && (
              <>
                <div className="text-sm font-medium pt-4">Employer's CPF Contribution</div>
                <div className="text-right pt-4">{formatCurrency(payslip.employer_cpf_contribution)}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
