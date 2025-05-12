"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"

export function EditUserForm({ userId }: { userId: number }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Mock user data based on ID
  const mockUser = {
    id: userId,
    firstName: userId === 1 ? "Tien" : "John",
    lastName: userId === 1 ? "Ho" : "Manager",
    email: userId === 1 ? "tien.ho@eh-immigration.com" : "john@acmecorp.com",
    role: userId === 1 ? "super_admin" : "company_admin",
    companyId: userId === 1 ? null : 1,
    isActive: true,
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      // Get existing deleted users or initialize empty array
      const deletedUsersJson = localStorage.getItem("deletedUsers") || "[]"
      const deletedUsers = JSON.parse(deletedUsersJson)

      // Add this user ID to the deleted users array
      if (!deletedUsers.includes(userId)) {
        deletedUsers.push(userId)
      }

      // Save back to localStorage
      localStorage.setItem("deletedUsers", JSON.stringify(deletedUsers))

      // Set a flag to show a toast on the users page
      localStorage.setItem("justDeletedUser", userId.toString())

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsDeleting(false)
      setShowDeleteDialog(false)

      toast({
        title: "User deleted",
        description: `${mockUser.firstName} ${mockUser.lastName} has been deleted.`,
        variant: "default",
      })

      // Force a hard navigation to ensure the page is fully refreshed
      window.location.href = "/admin/users"
    } catch (error) {
      console.error("Error deleting user:", error)
      setIsDeleting(false)
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Edit user details for {mockUser.firstName} {mockUser.lastName}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue={mockUser.firstName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue={mockUser.lastName} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={mockUser.email} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password (leave blank to keep current)</Label>
              <Input id="password" type="password" placeholder="Enter new password" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select defaultValue={mockUser.role}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="company_admin">Company Admin</SelectItem>
                  <SelectItem value="hr_manager">HR Manager</SelectItem>
                  <SelectItem value="payroll_officer">Payroll Officer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company (for Company Admins)</Label>
              <Select defaultValue={mockUser.companyId?.toString()} disabled={mockUser.role === "super_admin"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Acme Corporation</SelectItem>
                  <SelectItem value="2">TechSolutions Inc.</SelectItem>
                  <SelectItem value="3">Global Enterprises</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Only required for Company Admins</p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="isActive" defaultChecked={mockUser.isActive} />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          {/* Delete button on the far left */}
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </Button>

          {/* Save and Cancel buttons on the right */}
          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <Link href="/admin/users">Cancel</Link>
            </Button>
            <Button>Save Changes</Button>
          </div>
        </CardFooter>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {mockUser.firstName} {mockUser.lastName}? This action cannot be undone and
              will remove all data associated with this user.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
