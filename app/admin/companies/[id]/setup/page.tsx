"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { setupCompanySchema } from "@/lib/setup-company-schema"

export default function CompanySetupPage({ params }) {
  const { id } = params
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [setting, setSetting] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    async function loadCompany() {
      try {
        // Check if user is logged in and is super admin
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/")
          return
        }

        // Get user info
        const { data: userData, error: userError } = await supabase
          .from("admin_users")
          .select("is_super_admin")
          .eq("email", session.user.email)
          .single()

        if (userError || !userData || !userData.is_super_admin) {
          toast({
            title: "Access denied",
            description: "Only super administrators can access this area",
            variant: "destructive",
          })
          router.push("/admin/dashboard")
          return
        }

        // Get company info
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .eq("id", id)
          .single()

        if (companyError || !companyData) {
          toast({
            title: "Company not found",
            description: "The requested company does not exist",
            variant: "destructive",
          })
          router.push("/admin/companies")
          return
        }

        setCompany(companyData)
      } catch (error) {
        console.error("Error loading company:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadCompany()
  }, [id, router, supabase, toast])

  const handleSetupCompany = async () => {
    if (!company) return

    setSetting(true)

    try {
      // Setup company schema
      await setupCompanySchema(company.slug)

      // Update company setup status
      await supabase.from("companies").update({ setup_complete: true }).eq("id", company.id)

      setSetupComplete(true)

      toast({
        title: "Setup complete",
        description: `Database for ${company.name} has been successfully set up.`,
      })
    } catch (error) {
      console.error("Error setting up company:", error)
      toast({
        title: "Setup failed",
        description: "Failed to set up company database. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSetting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading company details...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/admin/companies">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Companies
        </Link>
      </Button>

      <h1 className="text-3xl font-bold mb-6">Set Up Company Database</h1>

      <Card>
        <CardHeader>
          <CardTitle>{company.name}</CardTitle>
          <CardDescription>Set up the database schema and tables for this company</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium mb-2">Company Details</h3>
            <p>
              <strong>Name:</strong> {company.name}
            </p>
            <p>
              <strong>Slug:</strong> {company.slug}
            </p>
            <p>
              <strong>Status:</strong> {company.active ? "Active" : "Inactive"}
            </p>
          </div>

          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium mb-2">Database Setup</h3>
            <p className="mb-4">
              This will create a dedicated database schema for {company.name} with the following tables:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Employees</li>
              <li>Payslips</li>
              <li>Work Records</li>
            </ul>

            {setupComplete ? (
              <div className="flex items-center text-green-600">
                <Check className="h-5 w-5 mr-2" />
                <span>Database setup complete</span>
              </div>
            ) : (
              <Button onClick={handleSetupCompany} disabled={setting} className="w-full">
                {setting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up database...
                  </>
                ) : (
                  "Set Up Company Database"
                )}
              </Button>
            )}
          </div>

          {setupComplete && (
            <div className="flex justify-end">
              <Button asChild>
                <Link href="/admin/companies">Return to Companies</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
