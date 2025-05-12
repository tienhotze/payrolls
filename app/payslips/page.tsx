import type { Metadata } from "next"
import Link from "next/link"
import { FileText, Plus } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DeletePayslipButton } from "@/components/delete-payslip-button"

export const metadata: Metadata = {
  title: "Payslips | Payroll Management System",
}

export default async function PayslipsPage() {
  const supabase = createServerClient()

  const { data: payslips, error } = await supabase
    .from("payslips")
    .select(`
      *,
      employees (
        id,
        first_name,
        last_name,
        employment_type
      )
    `)
    .order("payment_date", { ascending: false })

  if (error) {
    console.error("Error fetching payslips:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Payslips</h1>
        <Button asChild>
          <Link href="/payslips/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Payslip
          </Link>
        </Button>
      </div>

      {payslips && payslips.length > 0 ? (
        <div className="rounded-md border">
          <div className="grid grid-cols-7 gap-4 p-4 font-medium">
            <div>Employee</div>
            <div>Type</div>
            <div>Period</div>
            <div>Payment Date</div>
            <div>Amount</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>
          {payslips.map((payslip: any) => (
            <div key={payslip.id} className="grid grid-cols-7 gap-4 border-t p-4 hover:bg-muted/50">
              <div>
                <Link href={`/employees/${payslip.employees.id}`} className="hover:underline">
                  {payslip.employees.first_name} {payslip.employees.last_name}
                </Link>
              </div>
              <div className="capitalize">{payslip.employees.employment_type.replace("-", " ")}</div>
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
  )
}
