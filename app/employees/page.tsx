import type { Metadata } from "next"
import Link from "next/link"
import { Plus, Pencil } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteEmployeeButton } from "@/components/delete-employee-button"

export const metadata: Metadata = {
  title: "Employees | Payroll Management System",
}

export default async function EmployeesPage() {
  const supabase = createServerClient()

  const { data: employees, error } = await supabase
    .from("employees")
    .select("*")
    .order("last_name", { ascending: true })

  if (error) {
    console.error("Error fetching employees:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
        <Button asChild>
          <Link href="/employees/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Link>
        </Button>
      </div>

      {employees && employees.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {employees.map((employee) => (
            <Card key={employee.id} className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>
                  {employee.first_name} {employee.last_name}
                </CardTitle>
                <CardDescription>{employee.email || "No email provided"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Type:</div>
                  <div className="font-medium capitalize">{employee.employment_type.replace("-", " ")}</div>

                  {employee.employment_type === "full-time" && (
                    <>
                      <div className="text-muted-foreground">Monthly Salary:</div>
                      <div className="font-medium">
                        {employee.monthly_salary ? formatCurrency(employee.monthly_salary) : "N/A"}
                      </div>

                      <div className="text-muted-foreground">Weekly Hours:</div>
                      <div className="font-medium">{employee.contractual_hours_per_week || "N/A"}</div>
                    </>
                  )}

                  {employee.employment_type === "part-time" && (
                    <>
                      <div className="text-muted-foreground">Hourly Rate:</div>
                      <div className="font-medium">
                        {employee.hourly_rate ? formatCurrency(employee.hourly_rate) : "N/A"}
                      </div>
                    </>
                  )}

                  <div className="text-muted-foreground">Mobile:</div>
                  <div className="font-medium">{employee.mobile_phone || "N/A"}</div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/employees/${employee.id}`}>View Details</Link>
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href={`/employees/${employee.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                  <DeleteEmployeeButton employeeId={employee.id} />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border p-8 text-center">
          <h3 className="text-lg font-medium">No employees yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Get started by adding a new employee.</p>
          <Button className="mt-4" asChild>
            <Link href="/employees/new">Add Employee</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
