"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Plus, Trash2, UserPlus } from "lucide-react"
import { format } from "date-fns"
import { getSupabaseClient } from "@/lib/supabase/client"
import { calculatePayForFullTime, calculatePayForPartTime, formatCurrency, formatPeriod } from "@/lib/utils"
import {
  getFirstDayOfCurrentMonth,
  getFirstDayOfPreviousMonth,
  getLastDayOfCurrentMonth,
  getLastDayOfPreviousMonth,
} from "@/lib/date-utils"
import type { WorkScheduleEntry } from "@/lib/work-hours-utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { WorkScheduleInput } from "@/components/work-schedule-input"

const payslipFormSchema = z.object({
  employee_id: z.string({
    required_error: "Please select an employee.",
  }),
  work_period_start: z.date({
    required_error: "Please select a start date.",
  }),
  work_period_end: z
    .date({
      required_error: "Please select an end date.",
    })
    .refine((date) => date > new Date(0), {
      message: "Please select an end date.",
    }),
  payment_date: z.date({
    required_error: "Please select a payment date.",
  }),
  regular_hours: z.coerce.number().optional(),
  overtime_hours: z.coerce.number().optional(),
  holiday_hours: z.coerce.number().optional(),
  status: z.enum(["draft", "issued", "paid"], {
    required_error: "Please select a status.",
  }),
  allowances: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      amount: z.coerce.number().min(0, "Amount must be a positive number"),
    }),
  ),
  deductions: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      amount: z.coerce.number().min(0, "Amount must be a positive number"),
    }),
  ),
})

type PayslipFormValues = z.infer<typeof payslipFormSchema>

interface PayslipFormProps {
  employees: any[]
  selectedEmployee?: any
  payslip?: any
}

// Special value for "Create employee" option
const CREATE_EMPLOYEE_OPTION = "create_new_employee"

