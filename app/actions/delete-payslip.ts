"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"

export async function deletePayslip(payslipId: number) {
  try {
    const supabase = createServerClient()

    // Delete the payslip
    const { error } = await supabase.from("payslips").delete().eq("id", payslipId)

    if (error) {
      throw new Error(`Failed to delete payslip: ${error.message}`)
    }

    // Revalidate the dashboard and payslips pages
    revalidatePath("/")
    revalidatePath("/payslips")

    return { success: true }
  } catch (error) {
    console.error("Error deleting payslip:", error)
    return { success: false, error: (error as Error).message }
  }
}
