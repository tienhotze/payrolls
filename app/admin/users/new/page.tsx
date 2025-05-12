import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Add Admin User | Payroll System",
  description: "Add a new admin user to the payroll system",
}

export default function NewAdminUserPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Add Admin User</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Add a new admin user to the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="Enter first name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Enter last name" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter email address" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter password" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
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
              <Select disabled>
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
          </form>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/users">Cancel</Link>
          </Button>
          <Button>Create User</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
