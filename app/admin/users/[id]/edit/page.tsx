import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { EditUserForm } from "@/components/admin/edit-user-form"

export const metadata: Metadata = {
  title: "Edit Admin User | Payroll System",
  description: "Edit an admin user in the payroll system",
}

export default function EditAdminUserPage({ params }: { params: { id: string } }) {
  const userId = Number.parseInt(params.id)

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Admin User</h1>
      </div>

      <EditUserForm userId={userId} />
    </div>
  )
}
