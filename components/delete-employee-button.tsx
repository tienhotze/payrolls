"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
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
import { useToast } from "@/components/ui/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"

interface DeleteEmployeeButtonProps {
  employeeId: string | number
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost"
  className?: string
  showIcon?: boolean
  redirectTo?: string
}

export function DeleteEmployeeButton({
  employeeId,
  variant = "ghost",
  className,
  showIcon = false,
  redirectTo,
}: DeleteEmployeeButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleDelete() {
    setIsDeleting(true)

    try {
      const supabase = getSupabaseClient()

      // Delete the employee
      const { error } = await supabase.from("employees").delete().eq("id", employeeId)

      if (error) {
        throw new Error(`Failed to delete employee: ${error.message}`)
      }

      toast({
        title: "Employee deleted",
        description: "The employee has been deleted successfully.",
      })

      if (redirectTo) {
        router.push(redirectTo)
      }
      router.refresh()
    } catch (error) {
      console.error("Error deleting employee:", error)
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to delete employee. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
    }
  }

  return (
    <>
      <Button variant={variant} size="icon" onClick={() => setIsOpen(true)} className={className} disabled={isDeleting}>
        {showIcon && <Trash2 className="h-4 w-4 mr-2" />}
        {!showIcon && <Trash2 className="h-4 w-4" />}
        <span className="sr-only">Delete employee</span>
        {variant === "destructive" && showIcon && "Delete Employee"}
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee and all associated data from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
