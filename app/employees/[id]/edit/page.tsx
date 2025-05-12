import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { EmployeeForm } from "@/components/employee-form"

export const metadata: Metadata = {
  title: "Edit Employee | Payroll Management System",
}

export default async function EditEmployeePage({
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit Employee</h1>
      <div className="mx-auto max-w-2xl">
        <EmployeeForm employee={employee} />
      </div>
    </div>
  )
}
