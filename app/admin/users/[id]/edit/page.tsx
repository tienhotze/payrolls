import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Edit Admin User | Payroll System",
  description: "Edit an admin user in the payroll system",
}

export default function EditAdminUserPage({ params }: { params: { id: string } }) {
  // Mock user data based on ID
  const userId = Number.parseInt(params.id)
  const mockUser = {
    id: userId,
    firstName: userId === 1 ? "Tien" : "John",
    lastName: userId === 1 ? "Ho" : "Manager",
    email: userId === 1 ? "tien.ho@eh-immigration.com" : "john@acmecorp.com",
    role: userId === 1 ? "super_admin" : "company_admin",
    companyId: userId === 1 ? null : 1,
    isActive: true,
  }

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
        <CardFooter className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/users">Cancel</Link>
          </Button>
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
