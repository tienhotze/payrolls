"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getCompanyClient } from "@/lib/db-utils"

export default function CompanyPayslips({ params }) {
  const { companySlug } = params
  const [payslips, setPayslips] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const companyClient = getCompanyClient(companySlug)
  const { toast } = useToast()

  useEffect(() => {
    async function loadPayslips() {
      try {
        // Check if user is logged in
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push(`/${companySlug}/login`)
          return
        }

        // Get company info
        const { data: company, error: companyError } = await supabase
          .from("companies")
          .select("id")
          .eq("slug", companySlug)
          .eq("active", true)
          .single()

        if (companyError || !company) {
          toast({
            title: "Company not found",
            description: "The requested company does not exist or is not active",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        // Get user info
        const { data: user, error: userError } = await supabase
          .from("admin_users")
          .select("company_id")
          .eq("email", session.user.email)
          .single()

        if (userError || !user || user.company_id !== company.id) {
          toast({
            title: "Access denied",
            description: "You don't have access to this company",
            variant: "destructive",
          })
          await supabase.auth.signOut()
          router.push(`/${companySlug}/login`)
          return
        }

        // Get payslips from company schema
        // In a real implementation, you would query the company-specific schema
        // For now, we'll use mock data
        setPayslips([
          {
            id: 1,
            employee_name: "John Doe",
            period: "July 2023",
            amount: 2500.0,
            status: "Paid",
            payment_date: "2023-07-31",
          },
          {
            id: 2,
            employee_name: "Jane Smith",
            period: "July 2023",
            amount: 3000.0,
            status: "Paid",
            payment_date: "2023-07-31",
          },
        ])
      } catch (error) {
        console.error("Error loading payslips:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadPayslips()
  }, [companySlug, router, supabase, toast, companyClient])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="mb-2 -ml-3">
            <Link href={`/${companySlug}/dashboard`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Payslips</h1>
            <Button asChild>
              <Link href={`/${companySlug}/payslips/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Create Payslip
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>All Payslips</CardTitle>
            <CardDescription>Manage employee payslips</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading payslips...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No payslips found
                      </TableCell>
                    </TableRow>
                  ) : (
                    payslips.map((payslip) => (
                      <TableRow key={payslip.id}>
                        <TableCell className="font-medium">{payslip.employee_name}</TableCell>
                        <TableCell>{payslip.period}</TableCell>
                        <TableCell>${payslip.amount.toFixed(2)}</TableCell>
                        <TableCell>{payslip.status}</TableCell>
                        <TableCell>{new Date(payslip.payment_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/${companySlug}/payslips/${payslip.id}`}>
                                <FileText className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
