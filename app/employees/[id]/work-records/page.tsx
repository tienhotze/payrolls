import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Plus } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import { formatDate } from "@/lib/utils"
import { aggregateWorkHours } from "@/lib/work-hours-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkHoursSummary } from "@/components/work-hours-summary"

export const metadata: Metadata = {
  title: "Work Records | Payroll Management System",
}

export default async function EmployeeWorkRecordsPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerClient()

  // Fetch employee details
  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("*")
    .eq("id", params.id)
    .single()

  if (employeeError || !employee) {
    notFound()
  }

  // Fetch work records for this employee
  const { data: workRecords, error: recordsError } = await supabase
    .from("work_records")
    .select("*")
    .eq("employee_id", params.id)
    .order("work_date", { ascending: false })

  if (recordsError) {
    console.error("Error fetching work records:", recordsError)
  }

  // Aggregate work hours
  const aggregatedHours = aggregateWorkHours(workRecords || [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Work Records: {employee.first_name} {employee.last_name}
        </h1>
        <Button asChild>
          <Link href={`/employees/${params.id}/work-records/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Work Record
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="records" className="space-y-4">
        <TabsList>
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          {workRecords && workRecords.length > 0 ? (
            <div className="rounded-md border">
              <div className="grid grid-cols-6 gap-4 p-4 font-medium">
                <div>Date</div>
                <div>Scheduled Hours</div>
                <div>Break Time</div>
                <div>Payable Hours</div>
                <div>Type</div>
                <div>Actions</div>
              </div>
              {workRecords.map((record) => (
                <div key={record.id} className="grid grid-cols-6 gap-4 border-t p-4">
                  <div>{formatDate(record.work_date)}</div>
                  <div>{record.scheduled_hours || 0} hrs</div>
                  <div>{record.break_time_minutes || 0} mins</div>
                  <div>{record.payable_hours || 0} hrs</div>
                  <div>
                    {record.is_holiday && (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 mr-1">
                        Holiday
                      </span>
                    )}
                    {record.is_overtime && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        Overtime
                      </span>
                    )}
                  </div>
                  <div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/employees/${params.id}/work-records/${record.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border p-8 text-center">
              <h3 className="text-lg font-medium">No work records yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Get started by adding a new work record.</p>
              <Button className="mt-4" asChild>
                <Link href={`/employees/${params.id}/work-records/new`}>Add Work Record</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="summary">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Summary</CardTitle>
                <CardDescription>Work hours by week</CardDescription>
              </CardHeader>
              <CardContent>
                <WorkHoursSummary data={aggregatedHours.byWeek} type="week" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Summary</CardTitle>
                <CardDescription>Work hours by month</CardDescription>
              </CardHeader>
              <CardContent>
                <WorkHoursSummary data={aggregatedHours.byMonth} type="month" />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Yearly Summary</CardTitle>
                <CardDescription>Work hours by year</CardDescription>
              </CardHeader>
              <CardContent>
                <WorkHoursSummary data={aggregatedHours.byYear} type="year" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
