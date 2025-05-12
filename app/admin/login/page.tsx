import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminLoginForm } from "@/components/admin/login-form"

export const metadata: Metadata = {
  title: "Admin Login | Payroll Management System",
}

export default function AdminLoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Super Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            <Link href="/" className="underline">
              Back to home
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