export function PayslipForm({ employees, selectedEmployee, payslip }: PayslipFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEmployeeData, setSelectedEmployeeData] = useState<any>(selectedEmployee || null)
  const [calculatedPay, setCalculatedPay] = useState<{
    gross: number
    net: number
    employerCpf: number
  } | null>(null)
  const [workSchedules, setWorkSchedules] = useState<WorkScheduleEntry[]>([])

  // Parse allowances and deductions from payslip if they exist
  const payslipAllowances = payslip?.allowances
    ? Array.isArray(payslip.allowances)
      ? payslip.allowances
      : []
    : [{ name: "", amount: 0 }]

  const payslipDeductions = payslip?.deductions
    ? Array.isArray(payslip.deductions)
      ? payslip.deductions
      : []
    : [{ name: "", amount: 0 }]

  const defaultValues: Partial<PayslipFormValues> = {
    employee_id: selectedEmployee?.id?.toString() || payslip?.employee_id?.toString() || "",
    work_period_start: payslip?.work_period_start ? new Date(payslip.work_period_start) : new Date(),
    work_period_end: payslip?.work_period_end ? new Date(payslip.work_period_end) : new Date(),
    payment_date: payslip?.payment_date ? new Date(payslip.payment_date) : new Date(),
    regular_hours: payslip?.regular_hours || undefined,
    overtime_hours: payslip?.overtime_hours || undefined,
    holiday_hours: payslip?.holiday_hours || undefined,
    status: payslip?.status || "draft",
    allowances: payslipAllowances,
    deductions: payslipDeductions,
  }

  const form = useForm<PayslipFormValues>({
    resolver: zodResolver(payslipFormSchema),
    defaultValues,
  })

  const {
    fields: allowanceFields,
    append: appendAllowance,
    remove: removeAllowance,
  } = useFieldArray({
    control: form.control,
    name: "allowances",
  })

  const {
    fields: deductionFields,
    append: appendDeduction,
    remove: removeDeduction,
  } = useFieldArray({
    control: form.control,
    name: "deductions",
  })

  const watchEmployeeId = form.watch("employee_id")
  const watchRegularHours = form.watch("regular_hours")
  const watchOvertimeHours = form.watch("overtime_hours")
  const watchHolidayHours = form.watch("holiday_hours")
  const watchAllowances = form.watch("allowances")
  const watchDeductions = form.watch("deductions")
  const watchWorkPeriodStart = form.watch("work_period_start")
  const watchWorkPeriodEnd = form.watch("work_period_end")

  // Handle employee selection change
  const handleEmployeeChange = (value: string) => {
    if (value === CREATE_EMPLOYEE_OPTION) {
      // Redirect to create employee page
      router.push("/employees/new")
    } else {
      // Normal employee selection
      form.setValue("employee_id", value)
    }
  }

  // Update selected employee when employee_id changes
  useEffect(() => {
    if (watchEmployeeId && watchEmployeeId !== CREATE_EMPLOYEE_OPTION) {
      const employee = employees.find((e) => e.id.toString() === watchEmployeeId)
      setSelectedEmployeeData(employee || null)
    } else {
      setSelectedEmployeeData(null)
    }
  }, [watchEmployeeId, employees])

  // Calculate pay when relevant fields change
  useEffect(() => {
    if (selectedEmployeeData) {
      // Calculate total allowances
      const totalAllowances = watchAllowances.reduce((sum, allowance) => sum + (Number(allowance.amount) || 0), 0)

      // Calculate total deductions
      const totalDeductions = watchDeductions.reduce((sum, deduction) => sum + (Number(deduction.amount) || 0), 0)

      // Calculate total payable hours from work schedules
      const totalPayableHours = workSchedules.reduce((sum, schedule) => sum + schedule.payableHours, 0)

      if (selectedEmployeeData.employment_type === "full-time") {
        const result = calculatePayForFullTime(
          selectedEmployeeData.monthly_salary || 0,
          watchOvertimeHours || 0,
          watchHolidayHours || 0,
        )

        // Add allowances to gross
        const grossWithAllowances = result.gross + totalAllowances

        // Subtract deductions from net
        const netAfterDeductions = grossWithAllowances - totalDeductions

        // Calculate employer CPF (17% of gross for demonstration)
        const employerCpf = grossWithAllowances * 0.17

        setCalculatedPay({
          gross: grossWithAllowances,
          net: netAfterDeductions,
          employerCpf,
        })
      } else if (selectedEmployeeData.employment_type === "part-time") {
        // Use total payable hours from work schedules if available, otherwise use regular hours
        const hoursToUse = totalPayableHours > 0 ? totalPayableHours : watchRegularHours || 0

        const result = calculatePayForPartTime(
          selectedEmployeeData.hourly_rate || 10, // Default to S$10 if not set
          hoursToUse,
          watchOvertimeHours || 0,
          watchHolidayHours || 0,
        )

        // Add allowances to gross
        const grossWithAllowances = result.gross + totalAllowances

        // Subtract deductions from net
        const netAfterDeductions = grossWithAllowances - totalDeductions

        // Calculate employer CPF (17% of gross for demonstration)
        const employerCpf = grossWithAllowances * 0.17

        setCalculatedPay({
          gross: grossWithAllowances,
          net: netAfterDeductions,
          employerCpf,
        })
      }
    }
  }, [
    selectedEmployeeData,
    watchRegularHours,
    watchOvertimeHours,
    watchHolidayHours,
    watchAllowances,
    watchDeductions,
    workSchedules,
  ])

  // Handle work schedules change
  const handleWorkSchedulesChange = (schedules: WorkScheduleEntry[]) => {
    setWorkSchedules(schedules)

    // Update regular hours based on total payable hours
    const totalPayableHours = schedules.reduce((sum, schedule) => sum + schedule.payableHours, 0)
    if (totalPayableHours > 0) {
      form.setValue("regular_hours", totalPayableHours)
    }
  }

  // Handle setting period to previous month
  const handleSetPreviousMonth = () => {
    form.setValue("work_period_start", getFirstDayOfPreviousMonth())
    form.setValue("work_period_end", getLastDayOfPreviousMonth())
  }

  // Handle setting period to current month
  const handleSetCurrentMonth = () => {
    form.setValue("work_period_start", getFirstDayOfCurrentMonth())
    form.setValue("work_period_end", getLastDayOfCurrentMonth())
  }

  async function onSubmit(data: PayslipFormValues) {
    if (!calculatedPay) return

    setIsLoading(true)

    try {
      const supabase = getSupabaseClient()

      // Filter out empty allowances and deductions
      const filteredAllowances = data.allowances.filter((a) => a.name && a.amount > 0)
      const filteredDeductions = data.deductions.filter((d) => d.name && d.amount > 0)

      const payslipData = {
        ...data,
        employee_id: Number.parseInt(data.employee_id),
        work_period_start: data.work_period_start.toISOString().split("T")[0],
        work_period_end: data.work_period_end.toISOString().split("T")[0],
        payment_date: data.payment_date.toISOString().split("T")[0],
        gross_amount: calculatedPay.gross,
        net_amount: calculatedPay.net,
        employer_cpf_contribution: calculatedPay.employerCpf,
        allowances: filteredAllowances,
        deductions: filteredDeductions,
      }

      let payslipId: number

      if (payslip?.id) {
        // Update existing payslip
        const { error } = await supabase.from("payslips").update(payslipData).eq("id", payslip.id)

        if (error) throw error

        payslipId = payslip.id

        toast({
          title: "Payslip updated",
          description: "The payslip has been updated successfully.",
        })
      } else {
        // Create new payslip
        const { data: newPayslip, error } = await supabase.from("payslips").insert(payslipData).select("id").single()

        if (error) throw error

        payslipId = newPayslip.id

        toast({
          title: "Payslip created",
          description: "The new payslip has been created successfully.",
        })
      }

      // Save work schedules
      if (workSchedules.length > 0) {
        // Delete existing work schedules for this payslip
        if (payslip?.id) {
          await supabase.from("daily_work_schedules").delete().eq("payslip_id", payslip.id)
        }

        // Insert new work schedules
        const workScheduleData = workSchedules.map((schedule) => ({
          payslip_id: payslipId,
          employee_id: Number.parseInt(data.employee_id),
          work_date: new Date(schedule.date).toISOString().split("T")[0],
          start_time: schedule.startTime,
          end_time: schedule.endTime,
          scheduled_hours: schedule.scheduledHours,
          break_time_minutes: schedule.breakTimeMinutes,
          break_time_hours: schedule.breakTimeHours,
          payable_hours: schedule.payableHours,
        }))

        const { error: scheduleError } = await supabase.from("daily_work_schedules").insert(workScheduleData)

        if (scheduleError) {
          console.error("Error saving work schedules:", scheduleError)
          toast({
            title: "Warning",
            description: "Payslip saved but there was an error saving work schedules.",
            variant: "destructive",
          })
        }
      }

      router.push("/payslips")
      router.refresh()
    } catch (error) {
      console.error("Error saving payslip:", error)
      toast({
        title: "Error",
        description: "There was an error saving the payslip. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
              <Select onValueChange={handleEmployeeChange} defaultValue={field.value} disabled={!!selectedEmployee}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Employees</SelectLabel>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.first_name} {employee.last_name} ({employee.employment_type})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectItem value={CREATE_EMPLOYEE_OPTION} className="text-primary font-medium">
                      <div className="flex items-center">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create employee
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap gap-2 mb-4">
          <Button type="button" variant="outline" size="sm" onClick={handleSetPreviousMonth}>
            Previous Month
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleSetCurrentMonth}>
            Current Month
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="work_period_start"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Work Period Start</FormLabel>
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
            name="work_period_end"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Work Period End</FormLabel>
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
        </div>

        {watchWorkPeriodStart && watchWorkPeriodEnd && (
          <div className="text-sm text-muted-foreground">
            Period: {formatPeriod(watchWorkPeriodStart, watchWorkPeriodEnd)}
          </div>
        )}

        <FormField
          control={form.control}
          name="payment_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Payment Date</FormLabel>
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

        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schedule">Work Schedule</TabsTrigger>
            <TabsTrigger value="manual">Manual Hours</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4 pt-4">
            <div className="text-sm text-muted-foreground mb-2">
              Upload a CSV file with columns: Date, Start Time, End Time or add work schedule entries manually.
            </div>
            <WorkScheduleInput onSchedulesChange={handleWorkSchedulesChange} />
          </TabsContent>

          <TabsContent value="manual" className="space-y-4 pt-4">
            {selectedEmployeeData?.employment_type === "part-time" && (
              <FormField
                control={form.control}
                name="regular_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regular Hours</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" {...field} />
                    </FormControl>
                    <FormDescription>Total regular hours worked during this period.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="overtime_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overtime Hours</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" {...field} />
                    </FormControl>
                    <FormDescription>Hours worked beyond contractual hours.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="holiday_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Holiday Hours</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" {...field} />
                    </FormControl>
                    <FormDescription>Hours worked on public holidays.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Allowances</CardTitle>
          </CardHeader>
          <CardContent>
            {allowanceFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-4 mb-4">
                <FormField
                  control={form.control}
                  name={`allowances.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Transport" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`allowances.${index}.amount`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Amount (S$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAllowance(index)}
                  disabled={allowanceFields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => appendAllowance({ name: "", amount: 0 })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Allowance
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            {deductionFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-4 mb-4">
                <FormField
                  control={form.control}
                  name={`deductions.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="CPF" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`deductions.${index}.amount`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Amount (S$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDeduction(index)}
                  disabled={deductionFields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => appendDeduction({ name: "", amount: 0 })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Deduction
            </Button>
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="issued">Issued</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {calculatedPay && (
          <div className="rounded-md border p-4">
            <h3 className="font-medium">Calculated Pay</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="text-sm text-muted-foreground">Gross Amount:</div>
              <div className="font-medium">{formatCurrency(calculatedPay.gross)}</div>
              <div className="text-sm text-muted-foreground">Net Amount:</div>
              <div className="font-medium">{formatCurrency(calculatedPay.net)}</div>
              <div className="text-sm text-muted-foreground">Employer CPF Contribution:</div>
              <div className="font-medium">{formatCurrency(calculatedPay.employerCpf)}</div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !calculatedPay}>
            {isLoading ? "Saving..." : payslip?.id ? "Update Payslip" : "Create Payslip"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
