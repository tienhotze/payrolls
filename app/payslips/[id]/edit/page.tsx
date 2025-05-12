import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { PayslipForm } from "@/components/payslip-form"

export const metadata: Metadata = {
  title: "Edit Payslip | Payroll Management System",
}

export default async function EditPayslipPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerClient()

  // Fetch payslip details
  const { data: payslip, error: payslipError } = await supabase
    .from("payslips")
    .select("*")
    .eq("id", params.id)
    .single()

  if (payslipError || !payslip) {
    notFound()
  }

  // Fetch all employees for the dropdown
  const { data: employees, error: employeesError } = await supabase
    .from("employees")
    .select("id, first_name, last_name, employment_type, hourly_rate, monthly_salary, contractual_hours_per_week")
    .order("last_name", { ascending: true })

  if (employeesError) {
    console.error("Error fetching employees:", employeesError)
  }

  // Fetch the employee for this payslip
  const { data: employee } = await supabase.from("employees").select("*").eq("id", payslip.employee_id).single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Payslip</h1>
        <p className="text-muted-foreground">Update payslip details.</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <PayslipForm employees={employees || []} selectedEmployee={employee} payslip={payslip} />
      </div>
    </div>
  )
}
