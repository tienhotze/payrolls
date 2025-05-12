import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Get the current admin user
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("id, password_hash, email")
      .eq("email", "tien.ho@eh-immigration.com")
      .single()

    if (adminError || !adminUser) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 })
    }

    // Create a new valid bcrypt hash
    const validHash = await bcrypt.hash("S!ngapore01", 10)

    // Update the password hash
    const { error: updateError } = await supabase
      .from("admin_users")
      .update({ password_hash: validHash })
      .eq("id", adminUser.id)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update password hash" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Password hash updated successfully",
      oldHash: adminUser.password_hash,
      newHash: validHash,
    })
  } catch (error) {
    console.error("Error fixing admin password:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
