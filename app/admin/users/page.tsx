"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Initial mock data for admin users
const initialMockUsers = [
  {
    id: 1,
    name: "Tien Ho",
    email: "tien.ho@eh-immigration.com",
    role: "Super Admin",
    company: null,
    isActive: true,
  },
  {
    id: 2,
    name: "John Manager",
    email: "john@acmecorp.com",
    role: "Company Admin",
    company: "Acme Corporation",
    isActive: true,
  },
  {
    id: 3,
    name: "Sarah Director",
    email: "sarah@techsolutions.com",
    role: "Company Admin",
    company: "TechSolutions Inc.",
    isActive: true,
  },
  {
    id: 4,
    name: "Michael Executive",
    email: "michael@globalent.com",
    role: "Company Admin",
    company: "Global Enterprises",
    isActive: true,
  },
]

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState(initialMockUsers)

  // Load deleted users from localStorage on mount
  useEffect(() => {
    try {
      const deletedUsersJson = localStorage.getItem("deletedUsers")
      if (deletedUsersJson) {
        const deletedUserIds = JSON.parse(deletedUsersJson)
        // Filter out deleted users
        setUsers((prevUsers) => prevUsers.filter((user) => !deletedUserIds.includes(user.id)))
      }

      // Check for returning from a delete operation
      const justDeletedId = localStorage.getItem("justDeletedUser")
      if (justDeletedId) {
        const userId = Number.parseInt(justDeletedId)
        const userName = initialMockUsers.find((u) => u.id === userId)?.name || "User"

        toast({
          title: "User deleted",
          description: `${userName} has been removed from the system.`,
        })

        // Clear the flag
        localStorage.removeItem("justDeletedUser")
      }
    } catch (error) {
      console.error("Error loading deleted users:", error)
    }
  }, [toast])

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Users</h1>
        <Button asChild>
          <Link href="/admin/users/new">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
          <CardDescription>Manage super admins and company admins for the payroll system.</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found.</p>
              <Button asChild className="mt-4">
                <Link href="/admin/users/new">Add User</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 p-4 bg-muted/50 font-medium">
                <div className="col-span-3">Name</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-2">Company</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              <div className="divide-y">
                {users.map((user) => (
                  <div key={user.id} className="grid grid-cols-12 p-4 items-center">
                    <div className="col-span-3 font-medium">{user.name}</div>
                    <div className="col-span-3 text-sm">{user.email}</div>
                    <div className="col-span-2">
                      <Badge variant={user.role === "Super Admin" ? "default" : "outline"}>{user.role}</Badge>
                    </div>
                    <div className="col-span-2 text-sm">{user.company || "—"}</div>
                    <div className="col-span-1">
                      <Badge variant={user.isActive ? "success" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="col-span-1 flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/users/${user.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
