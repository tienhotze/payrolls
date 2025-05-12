"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"

interface DeleteEmployeeButtonProps {
  employeeId: string | number
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showIcon?: boolean
  redirectTo?: string
  children?: React.ReactNode
}

export function DeleteEmployeeButton({
  employeeId,
  variant = "ghost",
  size = "icon",
  className = "",
  showIcon = true,
  redirectTo,
  children,
}: DeleteEmployeeButtonProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const supabase = getSupabaseClient()

      // First delete related records
      await supabase.from("payslips").delete().eq("employee_id", employeeId)
      await supabase.from("work_records").delete().eq("employee_id", employeeId)
      await supabase.from("daily_work_schedules").delete().eq("employee_id", employeeId)

      // Then delete the employee
      const { error } = await supabase.from("employees").delete().eq("id", employeeId)

      if (error) {
        throw error
      }

      toast({
        title: "Employee deleted",
        description: "The employee has been successfully deleted.",
      })

      if (redirectTo) {
        router.push(redirectTo)
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting employee:", error)
      toast({
        title: "Error",
        description: "Failed to delete employee. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setOpen(false)
    }
  }

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={() => setOpen(true)} disabled={isDeleting}>
        {showIcon && <Trash2 className={children ? "mr-2 h-4 w-4" : "h-4 w-4"} />}
        {children}
        {!children && <span className="sr-only">Delete employee</span>}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee and all associated payslips and
              work records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
