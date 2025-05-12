import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { WorkRecordForm } from "@/components/work-record-form"

export const metadata: Metadata = {
  title: "Edit Work Record | Payroll Management System",
}

export default async function EditWorkRecordPage({
  params,
}: {
  params: { id: string; recordId: string }
}) {
  const supabase = createServerClient()

  // Fetch work record details
  const { data: workRecord, error: recordError } = await supabase
    .from("work_records")
    .select("*")
    .eq("id", params.recordId)
    .single()

  if (recordError || !workRecord) {
    notFound()
  }

  // Fetch employee details
  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("*")
    .eq("id", params.id)
    .single()

  if (employeeError || !employee) {
    notFound()
  }

  // Fetch all employees for the dropdown
  const { data: employees } = await supabase
    .from("employees")
    .select("id, first_name, last_name")
    .order("last_name", { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Work Record</h1>
        <p className="text-muted-foreground">
          Update work record for {employee.first_name} {employee.last_name}.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <WorkRecordForm employees={employees || []} selectedEmployee={employee} workRecord={workRecord} />
      </div>
    </div>
  )
}
