"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

const employeeFormSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z
    .string()
    .email({
      message: "Please enter a valid email address.",
    })
    .optional()
    .or(z.literal("")),
  mobile_phone: z.string().optional().or(z.literal("")),
  employment_type: z.enum(["full-time", "part-time"], {
    required_error: "Please select an employment type.",
  }),
  hourly_rate: z.coerce.number().optional().or(z.literal(0)),
  monthly_salary: z.coerce.number().optional().or(z.literal(0)),
  contractual_hours_per_week: z.coerce.number().optional().or(z.literal(0)),
})

type EmployeeFormValues = z.infer<typeof employeeFormSchema>

interface EmployeeFormProps {
  employee?: any
}

export function EmployeeForm({ employee }: EmployeeFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const defaultValues: Partial<EmployeeFormValues> = {
    first_name: employee?.first_name || "",
    last_name: employee?.last_name || "",
    email: employee?.email || "",
    mobile_phone: employee?.mobile_phone || "",
    employment_type: employee?.employment_type || "full-time",
    hourly_rate: employee?.hourly_rate || 0,
    monthly_salary: employee?.monthly_salary || 0,
    contractual_hours_per_week: employee?.contractual_hours_per_week || 0,
  }

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues,
    mode: "onChange",
  })

  const employmentType = form.watch("employment_type")

  async function onSubmit(data: EmployeeFormValues) {
    setIsLoading(true)

    try {
      const supabase = getSupabaseClient()

      // Clean up data based on employment type
      if (data.employment_type === "full-time") {
        data.hourly_rate = null
      } else {
        data.monthly_salary = null
        data.contractual_hours_per_week = null
      }

      // Convert empty email to null to avoid unique constraint issues
      if (data.email === "") {
        data.email = null
      }

      if (employee?.id) {
        // Update existing employee
        const { error } = await supabase.from("employees").update(data).eq("id", employee.id)

        if (error) {
          if (error.code === "23505" && error.message.includes("employees_email_key")) {
            throw new Error("An employee with this email already exists. Please use a different email.")
          }
          throw error
        }

        toast({
          title: "Employee updated",
          description: "The employee record has been updated successfully.",
        })
      } else {
        // Create new employee
        const { error } = await supabase.from("employees").insert(data)

        if (error) {
          if (error.code === "23505" && error.message.includes("employees_email_key")) {
            throw new Error("An employee with this email already exists. Please use a different email.")
          }
          throw error
        }

        toast({
          title: "Employee added",
          description: "The new employee has been added successfully.",
        })
      }

      router.push("/employees")
      router.refresh()
    } catch (error) {
      console.error("Error saving employee:", error)
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "There was an error saving the employee. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mobile_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Phone (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="+65 9123 4567" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="employment_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {employmentType === "full-time" && (
          <>
            <FormField
              control={form.control}
              name="monthly_salary"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Monthly Salary (S$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={value || ""}
                      onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>The fixed monthly salary for this employee.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contractual_hours_per_week"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Contractual Hours Per Week (excluding breaks)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={value || ""}
                      onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Standard working hours per week (e.g., 40).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {employmentType === "part-time" && (
          <FormField
            control={form.control}
            name="hourly_rate"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Hourly Rate (S$)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>The hourly rate for this employee.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : employee?.id ? "Update Employee" : "Add Employee"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
