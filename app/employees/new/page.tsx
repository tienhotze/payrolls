import type { Metadata } from "next"
import { EmployeeForm } from "@/components/employee-form"

export const metadata: Metadata = {
  title: "Add Employee | Payroll Management System",
}

export default function NewEmployeePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Employee</h1>
        <p className="text-muted-foreground">Create a new employee record in the system.</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <EmployeeForm />
      </div>
    </div>
  )
}
