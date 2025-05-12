"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function CompanyLoginPage({ params }) {
  const { companySlug } = params
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [companyExists, setCompanyExists] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    async function checkCompany() {
      try {
        const { data, error } = await supabase
          .from("companies")
          .select("name")
          .eq("slug", companySlug)
          .eq("active", true)
          .single()

        if (error || !data) {
          setCompanyExists(false)
        } else {
          setCompanyName(data.name)
          setCompanyExists(true)
        }
      } catch (error) {
        console.error("Error checking company:", error)
        setCompanyExists(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkCompany()
  }, [companySlug, supabase])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Check if user belongs to this company
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("company_id")
        .eq("email", email)
        .single()

      if (adminError || !adminUser) {
        toast({
          title: "Access denied",
          description: "You don't have access to this company",
          variant: "destructive",
        })
        // Sign out if not authorized
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // Get company ID for the slug
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("id")
        .eq("slug", companySlug)
        .single()

      if (companyError || !company || adminUser.company_id !== company.id) {
        toast({
          title: "Access denied",
          description: "You don't have access to this company",
          variant: "destructive",
        })
        // Sign out if not authorized for this company
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // Redirect to company dashboard
      router.push(`/${companySlug}/dashboard`)
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!companyExists) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Company Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center">The company "{companySlug}" does not exist or is not active.</p>
            <div className="flex justify-center">
              <Button asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">{companyName} Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-500">
              Return to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
