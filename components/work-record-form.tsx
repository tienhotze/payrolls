"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { getSupabaseClient } from "@/lib/supabase/client"
import { calculateBreakTime, calculatePayableHours, createWorkHoursData } from "@/lib/work-hours-utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

const workRecordFormSchema = z.object({
  employee_id: z.string({
    required_error: "Please select an employee.",
  }),
  work_date: z.date({
    required_error: "Please select a date.",
  }),
  scheduled_hours: z.coerce.number().min(0, {
    message: "Scheduled hours must be a positive number.",
  }),
  is_holiday: z.boolean().default(false),
  is_overtime: z.boolean().default(false),
  notes: z.string().optional(),
})

type WorkRecordFormValues = z.infer<typeof workRecordFormSchema>

interface WorkRecordFormProps {
  employees: any[]
  selectedEmployee?: any
  workRecord?: any
}

export function WorkRecordForm({ employees, selectedEmployee, workRecord }: WorkRecordFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [breakTimeMinutes, setBreakTimeMinutes] = useState(workRecord?.break_time_minutes || 0)
  const [payableHours, setPayableHours] = useState(workRecord?.payable_hours || 0)

  const defaultValues: Partial<WorkRecordFormValues> = {
    employee_id: selectedEmployee?.id?.toString() || workRecord?.employee_id?.toString() || "",
    work_date: workRecord?.work_date ? new Date(workRecord.work_date) : new Date(),
    scheduled_hours: workRecord?.scheduled_hours || 0,
    is_holiday: workRecord?.is_holiday || false,
    is_overtime: workRecord?.is_overtime || false,
    notes: workRecord?.notes || "",
  }

  const form = useForm<WorkRecordFormValues>({
    resolver: zodResolver(workRecordFormSchema),
    defaultValues,
  })

  const watchScheduledHours = form.watch("scheduled_hours")

  // Update break time and payable hours when scheduled hours change
  const updateBreakTimeAndPayableHours = (scheduledHours: number) => {
    const breakTime = calculateBreakTime(scheduledHours)
    setBreakTimeMinutes(breakTime)

    const payable = calculatePayableHours(scheduledHours, breakTime)
    setPayableHours(payable)
  }

  // Call the update function when scheduled hours change
  if (watchScheduledHours !== undefined) {
    updateBreakTimeAndPayableHours(watchScheduledHours)
  }

  async function onSubmit(data: WorkRecordFormValues) {
    setIsLoading(true)

    try {
      const supabase = getSupabaseClient()

      // Calculate break time and payable hours
      const breakTime = calculateBreakTime(data.scheduled_hours)
      const payable = calculatePayableHours(data.scheduled_hours, breakTime)

      // Create work hours data structure
      const workHoursData = createWorkHoursData(data.work_date, data.scheduled_hours)

      // Prepare record data
      const recordData = {
        ...data,
        employee_id: Number.parseInt(data.employee_id),
        work_date: data.work_date.toISOString().split("T")[0],
        hours_worked: payable, // Set hours_worked to payable hours
        scheduled_hours: data.scheduled_hours,
        break_time_minutes: breakTime,
        payable_hours: payable,
        work_hours_data: workHoursData.data,
      }

      if (workRecord?.id) {
        // Update existing work record
        const { error } = await supabase.from("work_records").update(recordData).eq("id", workRecord.id)

        if (error) throw error

        toast({
          title: "Work record updated",
          description: "The work record has been updated successfully.",
        })
      } else {
        // Create new work record
        const { error } = await supabase.from("work_records").insert(recordData)

        if (error) throw error

        toast({
          title: "Work record added",
          description: "The new work record has been added successfully.",
        })
      }

      // Update work hours summary
      await updateWorkHoursSummary(
        Number.parseInt(data.employee_id),
        data.work_date,
        data.scheduled_hours,
        breakTime,
        payable,
      )

      router.push(`/employees/${data.employee_id}/work-records`)
      router.refresh()
    } catch (error) {
      console.error("Error saving work record:", error)
      toast({
        title: "Error",
        description: "There was an error saving the work record. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function updateWorkHoursSummary(
    employeeId: number,
    date: Date,
    scheduledHours: number,
    breakTimeMinutes: number,
    payableHours: number,
  ) {
    try {
      const supabase = getSupabaseClient()

      const year = date.getFullYear()
      const month = date.getMonth() + 1 // 1-12
      const week = Math.ceil((date.getDate() + new Date(year, month - 1, 1).getDay()) / 7) // 1-5

      // Check if a summary record already exists
      const { data: existingSummary } = await supabase
        .from("work_hours_summary")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("year", year)
        .eq("month", month)
        .eq("week", week)
        .single()

      if (existingSummary) {
        // Update existing summary
        await supabase
          .from("work_hours_summary")
          .update({
            scheduled_hours_total: existingSummary.scheduled_hours_total + scheduledHours,
            break_time_minutes_total: existingSummary.break_time_minutes_total + breakTimeMinutes,
            payable_hours_total: existingSummary.payable_hours_total + payableHours,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSummary.id)
      } else {
        // Create new summary
        await supabase.from("work_hours_summary").insert({
          employee_id: employeeId,
          year,
          month,
          week,
          scheduled_hours_total: scheduledHours,
          break_time_minutes_total: breakTimeMinutes,
          payable_hours_total: payableHours,
        })
      }
    } catch (error) {
      console.error("Error updating work hours summary:", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="employee_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee</FormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                  disabled={!!selectedEmployee}
                >
                  <option value="">Select an employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id.toString()}>
                      {employee.first_name} {employee.last_name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="work_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Work Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scheduled_hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scheduled Hours</FormLabel>
              <FormControl>
                <Input type="number" step="0.5" {...field} />
              </FormControl>
              <FormDescription>Total scheduled work hours for this day.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <FormLabel>Break Time (minutes)</FormLabel>
            <div className="h-10 px-3 py-2 rounded-md border border-input bg-muted">{breakTimeMinutes}</div>
            <p className="text-sm text-muted-foreground mt-1">Automatically calculated based on scheduled hours.</p>
          </div>

          <div>
            <FormLabel>Payable Hours</FormLabel>
            <div className="h-10 px-3 py-2 rounded-md border border-input bg-muted">{payableHours.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-1">Scheduled hours minus break time.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="is_holiday"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Holiday</FormLabel>
                  <FormDescription>Check if this work day is a public holiday.</FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_overtime"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Overtime</FormLabel>
                  <FormDescription>Check if these hours are overtime.</FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Add any additional notes here..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : workRecord?.id ? "Update Record" : "Add Record"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
