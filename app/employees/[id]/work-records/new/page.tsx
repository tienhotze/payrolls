import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { WorkRecordForm } from "@/components/work-record-form"

export const metadata: Metadata = {
  title: "Add Work Record | Payroll Management System",
}

export default async function NewWorkRecordPage({
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

  // Fetch all employees for the dropdown (in case we need to change the employee)
  const { data: employees } = await supabase
    .from("employees")
    .select("id, first_name, last_name")
    .order("last_name", { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Work Record</h1>
        <p className="text-muted-foreground">
          Record work hours for {employee.first_name} {employee.last_name}.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <WorkRecordForm employees={employees || []} selectedEmployee={employee} />
      </div>
    </div>
  )
}
