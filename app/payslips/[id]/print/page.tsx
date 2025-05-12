import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { PayslipPrintView } from "@/components/payslip-print-view"

export default async function PayslipPrintPage({
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

  return <PayslipPrintView payslip={payslip} />
}
