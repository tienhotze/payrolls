import type { Metadata } from "next"
import { createServerClient } from "@/lib/supabase/server"
import { PayslipForm } from "@/components/payslip-form"

export const metadata: Metadata = {
  title: "Create Payslip | Payroll Management System",
}

export default async function NewPayslipPage({
  searchParams,
}: {
  searchParams: { employee?: string }
}) {
  const supabase = createServerClient()

  // Fetch all employees for the dropdown
  const { data: employees, error } = await supabase
    .from("employees")
    .select("id, first_name, last_name, employment_type, hourly_rate, monthly_salary, contractual_hours_per_week")
    .order("last_name", { ascending: true })

  if (error) {
    console.error("Error fetching employees:", error)
  }

  // If employee ID is provided in the URL, fetch that employee
  let selectedEmployee = null
  if (searchParams.employee) {
    const { data } = await supabase.from("employees").select("*").eq("id", searchParams.employee).single()

    selectedEmployee = data
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Payslip</h1>
        <p className="text-muted-foreground">Generate a new payslip for an employee.</p>
      </div>

      <div className="mx-auto max-w-3xl">
        <PayslipForm employees={employees || []} selectedEmployee={selectedEmployee} />
      </div>
    </div>
  )
}
